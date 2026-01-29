export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'gigachat',
  model: {
    temperature: Number(process.env.AI_TEMPERATURE || 0.7),
    maxTokens: Number(process.env.AI_MAX_TOKENS || 800),
    topP: Number(process.env.AI_TOP_P || 0.9)
  },
  timeouts: {
    requestMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 15000),
    connectMs: Number(process.env.AI_CONNECT_TIMEOUT_MS || 5000)
  },
  retry: {
    maxRetries: Number(process.env.AI_MAX_RETRIES || 3),
    backoffMs: Number(process.env.AI_RETRY_BACKOFF_MS || 500)
  },
  gigachat: {
    clientId: process.env.GIGACHAT_CLIENT_ID,
    clientSecret: process.env.GIGACHAT_CLIENT_SECRET,
    scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
    authUrl: process.env.GIGACHAT_AUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    apiUrl: process.env.GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1'
  },
  llama: {
    apiUrl: process.env.LLAMA_API_URL || null,
    apiKey: process.env.LLAMA_API_KEY || null
  }
};
