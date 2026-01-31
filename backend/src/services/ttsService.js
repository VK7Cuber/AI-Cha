import { ttsConfig } from '../config/ttsConfig.js';

function getAuthHeader() {
  if (ttsConfig.yandex.apiKey) {
    return { Authorization: `Api-Key ${ttsConfig.yandex.apiKey}` };
  }
  if (ttsConfig.yandex.iamToken) {
    return { Authorization: `Bearer ${ttsConfig.yandex.iamToken}` };
  }
  throw new Error('YANDEX_API_KEY or YANDEX_IAM_TOKEN must be set');
}

function resolveContentType(format, fallback) {
  if (fallback) return fallback;
  const normalized = String(format || '').toLowerCase();
  if (normalized === 'mp3') return 'audio/mpeg';
  if (normalized === 'wav') return 'audio/wav';
  if (normalized === 'oggopus' || normalized === 'ogg_opus' || normalized === 'opus') {
    return 'audio/ogg';
  }
  return 'application/octet-stream';
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

function buildSynthesisParams(text, options = {}) {
  const params = new URLSearchParams();
  const language = options.language || ttsConfig.synthesis.language;
  const voice = options.voice || ttsConfig.synthesis.voice;
  const speed = options.speed ?? ttsConfig.synthesis.speed;
  const emotion = options.emotion || ttsConfig.synthesis.emotion;
  const format = options.format || ttsConfig.synthesis.format;

  if (options.useSsml) {
    params.set('ssml', text);
  } else {
    params.set('text', text);
  }
  params.set('lang', language);
  params.set('voice', voice);
  params.set('speed', String(speed));
  params.set('emotion', emotion);
  params.set('format', format);

  if (ttsConfig.yandex.folderId) {
    params.set('folderId', ttsConfig.yandex.folderId);
  }

  return {
    params,
    meta: {
      language,
      voice,
      speed,
      emotion,
      format
    }
  };
}

async function synthesizeViaYandex(text, options = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    throw new Error('Text is required for TTS synthesis');
  }

  const { params, meta } = buildSynthesisParams(trimmed, options);
  const headers = {
    ...getAuthHeader(),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const maxRetries = ttsConfig?.retry?.maxRetries ?? 2;
  const backoffMs = ttsConfig?.retry?.backoffMs ?? 500;
  const timeoutMs = ttsConfig?.timeouts?.requestMs ?? 15000;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        ttsConfig.yandex.apiUrl,
        {
          method: 'POST',
          headers,
          body: params.toString()
        },
        timeoutMs
      );

      if (!response.ok) {
        const errorText = await parseErrorResponse(response);
        if (response.status >= 500 && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
          continue;
        }
        throw new Error(`Yandex TTS error (${response.status}): ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = resolveContentType(meta.format, response.headers.get('content-type'));
      return {
        audioBuffer: Buffer.from(arrayBuffer),
        contentType,
        ...meta
      };
    } catch (error) {
      const isAbort = error?.name === 'AbortError';
      if ((isAbort || error?.status >= 500) && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  return null;
}

export const ttsService = {
  async synthesizeText(text, options = {}) {
    return synthesizeViaYandex(text, options);
  }
};
