const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Очистим данные, чтобы seed был идемпотентным при повторном запуске
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});

    // Категории обновленного меню
    const categories = [
      {
        key: 'tea_collection',
        name_ru: 'Чайная коллекция',
        name_zh: '创意茶饮',
        slug: 'tea-collection',
        description_ru: 'Фирменные бабл-ти и чайные напитки с авторскими сиропами',
        description_zh: '创意茶饮与波波茶',
        display_order: 1,
        icon_url: '/images/categories/tea.png'
      },
      {
        key: 'coffee_collection',
        name_ru: 'Кофейная коллекция',
        name_zh: '咖啡系列',
        slug: 'coffee-collection',
        description_ru: 'Кофейные новинки с пряностями, карамелью и фруктами',
        description_zh: '创意风味咖啡',
        display_order: 2,
        icon_url: '/images/categories/coffee.png'
      }
    ].map((cat) => ({
      id: uuidv4(),
      ...cat,
      is_active: true,
      created_at: now,
      updated_at: now
    }));

    const catId = (key) => categories.find((c) => c.key === key).id;

    // Товары обновленного меню (14 позиций)
    const products = [
      // Tea collection
      {
        category: 'tea_collection',
        name_ru: 'Облачный Улун',
        name_zh: '乌龙云顶',
        price: 430,
        temperature: 'cold',
        tags: ['улун', 'кокос', 'бабл-ти', 'сливочный', 'холодный'],
        description_ru: 'Слоистый бабл-ти на молочном улунe с кокосовым молоком и солёным кремом.',
        description_zh: '椰香奶乌龙，多层波波配咸奶盖。',
        ingredients_ru: 'Молочный улун, кокосовое молоко, ванильный сироп, миндальный сироп, медовая тапиока, солёные взбитые сливки, какао.',
        ingredients_zh: '奶香乌龙、椰奶、香草糖浆、杏仁糖浆、蜂蜜波波、咸奶盖、可可粉。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Дымящаяся Скала',
        name_zh: '烟熏岩茶',
        price: 420,
        temperature: 'hot',
        tags: ['копченый', 'латте', 'миндальное молоко', 'ягоды', 'горячий'],
        description_ru: 'Горячий лапсанг-латте с миндальным молоком, дымом и ягодами.',
        description_zh: '正山小种拿铁，烟熏风味配杏仁奶与覆盆子。',
        ingredients_ru: 'Лапсанг Сушонг, миндальное молоко, кленовый сироп, лавандовый сироп, взбитые сливки, корица, сушёная малина.',
        ingredients_zh: '正山小种、杏仁奶、枫糖浆、薰衣草糖浆、淡奶油、肉桂、冻干覆盆子。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Матча-Аффогато',
        name_zh: '抹茶阿芙佳朵',
        price: 450,
        temperature: 'both',
        tags: ['матча', 'десерт', 'кокос', 'карамель', 'сливочный'],
        description_ru: 'Матча-крем с шариком ванильного мороженого и карамельной тапиокой.',
        description_zh: '抹茶奶油淋香草冰淇淋，配焦糖波波。',
        ingredients_ru: 'Матча-порошок, кокосовое молоко, ванильное мороженое, карамельный сироп, карамельная тапиока.',
        ingredients_zh: '抹茶粉、椰奶、香草冰淇淋、焦糖糖浆、焦糖波波。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Красный Бархат',
        name_zh: '红色天鹅绒',
        price: 410,
        temperature: 'cold',
        tags: ['ягодный', 'черный чай', 'безлактозный', 'сладкий', 'холодный'],
        description_ru: 'Ягодный чёрный чай-фраппе с малиной, безлактозным молоком и сливками.',
        description_zh: '覆盆子黑茶冰沙，乳脂绵密配草莓波波。',
        ingredients_ru: 'Чёрный чай, малиновый сироп, замороженная малина, безлактозное молоко, взбитые сливки, сушёная малина, клубничная тапиока.',
        ingredients_zh: '红茶、覆盆子糖浆、冷冻覆盆子、无乳糖牛奶、奶油、冻干覆盆子、草莓波波。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Жасминовый Туман',
        name_zh: '茉莉雾霭',
        price: 400,
        temperature: 'cold',
        tags: ['жасмин', 'миндальное молоко', 'флоральный', 'освежающий', 'бабл-ти'],
        description_ru: 'Холодный жасминовый чай с миндальным молоком и нотами сливы, лаванды и мяты.',
        description_zh: '茉莉冷萃加杏仁奶，梅花与薰衣草薄荷香。',
        ingredients_ru: 'Зелёный жасминовый чай, сироп цветков сливы, лавандовый сироп, мятный сироп, миндальное молоко, чёрная тапиока, сливки, лёд.',
        ingredients_zh: '茉莉绿茶、梅花糖浆、薰衣草糖浆、薄荷糖浆、杏仁奶、黑波波、奶油、冰块。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Белый Сад',
        name_zh: '白茶花园',
        price: 390,
        temperature: 'hot',
        tags: ['белый чай', 'медовый', 'мягкий', 'сливочный'],
        description_ru: 'Бай Му Дань с миндальным молоком, мёдом и кленовым сиропом, подается с медовой тапиокой.',
        description_zh: '白牡丹茶搭配杏仁奶、蜂蜜与枫糖，配蜂蜜波波。',
        ingredients_ru: 'Белый чай Бай Му Дань, миндальное молоко, кленовый сироп, мёд, медовая тапиока.',
        ingredients_zh: '白牡丹、杏仁奶、枫糖浆、蜂蜜、蜂蜜波波。'
      },
      {
        category: 'tea_collection',
        name_ru: 'Инь-Янь Бабл',
        name_zh: '阴阳波波茶',
        price: 440,
        temperature: 'cold',
        tags: ['матча', 'ананас', 'слои', 'бабл-ти', 'освежающий'],
        description_ru: 'Двухслойный матча-латте и ананасовый чёрный чай с зелёной тапиокой.',
        description_zh: '双层抹茶拿铁与菠萝红茶，配抹茶波波。',
        ingredients_ru: 'Матча-латте на кокосовом молоке, чёрный чай, ананасовый сок, апельсиновый сироп, зелёная тапиока, лёд.',
        ingredients_zh: '抹茶拿铁、红茶、菠萝汁、橙味糖浆、抹茶波波、冰块。'
      },
      // Coffee collection
      {
        category: 'coffee_collection',
        name_ru: 'Эспрессо имбирно-пряничный',
        name_zh: '姜饼浓缩咖啡',
        price: 350,
        temperature: 'hot',
        tags: ['эспрессо', 'пряный', 'имбирь', 'сливки', 'горячий'],
        description_ru: 'Двойной эспрессо с имбирным сиропом и пряной шапкой сливок.',
        description_zh: '双份浓缩加姜饼糖浆与香料奶盖。',
        ingredients_ru: 'Двойной эспрессо, имбирный сироп, сливки 20%, взбитые сливки, корица, какао, цукаты имбиря.',
        ingredients_zh: '双份浓缩、姜饼糖浆、淡奶油、奶油、肉桂、可可粉、姜糖。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Латте карамельный',
        name_zh: '焦糖拿铁',
        price: 360,
        temperature: 'hot',
        tags: ['латте', 'карамель', 'шоколад', 'сливочный'],
        description_ru: 'Горячий карамельный латте с шоколадным акцентом и карамельной тапиокой.',
        description_zh: '焦糖拿铁配巧克力风味与焦糖波波。',
        ingredients_ru: 'Эспрессо, молоко, карамельный сироп, шоколадный сироп, мёд, взбитые сливки, корица, карамельная тапиока.',
        ingredients_zh: '浓缩、牛奶、焦糖糖浆、巧克力糖浆、蜂蜜、奶油、肉桂、焦糖波波。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Фруктовое наслаждение',
        name_zh: '果味的喜悦',
        price: 380,
        temperature: 'cold',
        tags: ['кофе-тоник', 'манго', 'имбирь', 'освежающий'],
        description_ru: 'Холодный кофе-тоник с манго, имбирём и медовой тапиокой.',
        description_zh: '冰咖啡汤力配芒果姜味，蜂蜜波波。',
        ingredients_ru: 'Холодный латте, тоник, сироп манго, имбирный сироп, медовая тапиока, лёд, корица.',
        ingredients_zh: '冰拿铁、汤力水、芒果糖浆、姜糖浆、蜂蜜波波、冰块、肉桂。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Коричный Рулет',
        name_zh: '肉桂卷咖啡',
        price: 370,
        temperature: 'hot',
        tags: ['мокка', 'кокос', 'корица', 'десертный'],
        description_ru: 'Горячая мокка с кокосовым молоком, корицей и песочной крошкой.',
        description_zh: '椰奶摩卡，肉桂与饼干碎做顶。',
        ingredients_ru: 'Мокка, кокосовое молоко, кокосовый сироп, коричный сироп, взбитые сливки, песочная крошка, корица.',
        ingredients_zh: '摩卡、椰奶、椰子糖浆、肉桂糖浆、奶油、饼干碎、肉桂粉。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Ореховый Эльф',
        name_zh: '坚果精灵',
        price: 390,
        temperature: 'cold',
        tags: ['фраппе', 'фундук', 'карамель', 'холодный', 'сливочный'],
        description_ru: 'Фраппе на капучино с фундуком, карамелью и карамельной тапиокой.',
        description_zh: '榛果焦糖冰咖啡冰沙，配焦糖波波。',
        ingredients_ru: 'Капучино, фундуковый сироп, молоко, карамельный сироп, лёд, взбитые сливки, карамельная тапиока.',
        ingredients_zh: '卡布奇诺、榛果糖浆、牛奶、焦糖糖浆、冰块、奶油、焦糖波波。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Фильтр-Сангрия',
        name_zh: '过滤桑格利亚',
        price: 365,
        temperature: 'cold',
        tags: ['ананас', 'ягодный', 'холодный', 'легкий'],
        description_ru: 'Освежающий микс охлаждённого капучино, ананасового сока и малины.',
        description_zh: '菠萝汁与覆盆子冰咖啡，似桑格利亚风味。',
        ingredients_ru: 'Охлаждённый капучино, ананасовый сок, сушёная малина, медовая тапиока, лёд, корица.',
        ingredients_zh: '冰卡布奇诺、菠萝汁、冻干覆盆子、蜂蜜波波、冰块、肉桂。'
      },
      {
        category: 'coffee_collection',
        name_ru: 'Медовая Луна',
        name_zh: '蜜月咖啡',
        price: 380,
        temperature: 'hot',
        tags: ['латте', 'мёд', 'цветы', 'мягкий', 'теплый'],
        description_ru: 'Тёплый латте с мёдом, сливками и нотами цветков сливы.',
        description_zh: '蜂蜜拿铁配梅花糖浆与奶油，蜂蜜波波。',
        ingredients_ru: 'Латте, мёд, безлактозное молоко, сироп цветков сливы, взбитые сливки, медовая тапиока.',
        ingredients_zh: '拿铁、蜂蜜、无乳糖牛奶、梅花糖浆、奶油、蜂蜜波波。'
      }
    ].map((p, idx) => ({
      id: uuidv4(),
      category_id: catId(p.category),
      name_ru: p.name_ru,
      name_zh: p.name_zh,
      description_ru: p.description_ru,
      description_zh: p.description_zh,
      price: p.price,
      image_url: p.image_url || `/images/products/${p.category}-${idx + 1}.webp`,
      ingredients_ru: p.ingredients_ru || null,
      ingredients_zh: p.ingredients_zh || null,
      temperature: p.temperature,
      is_available: true,
      is_recommended: p.is_recommended ?? (p.tags?.includes('рекомендовано') || false),
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

