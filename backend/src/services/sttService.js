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

async function recognizeViaYandex(audioBuffer, options = {}) {
  const language = options.language || sttConfig.recognition.language;
  const format = options.format || sttConfig.recognition.format;
  const sampleRateHz = options.sampleRateHz || sttConfig.recognition.sampleRateHz;

  const params = new URLSearchParams({
    lang: language,
    format: format
  });

  if (sampleRateHz && format !== 'oggopus') {
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

function buildStreamingOptions() {
  const normalization = sttConfig.model.textNormalization === 'enabled'
    ? 'TEXT_NORMALIZATION_ENABLED'
    : 'TEXT_NORMALIZATION_DISABLED';

  return {
    recognition_model: {
      model: sttConfig.model.name,
      audio_format: {
        raw_audio: {
          audio_encoding: 'LINEAR16_PCM',
          sample_rate_hertz: sttConfig.recognition.sampleRateHz,
          audio_channel_count: sttConfig.recognition.channels
        }
      },
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

function createStreamingSession() {
  if (!Recognizer) {
    throw new Error('gRPC Recognizer proto was not loaded');
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a176f22f-f145-4f71-8b93-2ee49b515c57',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sttService.js:170',message:'createStreamingSession',data:{host:'stt.api.cloud.yandex.net:443',hasApiKey:Boolean(sttConfig.yandex.apiKey),hasIamToken:Boolean(sttConfig.yandex.iamToken),hasFolderId:Boolean(sttConfig.yandex.folderId)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H11'})}).catch(()=>{});
  // #endregion

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

  call.write({ session_options: buildStreamingOptions() });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a176f22f-f145-4f71-8b93-2ee49b515c57',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sttService.js:198',message:'stream initialized',data:{optionsSent:true},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H11'})}).catch(()=>{});
  // #endregion

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
    return recognizeViaYandex(audioBuffer, options);
  },
  createStreamingSession,
  extractTextFromAlternatives
};
