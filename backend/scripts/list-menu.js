import 'dotenv/config';
import { createRequire } from 'node:module';
import { sequelize } from '../src/config/database.js';

const require = createRequire(import.meta.url);
const { initModels } = require('../src/database/models/index.cjs');

const { Category, Product } = initModels(sequelize);

async function main() {
  await sequelize.authenticate();
  const categories = await Category.findAll({ attributes: ['id', 'name_ru', 'slug'] });
  const products = await Product.findAll({
    attributes: ['id', 'name_ru', 'name_zh', 'price', 'temperature', 'is_available', 'display_order'],
    order: [['display_order', 'ASC']]
  });

  console.log(`Категорий: ${categories.length}`);
  categories.forEach((c) => console.log(` - ${c.name_ru} (${c.slug})`));

  console.log(`\nТоваров: ${products.length}`);
  products.slice(0, 50).forEach((p, idx) => {
    console.log(
      `${idx + 1}. ${p.name_ru} / ${p.name_zh} — ${p.price}₽ (${p.temperature})${p.is_available ? '' : ' [нет в наличии]'}`
    );
  });

  await sequelize.close();
}

main().catch((err) => {
  console.error('Ошибка при выводе меню:', err);
  sequelize.close();
  process.exit(1);
});

