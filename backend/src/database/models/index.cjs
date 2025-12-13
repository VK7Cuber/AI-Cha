const CategoryFactory = require('./Category.cjs');
const ProductFactory = require('./Product.cjs');
const OrderFactory = require('./Order.cjs');
const OrderItemFactory = require('./OrderItem.cjs');
const RatingFactory = require('./Rating.cjs');

function initModels(sequelize) {
  const Category = CategoryFactory(sequelize);
  const Product = ProductFactory(sequelize);
  const Order = OrderFactory(sequelize);
  const OrderItem = OrderItemFactory(sequelize);
  const Rating = RatingFactory(sequelize);

  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  Order.hasOne(Rating, { foreignKey: 'order_id', as: 'ratingEntry' });
  Rating.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  return { Category, Product, Order, OrderItem, Rating };
}

module.exports = { initModels };

