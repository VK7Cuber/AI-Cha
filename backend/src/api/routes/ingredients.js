import { ingredientController } from '../controllers/ingredientController.js';

export async function ingredientRoutes(fastify) {
  fastify.get('/categories', ingredientController.getCategories);
  fastify.get('/', ingredientController.getAll);
  fastify.get('/compatibility/:id', ingredientController.getCompatibility);
  fastify.get('/:id', ingredientController.getById);
}
