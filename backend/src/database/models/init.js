import { createRequire } from 'node:module';
import { sequelize } from '../../config/database.js';

const require = createRequire(import.meta.url);
const { initModels } = require('./index.cjs');

export const models = initModels(sequelize);

