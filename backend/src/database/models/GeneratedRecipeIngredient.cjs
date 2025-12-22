const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GeneratedRecipeIngredient extends Model {}

  GeneratedRecipeIngredient.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      generated_recipe_id: { type: DataTypes.UUID, allowNull: false },
      ingredient_id: { type: DataTypes.UUID, allowNull: false },
      amount: DataTypes.STRING,
      preparation_note: DataTypes.TEXT,
      order_in_recipe: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      modelName: 'GeneratedRecipeIngredient',
      tableName: 'generated_recipe_ingredients'
    }
  );

  return GeneratedRecipeIngredient;
};
