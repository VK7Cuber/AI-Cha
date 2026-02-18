import { WebSocketServer } from 'ws';
import http from 'http';
import { URL } from 'url';
import { sttService } from '../services/sttService.js';
import { AudioProcessor } from '../services/audioProcessor.js';
import { sttConfig } from '../config/sttConfig.js';
import { ttsService } from '../services/ttsService.js';
import { ttsConfig } from '../config/ttsConfig.js';

let wssAudio = null;
let wssPublic = null;

const AUDIO_PATH_PREFIX = '/ws/audio';
const MAX_AUDIO_BUFFER_BYTES = 1024 * 1024; // 1MB для защиты памяти
const WS_DEBUG = process.env.WS_DEBUG === 'true';
const TTS_DEBUG = process.env.TTS_DEBUG === 'true';
const DEFAULT_AUDIO_PORT = 8081;
const DEFAULT_PUBLIC_PORT = 8082;
const DEFAULT_TTS_CHUNK_BYTES = 32 * 1024;
const DEFAULT_TTS_CHUNK_DELAY_MS = 0;
const STREAMING_FORMATS = new Set([
  'pcm16',
  'lpcm',
  'raw',
  'oggopus',
  'ogg_opus',
  'opus',
  'wav',
  'mp3'
]);

const resolvePort = (value, fallback) => {
  const port = Number(value);
  return Number.isFinite(port) && port > 0 ? port : fallback;
};

const normalizeFormat = (value) => String(value || '').trim().toLowerCase();

const getPathname = (request) => {
  const host = request.headers.host || 'localhost';
  const url = new URL(request.url || '/', `http://${host}`);
  return url.pathname || '/';
};

function sendJson(socket, event, payload = {}) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify({ event, payload }));
  }
}

