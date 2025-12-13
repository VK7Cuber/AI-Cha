const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Очистим данные, чтобы seed был идемпотентным при повторном запуске
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});

    // Категории
    const categories = [
      { key: 'tea', name_ru: 'Чайные напитки', name_zh: '茶饮', slug: 'tea', description_ru: 'Классические и авторские чаи', description_zh: '经典与创意茶饮', display_order: 1, icon_url: '/images/categories/tea.png' },
      { key: 'coffee', name_ru: 'Кофейные напитки', name_zh: '咖啡饮品', slug: 'coffee', description_ru: 'Эспрессо, латте и альтернативы', description_zh: '意式、拿铁与手冲', display_order: 2, icon_url: '/images/categories/coffee.png' },
      { key: 'cold', name_ru: 'Холодные напитки', name_zh: '冷饮', slug: 'cold', description_ru: 'Освежающие лимонады и холодные чаи', description_zh: '清爽柠檬水与冷泡茶', display_order: 3, icon_url: '/images/categories/cold.png' },
      { key: 'dessert', name_ru: 'Десерты', name_zh: '甜点', slug: 'desserts', description_ru: 'Сладкие дополнения к чаю', description_zh: '搭配茶饮的甜品', display_order: 4, icon_url: '/images/categories/dessert.png' },
      { key: 'ceremony', name_ru: 'Чайные церемонии', name_zh: '茶道', slug: 'ceremonies', description_ru: 'Традиционные заваривания', description_zh: '传统茶艺冲泡', display_order: 5, icon_url: '/images/categories/ceremony.png' }
    ].map((cat) => ({
      id: uuidv4(),
      ...cat,
      is_active: true,
      created_at: now,
      updated_at: now
    }));

    const catId = (key) => categories.find((c) => c.key === key).id;

    // Товары (минимум 30 позиций)
    const products = [
      // Tea
      { category: 'tea', name_ru: 'Лунцзин', name_zh: '龙井茶', price: 250, temperature: 'hot', tags: ['зеленый', 'легкий', 'ореховый'], description_ru: 'Классический зеленый чай с ореховыми нотами', description_zh: '经典龙井，带坚果香气' },
      { category: 'tea', name_ru: 'Пуэр выдержанный', name_zh: '普洱茶', price: 350, temperature: 'hot', tags: ['крепкий', 'землистый'], description_ru: 'Глубокий вкус выдержанного пуэра', description_zh: '陈年普洱，醇厚回甘' },
      { category: 'tea', name_ru: 'Молочный улун', name_zh: '乌龙茶', price: 280, temperature: 'hot', tags: ['улун', 'сливочный', 'ароматный'], description_ru: 'Мягкий сливочный аромат улуна', description_zh: '奶香乌龙，香醇顺滑' },
      { category: 'tea', name_ru: 'Жасминовый чай', name_zh: '茉莉花茶', price: 230, temperature: 'hot', tags: ['цветочный', 'легкий'], description_ru: 'Свежий жасминовый аромат', description_zh: '清新茉莉花香' },
      { category: 'tea', name_ru: 'Черный чай Дяньхун', name_zh: '滇红', price: 260, temperature: 'hot', tags: ['черный', 'медовый'], description_ru: 'Медовые ноты и глубокий цвет', description_zh: '蜜香滇红，醇厚甘甜' },
      { category: 'tea', name_ru: 'Матча латте', name_zh: '抹茶拿铁', price: 320, temperature: 'both', tags: ['матча', 'сливочный'], description_ru: 'Матча с молоком, можно холодную', description_zh: '抹茶与牛奶，可热可冷' },
      // Coffee
      { category: 'coffee', name_ru: 'Эспрессо', name_zh: '意式浓缩', price: 180, temperature: 'hot', tags: ['крепкий', 'быстрый'], description_ru: 'Классический эспрессо', description_zh: '经典意式浓缩' },
      { category: 'coffee', name_ru: 'Американо', name_zh: '美式咖啡', price: 200, temperature: 'hot', tags: ['легкий', 'длительный'], description_ru: 'Эспрессо с горячей водой', description_zh: '浓缩加热水，口感顺' },
      { category: 'coffee', name_ru: 'Капучино', name_zh: '卡布奇诺', price: 260, temperature: 'hot', tags: ['молочный', 'пенка'], description_ru: 'Кофе с пышной молочной пеной', description_zh: '绵密奶泡的咖啡' },
      { category: 'coffee', name_ru: 'Латте', name_zh: '拿铁', price: 270, temperature: 'hot', tags: ['мягкий', 'молочный'], description_ru: 'Мягкий кофе с молоком', description_zh: '口感柔和的牛奶咖啡' },
      { category: 'coffee', name_ru: 'Флэт уайт', name_zh: '馥芮白', price: 280, temperature: 'hot', tags: ['плотный', 'микропенка'], description_ru: 'Плотный вкус, тонкая пенка', description_zh: '风味浓郁，薄奶泡' },
      { category: 'coffee', name_ru: 'Карамельный раф', name_zh: '焦糖拉花咖啡', price: 310, temperature: 'hot', tags: ['сладкий', 'сливочный'], description_ru: 'Сливочный раф с карамелью', description_zh: '焦糖与奶油的甜香' },
      // Cold drinks
      { category: 'cold', name_ru: 'Холодный жасминовый чай', name_zh: '冷泡茉莉', price: 240, temperature: 'cold', tags: ['легкий', 'цветочный', 'освежающий'], description_ru: 'Холодный настой жасминового чая', description_zh: '清爽冷泡茉莉' },
      { category: 'cold', name_ru: 'Лимонад с юдзу', name_zh: '柚子柠檬水', price: 260, temperature: 'cold', tags: ['цитрусовый', 'кисло-сладкий'], description_ru: 'Легкий цитрусовый лимонад', description_zh: '清新柚子风味' },
      { category: 'cold', name_ru: 'Холодный улун с персиком', name_zh: '桃子乌龙冷泡', price: 270, temperature: 'cold', tags: ['фруктовый', 'улун'], description_ru: 'Улун с ароматом персика', description_zh: '乌龙融合桃子果香' },
      { category: 'cold', name_ru: 'Матча-тоник', name_zh: '抹茶汤力', price: 290, temperature: 'cold', tags: ['матча', 'тоник', 'освежающий'], description_ru: 'Матча с тоником и льдом', description_zh: '抹茶搭配汤力水' },
      { category: 'cold', name_ru: 'Айс-латте', name_zh: '冰拿铁', price: 280, temperature: 'cold', tags: ['кофе', 'молочный', 'холодный'], description_ru: 'Латте на льду', description_zh: '冰爽拿铁' },
      { category: 'cold', name_ru: 'Фруктовый чай с ягодами', name_zh: '莓果水果茶', price: 300, temperature: 'cold', tags: ['ягодный', 'сладкий'], description_ru: 'Фруктовый чай с ягодным миксом', description_zh: '多莓果香水果茶' },
      // Desserts
      { category: 'dessert', name_ru: 'Чизкейк классический', name_zh: '经典芝士蛋糕', price: 320, temperature: 'both', tags: ['сливочный', 'сырный'], description_ru: 'Нежный сырный чизкейк', description_zh: '绵密奶香芝士' },
      { category: 'dessert', name_ru: 'Маффин матча', name_zh: '抹茶玛芬', price: 180, temperature: 'both', tags: ['матча', 'сладкий'], description_ru: 'Маффин с матча и белым шоколадом', description_zh: '抹茶与白巧的甜香' },
      { category: 'dessert', name_ru: 'Тирамису', name_zh: '提拉米苏', price: 300, temperature: 'both', tags: ['кофе', 'кремовый'], description_ru: 'Классический тирамису', description_zh: '经典提拉米苏' },
      { category: 'dessert', name_ru: 'Печенье кунжутное', name_zh: '芝麻曲奇', price: 140, temperature: 'both', tags: ['кунжут', 'хрустящий'], description_ru: 'Хрустящее печенье с кунжутом', description_zh: '酥脆芝麻饼干' },
      { category: 'dessert', name_ru: 'Моти с манго', name_zh: '芒果麻薯', price: 210, temperature: 'both', tags: ['манго', 'жевательное'], description_ru: 'Мягкие моти с манговой начинкой', description_zh: '芒果内馅软糯麻薯' },
      { category: 'dessert', name_ru: 'Шоколадный брауни', name_zh: '布朗尼', price: 240, temperature: 'both', tags: ['шоколад', 'насыщенный'], description_ru: 'Плотный шоколадный брауни', description_zh: '浓郁巧克力布朗尼' },
      // Ceremony
      { category: 'ceremony', name_ru: 'Гунфу завари́вание улуна', name_zh: '功夫乌龙冲泡', price: 650, temperature: 'hot', tags: ['церемония', 'улун'], description_ru: 'Традиционное заваривание улуна гайванью', description_zh: '盖碗功夫泡乌龙' },
      { category: 'ceremony', name_ru: 'Гунфу завари́вание пуэра', name_zh: '功夫普洱冲泡', price: 680, temperature: 'hot', tags: ['церемония', 'пуэр'], description_ru: 'Чайная церемония с пуэром', description_zh: '普洱功夫茶道' },
      { category: 'ceremony', name_ru: 'Матча церемониальная', name_zh: '抹茶点茶', price: 620, temperature: 'hot', tags: ['матча', 'церемония'], description_ru: 'Взбивание матча бамбуковой кистью', description_zh: '传统茶筅点茶' },
      { category: 'ceremony', name_ru: 'Жасминовый гунфу сет', name_zh: '茉莉功夫茶', price: 600, temperature: 'hot', tags: ['жасмин', 'церемония'], description_ru: 'Церемония с жасминовым чаем', description_zh: '茉莉花茶功夫泡' },
      { category: 'ceremony', name_ru: 'Улун с пиалами', name_zh: '乌龙茶席', price: 640, temperature: 'hot', tags: ['улун', 'традиционный'], description_ru: 'Пошаговое заваривание улуна с сервировкой', description_zh: '乌龙分泡与呈茶' }
    ].map((p, idx) => ({
      id: uuidv4(),
      category_id: catId(p.category),
      name_ru: p.name_ru,
      name_zh: p.name_zh,
      description_ru: p.description_ru,
      description_zh: p.description_zh,
      price: p.price,
      image_url: p.image_url || `/images/products/${p.category}-${idx + 1}.webp`,
      ingredients_ru: null,
      ingredients_zh: null,
      temperature: p.temperature,
      is_available: true,
      is_recommended: p.tags?.includes('рекомендовано') || false,
      tags: JSON.stringify(p.tags || []),
      display_order: idx + 1,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('categories', categories.map(({ key, ...cat }) => cat));
    await queryInterface.bulkInsert('products', products);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};

