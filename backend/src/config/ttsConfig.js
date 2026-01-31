export const ttsConfig = {
  provider: 'yandex',
  yandex: {
    apiKey: process.env.YANDEX_API_KEY,
    iamToken: process.env.YANDEX_IAM_TOKEN,
    folderId: process.env.YANDEX_FOLDER_ID,
    apiUrl: process.env.YANDEX_TTS_URL || 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'
  },
  synthesis: {
    language: process.env.TTS_LANG || 'ru-RU',
    voice: process.env.TTS_VOICE || 'alena',
    speed: Number(process.env.TTS_SPEED || 1.0),
    emotion: process.env.TTS_EMOTION || 'neutral',
    format: process.env.TTS_FORMAT || 'oggopus'
  },
  timeouts: {
    requestMs: Number(process.env.TTS_REQUEST_TIMEOUT_MS || 15000)
  },
  retry: {
    maxRetries: Number(process.env.TTS_MAX_RETRIES || 2),
    backoffMs: Number(process.env.TTS_RETRY_BACKOFF_MS || 500)
  },
  cache: {
    enabled: process.env.TTS_CACHE_ENABLED !== 'false',
    maxEntries: Number(process.env.TTS_CACHE_MAX_ENTRIES || 100),
    maxAgeDays: Number(process.env.TTS_CACHE_MAX_AGE_DAYS || 1)
  }
};
