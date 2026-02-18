import { models } from '../../database/models/init.js';
import { ingredientService } from '../../services/ingredientService.js';
import { analysisPrompt } from '../prompts/analysisPrompt.js';
import { aiModelService } from './aiModelService.js';

const { DialogMessage, UserProfile } = models;

const FALLBACK_ENABLED = process.env.ANALYSIS_FALLBACK_ENABLED !== 'false';

function buildDialogText(messages) {
  return messages
    .map((message) => `${message.role === 'user' ? 'Пользователь' : 'Бариста'}: ${message.content}`)
    .join('\n');
}

function buildIngredientsText(ingredients, categoriesMap) {
  return ingredients
    .map((ingredient) => {
      const category = categoriesMap.get(ingredient.category_id) || 'unknown';
      return `- ${ingredient.name_ru} (id: ${ingredient.id}) | category: ${category} | caffeine: ${ingredient.caffeine_level} | vegan: ${ingredient.is_vegan}`;
    })
    .join('\n');
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    mood: raw.mood || {},
    taste_profile: raw.taste_profile || {},
    drink_params: raw.drink_params || {},
    restrictions: raw.restrictions || {},
    context: raw.context || {},
    special_wishes: raw.special_wishes || '',
    personalization_hints: raw.personalization_hints || {}
  };
}

function keywordFallback(text) {
  const normalized = String(text || '').toLowerCase();

  const mood = {
    primary: 'neutral',
    secondary: 'neutral',
    confidence: 0.3,
    evidence: ''
  };

  const evidence = [];
  const addEvidence = (phrase) => {
    if (phrase) evidence.push(phrase);
  };

  if (normalized.includes('устал')) {
    mood.primary = 'tired';
    addEvidence('устал');
  } else if (normalized.includes('счаст') || normalized.includes('рад')) {
    mood.primary = 'happy';
    addEvidence('счаст');
  } else if (normalized.includes('стресс') || normalized.includes('горит')) {
    mood.primary = 'focused';
    mood.secondary = 'stressed';
    addEvidence('стресс');
  } else if (normalized.includes('влюб') || normalized.includes('романт')) {
    mood.primary = 'romantic';
    addEvidence('влюб');
  } else if (normalized.includes('энерг') || normalized.includes('бодр')) {
    mood.primary = 'energetic';
    addEvidence('бодр');
  }

  mood.evidence = evidence.join('; ');

  const taste_profile = {
    sweetness: normalized.includes('без сах') ? 'none' : normalized.includes('слад') ? 'sweet' : 'neutral',
    sourness: normalized.includes('кисл') ? 'yes' : 'neutral',
    bitterness: normalized.includes('горьк') ? 'yes' : 'neutral',
    spicy: normalized.includes('прян') || normalized.includes('остр') ? 'yes' : 'neutral',
    floral: normalized.includes('цветоч') ? 'yes' : 'neutral'
  };

  let temperature = 'warm';
  if (normalized.includes('холод')) temperature = 'cold';
  if (normalized.includes('горяч')) temperature = 'hot';

  let caffeine = 'low';
  if (normalized.includes('без кофеин') || normalized.includes('без кофе')) caffeine = 'no';
  if (normalized.includes('кофеин') || normalized.includes('бодр')) caffeine = 'yes';

  let milk = 'none';
  if (normalized.includes('овсян') || normalized.includes('кокос') || normalized.includes('соев')) {
    milk = 'plant';
  } else if (normalized.includes('молок')) {
    milk = 'dairy';
  }

  const drink_params = {
    temperature,
    caffeine,
    milk,
    texture: normalized.includes('кремов') ? 'creamy' : normalized.includes('пен') ? 'foamy' : 'light'
  };

  const restrictions = {
    is_vegan: normalized.includes('веган'),
    sugar_free: normalized.includes('без сах'),
    allergies: [],
    age_appropriate: true
  };

  const context = {
    in_hurry: normalized.includes('спеш') || normalized.includes('быстр'),
    to_go: normalized.includes('с собой'),
    time_of_day: normalized.includes('утр') ? 'morning' : normalized.includes('вечер') ? 'evening' : 'afternoon',
    is_tourist: normalized.includes('турист') || normalized.includes('приехал'),
    has_company: normalized.includes('с друзья') || normalized.includes('с компанией'),
    special_occasion: normalized.includes('свидан')
      ? 'date'
      : normalized.includes('встреч')
        ? 'meeting'
        : normalized.includes('работ')
          ? 'work'
          : 'none'
  };

  const personalization_hints = {
    profession: normalized.includes('программист') || normalized.includes('разработчик') ? 'programmer' : '',
    hobbies: [],
    cultural_context: normalized.includes('китай') ? 'chinese' : ''
  };

  const special_wishes = normalized.includes('без сах')
    ? 'без сахара'
    : normalized.includes('без кофеин')
      ? 'без кофеина'
      : '';

  return {
    mood,
    taste_profile,
    drink_params,
    restrictions,
    context,
    special_wishes,
    personalization_hints
  };
}

export const analysisService = {
  async analyzeSession(sessionId) {
    const messages = await DialogMessage.getForSession(sessionId);
    if (!messages || messages.length === 0) {
      throw new Error('Диалог пуст');
    }

    const dialogText = buildDialogText(messages);
    const ingredients = await ingredientService.getAll({ is_available: 'true' });
    const categories = await ingredientService.getCategories();
    const categoriesMap = new Map(categories.map((cat) => [cat.id, cat.name_ru]));
    const ingredientsText = buildIngredientsText(ingredients, categoriesMap);
    let analysis = null;

    try {
      const response = await aiModelService.chatCompletion({
        systemPrompt: analysisPrompt,
        messages: [
          {
            role: 'user',
            content: `Диалог:\n${dialogText}\n\nДоступные ингредиенты:\n${ingredientsText}`
          }
        ]
      });
      const parsed = extractJson(response.content);
      analysis = normalizeAnalysis(parsed);
    } catch {
      analysis = null;
    }

    if (!analysis && FALLBACK_ENABLED) {
      analysis = keywordFallback(dialogText);
    }

    if (!analysis) {
      throw new Error('Не удалось проанализировать диалог');
    }

    const profileData = {
      mood: analysis.mood?.primary || null,
      mood_confidence: analysis.mood?.confidence ?? null,
      preferences: {
        taste_profile: analysis.taste_profile || {},
        drink_params: analysis.drink_params || {},
        restrictions: analysis.restrictions || {},
        special_wishes: analysis.special_wishes || '',
        personalization_hints: analysis.personalization_hints || {}
      },
      context: analysis.context || {}
    };

    const profile = await UserProfile.createOrUpdateForSession(sessionId, profileData);

    return { analysis, profile };
  }
};
