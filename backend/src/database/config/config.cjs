require('dotenv').config();

const defaultConfig = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  }
};

module.exports = {
  development: defaultConfig,
  test: defaultConfig,
  production: defaultConfig
};

