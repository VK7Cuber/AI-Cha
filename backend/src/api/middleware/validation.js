const PAYMENT_METHODS = ['card', 'aicha_card', 'sbp'];

const badRequest = (reply, message) => reply.code(400).send({ message });

export const validateCreateOrder = async (request, reply) => {
  const { terminal_id, items } = request.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return badRequest(reply, 'Не переданы товары');
  }
  for (const item of items) {
    const type = item.item_type || 'product';
    if (!['product', 'generated_recipe'].includes(type)) {
      return badRequest(reply, 'item_type должен быть product или generated_recipe');
    }

    if (type === 'product') {
      if (!item?.product_id || typeof item.product_id !== 'string') {
        return badRequest(reply, 'product_id обязателен для item_type=product');
      }
    } else {
      if (!item?.generated_recipe_id || typeof item.generated_recipe_id !== 'string') {
        return badRequest(reply, 'generated_recipe_id обязателен для item_type=generated_recipe');
      }
    }

    const qty = Number(item.quantity ?? 1);
    if (!Number.isFinite(qty) || qty <= 0) {
      return badRequest(reply, 'quantity должен быть > 0');
    }
  }
  if (terminal_id && typeof terminal_id !== 'string') {
    return badRequest(reply, 'terminal_id должен быть строкой');
  }
};

export const validatePayment = async (request, reply) => {
  const { payment_method } = request.body || {};
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return badRequest(reply, 'Некорректный способ оплаты');
  }
};

export const validateRating = async (request, reply) => {
  const { order_id, rating } = request.body || {};
  if (!order_id || typeof order_id !== 'string') {
    return badRequest(reply, 'order_id обязателен');
  }
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    return badRequest(reply, 'rating должен быть целым числом 1-10');
  }
};

