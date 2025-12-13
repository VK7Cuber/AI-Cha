import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export const sequelize = new Sequelize(databaseUrl, {
  logging: false,
  define: {
    underscored: true,
    timestamps: true
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
  }
});

