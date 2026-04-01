/**
 * Data for the offline demo mode.
 *
 * Audio files are generated once (when internet is available) by running:
 *   cd backend && npm run demo:generate-audio
 *
 * They are stored in frontend/public/demo/ and served as static assets.
 * The filenames here MUST stay in sync with backend/scripts/generate-demo-audio.js.
 */

import type { GeneratedRecipe } from '../services/aiRecipeService';

// ─── Demo dialogue steps ──────────────────────────────────────────────────────

export interface DemoStep {
  /** Text displayed and spoken by the AI barista */
  question: string;
  /** Chinese translation shown as subtitle */
  questionZh?: string;
  /** Path relative to the Vite public root (served at /demo/…) */
  audioFile: string;
  /** If true this is the closing phrase — navigate to recipe after playing */
  isClosing?: boolean;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    question:
      'Привет! Как настроение? Хочется бодрости и тонуса, или, наоборот, чего-то мягкого и расслабляющего?',
    questionZh: '你现在的心情怎么样？想要提神还是放松一下？',
    audioFile: '/demo/q1.mp3',
  },
  {
    question:
      'Отлично! В таком случае, вам отлично подойдёт матча-латте или молочный улун - они помогут зарядиться на день! Что думаете?',
    questionZh: '你喜欢抹茶还是牛奶？',
    audioFile: '/demo/q2.mp3',
  },
  {
    question: 'Прекрасно! Бодрость и матча — есть идея! Начинаю творить!',
    questionZh: '太好了！开始为你创作！',
    audioFile: '/demo/closing.mp3',
    isClosing: true,
  },
];

// The first two steps are "questions" (user answers), the last is the closing.
export const DEMO_QUESTION_COUNT = DEMO_STEPS.filter((s) => !s.isClosing).length;

// ─── Demo suggested answers (for the presenter) ──────────────────────────────
// Not used in code — kept here for reference. See DEMO_INSTRUCTIONS.md.
export const DEMO_SUGGESTED_ANSWERS = [
  'Наверное, хочу взбодриться, впереди важный день!',
  'Никогда не пробовал матча.... давай попробуем!',
];

// ─── Pre-generated demo recipe ────────────────────────────────────────────────

export const DEMO_RECIPE: GeneratedRecipe = {
  id: 'demo-recipe-001',
  session_id: 'demo-session',
  name_ru: 'Облачный Матча',
  name_zh: '云朵抹茶',
  description_ru:
    'Нежный матча-латте с воздушным кокосовым кремом и лёгкой ноткой имбиря — напиток, который одновременно бодрит ум и согревает душу.',
  reasoning_ru:
    'Вы выбрали бодрость и насыщенный вкус — именно поэтому в основе японский матча церемониального класса. ' +
    'Кокосовое молоко смягчает горчинку и создаёт кремовую текстуру, ' +
    'а имбирный сироп добавляет тонкий тонизирующий акцент.',
  personal_message:
    '🍵 Этот напиток создан специально для вас — пусть он подарит энергию и хорошее настроение!',
  preparation_steps: [
    { step: 1, instruction: 'Просейте матча через мелкое сито в чашку' },
    { step: 2, instruction: 'Добавьте 30 мл горячей воды (80 °C) и взбейте до однородной пасты' },
    { step: 3, instruction: 'Подогрейте кокосовое молоко и взбейте в пышную пену' },
    { step: 4, instruction: 'Влейте молоко к матча, добавьте имбирный сироп' },
    { step: 5, instruction: 'Украсьте молочной пеной и щепоткой матча-порошка' },
  ],
  temperature: 'hot',
  total_price: '390',
  preparation_time_minutes: 5,
  ingredients: [
    {
      ingredient_id: 'demo-matcha',
      amount: '5 г',
      ingredient: { id: 'demo-matcha', name_ru: 'Матча церемониальный', name_zh: '抹茶' },
    },
    {
      ingredient_id: 'demo-coconut-milk',
      amount: '150 мл',
      ingredient: { id: 'demo-coconut-milk', name_ru: 'Кокосовое молоко', name_zh: '椰奶' },
    },
    {
      ingredient_id: 'demo-milk',
      amount: '100 мл',
      ingredient: { id: 'demo-milk', name_ru: 'Молоко', name_zh: '牛奶' },
    },
    {
      ingredient_id: 'demo-ginger-syrup',
      amount: '10 мл',
      ingredient: {
        id: 'demo-ginger-syrup',
        name_ru: 'Имбирный сироп',
        name_zh: '姜汁糖浆',
      },
    },
  ],
};
