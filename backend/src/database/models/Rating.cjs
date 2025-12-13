const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Rating extends Model {
    static async getAverageRating() {
      const result = await this.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']]
      });
      return Number(result?.get('avg_rating')) || 0;
    }
  }

  Rating.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false, unique: true },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 10 } },
      terminal_id: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'ratings'
    }
  );

  return Rating;
};

