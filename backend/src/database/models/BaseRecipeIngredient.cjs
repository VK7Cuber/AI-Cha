const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BaseRecipeIngredient extends Model {}

  BaseRecipeIngredient.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      recipe_id: { type: DataTypes.UUID, allowNull: false },
      ingredient_id: { type: DataTypes.UUID, allowNull: false },
      amount: DataTypes.STRING,
      is_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      order_in_recipe: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      modelName: 'BaseRecipeIngredient',
      tableName: 'base_recipe_ingredients'
    }
  );

  return BaseRecipeIngredient;
};
