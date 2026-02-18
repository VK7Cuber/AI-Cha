export const sttConfig = {
  provider: 'yandex',
  yandex: {
    apiKey: process.env.YANDEX_API_KEY,
    iamToken: process.env.YANDEX_IAM_TOKEN,
    folderId: process.env.YANDEX_FOLDER_ID,
    apiUrl: process.env.YANDEX_STT_URL || 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize'
  },
  input: {
    format: process.env.STT_INPUT_FORMAT || 'pcm16',
    sampleRateHz: Number(process.env.STT_INPUT_SAMPLE_RATE || 16000),
    channels: Number(process.env.STT_INPUT_CHANNELS || 1)
  },
  recognition: {
    language: 'ru-RU',
    format: 'oggopus',
    sampleRateHz: 16000,
    channels: 1,
    interimResults: true
  },
  model: {
    name: process.env.STT_MODEL || 'general',
    textNormalization: process.env.STT_TEXT_NORMALIZATION || 'enabled',
    profanityFilter: process.env.STT_PROFANITY_FILTER === 'true'
  },
  streaming: {
    chunkMs: 100,
    maxDurationMs: 10000,
    sessionTimeoutMs: 10000
  },
  timeouts: {
    requestMs: Number(process.env.STT_REQUEST_TIMEOUT_MS || 15000)
  },
  retry: {
    maxRetries: Number(process.env.STT_MAX_RETRIES || 3),
    backoffMs: Number(process.env.STT_RETRY_BACKOFF_MS || 500)
  },
  vad: {
    enabled: true,
    silenceMs: Number(process.env.STT_VAD_SILENCE_MS || 3000),
    minSpeechMs: 500,
    maxSpeechMs: 10000,
    volumeThreshold: 0.02
  }
};
