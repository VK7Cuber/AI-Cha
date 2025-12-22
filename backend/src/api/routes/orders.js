import { orderController } from '../controllers/orderController.js';
import { validateCreateOrder, validatePayment } from '../middleware/validation.js';

export async function orderRoutes(fastify) {
  fastify.post('/', { preHandler: validateCreateOrder }, orderController.create);
  fastify.get('/', orderController.getAll);
  fastify.get('/:id', orderController.getById);
  fastify.patch('/:id/status', orderController.updateStatus);
  fastify.post('/:id/payment', { preHandler: validatePayment }, orderController.processPayment);
}

