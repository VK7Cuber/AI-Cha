const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DialogSession extends Model {
    /**
     * Найти активные сессии для конкретного терминала
     */
    static async getActiveForTerminal(terminalId) {
      return this.findAll({
        where: { 
          terminal_id: terminalId,
          status: 'in_progress'
        },
        order: [['started_at', 'DESC']]
      });
    }

    /**
     * Завершить сессию
     */
    async complete(durationSeconds = null) {
      const completedAt = new Date();
      const duration = durationSeconds || Math.floor((completedAt - this.started_at) / 1000);
      
      return this.update({
        status: 'completed',
        completed_at: completedAt,
        duration_seconds: duration
      });
    }

    /**
     * Прервать сессию
     */
    async interrupt() {
      const interruptedAt = new Date();
      const duration = Math.floor((interruptedAt - this.started_at) / 1000);
      
      return this.update({
        status: 'interrupted',
        completed_at: interruptedAt,
        duration_seconds: duration
      });
    }

    /**
     * Отметить сессию как неуспешную
     */
    async fail() {
      const failedAt = new Date();
      const duration = Math.floor((failedAt - this.started_at) / 1000);
      
      return this.update({
        status: 'failed',
        completed_at: failedAt,
        duration_seconds: duration
      });
    }

    /**
     * Увеличить счетчик вопросов
     */
    async incrementQuestions() {
      return this.update({
        questions_asked: this.questions_asked + 1
      });
    }

    /**
     * Увеличить счетчик ответов пользователя
     */
    async incrementUserResponses() {
      return this.update({
        user_responses_count: this.user_responses_count + 1
      });
    }
  }

  DialogSession.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      terminal_id: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM('in_progress', 'completed', 'interrupted', 'failed'),
        allowNull: false,
        defaultValue: 'in_progress'
      },
      language: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ru' },
      started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      completed_at: DataTypes.DATE,
      duration_seconds: DataTypes.INTEGER,
      questions_asked: { type: DataTypes.INTEGER, defaultValue: 0 },
      user_responses_count: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      modelName: 'DialogSession',
      tableName: 'dialog_sessions'
    }
  );

  return DialogSession;
};