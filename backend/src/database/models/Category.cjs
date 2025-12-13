const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    static async getActive() {
      return this.findAll({ where: { is_active: true }, order: [['display_order', 'ASC']] });
    }

    static async getBySlug(slug) {
      return this.findOne({ where: { slug, is_active: true } });
    }
  }

  Category.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      icon_url: DataTypes.STRING,
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories'
    }
  );

  return Category;
};

