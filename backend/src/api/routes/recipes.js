import { recipeController } from '../controllers/recipeController.js';

export async function recipeRoutes(fastify) {
  fastify.get('/', recipeController.getAllBase);
  fastify.get('/:id', recipeController.getBaseById);
  fastify.get('/:id/ingredients', recipeController.getBaseIngredients);
}
