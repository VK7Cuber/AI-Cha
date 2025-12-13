import { ratingService } from '../../services/ratingService.js';

export const ratingController = {
  async create(request, reply) {
    const { order_id, rating, terminal_id } = request.body || {};
    const saved = await ratingService.submitRating({ orderId: order_id, rating, terminalId: terminal_id });
    reply.code(201).send(saved);
  },

  async getAverage(_request, reply) {
    const avg = await ratingService.getAverage();
    reply.send({ average: avg });
  }
};

