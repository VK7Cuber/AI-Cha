import { recipeController } from '../controllers/recipeController.js';
import { validateGenerateRecipe, validateDialogSessionParam } from '../middleware/validation.js';

export async function recipeRoutes(fastify) {
  fastify.post('/generate', { preHandler: validateGenerateRecipe }, recipeController.generateFromDialog);
  fastify.get(
    '/generated/:sessionId',
    { preHandler: validateDialogSessionParam },
    recipeController.getGeneratedBySession
  );
  fastify.get('/', recipeController.getAllBase);
  fastify.get('/:id', recipeController.getBaseById);
  fastify.get('/:id/ingredients', recipeController.getBaseIngredients);
}
