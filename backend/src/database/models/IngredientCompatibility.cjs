const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class IngredientCompatibility extends Model {}

  IngredientCompatibility.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      ingredient_a_id: { type: DataTypes.UUID, allowNull: false },
      ingredient_b_id: { type: DataTypes.UUID, allowNull: false },
      compatibility_score: { type: DataTypes.INTEGER, allowNull: false },
      notes: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'IngredientCompatibility',
      tableName: 'ingredient_compatibility'
    }
  );

  return IngredientCompatibility;
};
