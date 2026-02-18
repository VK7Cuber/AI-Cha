import { models } from '../../database/models/init.js';
import { ingredientService } from '../../services/ingredientService.js';
import { recipeService } from '../../services/recipeService.js';
import { buildRecipePrompt } from '../prompts/recipePrompt.js';
import { aiModelService } from './aiModelService.js';

const { DialogMessage, GeneratedRecipe, GeneratedRecipeIngredient, Ingredient, RecipeGenerationLog } = models;

const PRICE_MULTIPLIER = Number(process.env.RECIPE_PRICE_MULTIPLIER || 2.7);

function buildDialogText(messages) {
  return messages
    .map((message) => `${message.role === 'user' ? 'Пользователь' : 'Бариста'}: ${message.content}`)
    .join('\n');
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeRecipe(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    name_ru: raw.name_ru || '',
    name_zh: raw.name_zh || '',
    description_ru: raw.description_ru || '',
    reasoning_ru: raw.reasoning_ru || '',
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    preparation_steps: Array.isArray(raw.preparation_steps) ? raw.preparation_steps : [],
    temperature: raw.temperature || null,
    preparation_time_minutes: raw.preparation_time_minutes || null
  };
}

function buildIngredientsText(ingredients, categoriesMap) {
  return ingredients
    .map((ingredient) => {
      const category = categoriesMap.get(ingredient.category_id) || 'unknown';
      const flavor = ingredient.flavor_profile ? JSON.stringify(ingredient.flavor_profile) : '';
      const effects = ingredient.effects ? JSON.stringify(ingredient.effects) : '';
      const mood = ingredient.mood_tags ? JSON.stringify(ingredient.mood_tags) : '';
      return `- ${ingredient.name_ru} (id: ${ingredient.id}) | category: ${category} | caffeine: ${ingredient.caffeine_level} | vegan: ${ingredient.is_vegan} | sugar_free: ${ingredient.is_sugar_free} | flavor: ${flavor} | effects: ${effects} | mood: ${mood}`;
    })
    .join('\n');
}

function buildBaseRecipesText(baseRecipes) {
  return baseRecipes
    .map((recipe) => `- ${recipe.name_ru}: ${recipe.description_ru || ''}`)
    .join('\n');
}

function compatibilityStub() {
  return 'Проверка совместимости пока отключена. Избегай очевидных конфликтов (например, молоко + лимон).';
}

function validateCompatibilityStub() {
  return true;
}

function computePrice(ingredientsById, recipeIngredients) {
  const total = recipeIngredients.reduce((sum, item) => {
    const ingredient = ingredientsById.get(item.ingredient_id);
    const cost = ingredient?.cost_per_serving ? Number(ingredient.cost_per_serving) : 0;
    return sum + (Number.isFinite(cost) ? cost : 0);
  }, 0);
  const price = total * PRICE_MULTIPLIER;
  return Math.round(price / 10) * 10;
}

function truncateText(text, maxLength = 4000) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export const recipeGeneratorService = {
  async generateForSession({ sessionId, userProfile }) {
    const messages = await DialogMessage.getForSession(sessionId);
    if (!messages || messages.length === 0) {
      throw new Error('Диалог пуст');
    }
    if (!userProfile?.id) {
      throw new Error('Не удалось получить профиль пользователя');
    }

    const generationStartedAt = Date.now();
    const ingredients = await ingredientService.getAll({ is_available: 'true' });
    const categories = await ingredientService.getCategories();
    const categoriesMap = new Map(categories.map((cat) => [cat.id, cat.name_ru]));

    const baseRecipes = await recipeService.getBaseRecipes({});
    const baseRecipesSample = baseRecipes.slice(0, 3);

    const dialogText = buildDialogText(messages);
    const userProfileJson = JSON.stringify(
      {
        mood: userProfile?.mood || null,
        mood_confidence: userProfile?.mood_confidence ?? null,
        preferences: userProfile?.preferences || {},
        context: userProfile?.context || {}
      },
      null,
      2
    );
    const prompt = buildRecipePrompt({
      userProfileJson,
      ingredientsText: buildIngredientsText(ingredients, categoriesMap),
      compatibilityText: compatibilityStub(),
      baseRecipesText: buildBaseRecipesText(baseRecipesSample),
      dialogText
    });

    const response = await aiModelService.chatCompletion({
      systemPrompt: prompt,
      messages: []
    });

    const parsed = extractJson(response.content);
    const recipe = normalizeRecipe(parsed);
    if (!recipe || !recipe.ingredients.length || !recipe.name_ru) {
      throw new Error('AI вернул некорректный рецепт');
    }

    if (!validateCompatibilityStub(recipe.ingredients)) {
      throw new Error('Рецепт не прошел проверку совместимости');
    }

    const ingredientsById = new Map(ingredients.map((item) => [item.id, item]));
    const validIngredients = recipe.ingredients.filter((item) => ingredientsById.has(item.ingredient_id));
    if (!validIngredients.length) {
      throw new Error('В рецепте нет доступных ингредиентов');
    }

    const totalPrice = computePrice(ingredientsById, validIngredients);

    const created = await GeneratedRecipe.create({
      session_id: sessionId,
      name_ru: recipe.name_ru,
      name_zh: recipe.name_zh || recipe.name_ru,
      description_ru: recipe.description_ru,
      reasoning_ru: recipe.reasoning_ru,
      personal_message: recipe.personal_message || null,
      serving_style: recipe.serving_style || null,
      preparation_steps: recipe.preparation_steps,
      temperature: recipe.temperature,
      preparation_time_minutes: recipe.preparation_time_minutes,
      total_price: totalPrice
    });

    await Promise.all(
      validIngredients.map((item, index) =>
        GeneratedRecipeIngredient.create({
          generated_recipe_id: created.id,
          ingredient_id: item.ingredient_id,
          amount: item.amount || null,
          preparation_note: item.note || null,
          order_in_recipe: index + 1
        })
      )
    );

    await RecipeGenerationLog.createLog(sessionId, userProfile.id, created.id, {
      ai_reasoning: recipe.reasoning_ru,
      prompt_used: truncateText(prompt),
      generation_time_ms: Date.now() - generationStartedAt
    });

    return created;
  },

  async getGeneratedForSession(sessionId) {
    return GeneratedRecipe.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: GeneratedRecipeIngredient,
          as: 'ingredients',
          include: [{ model: Ingredient, as: 'ingredient' }],
          order: [['order_in_recipe', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }
};
