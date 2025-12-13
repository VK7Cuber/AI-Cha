import { productService } from '../../services/productService.js';

function parseTags(raw) {
  if (!raw) return [];
  return raw.split(',').map((t) => t.trim()).filter(Boolean);
}

export const productController = {
  async getAll(request, reply) {
    const { category, temperature, search, tags } = request.query;
    const products = await productService.getAll({
      category,
      temperature,
      search,
      tags: parseTags(tags)
    });
    reply.send(products);
  },

  async getById(request, reply) {
    const product = await productService.getById(request.params.id);
    if (!product) {
      reply.code(404).send({ message: 'Товар не найден' });
      return;
    }
    reply.send(product);
  },

  async getRecommended(_request, reply) {
    const products = await productService.getRecommended(6);
    reply.send(products);
  },

  async getByCategorySlug(request, reply) {
    const result = await productService.getByCategorySlug(request.params.slug);
    if (!result) {
      reply.code(404).send({ message: 'Категория не найдена' });
      return;
    }
    reply.send(result);
  }
};