function setupAudioConnection(socket, { sessionId }) {
  const inputFormat = normalizeFormat(sttConfig.input.format);
  const streamingSupported = STREAMING_FORMATS.has(inputFormat);
  const sttDisabled = process.env.WS_DISABLE_STT === 'true';
  const streamingEnabled = streamingSupported && !sttDisabled;
  const maxRetries = sttConfig?.retry?.maxRetries ?? 3;
  const backoffMs = sttConfig?.retry?.backoffMs ?? 500;
  const sessionTimeoutMs = sttConfig?.streaming?.sessionTimeoutMs ?? 10000;

  const state = {
    sessionId,
    buffer: [],
    bufferBytes: 0,
    lastChunkAt: null,
    lastSttEventAt: null,
    lastStreamCreatedAt: null,
    finalizeRequestedAt: null,
    processing: false,
    sttStream: null,
    audioProcessor: null,
    ttsProcessing: false,
    speechActive: false,
    lowVolumeNotified: false,
    reconnectAttempts: 0,
    streamSeq: 0,
    finalizingStreamId: null,
    lastFinalStreamId: null,
    lastFinalAt: null,
    lastFailedStreamId: null,
    streamTimer: null,
    streamingDisabled: !streamingEnabled,
    metrics: {
      successes: 0,
      errors: 0,
      latencyMsTotal: 0,
      lastLatencyMs: null
    }
  };

  if (inputFormat === 'pcm16') {
    state.audioProcessor = new AudioProcessor({
      inputFormat: sttConfig.input.format,
      inputSampleRate: sttConfig.input.sampleRateHz,
      inputChannels: sttConfig.input.channels
    });
  }

  const resetBuffer = () => {
    state.buffer = [];
    state.bufferBytes = 0;
  };

  const recordSttEvent = () => {
    state.lastSttEventAt = Date.now();
    state.reconnectAttempts = 0;
  };

  const recordLatency = (latencyMs) => {
    if (!Number.isFinite(latencyMs)) return null;
    state.metrics.lastLatencyMs = latencyMs;
    state.metrics.latencyMsTotal += latencyMs;
    return latencyMs;
  };

  const handleFinalResult = ({ text, confidence }, source, latencyMs = null, streamId = null) => {
    const computedLatency =
      latencyMs ?? (state.finalizeRequestedAt ? Date.now() - state.finalizeRequestedAt : null);
    const normalizedLatency = recordLatency(computedLatency);
    state.metrics.successes += 1;
    state.finalizeRequestedAt = null;
    state.finalizingStreamId = null;
    if (source === 'stream' && Number.isFinite(streamId)) {
      state.lastFinalStreamId = streamId;
      state.lastFinalAt = Date.now();
    }
    state.speechActive = false;
    state.lowVolumeNotified = false;
    resetBuffer();
    state.audioProcessor?.reset();
    sendJson(socket, 'transcript', {
      sessionId,
      text,
      confidence,
      latencyMs: normalizedLatency,
      source
    });
    sendJson(socket, 'status', { state: 'listening', sessionId });
    if (WS_DEBUG) {
      const successRate = state.metrics.successes + state.metrics.errors
        ? state.metrics.successes / (state.metrics.successes + state.metrics.errors)
        : 1;
      console.log('[ws] stt metrics', {
        sessionId,
        latencyMs: normalizedLatency,
        confidence,
        successRate
      });
    }
  };

  const handleStreamFailure = (error, streamId, reason) => {
    if (streamId !== state.streamSeq) return;
    if (state.lastFailedStreamId === streamId) return;
    if (streamId === state.finalizingStreamId && (reason === 'end' || reason === 'closed')) {
      state.sttStream = null;
      if (state.finalizeRequestedAt) {
        state.metrics.errors += 1;
        state.finalizeRequestedAt = null;
        state.finalizingStreamId = null;
        sendJson(socket, 'error', {
          sessionId,
          message: 'STT stream closed before final result'
        });
        return;
      }
      state.finalizingStreamId = null;
      return;
    }
    if (
      (reason === 'end' || reason === 'closed') &&
      streamId === state.lastFinalStreamId
    ) {
      state.sttStream = null;
      state.finalizingStreamId = null;
      state.lastFinalStreamId = null;
      state.lastFinalAt = null;
      return;
    }
    state.metrics.errors += 1;
    state.lastFailedStreamId = streamId;
    const message = error?.message || 'STT stream error';
    if (WS_DEBUG) {
      console.error('[ws] stt stream error', { sessionId, reason, message });
    }
    sendJson(socket, 'error', { sessionId, message });
    if (reason !== 'end' && reason !== 'closed') {
      state.sttStream?.close();
    }
    state.sttStream = null;

    if (state.streamingDisabled) return;
    if (state.reconnectAttempts >= maxRetries) {
      state.streamingDisabled = true;
      return;
    }
    const attempt = state.reconnectAttempts + 1;
    state.reconnectAttempts = attempt;
    const delay = backoffMs * attempt;
    setTimeout(() => {
      if (socket.readyState !== socket.OPEN || state.streamingDisabled) return;
      initStreamingSession();
    }, delay);
  };

  const handleStreamData = (response, streamId) => {
    if (streamId !== state.streamSeq) return;
    recordSttEvent();

    if (response.partial) {
      const { text, confidence } = sttService.extractBestAlternative(response.partial);
      sendJson(socket, 'partial', { sessionId, text, confidence });
    }
    if (response.final) {
      const { text, confidence } = sttService.extractBestAlternative(response.final);
      handleFinalResult({ text, confidence }, 'stream', null, streamId);
    }
    if (response.eou_update) {
      if (!state.finalizeRequestedAt) {
        state.finalizeRequestedAt = Date.now();
      }
      sendJson(socket, 'eou', { sessionId, timeMs: response.eou_update.time_ms });
    }
    if (response.status_code?.message) {
      sendJson(socket, 'status_code', {
        sessionId,
        code: response.status_code.code_type,
        message: response.status_code.message
      });
      if (response.status_code.code_type === 'CLOSED') {
        handleStreamFailure(new Error(response.status_code.message), streamId, 'closed');
      }
    }
  };

  const initStreamingSession = () => {
    if (state.streamingDisabled) return false;
    const streamId = state.streamSeq + 1;
    state.streamSeq = streamId;
    try {
      if (WS_DEBUG) {
        console.log('[ws] init audio session', { sessionId, inputFormat });
      }
      if (inputFormat === 'pcm16' && !state.audioProcessor) {
        state.audioProcessor = new AudioProcessor({
          inputFormat: sttConfig.input.format,
          inputSampleRate: sttConfig.input.sampleRateHz,
          inputChannels: sttConfig.input.channels
        });
      }
      const stream = sttService.createStreamingSession({ inputFormat: sttConfig.input.format });
      state.sttStream = stream;
      state.lastStreamCreatedAt = Date.now();
      state.lastSttEventAt = null;
      state.reconnectAttempts = 0;
      state.lastFailedStreamId = null;
      state.lastFinalStreamId = null;
      state.lastFinalAt = null;
      stream.onData((response) => handleStreamData(response, streamId));
      stream.onError((error) => handleStreamFailure(error, streamId, 'error'));
      stream.onEnd(() => handleStreamFailure(new Error('STT stream ended'), streamId, 'end'));
      return true;
    } catch (error) {
      handleStreamFailure(error, streamId, 'init');
      return false;
    }
  };

  if (streamingEnabled && sessionTimeoutMs > 0) {
    state.streamTimer = setInterval(() => {
      if (!state.sttStream) return;
      const now = Date.now();
      if (
        state.finalizeRequestedAt &&
        now - state.finalizeRequestedAt > sessionTimeoutMs
      ) {
        handleStreamFailure(new Error('STT finalize timeout'), state.streamSeq, 'timeout');
        return;
      }
      if (!state.lastChunkAt) return;
      if (now - state.lastChunkAt > sessionTimeoutMs) return;
      const sttIdleMs = state.lastSttEventAt ? now - state.lastSttEventAt : null;
      if (sttIdleMs === null || sttIdleMs > sessionTimeoutMs) {
        handleStreamFailure(new Error('STT stream timeout'), state.streamSeq, 'timeout');
      }
    }, Math.min(sessionTimeoutMs, 1000));
  }

  const finalizeBufferedAudio = async (source) => {
    if (state.processing) {
      sendJson(socket, 'status', { state: 'thinking', sessionId });
      return;
    }
    if (!state.finalizeRequestedAt) {
      state.finalizeRequestedAt = Date.now();
    }

    if (state.sttStream && !state.sttStream.isClosed?.()) {
      sendJson(socket, 'status', { state: 'thinking', sessionId });
      state.finalizingStreamId = state.streamSeq;
      state.sttStream.finalize();
      state.sttStream = null;
      return;
    }

    const audioBuffer = Buffer.concat(state.buffer);
    if (!audioBuffer.length) {
      state.finalizeRequestedAt = null;
      return;
    }
    state.processing = true;
    sendJson(socket, 'status', { state: 'thinking', sessionId });
    const startedAt = Date.now();
    try {
      const restFormat = sttService.resolveRestFormat(sttConfig.input.format);
      const result = await sttService.recognizeBuffer(audioBuffer, {
        format: restFormat,
        sampleRateHz: sttConfig.recognition.sampleRateHz
      });
      handleFinalResult(
        { text: result.text, confidence: result.confidence },
        source,
        Date.now() - startedAt
      );
    } catch (error) {
      state.metrics.errors += 1;
      sendJson(socket, 'error', {
        sessionId,
        message: error?.message || 'STT error'
      });
      sendJson(socket, 'status', { state: 'listening', sessionId });
      state.finalizeRequestedAt = null;
    } finally {
      state.processing = false;
    }
  };

  socket.on('message', async (data, isBinary) => {
    try {
      if (isBinary) {
        if (WS_DEBUG) {
          console.log('[ws] binary chunk', { sessionId, size: data?.length || 0 });
        }
        let chunk = Buffer.isBuffer(data) ? data : Buffer.from(data);
        state.lastChunkAt = Date.now();

        let processed = null;
        if (state.audioProcessor) {
          processed = state.audioProcessor.processChunk(chunk);
          chunk = processed.buffer;
          if (processed.isSpeech && !state.speechActive) {
            state.speechActive = true;
            state.lowVolumeNotified = false;
            sendJson(socket, 'speech_start', { sessionId });
          }
          if (
            !state.lowVolumeNotified &&
            sttConfig.vad.enabled &&
            processed.speechMs === 0 &&
            processed.totalMs >= sttConfig.vad.minSpeechMs
          ) {
            state.lowVolumeNotified = true;
            sendJson(socket, 'warning', {
              sessionId,
              code: 'low_volume',
              message: 'Слишком тихий сигнал'
            });
          }
        }

        state.buffer.push(chunk);
        state.bufferBytes += chunk.length;

        while (state.bufferBytes > MAX_AUDIO_BUFFER_BYTES && state.buffer.length > 1) {
          const removed = state.buffer.shift();
          state.bufferBytes -= removed.length;
        }

        if (
          !state.sttStream &&
          streamingEnabled &&
          !state.streamingDisabled &&
          !state.finalizeRequestedAt
        ) {
          initStreamingSession();
        }

        if (state.sttStream) {
          if (
            processed &&
            sttConfig.vad.enabled &&
            processed.durationMs > 0 &&
            !processed.isSpeech
          ) {
            state.sttStream.sendSilenceChunk?.(processed.durationMs);
          } else {
            state.sttStream.sendAudioChunk(chunk);
          }

          if (processed?.shouldFinalize) {
            await finalizeBufferedAudio('vad');
          }
        } else if (processed?.shouldFinalize) {
          await finalizeBufferedAudio('vad');
        }

        sendJson(socket, 'status', { state: 'listening', sessionId });
        return;
      }

      let message = null;
      try {
        message = JSON.parse(data.toString());
      } catch {
        sendJson(socket, 'error', { message: 'Invalid JSON message' });
        return;
      }

      if (WS_DEBUG) {
        console.log('[ws] json message', { sessionId, message });
      }

      if (message?.event === 'finalize') {
        await finalizeBufferedAudio('client');
        return;
      }

      if (message?.event === 'tts') {
        if (state.ttsProcessing) {
          sendJson(socket, 'tts_error', { sessionId, message: 'TTS is busy' });
          return;
        }

        const payload = message?.payload || {};
        const useSsml = Boolean(payload.ssml);
        const input = useSsml ? payload.ssml : payload.text;

        if (typeof input !== 'string' || !input.trim()) {
          sendJson(socket, 'tts_error', { sessionId, message: 'TTS text is required' });
          return;
        }

        state.ttsProcessing = true;
        sendJson(socket, 'status', { state: 'speaking', sessionId });
        if (TTS_DEBUG) {
          console.log('[ws][tts] request', {
            sessionId,
            useSsml,
            textLength: input.trim().length,
            format: ttsConfig.synthesis.format
          });
        }

        try {
          const result = await ttsService.synthesizeText(input, {
            useSsml,
            language: ttsConfig.synthesis.language,
            voice: ttsConfig.synthesis.voice,
            speed: ttsConfig.synthesis.speed,
            emotion: ttsConfig.synthesis.emotion,
            format: ttsConfig.synthesis.format
          });

          const audioBuffer = result?.audioBuffer;
          if (!audioBuffer?.length) {
            sendJson(socket, 'tts_error', { sessionId, message: 'TTS returned empty audio' });
            return;
          }

          sendJson(socket, 'tts_start', {
            sessionId,
            contentType: result.contentType,
            format: result.format,
            cacheHit: Boolean(result.cacheHit),
            bytes: audioBuffer.length
          });
          if (TTS_DEBUG) {
            console.log('[ws][tts] response', {
              sessionId,
              contentType: result.contentType,
              format: result.format,
              bytes: audioBuffer.length,
              cacheHit: Boolean(result.cacheHit)
            });
          }

          const chunkSize = Number(process.env.TTS_CHUNK_BYTES || DEFAULT_TTS_CHUNK_BYTES);
          const delayMs = Number(process.env.TTS_CHUNK_DELAY_MS || DEFAULT_TTS_CHUNK_DELAY_MS);
          if (TTS_DEBUG) {
            console.log('[ws][tts] streaming', { sessionId, chunkSize, delayMs });
          }

          for (let offset = 0; offset < audioBuffer.length; offset += chunkSize) {
            if (socket.readyState !== socket.OPEN) break;
            const chunk = audioBuffer.subarray(offset, offset + chunkSize);
            socket.send(chunk, { binary: true });
            if (delayMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          sendJson(socket, 'tts_end', { sessionId });
        } catch (error) {
          if (TTS_DEBUG) {
            console.error('[ws][tts] error', {
              sessionId,
              message: error?.message || error
            });
          }
          sendJson(socket, 'tts_error', {
            sessionId,
            message: error?.message || 'TTS error'
          });
        } finally {
          state.ttsProcessing = false;
          sendJson(socket, 'status', { state: 'listening', sessionId });
        }
        return;
      }

      sendJson(socket, 'ack', { ok: true });
    } catch (error) {
      console.error('WS audio handler error:', error);
      sendJson(socket, 'error', { sessionId, message: error?.message || 'WS handler error' });
    }
  });

  socket.on('close', (code, reason) => {
    if (WS_DEBUG) {
      console.log('[ws] audio socket closed', {
        sessionId,
        code,
        reason: reason?.toString()
      });
    }
    if (state.streamTimer) {
      clearInterval(state.streamTimer);
    }
    resetBuffer();
    state.audioProcessor?.reset();
    state.sttStream?.close();
  });

  socket.on('error', (error) => {
    console.error('[ws] audio socket error:', error);
  });

  sendJson(socket, 'connected', { ok: true, sessionId });
  sendJson(socket, 'status', { state: 'listening', sessionId });
}

export function initWs(_server) {
  if (wssAudio || wssPublic) return { wssAudio, wssPublic };

  const wsAudioPort = resolvePort(process.env.WS_AUDIO_PORT || process.env.WS_PORT, DEFAULT_AUDIO_PORT);
  let wsPublicPort = resolvePort(process.env.WS_PUBLIC_PORT, wsAudioPort + 1);
  if (wsPublicPort === wsAudioPort) {
    wsPublicPort = wsAudioPort + 1;
  }

  console.log('[ws] initWs called', {
    wsDebug: process.env.WS_DEBUG,
    wsAudioPort,
    wsPublicPort
  });

  const perMessageDeflate = process.env.WS_PERMESSAGE_DEFLATE !== 'false';

  const audioServer = http.createServer();
  wssAudio = new WebSocketServer({ server: audioServer, perMessageDeflate });
  audioServer.listen(wsAudioPort, '0.0.0.0', () => {
    console.log('[ws] audio ws server listening', { wsAudioPort });
  });

  const publicServer = http.createServer();
  wssPublic = new WebSocketServer({ server: publicServer, perMessageDeflate });
  publicServer.listen(wsPublicPort, '0.0.0.0', () => {
    console.log('[ws] public ws server listening', { wsPublicPort });
  });

  wssAudio.on('connection', (socket, request) => {
    const pathname = getPathname(request);

    if (WS_DEBUG) {
      console.log('[ws] connection: audio', {
        pathname,
        extensions: request.headers['sec-websocket-extensions']
      });
    }

    if (!pathname.startsWith(AUDIO_PATH_PREFIX)) {
      sendJson(socket, 'error', { message: 'Audio WS only. Use /ws/audio/*' });
      socket.close(1008, 'Audio WS only');
      return;
    }

    const sessionId = pathname.replace(AUDIO_PATH_PREFIX, '').replace('/', '') || null;
    setupAudioConnection(socket, { sessionId });
  });

  wssPublic.on('connection', (socket, request) => {
    const pathname = getPathname(request);

    if (WS_DEBUG) {
      console.log('[ws] connection: public', {
        pathname,
        extensions: request.headers['sec-websocket-extensions']
      });
    }

    if (pathname.startsWith(AUDIO_PATH_PREFIX)) {
      sendJson(socket, 'error', { message: 'Audio WS is on a separate port' });
      socket.close(1008, 'Audio WS separate');
      return;
    }

    sendJson(socket, 'connected', { ok: true });
  });

  wssAudio.on('error', (error) => {
    console.error('[ws] audio server error:', error);
  });

  wssPublic.on('error', (error) => {
    console.error('[ws] public server error:', error);
  });

  return { wssAudio, wssPublic };
}

export function wsBroadcast(event, payload) {
  if (!wssPublic) return;
  const message = JSON.stringify({ event, payload });
  for (const client of wssPublic.clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}
