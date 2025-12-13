import 'dotenv/config';
import { createRequire } from 'node:module';
import { sequelize } from '../src/config/database.js';

const require = createRequire(import.meta.url);
const { initModels } = require('../src/database/models/index.cjs');

const { Category, Product, OrderItem, Order, Rating } = initModels(sequelize);

const menuItems = [
  {
    name_ru: 'Полуночный Шёпот',
    name_zh: '午夜的耳语',
    mood: 'Тревога → Спокойствие',
    composition:
      'Улун, лавандовый сироп, кокосовое молоко, ванильный сироп, лёд. Топпинг: Тапиока.',
    temperature: 'cold',
    price: 360
  },
  {
    name_ru: 'Солнечная Вспышка',
    name_zh: '太阳 вспышка',
    mood: 'Усталость → Энергия',
    composition: 'Матча, имбирный сироп, манговый сироп, газированная вода.',
    temperature: 'cold',
    price: 370
  },
  {
    name_ru: 'Туманный Мост',
    name_zh: '雾桥',
    mood: 'Неопределённость → Ясность',
    composition: 'Чёрный чай (крепкий), грейпфрутовый сироп, тоник, лёд, долька грейпфрута.',
    temperature: 'cold',
    price: 370
  },
  {
    name_ru: 'Бархатный Бунт',
    name_zh: '天鹅绒 мятеж',
    mood: 'Подавленность → Бунтарство',
    composition: 'Чёрный чай, вишнёвый сироп, клубничное пюре, безлактозное молоко. Топпинг: Тапиока, взбитые сливки.',
    temperature: 'both',
    price: 380
  },
  {
    name_ru: 'Туманность Мечты',
    name_zh: '星云 мечта',
    mood: 'Скука → Вдохновение',
    composition: 'Чай Каркаде, сироп личи, кокосовое молоко, синий клубничный сироп (слоями).',
    temperature: 'cold',
    price: 380
  },
  {
    name_ru: 'Тихая Буря',
    name_zh: '无声 буря',
    mood: 'Гнев → Баланс',
    composition: 'Пуэр, гранатовый сироп, мятный сироп, лёд с ягодой внутри.',
    temperature: 'cold',
    price: 390
  },
  {
    name_ru: 'Бумажный Парус',
    name_zh: '纸帆',
    mood: 'Одиночество → Лёгкость',
    composition: 'Белый чай, мёд, персиковый сироп, игристый белый виноградный сок.',
    temperature: 'cold',
    price: 360
  },
  {
    name_ru: 'Ржавый Компас',
    name_zh: '生锈 компас',
    mood: 'Потерянность → Направление',
    composition: 'Чай Каркаде, облепиховый сироп, имбирный сироп, мёд, горячий. Топпинг: палочка корицы.',
    temperature: 'hot',
    price: 360
  },
  {
    name_ru: 'Квантовая Пена',
    name_zh: '量子 пена',
    mood: 'Перегруз → Фокус',
    composition: 'Зелёный чай, сироп маракуйи, миндальное молоко. Топпинг: взбитые сливки, тёртое печенье.',
    temperature: 'both',
    price: 390
  },
  {
    name_ru: 'Янтарная Тюрьма',
    name_zh: '琥珀 тюрьма',
    mood: 'Зависимость → Освобождение',
    composition: 'Чёрный чай, апельсиновый сироп, карамельный сироп, молоко. Украшение: карамельная сетка.',
    temperature: 'both',
    price: 380
  },
  {
    name_ru: 'Шерстяное Одеяло',
    name_zh: '羊毛毯',
    mood: 'Холод → Уют',
    composition: 'Чай Каркаде, миндальное молоко, мёд, сироп корицы, горячий. Посыпать молотой корицей.',
    temperature: 'hot',
    price: 360
  },
  {
    name_ru: 'Угасающее Эхо',
    name_zh: '褪色回声',
    mood: 'Ностальгия → Принятие',
    composition: 'Улун, персиковый сироп, розовый сироп, лёд. Топпинг: тапиока, сушёная роза.',
    temperature: 'cold',
    price: 370
  },
  {
    name_ru: 'Вулканический Пепел',
    name_zh: '火山 пепел',
    mood: 'Апатия → Пробуждение',
    composition: 'Чёрный чай (крепкий), ананасовый сок, лаймовый сироп, лёд. Топпинг: тёртое печенье «орео».',
    temperature: 'cold',
    price: 380
  },
  {
    name_ru: 'Жестяной Солдат',
    name_zh: 'жестяной солдат',
    mood: 'Хрупкость → Стойкость',
    composition: 'Чёрный чай, имбирный сироп, мёд, кленовый сироп, горячий.',
    temperature: 'hot',
    price: 350
  },
  {
    name_ru: 'Забытый Язык',
    name_zh: '被遗忘的语言',
    mood: 'Недопонимание → Гармония',
    composition: 'Зелёный чай, грушевый сироп, лёд. Украсить долькой груши.',
    temperature: 'cold',
    price: 360
  }
];

async function main() {
  await sequelize.authenticate();

  await sequelize.transaction(async (t) => {
    // Полностью очистим зависимые таблицы
    await sequelize.query('TRUNCATE TABLE order_items, ratings, orders, products, categories RESTART IDENTITY CASCADE', {
      transaction: t
    });

    const teaCategory = await Category.create(
      {
        name_ru: 'Чайные напитки',
        name_zh: '茶饮',
        slug: 'tea',
        description_ru: 'Авторские чаи AI-Cha',
        description_zh: 'AI-Cha 特调茶饮',
        display_order: 1,
        is_active: true
      },
      { transaction: t }
    );

    const rows = menuItems.map((item, idx) => ({
      category_id: teaCategory.id,
      name_ru: item.name_ru,
      name_zh: item.name_zh,
      description_ru: item.mood,
      description_zh: '',
      price: item.price,
      image_url: `/images/products/menu-${idx + 1}.webp`,
      ingredients_ru: item.composition,
      ingredients_zh: null,
      temperature: item.temperature,
      is_available: true,
      is_recommended: true,
      tags: [],
      display_order: idx + 1
    }));

    await Product.bulkCreate(rows, { transaction: t });
  });

  console.log('Меню загружено успешно (15 позиций).');
  await sequelize.close();
}

main().catch((err) => {
  console.error('Ошибка загрузки меню:', err);
  sequelize.close();
  process.exit(1);
});

