const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GeneratedRecipe extends Model {}

  GeneratedRecipe.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      reasoning_ru: DataTypes.TEXT,
      personal_message: DataTypes.TEXT,
      preparation_steps: DataTypes.JSONB,
      serving_style: DataTypes.JSONB,
      temperature: { type: DataTypes.ENUM('hot', 'cold', 'warm') },
      total_price: { type: DataTypes.DECIMAL(10, 2) },
      preparation_time_minutes: DataTypes.INTEGER,
      was_ordered: { type: DataTypes.BOOLEAN, defaultValue: false },
      rating: { type: DataTypes.INTEGER }
    },
    {
      sequelize,
      modelName: 'GeneratedRecipe',
      tableName: 'generated_recipes'
    }
  );

  return GeneratedRecipe;
};
