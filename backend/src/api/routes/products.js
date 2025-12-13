import { productController } from '../controllers/productController.js';

export async function productRoutes(fastify) {
  fastify.get('/', productController.getAll);
  fastify.get('/recommended', productController.getRecommended);
  fastify.get('/:id', productController.getById);
}

