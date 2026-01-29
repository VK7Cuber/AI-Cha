const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const getCategoryId = async (slug) => {
      const [rows] = await queryInterface.sequelize.query(
        'SELECT id FROM categories WHERE slug = :slug LIMIT 1',
        { replacements: { slug } }
      );
      return rows?.[0]?.id || null;
    };

    let signatureCategoryId = await getCategoryId('signature-drinks');
    if (!signatureCategoryId) {
      signatureCategoryId = uuidv4();
      await queryInterface.bulkInsert('categories', [
        {
          id: signatureCategoryId,
          name_ru: 'Авторские напитки',
          name_zh: '作者特调',
          slug: 'signature-drinks',
          description_ru: 'Коллекция авторских напитков с настроением и характером',
          description_zh: '情绪主题的原创特调饮品',
          display_order: 3,
          icon_url: '/images/categories/signature.png',
          is_active: true,
          created_at: now,
          updated_at: now
        }
      ]);
    }

    const [existing] = await queryInterface.sequelize.query(
      'SELECT name_ru FROM products WHERE category_id = :categoryId',
      { replacements: { categoryId: signatureCategoryId } }
    );
    const existingNames = new Set((existing || []).map((row) => row.name_ru));

    const products = [
      {
        name_ru: 'Полуночный Шёпот',
        name_zh: '午夜的耳语',
        price: 420,
        temperature: 'cold',
        tags: ['улун', 'лаванда', 'кокос', 'ваниль', 'холодный', 'бабл-ти'],
        description_ru: 'Мягкий улун с лавандой и кокосом, словно тёплый шёпот в тишине.',
        description_zh: '乌龙与薰衣草、椰香的柔和组合，如夜色中的低语。',
        ingredients_ru: 'Улун, лавандовый сироп, кокосовое молоко, ванильный сироп, лёд, классическая тапиока.',
        ingredients_zh: '乌龙茶、薰衣草糖浆、椰奶、香草糖浆、冰块、黑珍珠。'
      },
      {
        name_ru: 'Солнечная Вспышка',
        name_zh: '太阳',
        price: 410,
        temperature: 'cold',
        tags: ['матча', 'имбирь', 'манго', 'газированный', 'освежающий'],
        description_ru: 'Матча, манго и имбирь с искрой газированной воды для бодрого старта.',
        description_zh: '抹茶与芒果、生姜的清爽气泡饮，充满能量。',
        ingredients_ru: 'Матча, имбирный сироп, манговый сироп, газированная вода.',
        ingredients_zh: '抹茶、姜糖浆、芒果糖浆、气泡水。'
      },
      {
        name_ru: 'Туманный Мост',
        name_zh: '雾桥',
        price: 415,
        temperature: 'cold',
        tags: ['черный чай', 'апельсин', 'тоник', 'грейпфрут', 'холодный'],
        description_ru: 'Крепкий чёрный чай, цитрусы и тоник — ясность в каждом глотке.',
        description_zh: '浓红茶与柑橘、汤力水的组合，清晰明快。',
        ingredients_ru: 'Крепкий чёрный чай, апельсиновый сироп, тоник, лёд, долька грейпфрута.',
        ingredients_zh: '浓红茶、橙子糖浆、汤力水、冰块、西柚片。'
      },
      {
        name_ru: 'Бархатный Бунт',
        name_zh: '天鹅绒',
        price: 430,
        temperature: 'cold',
        tags: ['черный чай', 'малина', 'сливочный', 'клубничная тапиока'],
        description_ru: 'Ягодно‑сливочный микс с лёгкой дерзостью.',
        description_zh: '覆盆子与牛奶的柔滑碰撞，带一点叛逆。',
        ingredients_ru: 'Чёрный чай, малиновый сироп, безлактозное молоко, клубничная тапиока, взбитые сливки.',
        ingredients_zh: '红茶、覆盆子糖浆、无乳糖牛奶、草莓珍珠、奶油。'
      },
      {
        name_ru: 'Туманность Мечты',
        name_zh: '星云',
        price: 400,
        temperature: 'hot',
        tags: ['белый чай', 'слива', 'кокос', 'нежный'],
        description_ru: 'Белый чай с ароматом цветков сливы и кокосовой мягкостью.',
        description_zh: '白牡丹与梅花糖浆、椰奶的柔和梦幻组合。',
        ingredients_ru: 'Белый чай Бай Му Дань, сироп цветков сливы, кокосовое молоко.',
        ingredients_zh: '白牡丹、梅花糖浆、椰奶。'
      },
      {
        name_ru: 'Тихая Буря',
        name_zh: '无声',
        price: 410,
        temperature: 'cold',
        tags: ['улун', 'мята', 'кокос', 'холодный'],
        description_ru: 'Освежающий улун с мятой и кокосом.',
        description_zh: '清爽的乌龙茶，带薄荷与椰香。',
        ingredients_ru: 'Молочный улун, мятный сироп, кокосовый сироп, лёд.',
        ingredients_zh: '奶香乌龙、薄荷糖浆、椰子糖浆、冰块。'
      },
      {
        name_ru: 'Бумажный Парус',
        name_zh: '纸帆',
        price: 405,
        temperature: 'hot',
        tags: ['белый чай', 'мёд', 'лаванда', 'тёплый'],
        description_ru: 'Нежный белый чай с мёдом и лавандой.',
        description_zh: '白茶与蜂蜜、薰衣草的温柔香气。',
        ingredients_ru: 'Белый чай Бай Му Дань, мёд, лавандовый сироп, кокосовый сироп, тапиока с матчей.',
        ingredients_zh: '白牡丹、蜂蜜、薰衣草糖浆、椰子糖浆、抹茶珍珠。'
      },
      {
        name_ru: 'Ржавый Компас',
        name_zh: '生锈',
        price: 415,
        temperature: 'hot',
        tags: ['черный чай', 'апельсин', 'имбирь', 'мед', 'корица', 'горячий'],
        description_ru: 'Согревающий чёрный чай с апельсином, мёдом и имбирём.',
        description_zh: '红茶配橙子与姜、蜂蜜，温暖醒神。',
        ingredients_ru: 'Чёрный чай, апельсиновый сироп, имбирный сироп, мёд, палочка корицы.',
        ingredients_zh: '红茶、橙子糖浆、姜糖浆、蜂蜜、肉桂棒。'
      },
      {
        name_ru: 'Квантовая Пена',
        name_zh: '量子',
        price: 420,
        temperature: 'both',
        tags: ['жасмин', 'манго', 'миндаль', 'сливочный'],
        description_ru: 'Жасминовый чай с манго и миндальным молоком.',
        description_zh: '茉莉绿茶配芒果糖浆与杏仁奶。',
        ingredients_ru: 'Зелёный чай с жасмином, манговый сироп, миндальное молоко, взбитые сливки.',
        ingredients_zh: '茉莉绿茶、芒果糖浆、杏仁奶、奶油。'
      },
      {
        name_ru: 'Янтарная Тюрьма',
        name_zh: '琥珀',
        price: 410,
        temperature: 'hot',
        tags: ['черный чай', 'апельсин', 'карамель', 'сливочный'],
        description_ru: 'Чёрный чай с апельсином и карамельной сеткой.',
        description_zh: '红茶搭配橙香与焦糖网纹。',
        ingredients_ru: 'Чёрный чай, апельсиновый сироп, карамельный сироп, обычное молоко, карамельная сетка.',
        ingredients_zh: '红茶、橙子糖浆、焦糖糖浆、牛奶、焦糖网纹。'
      },
      {
        name_ru: 'Шерстяное Одеяло',
        name_zh: '羊毛毯',
        price: 420,
        temperature: 'hot',
        tags: ['черный чай', 'мята', 'миндаль', 'мед', 'корица', 'горячий'],
        description_ru: 'Уютный мятный чёрный чай с миндалём и мёдом.',
        description_zh: '薄荷红茶与杏仁、蜂蜜的温暖组合。',
        ingredients_ru: 'Чёрный мятный чай, миндальное молоко, мёд, сироп корицы, молотая корица, медовая тапиока.',
        ingredients_zh: '薄荷红茶、杏仁奶、蜂蜜、肉桂糖浆、肉桂粉、蜂蜜珍珠。'
      },
      {
        name_ru: 'Угасающее Эхо',
        name_zh: '褪色回声',
        price: 410,
        temperature: 'cold',
        tags: ['улун', 'мята', 'шоколад', 'холодный', 'бабл-ти'],
        description_ru: 'Молочный улун с мятой и шоколадом.',
        description_zh: '奶香乌龙与薄荷、巧克力的冷饮。',
        ingredients_ru: 'Молочный улун, мятный сироп, шоколадный сироп, лёд, классическая тапиока.',
        ingredients_zh: '奶香乌龙、薄荷糖浆、巧克力糖浆、冰块、黑珍珠。'
      },
      {
        name_ru: 'Вулканический Пепел',
        name_zh: '火山',
        price: 415,
        temperature: 'cold',
        tags: ['черный чай', 'карамель', 'апельсин', 'холодный'],
        description_ru: 'Крепкий чёрный чай с карамелью и апельсином.',
        description_zh: '浓红茶配焦糖与橙香。',
        ingredients_ru: 'Крепкий чёрный чай, карамельный сироп, апельсиновый сироп, лёд.',
        ingredients_zh: '浓红茶、焦糖糖浆、橙子糖浆、冰块。'
      },
      {
        name_ru: 'Жестяной Солдат',
        name_zh: '士兵',
        price: 410,
        temperature: 'hot',
        tags: ['черный чай', 'имбирь', 'мед', 'клен', 'горячий'],
        description_ru: 'Согревающий чёрный чай с мёдом, кленом и имбирём.',
        description_zh: '红茶配蜂蜜、枫糖与生姜，温暖坚定。',
        ingredients_ru: 'Чёрный чай, имбирный сироп, мёд, кленовый сироп.',
        ingredients_zh: '红茶、姜糖浆、蜂蜜、枫糖浆。'
      },
      {
        name_ru: 'Забытый Язык',
        name_zh: '被遗忘的语言',
        price: 420,
        temperature: 'cold',
        tags: ['жасмин', 'миндаль', 'фундук', 'холодный', 'бабл-ти'],
        description_ru: 'Жасминовый чай с ореховыми нотами.',
        description_zh: '茉莉绿茶与坚果糖浆的冷饮。',
        ingredients_ru: 'Жасминовый зелёный чай, миндальный сироп, фундуковый сироп, лёд, классическая тапиока.',
        ingredients_zh: '茉莉绿茶、杏仁糖浆、榛果糖浆、冰块、黑珍珠。'
      }
    ];

    const rows = products
      .filter((p) => !existingNames.has(p.name_ru))
      .map((p, idx) => ({
        id: uuidv4(),
        category_id: signatureCategoryId,
        name_ru: p.name_ru,
        name_zh: p.name_zh,
        description_ru: p.description_ru,
        description_zh: p.description_zh,
        price: p.price,
        image_url: `/images/products/signature-${idx + 1}.webp`,
        ingredients_ru: p.ingredients_ru,
        ingredients_zh: p.ingredients_zh,
        temperature: p.temperature,
        is_available: true,
        is_recommended: false,
        tags: JSON.stringify(p.tags || []),
        display_order: idx + 1,
        created_at: now,
        updated_at: now
      }));

    if (rows.length) {
      await queryInterface.bulkInsert('products', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', { name_ru: { [queryInterface.sequelize.Op.in]: [
      'Полуночный Шёпот',
      'Солнечная Вспышка',
      'Туманный Мост',
      'Бархатный Бунт',
      'Туманность Мечты',
      'Тихая Буря',
      'Бумажный Парус',
      'Ржавый Компас',
      'Квантовая Пена',
      'Янтарная Тюрьма',
      'Шерстяное Одеяло',
      'Угасающее Эхо',
      'Вулканический Пепел',
      'Жестяной Солдат',
      'Забытый Язык'
    ] } });
  }
};
