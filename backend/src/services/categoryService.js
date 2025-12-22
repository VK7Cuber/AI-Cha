import { models } from '../database/models/init.js';

const { Category, Product } = models;

let categoryCache = { data: null, expiresAt: 0 };
const CACHE_TTL_MS = 60_000; // 1 минута на базовом этапе, можно заменить на Redis

export const categoryService = {
  async getCategories() {
    const now = Date.now();
    if (categoryCache.data && categoryCache.expiresAt > now) {
      return categoryCache.data;
    }
    const categories = await Category.getActive();
    categoryCache = { data: categories, expiresAt: now + CACHE_TTL_MS };
    return categories;
  },

  async getCategoriesWithProducts() {
    const categories = await Category.getActive();
    const categoryIds = categories.map((c) => c.id);
    const products = await Product.findAll({
      where: { category_id: categoryIds, is_available: true },
      order: [['display_order', 'ASC']]
    });

    const grouped = categories.map((c) => ({
      ...c.toJSON(),
      products: products.filter((p) => p.category_id === c.id)
    }));

    return grouped;
  }
};

