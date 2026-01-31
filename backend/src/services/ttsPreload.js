import { ttsConfig } from '../config/ttsConfig.js';
import { ttsService } from './ttsService.js';

const DEFAULT_PHRASES = [
  'Здравствуйте! Как ваше настроение сегодня?',
  'Здравствуйте! Давайте придумаем что-нибудь вкусное специально для вас!',
  'Не расслышал, повторите пожалуйста',
  'Понял, спасибо!',
  'Отлично! Я подобрал для вас несколько напитков'
];

function resolvePhrases() {
  const raw = process.env.TTS_PRELOAD_PHRASES;
  if (!raw) return DEFAULT_PHRASES;
  return raw
    .split('|')
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

async function runPreload() {
  if (!ttsConfig.cache.enabled) {
    return;
  }
  if (process.env.TTS_PRELOAD_ENABLED !== 'true') {
    return;
  }
  if (!ttsConfig.yandex.apiKey && !ttsConfig.yandex.iamToken) {
    console.warn('[tts-preload] skipped: missing Yandex credentials');
    return;
  }

  const phrases = resolvePhrases();
  if (!phrases.length) return;

  for (const phrase of phrases) {
    try {
      await ttsService.synthesizeText(phrase, {
        language: ttsConfig.synthesis.language,
        voice: ttsConfig.synthesis.voice,
        speed: ttsConfig.synthesis.speed,
        emotion: ttsConfig.synthesis.emotion,
        format: ttsConfig.synthesis.format
      });
    } catch (error) {
      console.warn('[tts-preload] failed', error?.message || error);
    }
  }
}

export function scheduleTtsPreload() {
  setTimeout(() => {
    runPreload().catch((error) => {
      console.warn('[tts-preload] error', error?.message || error);
    });
  }, 1000);
}
