import { Op } from 'sequelize';
import { models } from '../database/models/init.js';
import { sequelize } from '../config/database.js';
import { wsBroadcast } from '../utils/ws.js';

const { Order, OrderItem, Product, GeneratedRecipe } = models;

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
      const genRecipeIds = items.filter((i) => i.item_type === 'generated_recipe').map((i) => i.generated_recipe_id);

      const products = await Product.findAll({ where: { id: productIds, is_available: true }, transaction: t });
      if (products.length !== productIds.filter(Boolean).length) {
        const err = new Error('Некоторые товары недоступны');
        err.statusCode = 400;
        throw err;
      }

      const generatedRecipes = genRecipeIds.length
        ? await GeneratedRecipe.findAll({ where: { id: genRecipeIds }, transaction: t })
        : [];
      if (generatedRecipes.length !== genRecipeIds.length) {
        const err = new Error('Некоторые сгенерированные рецепты не найдены');
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
        const isGenerated = item.item_type === 'generated_recipe';
        const qty = Math.max(1, Number(item.quantity || 1));

        if (isGenerated) {
          const recipe = generatedRecipes.find((g) => g.id === item.generated_recipe_id);
          if (!recipe) {
            const err = new Error('Сгенерированный рецепт не найден');
            err.statusCode = 400;
            throw err;
          }
          const price = Number(recipe.total_price || 0);
          total += price * qty;
          await OrderItem.create(
            {
              order_id: order.id,
              item_type: 'generated_recipe',
              generated_recipe_id: recipe.id,
              product_id: null,
              quantity: qty,
              price_at_order: price,
              product_name_ru: recipe.name_ru,
              product_name_zh: recipe.name_zh
            },
            { transaction: t }
          );
        } else {
          const product = products.find((p) => p.id === item.product_id);
          if (!product) {
            const err = new Error('Товар не найден');
            err.statusCode = 400;
            throw err;
          }
          const line = Number(product.price) * qty;
          total += line;
          await OrderItem.create(
            {
              order_id: order.id,
              item_type: 'product',
              product_id: product.id,
              generated_recipe_id: null,
              quantity: qty,
              price_at_order: product.price,
              product_name_ru: product.name_ru,
              product_name_zh: product.name_zh
            },
            { transaction: t }
          );
        }
      }

      order.total_amount = total;
      await order.save({ transaction: t });
      wsBroadcast('new_order', { orderId: order.id, total, terminalId });
      return order;
    });
  },

  async listOrders(filter = {}) {
    const where = {};
    if (filter.status === 'active') {
      where.status = { [Op.notIn]: ['completed', 'cancelled'] };
    } else if (filter.status) {
      where.status = filter.status;
    }

    return Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: GeneratedRecipe, as: 'generatedRecipe' }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  },

  async getOrder(id) {
    return Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: GeneratedRecipe, as: 'generatedRecipe' }
          ]
        }
      ]
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
    wsBroadcast('order_updated', { orderId: id, status });
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
    wsBroadcast('order_updated', { orderId: id, status: order.status });
    return order;
  }
};

