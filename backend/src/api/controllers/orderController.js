import { orderService } from '../../services/orderService.js';

export const orderController = {
  async create(request, reply) {
    const { terminal_id, items } = request.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      reply.code(400).send({ message: 'Не переданы товары' });
      return;
    }
    const order = await orderService.createOrder(terminal_id || null, items);
    reply.code(201).send(order);
  },

  async getById(request, reply) {
    const order = await orderService.getOrder(request.params.id);
    if (!order) {
      reply.code(404).send({ message: 'Заказ не найден' });
      return;
    }
    reply.send(order);
  },

  async updateStatus(request, reply) {
    const { status } = request.body || {};
    const order = await orderService.updateStatus(request.params.id, status);
    reply.send(order);
  },

  async processPayment(request, reply) {
    const { payment_method } = request.body || {};
    const order = await orderService.processPayment(request.params.id, payment_method);
    reply.send(order);
  }
};

