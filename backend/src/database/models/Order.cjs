const { Model, DataTypes } = require('sequelize');

const ORDER_STATUSES = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
const PAYMENT_METHODS = ['card', 'aicha_card', 'sbp'];
const PAYMENT_STATUSES = ['pending', 'success', 'failed'];

module.exports = (sequelize) => {
  class Order extends Model {
    async updateStatus(status) {
      if (!ORDER_STATUSES.includes(status)) {
        throw new Error('Invalid status');
      }
      this.status = status;
      return this.save();
    }

    async complete() {
      this.status = 'completed';
      this.completed_at = new Date();
      return this.save();
    }

    async cancel() {
      this.status = 'cancelled';
      return this.save();
    }
  }

  Order.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_number: { type: DataTypes.INTEGER, unique: true, allowNull: false, autoIncrement: true },
      terminal_id: DataTypes.STRING,
      status: { type: DataTypes.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: 'pending' },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_method: { type: DataTypes.ENUM(...PAYMENT_METHODS) },
      payment_status: { type: DataTypes.ENUM(...PAYMENT_STATUSES), allowNull: false, defaultValue: 'pending' },
      rating: { type: DataTypes.INTEGER },
      session_id: DataTypes.STRING,
      paid_at: DataTypes.DATE,
      completed_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders'
    }
  );

  return Order;
};

