/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('categories', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      icon_url: DataTypes.STRING,
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('products', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      description_zh: DataTypes.TEXT,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      image_url: DataTypes.STRING,
      ingredients_ru: DataTypes.TEXT,
      ingredients_zh: DataTypes.TEXT,
      temperature: { type: DataTypes.ENUM('hot', 'cold', 'both'), allowNull: false, defaultValue: 'hot' },
      is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_recommended: { type: DataTypes.BOOLEAN, defaultValue: false },
      tags: DataTypes.JSONB,
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      order_number: { type: DataTypes.INTEGER, unique: true, allowNull: false, autoIncrement: true },
      terminal_id: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_method: { type: DataTypes.ENUM('card', 'aicha_card', 'sbp'), allowNull: true },
      payment_status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      rating: { type: DataTypes.INTEGER, allowNull: true },
      session_id: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      paid_at: { type: DataTypes.DATE },
      completed_at: { type: DataTypes.DATE },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('order_items', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE'
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      price_at_order: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      product_name_ru: { type: DataTypes.STRING, allowNull: false },
      product_name_zh: { type: DataTypes.STRING, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('ratings', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE',
        unique: true
      },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      terminal_id: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('categories', ['slug']);
    await queryInterface.addIndex('categories', ['display_order', 'is_active']);
    await queryInterface.addIndex('products', ['category_id', 'is_available']);
    await queryInterface.addIndex('products', ['display_order']);
    await queryInterface.addIndex('orders', ['order_number']);
    await queryInterface.addIndex('orders', ['status', 'created_at']);
    await queryInterface.addIndex('orders', ['terminal_id', 'created_at']);
    await queryInterface.addIndex('order_items', ['order_id']);
    await queryInterface.addIndex('ratings', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ratings');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_products_temperature\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_orders_status\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_orders_payment_method\";");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_orders_payment_status\";");
  }
};

