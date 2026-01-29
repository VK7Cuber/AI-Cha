const { Model, DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  class TtsCache extends Model {
    /**
     * Создать хеш текста для поиска
     */
    static createTextHash(text, voiceName = '') {
      return crypto.createHash('sha256').update(`${text}:${voiceName}`).digest('hex');
    }

    /**
     * Найти кэшированное аудио по тексту
     */
    static async findByText(text, voiceName = '') {
      const hash = this.createTextHash(text, voiceName);
      const cached = await this.findOne({
        where: { text_hash: hash }
      });

      if (cached) {
        // Увеличиваем счетчик использования и обновляем время последнего использования
        await cached.update({
          hits_count: cached.hits_count + 1,
          last_used_at: new Date()
        });
      }

      return cached;
    }

    /**
     * Кэшировать аудио для текста
     */
    static async cacheAudio(text, audioData, options = {}) {
      const hash = this.createTextHash(text, options.voiceName || '');
      
      // Проверяем, есть ли уже такой хеш
      const existing = await this.findOne({
        where: { text_hash: hash }
      });

      if (existing) {
        // Обновляем существующий кэш
        return existing.update({
          audio_data: audioData,
          audio_format: options.audioFormat,
          voice_name: options.voiceName,
          duration_ms: options.durationMs,
          hits_count: existing.hits_count + 1,
          last_used_at: new Date()
        });
      } else {
        // Создаем новую запись
        return this.create({
          text_hash: hash,
          text_content: text,
          audio_data: audioData,
          audio_format: options.audioFormat,
          voice_name: options.voiceName,
          duration_ms: options.durationMs,
          hits_count: 1,
          last_used_at: new Date()
        });
      }
    }

    /**
     * Получить статистику кэша
     */
    static async getCacheStats() {
      const stats = await this.findAll({
        attributes: [
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'total_entries'],
          [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('hits_count')), 'total_hits'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('hits_count')), 'avg_hits_per_entry'],
          [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('duration_ms')), 'total_duration_ms'],
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('duration_ms')), 'avg_duration_ms']
        ]
      });

      return stats[0];
    }

    /**
     * Получить самые популярные кэшированные фразы
     */
    static async getMostPopular(limit = 10) {
      return this.findAll({
        attributes: ['text_content', 'voice_name', 'hits_count', 'duration_ms', 'last_used_at'],
        order: [['hits_count', 'DESC']],
        limit: limit
      });
    }

    /**
     * Очистить старый кэш
     */
    static async cleanOldCache(daysOld = 30, minHits = 1) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await this.destroy({
        where: {
          last_used_at: { [sequelize.Sequelize.Op.lt]: cutoffDate },
          hits_count: { [sequelize.Sequelize.Op.lt]: minHits }
        }
      });

      return deletedCount;
    }

    /**
     * Получить размер кэша в байтах (приблизительно)
     */
    static async getCacheSize() {
      const result = await this.findAll({
        attributes: [
          [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.fn('LENGTH', sequelize.Sequelize.col('audio_data'))), 'total_audio_size'],
          [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.fn('LENGTH', sequelize.Sequelize.col('text_content'))), 'total_text_size']
        ]
      });

      return result[0];
    }

    /**
     * Найти дубликаты (одинаковый текст, разные голоса)
     */
    static async findDuplicateTexts() {
      const results = await this.findAll({
        attributes: [
          'text_content',
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count'],
          [sequelize.Sequelize.fn('array_agg', sequelize.Sequelize.col('voice_name')), 'voice_names']
        ],
        group: ['text_content'],
        having: sequelize.Sequelize.literal('COUNT(id) > 1'),
        order: [[sequelize.Sequelize.literal('count'), 'DESC']]
      });

      return results;
    }

    /**
     * Обновить время последнего использования
     */
    async markUsed() {
      return this.update({
        hits_count: this.hits_count + 1,
        last_used_at: new Date()
      });
    }

    /**
     * Получить аудиоданные как Buffer
     */
    getAudioBuffer() {
      return this.audio_data;
    }
  }

  TtsCache.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      text_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      text_content: { type: DataTypes.TEXT, allowNull: false },
      audio_data: DataTypes.BLOB,
      audio_format: DataTypes.STRING,
      voice_name: DataTypes.STRING,
      duration_ms: DataTypes.INTEGER,
      hits_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_used_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'TtsCache',
      tableName: 'tts_cache'
    }
  );

  return TtsCache;
};