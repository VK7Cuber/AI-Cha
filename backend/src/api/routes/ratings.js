import { ratingController } from '../controllers/ratingController.js';
import { validateRating } from '../middleware/validation.js';

export async function ratingRoutes(fastify) {
  fastify.post('/', { preHandler: validateRating }, ratingController.create);
  fastify.get('/average', ratingController.getAverage);
}

