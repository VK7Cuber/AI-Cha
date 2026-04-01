/**
 * Generates pre-recorded TTS audio files for the offline demo mode.
 * Run once before a demo when internet is available:
 *
 *   cd backend
 *   npm run demo:generate-audio
 *
 * Output: frontend/public/demo/{q1,q2,closing}.<ext>
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ttsService } from '../src/services/ttsService.js';
import { ttsConfig } from '../src/config/ttsConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../../frontend/public/demo');

// ─── Demo phrases ─────────────────────────────────────────────────────────────
// These MUST stay in sync with DEMO_STEPS in frontend/src/data/demoData.ts
const PHRASES = [
  {
    id: 'q1',
    text: 'Привет! Как настроение? Хочется бодрости и тонуса, или, наоборот, чего-то мягкого и расслабляющего?',
  },
  {
    id: 'q2',
    text: 'Отлично! В таком случае, вам отлично подойдёт матча-латте или молочный улун - они помогут зарядиться на день! Что думаете?',
  },
  {
    id: 'closing',
    text: 'Прекрасно! Бодрость и матча — есть идея! Начинаю творить!',
  },
];

// ─── TTS options ──────────────────────────────────────────────────────────────
// Uses the same voice/speed/format as the main app (from .env / ttsConfig).
const TTS_OPTIONS = {
  language: ttsConfig.synthesis.language,
  voice:    ttsConfig.synthesis.voice,
  speed:    ttsConfig.synthesis.speed,
  emotion:  ttsConfig.synthesis.emotion,
  format:   ttsConfig.synthesis.format,
};

function extForFormat(format) {
  if (format === 'mp3')                               return 'mp3';
  if (format === 'oggopus' || format === 'ogg_opus') return 'ogg';
  if (format === 'wav')                               return 'wav';
  return format || 'bin';
}

async function main() {
  console.log('🎙  Generating demo TTS audio files…');
  console.log(`   Voice : ${TTS_OPTIONS.voice}`);
  console.log(`   Format: ${TTS_OPTIONS.format}`);
  console.log(`   Speed : ${TTS_OPTIONS.speed}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('   Created output directory.\n');
  }

  let allOk = true;
  for (const phrase of PHRASES) {
    process.stdout.write(`   [${phrase.id}] Synthesizing…`);
    try {
      const result = await ttsService.synthesizeText(phrase.text, TTS_OPTIONS);
      const ext    = extForFormat(result.format || TTS_OPTIONS.format);
      const file   = path.join(OUTPUT_DIR, `${phrase.id}.${ext}`);
      fs.writeFileSync(file, result.audioBuffer);
      console.log(` ✓  ${result.audioBuffer.length} bytes → ${path.basename(file)}`);
    } catch (err) {
      console.log(' ✗');
      console.error(`      Error: ${err?.message || err}`);
      allOk = false;
    }
  }

  if (!allOk) {
    console.error('\n✗  Some files failed. Check your YANDEX_API_KEY and network connection.');
    process.exit(1);
  }

  console.log('\n✓  All demo audio files generated successfully!');
  console.log('   You can now run the frontend offline demo without internet.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
