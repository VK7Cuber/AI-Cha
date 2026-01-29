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
// AI-специфичные модели
const DialogSessionFactory = require('./DialogSession.cjs');
const DialogMessageFactory = require('./DialogMessage.cjs');
const UserProfileFactory = require('./UserProfile.cjs');
const RecipeGenerationLogFactory = require('./RecipeGenerationLog.cjs');
const TtsCacheFactory = require('./TtsCache.cjs');

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
  // AI-специфичные модели
  const DialogSession = DialogSessionFactory(sequelize);
  const DialogMessage = DialogMessageFactory(sequelize);
  const UserProfile = UserProfileFactory(sequelize);
  const RecipeGenerationLog = RecipeGenerationLogFactory(sequelize);
  const TtsCache = TtsCacheFactory(sequelize);

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

  // AI-специфичные связи
  DialogSession.hasMany(DialogMessage, { foreignKey: 'session_id', as: 'messages' });
  DialogMessage.belongsTo(DialogSession, { foreignKey: 'session_id', as: 'session' });

  DialogSession.hasOne(UserProfile, { foreignKey: 'session_id', as: 'userProfile' });
  UserProfile.belongsTo(DialogSession, { foreignKey: 'session_id', as: 'session' });

  DialogSession.hasMany(GeneratedRecipe, { foreignKey: 'session_id', as: 'generatedRecipes' });
  GeneratedRecipe.belongsTo(DialogSession, { foreignKey: 'session_id', as: 'dialogSession' });

  DialogSession.hasMany(RecipeGenerationLog, { foreignKey: 'session_id', as: 'generationLogs' });
  RecipeGenerationLog.belongsTo(DialogSession, { foreignKey: 'session_id', as: 'session' });

  UserProfile.hasMany(RecipeGenerationLog, { foreignKey: 'profile_id', as: 'generationLogs' });
  RecipeGenerationLog.belongsTo(UserProfile, { foreignKey: 'profile_id', as: 'userProfile' });

  GeneratedRecipe.hasMany(RecipeGenerationLog, { foreignKey: 'generated_recipe_id', as: 'generationLogs' });
  RecipeGenerationLog.belongsTo(GeneratedRecipe, { foreignKey: 'generated_recipe_id', as: 'generatedRecipe' });

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
    GeneratedRecipeIngredient,
    // AI-специфичные модели
    DialogSession,
    DialogMessage,
    UserProfile,
    RecipeGenerationLog,
    TtsCache
  };
}

module.exports = { initModels };

