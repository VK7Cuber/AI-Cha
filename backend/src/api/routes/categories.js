import { productController } from '../controllers/productController.js';
import { categoryService } from '../../services/categoryService.js';

export async function categoryRoutes(fastify) {
  fastify.get('/', async (_req, reply) => {
    const categories = await categoryService.getCategories();
    reply.send(categories);
  });

  fastify.get('/:slug/products', productController.getByCategorySlug);
}

