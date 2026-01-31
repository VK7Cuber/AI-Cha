import { createClient } from 'redis';

let client = null;
let connectPromise = null;

export async function getRedisClient() {
  if (client?.isOpen) return client;

  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    client = createClient({ url: redisUrl });
    client.on('error', (error) => {
      console.error('[redis] error', error?.message || error);
    });
  }

  if (!connectPromise) {
    connectPromise = client.connect().catch((error) => {
      connectPromise = null;
      throw error;
    });
  }

  await connectPromise;
  return client;
}
