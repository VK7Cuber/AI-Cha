const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserProfile extends Model {
    /**
     * Получить профиль для сессии
     */
    static async getForSession(sessionId) {
      return this.findOne({
        where: { session_id: sessionId }
      });
    }

    /**
     * Создать или обновить профиль пользователя
     */
    static async createOrUpdateForSession(sessionId, profileData) {
      const existing = await this.findOne({
        where: { session_id: sessionId }
      });

      if (existing) {
        return existing.update(profileData);
      } else {
        return this.create({
          session_id: sessionId,
          ...profileData
        });
      }
    }

    /**
     * Обновить настроение пользователя
     */
    async updateMood(mood, confidence = null) {
      return this.update({
        mood: mood,
        mood_confidence: confidence
      });
    }

    /**
     * Добавить предпочтение
     */
    async addPreference(key, value) {
      const currentPreferences = this.preferences || {};
      currentPreferences[key] = value;
      
      return this.update({
        preferences: currentPreferences
      });
    }

    /**
     * Добавить контекстную информацию
     */
    async addContext(key, value) {
      const currentContext = this.context || {};
      currentContext[key] = value;
      
      return this.update({
        context: currentContext
      });
    }

    /**
     * Получить статистику настроений
     */
    static async getMoodStats() {
      const results = await this.findAll({
        attributes: [
          'mood',
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('mood')), 'count'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('mood_confidence')), 'avg_confidence']
        ],
        where: {
          mood: { [sequelize.Sequelize.Op.not]: null }
        },
        group: ['mood'],
        order: [[sequelize.Sequelize.literal('count'), 'DESC']]
      });

      return results;
    }

    /**
     * Получить популярные предпочтения
     */
    static async getPopularPreferences() {
      const profiles = await this.findAll({
        attributes: ['preferences'],
        where: {
          preferences: { [sequelize.Sequelize.Op.not]: null }
        }
      });

      const preferenceStats = {};
      profiles.forEach(profile => {
        if (profile.preferences) {
          Object.entries(profile.preferences).forEach(([key, value]) => {
            if (!preferenceStats[key]) {
              preferenceStats[key] = {};
            }
            if (!preferenceStats[key][value]) {
              preferenceStats[key][value] = 0;
            }
            preferenceStats[key][value]++;
          });
        }
      });

      return preferenceStats;
    }
  }

  UserProfile.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID, allowNull: false },
      mood: DataTypes.STRING,
      mood_confidence: DataTypes.FLOAT,
      preferences: DataTypes.JSONB,
      context: DataTypes.JSONB,
      experience_level: DataTypes.STRING,
      cultural_background: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'UserProfile',
      tableName: 'user_profiles'
    }
  );

  return UserProfile;
};