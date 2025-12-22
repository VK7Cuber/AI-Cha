const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BaseRecipe extends Model {}

  BaseRecipe.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      category: { type: DataTypes.ENUM('tea', 'coffee', 'herbal', 'cold', 'specialty'), allowNull: false },
      base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      preparation_time_minutes: DataTypes.INTEGER,
      serving_style: DataTypes.JSONB,
      mood_tags: DataTypes.JSONB,
      flavor_profile: DataTypes.JSONB,
      effects: DataTypes.JSONB,
      sample_card_message: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'BaseRecipe',
      tableName: 'base_recipes'
    }
  );

  return BaseRecipe;
};
