/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // create enum if not exists
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_items_item_type') THEN
           CREATE TYPE "enum_order_items_item_type" AS ENUM ('product', 'generated_recipe');
         END IF;
       END$$;`
    );

    // add item_type column if missing
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name='order_items' AND column_name='item_type'
         ) THEN
           ALTER TABLE "order_items" ADD COLUMN "item_type" "enum_order_items_item_type" NOT NULL DEFAULT 'product';
         END IF;
       END$$;`
    );

    // add generated_recipe_id column if missing
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name='order_items' AND column_name='generated_recipe_id'
         ) THEN
           ALTER TABLE "order_items" ADD COLUMN "generated_recipe_id" UUID NULL REFERENCES "generated_recipes" ("id") ON DELETE CASCADE;
         END IF;
       END$$;`
    );

    // make product_id nullable to allow generated recipes
    await queryInterface.changeColumn('order_items', 'product_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // revert product_id to NOT NULL
    await queryInterface.changeColumn('order_items', 'product_id', {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });

    // drop generated_recipe_id if exists
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name='order_items' AND column_name='generated_recipe_id'
         ) THEN
           ALTER TABLE "order_items" DROP COLUMN "generated_recipe_id";
         END IF;
       END$$;`
    );

    // drop item_type if exists
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name='order_items' AND column_name='item_type'
         ) THEN
           ALTER TABLE "order_items" DROP COLUMN "item_type";
         END IF;
       END$$;`
    );

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_order_items_item_type";');
  }
};

