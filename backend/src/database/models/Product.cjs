const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static async getAvailable(filters = {}) {
      const where = { is_available: true };
      if (filters.category_id) where.category_id = filters.category_id;
      if (filters.temperature) where.temperature = filters.temperature;
      return this.findAll({ where, order: [['display_order', 'ASC']] });
    }

    static async getByCategory(categoryId) {
      return this.findAll({ where: { category_id: categoryId, is_available: true } });
    }

    static async searchByName(query) {
      if (!query) return [];
      return this.findAll({
        where: {
          is_available: true,
          [Op.or]: [
            { name_ru: { [Op.iLike]: `%${query}%` } },
            { name_zh: { [Op.like]: `%${query}%` } }
          ]
        }
      });
    }
  }

  Product.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      category_id: { type: DataTypes.UUID, allowNull: false },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 }
      },
      image_url: DataTypes.STRING,
      ingredients_ru: DataTypes.TEXT,
      ingredients_zh: DataTypes.TEXT,
      temperature: { type: DataTypes.ENUM('hot', 'cold', 'both'), allowNull: false, defaultValue: 'hot' },
      is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_recommended: { type: DataTypes.BOOLEAN, defaultValue: false },
      tags: DataTypes.JSONB,
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products'
    }
  );

  return Product;
};

