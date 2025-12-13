import { models } from '../database/models/init.js';
import { sequelize } from '../config/database.js';

const { Order, OrderItem, Product } = models;

const ALLOWED_STATUS = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
const PAYMENT_METHODS = ['card', 'aicha_card', 'sbp'];

export const orderService = {
  async createOrder(terminalId, items = []) {
    if (!items.length) {
      const err = new Error('Не переданы товары');
      err.statusCode = 400;
      throw err;
    }

    return sequelize.transaction(async (t) => {
      const productIds = items.map((i) => i.product_id);
      const products = await Product.findAll({ where: { id: productIds, is_available: true }, transaction: t });
      if (products.length !== productIds.length) {
        const err = new Error('Некоторые товары недоступны');
        err.statusCode = 400;
        throw err;
      }

      const order = await Order.create(
        {
          terminal_id: terminalId,
          status: 'pending',
          payment_status: 'pending',
          total_amount: 0
        },
        { transaction: t }
      );

      let total = 0;
      for (const item of items) {
        const product = products.find((p) => p.id === item.product_id);
        const qty = Math.max(1, Number(item.quantity || 1));
        const line = Number(product.price) * qty;
        total += line;
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: product.id,
            quantity: qty,
            price_at_order: product.price,
            product_name_ru: product.name_ru,
            product_name_zh: product.name_zh
          },
          { transaction: t }
        );
      }

      order.total_amount = total;
      await order.save({ transaction: t });
      return order;
    });
  },

  async getOrder(id) {
    return Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });
  },

  async updateStatus(id, status) {
    if (!ALLOWED_STATUS.includes(status)) {
      const err = new Error('Недопустимый статус');
      err.statusCode = 400;
      throw err;
    }
    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error('Заказ не найден');
      err.statusCode = 404;
      throw err;
    }
    order.status = status;
    await order.save();
    return order;
  },

  async processPayment(id, paymentMethod) {
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      const err = new Error('Некорректный способ оплаты');
      err.statusCode = 400;
      throw err;
    }
    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error('Заказ не найден');
      err.statusCode = 404;
      throw err;
    }

    order.payment_method = paymentMethod;
    order.payment_status = 'success';
    order.status = 'paid';
    order.paid_at = new Date();
    await order.save();
    return order;
  }
};

