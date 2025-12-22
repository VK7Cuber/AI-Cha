import { recipeService } from '../../services/recipeService.js';

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
  }
};
