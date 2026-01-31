import crypto from 'crypto';
import { ttsConfig } from '../config/ttsConfig.js';
import { getRedisClient } from '../utils/redisClient.js';

const CACHE_PREFIX = 'tts';
const ZSET_KEY = `${CACHE_PREFIX}:hits`;
const AUDIO_KEY = (hash) => `${CACHE_PREFIX}:audio:${hash}`;
const META_KEY = (hash) => `${CACHE_PREFIX}:meta:${hash}`;

let redisUnavailableUntil = 0;

function getTtlSeconds() {
  const days = Number(ttsConfig.cache.maxAgeDays || 1);
  return Math.max(60, Math.floor(days * 24 * 60 * 60));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function buildCacheFingerprint(text, options = {}) {
  const parts = [
    normalizeText(text),
    options.useSsml ? 'ssml' : 'text',
    options.language || ttsConfig.synthesis.language,
    options.voice || ttsConfig.synthesis.voice,
    String(options.speed ?? ttsConfig.synthesis.speed),
    options.emotion || ttsConfig.synthesis.emotion,
    options.format || ttsConfig.synthesis.format
  ];
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
}

async function getRedisSafe() {
  if (!ttsConfig.cache.enabled) return null;
  if (Date.now() < redisUnavailableUntil) return null;
  try {
    return await getRedisClient();
  } catch (error) {
    redisUnavailableUntil = Date.now() + 10_000;
    console.warn('[tts-cache] redis unavailable', error?.message || error);
    return null;
  }
}

function extractValues(popped) {
  if (!Array.isArray(popped)) return [];
  return popped.map((entry) => entry?.value ?? entry?.member ?? entry?.[0] ?? entry).filter(Boolean);
}

async function ensureCacheLimit(client) {
  const maxEntries = Number(ttsConfig.cache.maxEntries || 0);
  if (!maxEntries) return;
  const total = await client.zCard(ZSET_KEY);
  if (total <= maxEntries) return;
  const excess = total - maxEntries;
  const popped = await client.zPopMin(ZSET_KEY, excess);
  const hashes = extractValues(popped);
  if (!hashes.length) return;
  const keysToDelete = hashes.flatMap((hash) => [AUDIO_KEY(hash), META_KEY(hash)]);
  await client.del(keysToDelete);
}

async function getCachedTts(text, options = {}) {
  try {
    const client = await getRedisSafe();
    if (!client) return null;

    const hash = buildCacheFingerprint(text, options);
    const audioBase64 = await client.get(AUDIO_KEY(hash));
    if (!audioBase64) {
      await client.zRem(ZSET_KEY, hash);
      await client.del(META_KEY(hash));
      return null;
    }

    const meta = await client.hGetAll(META_KEY(hash));
    if (!meta || Object.keys(meta).length === 0) {
      await client.zRem(ZSET_KEY, hash);
      await client.del(AUDIO_KEY(hash));
      return null;
    }

    const audio = Buffer.from(audioBase64, 'base64');
    await client.hIncrBy(META_KEY(hash), 'hits', 1);
    await client.zIncrBy(ZSET_KEY, 1, hash);

    return {
      audioBuffer: audio,
      contentType: meta.contentType || 'application/octet-stream',
      format: meta.format,
      voice: meta.voice,
      speed: meta.speed ? Number(meta.speed) : null,
      emotion: meta.emotion,
      language: meta.language,
      cacheHit: true
    };
  } catch (error) {
    console.warn('[tts-cache] get failed', error?.message || error);
    return null;
  }
}

async function setCachedTts(text, result, options = {}) {
  try {
    const client = await getRedisSafe();
    if (!client) return;
    if (!result?.audioBuffer) return;

    const hash = buildCacheFingerprint(text, options);
    const ttlSeconds = getTtlSeconds();

    const audioBase64 = result.audioBuffer.toString('base64');
    await client.set(AUDIO_KEY(hash), audioBase64, { EX: ttlSeconds });
    await client.hSet(META_KEY(hash), {
      contentType: result.contentType || 'application/octet-stream',
      format: result.format || options.format || ttsConfig.synthesis.format,
      voice: result.voice || options.voice || ttsConfig.synthesis.voice,
      speed: String(result.speed ?? options.speed ?? ttsConfig.synthesis.speed),
      emotion: result.emotion || options.emotion || ttsConfig.synthesis.emotion,
      language: result.language || options.language || ttsConfig.synthesis.language,
      hits: '1',
      createdAt: new Date().toISOString()
    });
    await client.expire(META_KEY(hash), ttlSeconds);
    await client.zAdd(ZSET_KEY, { score: 1, value: hash });

    await ensureCacheLimit(client);
  } catch (error) {
    console.warn('[tts-cache] set failed', error?.message || error);
  }
}

export const ttsCacheManager = {
  get: getCachedTts,
  set: setCachedTts
};
