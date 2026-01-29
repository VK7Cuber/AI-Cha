const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DialogMessage extends Model {
    /**
     * Получить все сообщения сессии в хронологическом порядке
     */
    static async getForSession(sessionId) {
      return this.findAll({
        where: { session_id: sessionId },
        order: [['created_at', 'ASC']]
      });
    }

    /**
     * Получить последнее сообщение в сессии
     */
    static async getLastForSession(sessionId) {
      return this.findOne({
        where: { session_id: sessionId },
        order: [['created_at', 'DESC']]
      });
    }

    /**
     * Получить сообщения пользователя в сессии
     */
    static async getUserMessagesForSession(sessionId) {
      return this.findAll({
        where: { 
          session_id: sessionId,
          role: 'user'
        },
        order: [['created_at', 'ASC']]
      });
    }

    /**
     * Получить сообщения ассистента в сессии
     */
    static async getAssistantMessagesForSession(sessionId) {
      return this.findAll({
        where: { 
          session_id: sessionId,
          role: 'assistant'
        },
        order: [['created_at', 'ASC']]
      });
    }

    /**
     * Создать сообщение пользователя
     */
    static async createUserMessage(sessionId, content, audioDurationMs = null, sttConfidence = null) {
      return this.create({
        session_id: sessionId,
        role: 'user',
        content: content,
        audio_duration_ms: audioDurationMs,
        stt_confidence: sttConfidence
      });
    }

    /**
     * Создать сообщение ассистента
     */
    static async createAssistantMessage(sessionId, content) {
      return this.create({
        session_id: sessionId,
        role: 'assistant',
        content: content
      });
    }

    /**
     * Получить среднюю уверенность STT для сессии
     */
    static async getAverageSTTConfidenceForSession(sessionId) {
      const result = await this.findOne({
        where: { 
          session_id: sessionId,
          role: 'user',
          stt_confidence: { [sequelize.Sequelize.Op.not]: null }
        },
        attributes: [
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('stt_confidence')), 'avg_confidence']
        ]
      });
      
      return result?.dataValues?.avg_confidence || null;
    }
  }

  DialogMessage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: { type: DataTypes.UUID, allowNull: false },
      role: {
        type: DataTypes.ENUM('assistant', 'user'),
        allowNull: false
      },
      content: { type: DataTypes.TEXT, allowNull: false },
      audio_duration_ms: DataTypes.INTEGER,
      stt_confidence: DataTypes.FLOAT
    },
    {
      sequelize,
      modelName: 'DialogMessage',
      tableName: 'dialog_messages'
    }
  );

  return DialogMessage;
};