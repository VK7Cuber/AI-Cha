import { models } from '../database/models/init.js';
import { Op } from 'sequelize';

const { BaseRecipe, BaseRecipeIngredient, Ingredient, GeneratedRecipe, GeneratedRecipeIngredient } = models;

export const recipeService = {
  async getBaseRecipes(filters = {}) {
    const where = {};
    if (filters.category) where.category = filters.category;
    if (filters.mood_tags) {
      const tags = Array.isArray(filters.mood_tags) ? filters.mood_tags : String(filters.mood_tags).split(',');
      where.mood_tags = { [Op.contains]: tags.filter(Boolean) };
    }
    return BaseRecipe.findAll({
      where,
      order: [['name_ru', 'ASC']]
    });
  },

  async getBaseRecipeById(id) {
    return BaseRecipe.findByPk(id, {
      include: [
        {
          model: BaseRecipeIngredient,
          as: 'ingredients',
          include: [{ model: Ingredient, as: 'ingredient' }],
          order: [['order_in_recipe', 'ASC']]
        }
      ]
    });
  },

  async getGeneratedRecipeById(id) {
    return GeneratedRecipe.findByPk(id, {
      include: [
        {
          model: GeneratedRecipeIngredient,
          as: 'ingredients',
          include: [{ model: Ingredient, as: 'ingredient' }],
          order: [['order_in_recipe', 'ASC']]
        }
      ]
    });
  }
};
