const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RecipeGenerationLog extends Model {
    /**
     * Получить логи генерации для сессии
     */
    static async getForSession(sessionId) {
      return this.findAll({
        where: { session_id: sessionId },
        order: [['created_at', 'ASC']]
      });
    }

    /**
     * Получить логи для конкретного рецепта
     */
    static async getForRecipe(generatedRecipeId) {
      return this.findAll({
        where: { generated_recipe_id: generatedRecipeId },
        order: [['created_at', 'ASC']]
      });
    }

    /**
     * Создать лог генерации рецепта
     */
    static async createLog(sessionId, profileId, generatedRecipeId, options = {}) {
      return this.create({
        session_id: sessionId,
        profile_id: profileId,
        generated_recipe_id: generatedRecipeId,
        ai_reasoning: options.ai_reasoning,
        prompt_used: options.prompt_used,
        generation_time_ms: options.generation_time_ms,
        was_ordered: false,
        user_rating: null
      });
    }

    /**
     * Отметить рецепт как заказанный
     */
    async markAsOrdered() {
      return this.update({ was_ordered: true });
    }

    /**
     * Установить рейтинг пользователя
     */
    async setUserRating(rating) {
      if (rating < 1 || rating > 10) {
        throw new Error('Rating must be between 1 and 10');
      }
      return this.update({ user_rating: rating });
    }

    /**
     * Получить статистику генерации рецептов
     */
    static async getGenerationStats() {
      const results = await this.findAll({
        attributes: [
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'total_generations'],
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN was_ordered = true THEN 1 END')), 'ordered_count'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('generation_time_ms')), 'avg_generation_time'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('user_rating')), 'avg_rating'],
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN user_rating IS NOT NULL THEN 1 END')), 'rated_count']
        ]
      });

      return results[0];
    }

    /**
     * Получить статистику по времени генерации
     */
    static async getGenerationTimeStats() {
      const results = await this.findAll({
        attributes: [
          [sequelize.Sequelize.fn('MIN', sequelize.Sequelize.col('generation_time_ms')), 'min_time'],
          [sequelize.Sequelize.fn('MAX', sequelize.Sequelize.col('generation_time_ms')), 'max_time'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('generation_time_ms')), 'avg_time'],
          [sequelize.Sequelize.literal('PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY generation_time_ms)'), 'median_time'],
          [sequelize.Sequelize.literal('PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY generation_time_ms)'), 'p95_time']
        ],
        where: {
          generation_time_ms: { [sequelize.Sequelize.Op.not]: null }
        }
      });

      return results[0];
    }

    /**
     * Получить топ рейтингов рецептов
     */
    static async getTopRatedRecipes(limit = 10) {
      return this.findAll({
        where: {
          user_rating: { [sequelize.Sequelize.Op.not]: null }
        },
        order: [
          ['user_rating', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: limit,
        include: [{
          association: 'generatedRecipe',
          attributes: ['id', 'name_ru', 'name_zh', 'description_ru']
        }]
      });
    }

    /**
     * Анализировать эффективность промптов
     */
    static async analyzePromptEffectiveness() {
      const results = await this.findAll({
        attributes: [
          'prompt_used',
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'usage_count'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('user_rating')), 'avg_rating'],
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.literal('CASE WHEN was_ordered = true THEN 1 END')), 'order_count']
        ],
        where: {
          prompt_used: { [sequelize.Sequelize.Op.not]: null }
        },
        group: ['prompt_used'],
        having: sequelize.Sequelize.literal('COUNT(id) > 1'),
        order: [[sequelize.Sequelize.literal('avg_rating'), 'DESC']]
      });

      return results;
    }
  }

  RecipeGenerationLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID, allowNull: false },
      profile_id: { type: DataTypes.UUID, allowNull: false },
      generated_recipe_id: { type: DataTypes.UUID, allowNull: false },
      ai_reasoning: DataTypes.TEXT,
      prompt_used: DataTypes.TEXT,
      generation_time_ms: DataTypes.INTEGER,
      was_ordered: { type: DataTypes.BOOLEAN, defaultValue: false },
      user_rating: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'RecipeGenerationLog',
      tableName: 'recipe_generation_logs',
      validate: {
        ratingInRange() {
          if (this.user_rating !== null && (this.user_rating < 1 || this.user_rating > 10)) {
            throw new Error('User rating must be between 1 and 10');
          }
        }
      }
    }
  );

  return RecipeGenerationLog;
};