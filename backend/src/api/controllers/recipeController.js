import { recipeService } from '../../services/recipeService.js';
import { analysisService } from '../../ai/services/analysisService.js';
import { recipeGeneratorService } from '../../ai/services/recipeGeneratorService.js';

export const recipeController = {
  async getAllBase(request, reply) {
    const recipes = await recipeService.getBaseRecipes(request.query || {});
    reply.send(recipes);
  },

  async getBaseById(request, reply) {
    const recipe = await recipeService.getBaseRecipeById(request.params.id);
    if (!recipe) {
      reply.code(404).send({ message: 'Рецепт не найден' });
      return;
    }
    reply.send(recipe);
  },

  async getBaseIngredients(request, reply) {
    const recipe = await recipeService.getBaseRecipeById(request.params.id);
    if (!recipe) {
      reply.code(404).send({ message: 'Рецепт не найден' });
      return;
    }
    reply.send(recipe.ingredients || []);
  },

  async generateFromDialog(request, reply) {
    try {
      const sessionId = request.body?.session_id;
      const { profile } = await analysisService.analyzeSession(sessionId);
      const generated = await recipeGeneratorService.generateForSession({
        sessionId,
        userProfile: profile
      });
      const full = await recipeService.getGeneratedRecipeById(generated.id);
      reply.send(full || generated);
    } catch (error) {
      reply.code(500).send({ message: error?.message || 'Ошибка генерации рецепта' });
    }
  },

  async getGeneratedBySession(request, reply) {
    try {
      const { sessionId } = request.params;
      const recipes = await recipeGeneratorService.getGeneratedForSession(sessionId);
      reply.send(recipes);
    } catch (error) {
      reply.code(500).send({ message: error?.message || 'Ошибка получения рецептов' });
    }
  }
};
