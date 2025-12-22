const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class IngredientCategory extends Model {}

  IngredientCategory.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM('base', 'additive', 'topping', 'sweetener', 'spice', 'fruit', 'milk'),
        allowNull: false
      },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      modelName: 'IngredientCategory',
      tableName: 'ingredient_categories'
    }
  );

  return IngredientCategory;
};
