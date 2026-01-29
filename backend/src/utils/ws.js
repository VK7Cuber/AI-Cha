import { WebSocketServer } from 'ws';
import http from 'http';
import { URL } from 'url';
import { sttService } from '../services/sttService.js';
import { AudioProcessor } from '../services/audioProcessor.js';
import { sttConfig } from '../config/sttConfig.js';

let wssAudio = null;
let wssPublic = null;

const AUDIO_PATH_PREFIX = '/ws/audio';
const MAX_AUDIO_BUFFER_BYTES = 1024 * 1024; // 1MB для защиты памяти
const WS_DEBUG = process.env.WS_DEBUG === 'true';
const DEFAULT_AUDIO_PORT = 8081;
const DEFAULT_PUBLIC_PORT = 8082;

const resolvePort = (value, fallback) => {
  const port = Number(value);
  return Number.isFinite(port) && port > 0 ? port : fallback;
};

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
  const state = {
    sessionId,
    buffer: [],
    bufferBytes: 0,
    lastChunkAt: null,
    processing: false,
    sttStream: null,
    audioProcessor: null
  };

  const streamingEnabled = sttConfig.input.format === 'pcm16';
  const sttDisabled = process.env.WS_DISABLE_STT === 'true';
  if (streamingEnabled && !sttDisabled) {
    try {
      if (WS_DEBUG) {
        console.log('[ws] init audio session', { sessionId });
      }
      state.audioProcessor = new AudioProcessor({
        inputFormat: sttConfig.input.format,
        inputSampleRate: sttConfig.input.sampleRateHz,
        inputChannels: sttConfig.input.channels
      });
      state.sttStream = sttService.createStreamingSession();

      state.sttStream.onData((response) => {
        if (response.partial) {
          const text = sttService.extractTextFromAlternatives(response.partial);
          sendJson(socket, 'partial', { sessionId, text });
        }
        if (response.final) {
          const text = sttService.extractTextFromAlternatives(response.final);
          sendJson(socket, 'transcript', { sessionId, text });
        }
        if (response.status_code?.message) {
          sendJson(socket, 'status_code', {
            sessionId,
            code: response.status_code.code_type,
            message: response.status_code.message
          });
        }
      });

      state.sttStream.onError((error) => {
        console.error('[ws] stt stream error:', error);
        sendJson(socket, 'error', {
          sessionId,
          message: error?.message || 'STT stream error'
        });
      });
    } catch (error) {
      if (WS_DEBUG) {
        console.error('[ws] stt init error', error);
      }
      sendJson(socket, 'error', { sessionId, message: error?.message || 'STT init error' });
    }
  }

  socket.on('message', async (data, isBinary) => {
    try {
      if (isBinary) {
        if (WS_DEBUG) {
          console.log('[ws] binary chunk', { sessionId, size: data?.length || 0 });
        }
        let chunk = Buffer.isBuffer(data) ? data : Buffer.from(data);
        state.buffer.push(chunk);
        state.bufferBytes += chunk.length;
        state.lastChunkAt = Date.now();

        // Ограничение буфера
        while (state.bufferBytes > MAX_AUDIO_BUFFER_BYTES && state.buffer.length > 1) {
          const removed = state.buffer.shift();
          state.bufferBytes -= removed.length;
        }

        if (state.audioProcessor && state.sttStream) {
          const processed = state.audioProcessor.processChunk(chunk);
          chunk = processed.buffer;
          state.sttStream.sendAudioChunk(chunk);

          if (processed.shouldFinalize) {
            sendJson(socket, 'status', { state: 'thinking', sessionId });
            state.sttStream.finalize();
          }
        }

        sendJson(socket, 'status', { state: 'listening', sessionId });
        return;
      }

      // Текстовые команды от клиента
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
        if (state.processing) {
          sendJson(socket, 'status', { state: 'thinking', sessionId });
          return;
        }

        if (state.sttStream) {
          sendJson(socket, 'status', { state: 'thinking', sessionId });
          state.sttStream.finalize();
          return;
        }

        const audioBuffer = Buffer.concat(state.buffer);
        state.buffer = [];
        state.bufferBytes = 0;
        state.processing = true;

        sendJson(socket, 'status', { state: 'thinking', sessionId });

        try {
          const result = await sttService.recognizeBuffer(audioBuffer);
          sendJson(socket, 'transcript', {
            sessionId,
            text: result.text,
            confidence: result.confidence
          });
        } catch (error) {
          sendJson(socket, 'error', {
            sessionId,
            message: error?.message || 'STT error'
          });
        } finally {
          state.processing = false;
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

  socket.on('close', () => {
    if (WS_DEBUG) {
      console.log('[ws] audio socket closed', { sessionId });
    }
    state.buffer = [];
    state.bufferBytes = 0;
    state.audioProcessor?.reset();
    state.sttStream?.close();
  });

  socket.on('close', (code, reason) => {
    if (WS_DEBUG) {
      console.log('[ws] audio socket close code', {
        sessionId,
        code,
        reason: reason?.toString()
      });
    }
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
