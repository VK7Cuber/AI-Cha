import { Op, Sequelize } from 'sequelize';
import { models } from '../database/models/init.js';

const { Product, Category } = models;

function buildFilters(query = {}) {
  const where = { is_available: true };
  if (query.category) where.category_id = query.category;
  if (query.temperature) where.temperature = query.temperature;
  if (query.search) {
    where[Op.or] = [
      { name_ru: { [Op.iLike]: `%${query.search}%` } },
      { name_zh: { [Op.like]: `%${query.search}%` } }
    ];
  }
  if (query.tags?.length) {
    // tags stored as JSONB array; use PostgreSQL @> operator
    where.tags = { [Op.contains]: query.tags };
  }
  return where;
}

export const productService = {
  async getAll(query = {}) {
    const where = buildFilters(query);
    return Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name_ru', 'name_zh', 'slug'] }],
      order: [['display_order', 'ASC']]
    });
  },

  async getById(id) {
    return Product.findOne({
      where: { id, is_available: true },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name_ru', 'name_zh', 'slug'] }]
    });
  },

  async getByCategorySlug(slug) {
    const category = await Category.getBySlug(slug);
    if (!category) return null;
    const products = await Product.findAll({
      where: { category_id: category.id, is_available: true },
      order: [['display_order', 'ASC']]
    });
    return { category, products };
  },

  async getRecommended(limit = 6) {
    return Product.findAll({
      where: { is_available: true },
      order: [Sequelize.fn('RANDOM')],
      limit
    });
  }
};

