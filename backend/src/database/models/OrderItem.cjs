const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItem extends Model {
    calculateSubtotal() {
      return Number(this.price_at_order) * this.quantity;
    }
  }

  OrderItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: { type: DataTypes.UUID, allowNull: false },
      item_type: { type: DataTypes.ENUM('product', 'generated_recipe'), allowNull: false, defaultValue: 'product' },
      product_id: { type: DataTypes.UUID, allowNull: true },
      generated_recipe_id: { type: DataTypes.UUID, allowNull: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      price_at_order: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      product_name_ru: { type: DataTypes.STRING, allowNull: false },
      product_name_zh: { type: DataTypes.STRING, allowNull: false }
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items'
    }
  );

  return OrderItem;
};

