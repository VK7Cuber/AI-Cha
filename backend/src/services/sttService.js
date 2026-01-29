import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { sttConfig } from '../config/sttConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_ROOT = path.resolve(__dirname, './proto');
const PROTO_PATH = path.join(PROTO_ROOT, 'yandex/cloud/ai/stt/v3/stt_service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_ROOT]
});
const grpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
const Recognizer = grpcDescriptor?.speechkit?.stt?.v3?.Recognizer;

function getAuthHeader() {
  if (sttConfig.yandex.apiKey) {
    return { Authorization: `Api-Key ${sttConfig.yandex.apiKey}` };
  }
  if (sttConfig.yandex.iamToken) {
    return { Authorization: `Bearer ${sttConfig.yandex.iamToken}` };
  }
  throw new Error('YANDEX_API_KEY or YANDEX_IAM_TOKEN must be set');
}

function buildMetadata() {
  const metadata = new grpc.Metadata();
  const auth = getAuthHeader().Authorization;
  metadata.set('authorization', auth);
  if (sttConfig.yandex.folderId) {
    metadata.set('x-folder-id', sttConfig.yandex.folderId);
  }
  return metadata;
}

function shouldRetry(statusCode) {
  if (!statusCode) return true;
  return statusCode >= 500;
}

function normalizeFormat(value) {
  return String(value || '').trim().toLowerCase();
}

function resolveRestFormat(formatCandidate) {
  const format = normalizeFormat(formatCandidate);
  if (!format) return sttConfig.recognition.format;
  if (format === 'pcm16' || format === 'lpcm' || format === 'raw') return 'lpcm';
  if (format === 'oggopus' || format === 'ogg_opus' || format === 'opus') return 'oggopus';
  if (format === 'mp3') return 'mp3';
  return sttConfig.recognition.format;
}

function resolveStreamingAudioFormat(formatCandidate) {
  const format = normalizeFormat(formatCandidate);
  if (format === 'oggopus' || format === 'ogg_opus' || format === 'opus') {
    return {
      container_audio: {
        container_audio_type: 'OGG_OPUS'
      }
    };
  }
  if (format === 'wav') {
    return {
      container_audio: {
        container_audio_type: 'WAV'
      }
    };
  }
  return {
    raw_audio: {
      audio_encoding: 'LINEAR16_PCM',
      sample_rate_hertz: sttConfig.recognition.sampleRateHz,
      audio_channel_count: sttConfig.recognition.channels
    }
  };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseErrorResponse(response) {
  try {
    const text = await response.text();
    return text || response.statusText;
  } catch {
    return response.statusText || 'Unknown error';
  }
}

function extractTextFromAlternatives(update) {
  if (!update?.alternatives?.length) return '';
  return update.alternatives[0]?.text || '';
}

function extractBestAlternative(update) {
  if (!update?.alternatives?.length) {
    return { text: '', confidence: null };
  }
  const alternative = update.alternatives[0] || {};
  const confidence = Number.isFinite(alternative.confidence) ? alternative.confidence : null;
  return {
    text: alternative.text || '',
    confidence
  };
}

async function recognizeViaYandex(audioBuffer, options = {}) {
  const language = options.language || sttConfig.recognition.language;
  const format = options.format || resolveRestFormat(options.inputFormat || sttConfig.input.format);
  const sampleRateHz = options.sampleRateHz || sttConfig.recognition.sampleRateHz;

  const params = new URLSearchParams({
    lang: language,
    format: format
  });

  if (sampleRateHz && format === 'lpcm') {
    params.set('sampleRateHertz', String(sampleRateHz));
  }

  const url = `${sttConfig.yandex.apiUrl}?${params.toString()}`;
  const headers = {
    ...getAuthHeader(),
    'Content-Type': 'application/octet-stream'
  };

  const maxRetries = sttConfig?.retry?.maxRetries ?? 3;
  const backoffMs = sttConfig?.retry?.backoffMs ?? 500;
  const timeoutMs = sttConfig?.timeouts?.requestMs ?? 15000;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers,
          body: audioBuffer
        },
        timeoutMs
      );

      if (!response.ok) {
        const errorText = await parseErrorResponse(response);
        if (shouldRetry(response.status) && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
          continue;
        }
        throw new Error(`Yandex STT error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        text: data.result || '',
        confidence: data.confidence ?? null,
        raw: data
      };
    } catch (error) {
      const isAbort = error?.name === 'AbortError';
      if ((isAbort || shouldRetry()) && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  return { text: '', confidence: null, raw: null };
}

function buildStreamingOptions(inputFormat = sttConfig.input.format) {
  const normalization = sttConfig.model.textNormalization === 'enabled'
    ? 'TEXT_NORMALIZATION_ENABLED'
    : 'TEXT_NORMALIZATION_DISABLED';

  return {
    recognition_model: {
      model: sttConfig.model.name,
      audio_format: resolveStreamingAudioFormat(inputFormat),
      text_normalization: {
        text_normalization: normalization,
        profanity_filter: sttConfig.model.profanityFilter
      },
      audio_processing_type: 'REAL_TIME'
    },
    eou_classifier: {
      default_classifier: {
        type: 'DEFAULT',
        max_pause_between_words_hint_ms: sttConfig.vad.silenceMs
      }
    }
  };
}

function createStreamingSession(options = {}) {
  if (!Recognizer) {
    throw new Error('gRPC Recognizer proto was not loaded');
  }

  let rootCert = null;
  const caPathRaw = process.env.YANDEX_GRPC_ROOT_CA || process.env.NODE_EXTRA_CA_CERTS;
  const caPath = caPathRaw
    ? (path.isAbsolute(caPathRaw) ? caPathRaw : path.resolve(process.cwd(), caPathRaw))
    : null;
  if (caPath) {
    try {
      rootCert = fs.readFileSync(caPath);
    } catch (error) {
      console.warn('Failed to read custom gRPC root CA:', error?.message || error);
    }
  }

  const credentials = rootCert ? grpc.credentials.createSsl(rootCert) : grpc.credentials.createSsl();
  const client = new Recognizer('stt.api.cloud.yandex.net:443', credentials);
  const metadata = buildMetadata();

  const call = client.RecognizeStreaming(metadata);
  let isClosed = false;

  call.write({ session_options: buildStreamingOptions(options.inputFormat) });

  return {
    onData(handler) {
      call.on('data', handler);
    },
    onError(handler) {
      call.on('error', handler);
    },
    onEnd(handler) {
      call.on('end', handler);
    },
    sendAudioChunk(buffer) {
      if (isClosed) return;
      call.write({ chunk: { data: buffer } });
    },
    sendSilenceChunk(durationMs) {
      if (isClosed) return;
      if (!Number.isFinite(durationMs) || durationMs <= 0) return;
      call.write({ silence_chunk: { duration_ms: Math.floor(durationMs) } });
    },
    isClosed() {
      return isClosed;
    },
    finalize() {
      if (isClosed) return;
      isClosed = true;
      call.end();
    },
    close() {
      if (isClosed) return;
      isClosed = true;
      call.cancel();
    }
  };
}

export const sttService = {
  async recognizeBuffer(audioBuffer, options = {}) {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty');
    }
    return recognizeViaYandex(audioBuffer, { inputFormat: sttConfig.input.format, ...options });
  },
  createStreamingSession,
  extractTextFromAlternatives,
  extractBestAlternative,
  resolveRestFormat
};
