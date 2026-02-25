/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Ensure product_id can be null for generated recipes
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_name = 'order_items'
             AND column_name = 'product_id'
             AND is_nullable = 'NO'
         ) THEN
           ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
         END IF;
       END$$;`
    );

    await queryInterface.changeColumn('order_items', 'product_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('order_items', 'product_id', {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    });
  }
};
