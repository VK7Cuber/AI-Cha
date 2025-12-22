const CategoryFactory = require('./Category.cjs');
const ProductFactory = require('./Product.cjs');
const OrderFactory = require('./Order.cjs');
const OrderItemFactory = require('./OrderItem.cjs');
const RatingFactory = require('./Rating.cjs');
const IngredientCategoryFactory = require('./IngredientCategory.cjs');
const IngredientFactory = require('./Ingredient.cjs');
const IngredientCompatibilityFactory = require('./IngredientCompatibility.cjs');
const BaseRecipeFactory = require('./BaseRecipe.cjs');
const BaseRecipeIngredientFactory = require('./BaseRecipeIngredient.cjs');
const GeneratedRecipeFactory = require('./GeneratedRecipe.cjs');
const GeneratedRecipeIngredientFactory = require('./GeneratedRecipeIngredient.cjs');

function initModels(sequelize) {
  const Category = CategoryFactory(sequelize);
  const Product = ProductFactory(sequelize);
  const Order = OrderFactory(sequelize);
  const OrderItem = OrderItemFactory(sequelize);
  const Rating = RatingFactory(sequelize);
  const IngredientCategory = IngredientCategoryFactory(sequelize);
  const Ingredient = IngredientFactory(sequelize);
  const IngredientCompatibility = IngredientCompatibilityFactory(sequelize);
  const BaseRecipe = BaseRecipeFactory(sequelize);
  const BaseRecipeIngredient = BaseRecipeIngredientFactory(sequelize);
  const GeneratedRecipe = GeneratedRecipeFactory(sequelize);
  const GeneratedRecipeIngredient = GeneratedRecipeIngredientFactory(sequelize);

  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  OrderItem.belongsTo(GeneratedRecipe, { foreignKey: 'generated_recipe_id', as: 'generatedRecipe' });

  Order.hasOne(Rating, { foreignKey: 'order_id', as: 'ratingEntry' });
  Rating.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  IngredientCategory.hasMany(Ingredient, { foreignKey: 'category_id', as: 'ingredients' });
  Ingredient.belongsTo(IngredientCategory, { foreignKey: 'category_id', as: 'category' });

  IngredientCompatibility.belongsTo(Ingredient, { foreignKey: 'ingredient_a_id', as: 'ingredientA' });
  IngredientCompatibility.belongsTo(Ingredient, { foreignKey: 'ingredient_b_id', as: 'ingredientB' });

  BaseRecipe.hasMany(BaseRecipeIngredient, { foreignKey: 'recipe_id', as: 'ingredients' });
  BaseRecipeIngredient.belongsTo(BaseRecipe, { foreignKey: 'recipe_id', as: 'recipe' });
  BaseRecipeIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });

  GeneratedRecipe.hasMany(GeneratedRecipeIngredient, { foreignKey: 'generated_recipe_id', as: 'ingredients' });
  GeneratedRecipeIngredient.belongsTo(GeneratedRecipe, { foreignKey: 'generated_recipe_id', as: 'recipe' });
  GeneratedRecipeIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });

  return {
    Category,
    Product,
    Order,
    OrderItem,
    Rating,
    IngredientCategory,
    Ingredient,
    IngredientCompatibility,
    BaseRecipe,
    BaseRecipeIngredient,
    GeneratedRecipe,
    GeneratedRecipeIngredient
  };
}

module.exports = { initModels };

