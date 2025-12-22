import { models } from '../database/models/init.js';
import { Op } from 'sequelize';

const { IngredientCategory, Ingredient, IngredientCompatibility } = models;

export const ingredientService = {
  async getCategories() {
    return IngredientCategory.findAll({ order: [['display_order', 'ASC'], ['name_ru', 'ASC']] });
  },

  async getAll(filters = {}) {
    const where = {};
    if (filters.category) where.category_id = filters.category;
    if (filters.caffeine_level) where.caffeine_level = filters.caffeine_level;
    if (filters.is_vegan !== undefined) where.is_vegan = filters.is_vegan === 'true';
    if (filters.is_available !== undefined) where.is_available = filters.is_available === 'true';

    return Ingredient.findAll({
      where,
      order: [['name_ru', 'ASC']]
    });
  },

  async getById(id) {
    return Ingredient.findByPk(id, {
      include: [{ model: IngredientCategory, as: 'category' }]
    });
  },

  async getCompatibility(id) {
    return IngredientCompatibility.findAll({
      where: {
        [Op.or]: [{ ingredient_a_id: id }, { ingredient_b_id: id }]
      },
      include: [
        { model: Ingredient, as: 'ingredientA' },
        { model: Ingredient, as: 'ingredientB' }
      ]
    });
  }
};
