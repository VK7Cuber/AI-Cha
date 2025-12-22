const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Ingredient extends Model {}

  Ingredient.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      category_id: { type: DataTypes.UUID, allowNull: false },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      flavor_profile: DataTypes.JSONB,
      effects: DataTypes.JSONB,
      mood_tags: DataTypes.JSONB,
      caffeine_level: { type: DataTypes.ENUM('none', 'low', 'medium', 'high'), allowNull: false, defaultValue: 'none' },
      temperature_suitable: DataTypes.JSONB,
      is_vegan: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_sugar_free: { type: DataTypes.BOOLEAN, defaultValue: false },
      allergens: DataTypes.JSONB,
      serving_size: DataTypes.STRING,
      preparation_notes: DataTypes.TEXT,
      origin_story: DataTypes.TEXT,
      cost_per_serving: DataTypes.DECIMAL(10, 2),
      is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_seasonal: { type: DataTypes.BOOLEAN, defaultValue: false },
      image_url: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Ingredient',
      tableName: 'ingredients'
    }
  );

  return Ingredient;
};
