import { models } from '../database/models/init.js';

const { Rating, Order } = models;

export const ratingService = {
  async submitRating({ orderId, rating, terminalId }) {
    if (!orderId || !rating) {
      const err = new Error('order_id и rating обязательны');
      err.statusCode = 400;
      throw err;
    }
    const order = await Order.findByPk(orderId);
    if (!order) {
      const err = new Error('Заказ не найден');
      err.statusCode = 404;
      throw err;
    }

    // upsert на случай повтора
    const [row] = await Rating.upsert({
      order_id: orderId,
      rating,
      terminal_id: terminalId || null
    });

    order.rating = rating;
    await order.save();
    return row;
  },

  async getAverage() {
    return Rating.getAverageRating();
  }
};

