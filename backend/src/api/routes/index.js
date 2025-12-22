import { healthRoutes } from './health.js';
import { productRoutes } from './products.js';
import { categoryRoutes } from './categories.js';
import { orderRoutes } from './orders.js';
import { ratingRoutes } from './ratings.js';
import { ingredientRoutes } from './ingredients.js';
import { recipeRoutes } from './recipes.js';

export const registerRoutes = (fastify) => {
  fastify.register(healthRoutes, { prefix: '/api/health' });
  fastify.register(productRoutes, { prefix: '/api/products' });
  fastify.register(categoryRoutes, { prefix: '/api/categories' });
  fastify.register(orderRoutes, { prefix: '/api/orders' });
  fastify.register(ratingRoutes, { prefix: '/api/ratings' });
  fastify.register(ingredientRoutes, { prefix: '/api/ingredients' });
  fastify.register(recipeRoutes, { prefix: '/api/recipes' });
};

