/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ingredient_categories
    await queryInterface.createTable('ingredient_categories', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM('base', 'additive', 'topping', 'sweetener', 'spice', 'fruit', 'milk'),
        allowNull: false
      },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // ingredients
    await queryInterface.createTable('ingredients', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ingredient_categories', key: 'id' },
        onDelete: 'CASCADE'
      },
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
      image_url: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // ingredient_compatibility
    await queryInterface.createTable('ingredient_compatibility', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      ingredient_a_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE'
      },
      ingredient_b_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE'
      },
      compatibility_score: { type: DataTypes.INTEGER, allowNull: false },
      notes: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // base_recipes
    await queryInterface.createTable('base_recipes', {
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
      sample_card_message: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // base_recipe_ingredients
    await queryInterface.createTable('base_recipe_ingredients', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      recipe_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'base_recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      ingredient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount: DataTypes.STRING,
      is_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      order_in_recipe: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // generated_recipes
    await queryInterface.createTable('generated_recipes', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID },
      name_ru: { type: DataTypes.STRING, allowNull: false },
      name_zh: { type: DataTypes.STRING, allowNull: false },
      description_ru: DataTypes.TEXT,
      reasoning_ru: DataTypes.TEXT,
      personal_message: DataTypes.TEXT,
      preparation_steps: DataTypes.JSONB,
      serving_style: DataTypes.JSONB,
      temperature: { type: DataTypes.ENUM('hot', 'cold', 'warm'), allowNull: true },
      total_price: { type: DataTypes.DECIMAL(10, 2) },
      preparation_time_minutes: DataTypes.INTEGER,
      was_ordered: { type: DataTypes.BOOLEAN, defaultValue: false },
      rating: { type: DataTypes.INTEGER },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // generated_recipe_ingredients
    await queryInterface.createTable('generated_recipe_ingredients', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      generated_recipe_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'generated_recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      ingredient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ingredients', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount: DataTypes.STRING,
      preparation_note: DataTypes.TEXT,
      order_in_recipe: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // extend order_items to support AI recipes
    await queryInterface.addColumn('order_items', 'item_type', {
      type: DataTypes.ENUM('product', 'generated_recipe'),
      allowNull: false,
      defaultValue: 'product'
    });
    await queryInterface.changeColumn('order_items', 'product_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });
    await queryInterface.addColumn('order_items', 'generated_recipe_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'generated_recipes', key: 'id' },
      onDelete: 'CASCADE'
    });

    // indexes
    await queryInterface.addIndex('ingredients', ['category_id', 'is_available']);
    await queryInterface.addIndex('ingredients', ['caffeine_level']);
    await queryInterface.addIndex('ingredient_compatibility', ['ingredient_a_id', 'ingredient_b_id'], { unique: true });
    await queryInterface.addIndex('base_recipes', ['category']);
    await queryInterface.addIndex('base_recipe_ingredients', ['recipe_id']);
    await queryInterface.addIndex('generated_recipes', ['session_id']);
    await queryInterface.addIndex('generated_recipes', ['was_ordered', 'rating']);
    await queryInterface.addIndex('generated_recipe_ingredients', ['generated_recipe_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('order_items', 'generated_recipe_id');
    await queryInterface.removeColumn('order_items', 'item_type');
    await queryInterface.changeColumn('order_items', 'product_id', {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });

    await queryInterface.dropTable('generated_recipe_ingredients');
    await queryInterface.dropTable('generated_recipes');
    await queryInterface.dropTable('base_recipe_ingredients');
    await queryInterface.dropTable('base_recipes');
    await queryInterface.dropTable('ingredient_compatibility');
    await queryInterface.dropTable('ingredients');
    await queryInterface.dropTable('ingredient_categories');

    // drop enums
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ingredient_categories_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ingredients_caffeine_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_base_recipes_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_generated_recipes_temperature";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_order_items_item_type";');
  }
};
