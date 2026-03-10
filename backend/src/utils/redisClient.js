import { createClient } from 'redis';

let client = null;
let connectPromise = null;
let lastErrorLogAt = 0;

function logRedisError(error) {
  const now = Date.now();
  // Throttle repetitive connection errors when redis is down.
  if (now - lastErrorLogAt < 10_000) return;
  lastErrorLogAt = now;
  console.error('[redis] error', error?.message || error);
}

function withTimeout(promise, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Redis connect timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export async function getRedisClient() {
  if (client?.isOpen) return client;

  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    const connectTimeout = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 1000);
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout,
        reconnectStrategy: () => false
      }
    });
    client.on('error', (error) => {
      logRedisError(error);
    });
  }

  if (!connectPromise) {
    connectPromise = client.connect().catch((error) => {
      connectPromise = null;
      throw error;
    });
  }

  const timeoutMs = Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 1000);
  try {
    await withTimeout(connectPromise, timeoutMs);
    return client;
  } catch (error) {
    connectPromise = null;
    try {
      await client.disconnect();
    } catch {
      // ignore disconnect errors when redis is unavailable
    }
    client = null;
    throw error;
  }
}
