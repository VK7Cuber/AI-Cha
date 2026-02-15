import fs from 'fs';
import path from 'path';
import { Agent } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import { aiConfig } from '../../config/aiConfig.js';

let tokenCache = {
  value: null,
  expiresAt: 0
};

let httpsDispatcher = null;

function resolveCaPath(rawPath) {
  if (!rawPath) return null;
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

function getDispatcher() {
  if (httpsDispatcher) return httpsDispatcher;
  const caPath = resolveCaPath(process.env.GIGACHAT_CA_CERT || process.env.NODE_EXTRA_CA_CERTS);
  if (!caPath) return null;
  try {
    const rootCert = fs.readFileSync(caPath);
    httpsDispatcher = new Agent({ connect: { ca: rootCert } });
    return httpsDispatcher;
  } catch (error) {
    console.warn('[gigachat] failed to read CA cert:', error?.message || error);
    return null;
  }
}

function buildBasicAuth() {
  const { clientId, clientSecret } = aiConfig.gigachat;
  if (!clientId || !clientSecret) {
    throw new Error('GIGACHAT_CLIENT_ID and GIGACHAT_CLIENT_SECRET must be set');
  }
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${token}`;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const dispatcher = getDispatcher();
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      dispatcher: dispatcher || undefined
    });
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

async function requestToken() {
  const authUrl = aiConfig.gigachat.authUrl;
  const scope = aiConfig.gigachat.scope;
  const headers = {
    Authorization: buildBasicAuth(),
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
    RqUID: uuidv4()
  };

  const body = new URLSearchParams({ scope });
  const response = await fetchWithTimeout(
    authUrl,
    { method: 'POST', headers, body },
    aiConfig.timeouts.connectMs
  );

  if (!response.ok) {
    const errorText = await parseErrorResponse(response);
    throw new Error(`GigaChat auth error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresAt = data.expires_at ? Number(data.expires_at) : null;
  const expiresIn = data.expires_in ? Number(data.expires_in) : null;
  const now = Date.now();
  const computedExpiresAt = expiresAt
    ? expiresAt
    : expiresIn
      ? now + expiresIn * 1000
      : now + 30 * 60 * 1000;

  tokenCache = {
    value: accessToken,
    expiresAt: computedExpiresAt - 30 * 1000
  };

  return accessToken;
}

async function getAccessToken() {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value;
  }
  return requestToken();
}

function normalizeMessages(messages = []) {
  return messages
    .filter((item) => item && typeof item.content === 'string')
    .map((item) => ({
      role: item.role,
      content: item.content.trim()
    }))
    .filter((item) => item.content.length > 0);
}

function buildChatMessages(systemPrompt, messages) {
  const history = normalizeMessages(messages);
  const trimmed = history.slice(-10);
  if (systemPrompt) {
    return [{ role: 'system', content: systemPrompt.trim() }, ...trimmed];
  }
  return trimmed;
}

async function callChatCompletion(payload) {
  const apiUrl = `${aiConfig.gigachat.apiUrl}/chat/completions`;
  const accessToken = await getAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const response = await fetchWithTimeout(
    apiUrl,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    },
    aiConfig.timeouts.requestMs
  );

  if (!response.ok) {
    const errorText = await parseErrorResponse(response);
    throw new Error(`GigaChat API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export const aiModelService = {
  async chatCompletion({ systemPrompt, messages }) {
    const payload = {
      model: 'GigaChat',
      messages: buildChatMessages(systemPrompt, messages),
      temperature: aiConfig.model.temperature,
      top_p: aiConfig.model.topP,
      max_tokens: aiConfig.model.maxTokens,
      stream: false
    };

    const maxRetries = aiConfig.retry.maxRetries;
    const backoffMs = aiConfig.retry.backoffMs;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const data = await callChatCompletion(payload);
        const content = data?.choices?.[0]?.message?.content || '';
        return {
          content,
          raw: data
        };
      } catch (error) {
        const shouldRetry = attempt < maxRetries;
        if (!shouldRetry) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
      }
    }

    return { content: '', raw: null };
  }
};
