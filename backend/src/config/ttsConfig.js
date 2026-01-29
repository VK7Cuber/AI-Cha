export const ttsConfig = {
  provider: 'yandex',
  yandex: {
    apiKey: process.env.YANDEX_API_KEY,
    iamToken: process.env.YANDEX_IAM_TOKEN,
    folderId: process.env.YANDEX_FOLDER_ID
  },
  synthesis: {
    voice: process.env.TTS_VOICE || 'alena',
    speed: Number(process.env.TTS_SPEED || 1.0),
    emotion: process.env.TTS_EMOTION || 'neutral',
    format: process.env.TTS_FORMAT || 'oggopus'
  },
  cache: {
    enabled: process.env.TTS_CACHE_ENABLED !== 'false',
    maxEntries: Number(process.env.TTS_CACHE_MAX_ENTRIES || 500),
    maxAgeDays: Number(process.env.TTS_CACHE_MAX_AGE_DAYS || 30)
  }
};
