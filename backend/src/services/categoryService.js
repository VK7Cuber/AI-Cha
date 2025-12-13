import { models } from '../database/models/init.js';

const { Category, Product } = models;

export const categoryService = {
  async getCategories() {
    return Category.getActive();
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

