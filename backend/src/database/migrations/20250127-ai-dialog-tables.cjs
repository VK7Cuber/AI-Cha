/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // dialog_sessions - Сессии диалогов с AI
    await queryInterface.createTable('dialog_sessions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      terminal_id: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM('in_progress', 'completed', 'interrupted', 'failed'),
        allowNull: false,
        defaultValue: 'in_progress'
      },
      language: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ru' },
      started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      completed_at: DataTypes.DATE,
      duration_seconds: DataTypes.INTEGER,
      questions_asked: { type: DataTypes.INTEGER, defaultValue: 0 },
      user_responses_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // dialog_messages - Сообщения в диалоге
    await queryInterface.createTable('dialog_messages', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dialog_sessions', key: 'id' },
        onDelete: 'CASCADE'
      },
      role: {
        type: DataTypes.ENUM('assistant', 'user'),
        allowNull: false
      },
      content: { type: DataTypes.TEXT, allowNull: false },
      audio_duration_ms: DataTypes.INTEGER,
      stt_confidence: DataTypes.FLOAT,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // user_profiles - Профили пользователей из диалогов
    await queryInterface.createTable('user_profiles', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dialog_sessions', key: 'id' },
        onDelete: 'CASCADE'
      },
      mood: DataTypes.STRING,
      mood_confidence: DataTypes.FLOAT,
      preferences: DataTypes.JSONB,
      context: DataTypes.JSONB,
      experience_level: DataTypes.STRING,
      cultural_background: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // recipe_generation_logs - Логи генерации рецептов (для аналитики и улучшения AI)
    await queryInterface.createTable('recipe_generation_logs', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'dialog_sessions', key: 'id' },
        onDelete: 'CASCADE'
      },
      profile_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'user_profiles', key: 'id' },
        onDelete: 'CASCADE'
      },
      generated_recipe_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'generated_recipes', key: 'id' },
        onDelete: 'CASCADE'
      },
      ai_reasoning: DataTypes.TEXT,
      prompt_used: DataTypes.TEXT,
      generation_time_ms: DataTypes.INTEGER,
      was_ordered: { type: DataTypes.BOOLEAN, defaultValue: false },
      user_rating: DataTypes.INTEGER,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // tts_cache - Кэш синтезированных фраз
    await queryInterface.createTable('tts_cache', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      text_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      text_content: { type: DataTypes.TEXT, allowNull: false },
      audio_data: { type: DataTypes.BLOB('long') },
      audio_format: DataTypes.STRING,
      voice_name: DataTypes.STRING,
      duration_ms: DataTypes.INTEGER,
      hits_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_used_at: DataTypes.DATE,
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Add foreign key constraint from generated_recipes to dialog_sessions
    // (it was missing in the previous migration)
    await queryInterface.addConstraint('generated_recipes', {
      fields: ['session_id'],
      type: 'foreign key',
      name: 'fk_generated_recipes_session',
      references: {
        table: 'dialog_sessions',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Создание индексов для оптимизации
    await queryInterface.addIndex('dialog_sessions', ['terminal_id', 'started_at']);
    await queryInterface.addIndex('dialog_sessions', ['status', 'started_at']);
    await queryInterface.addIndex('dialog_messages', ['session_id', 'created_at']);
    await queryInterface.addIndex('user_profiles', ['session_id']);
    await queryInterface.addIndex('recipe_generation_logs', ['session_id']);
    await queryInterface.addIndex('recipe_generation_logs', ['generated_recipe_id']);
    await queryInterface.addIndex('recipe_generation_logs', ['was_ordered', 'user_rating']);
    await queryInterface.addIndex('tts_cache', ['text_hash']);
    await queryInterface.addIndex('tts_cache', ['last_used_at']);
  },

  async down(queryInterface) {
    // Удаление foreign key constraint
    await queryInterface.removeConstraint('generated_recipes', 'fk_generated_recipes_session');

    // Удаление таблиц в обратном порядке (с учетом зависимостей)
    await queryInterface.dropTable('tts_cache');
    await queryInterface.dropTable('recipe_generation_logs');
    await queryInterface.dropTable('user_profiles');
    await queryInterface.dropTable('dialog_messages');
    await queryInterface.dropTable('dialog_sessions');

    // Удаление ENUM типов
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dialog_sessions_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dialog_messages_role";');
  }
};