const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingCategories] = await queryInterface.sequelize.query(
      'SELECT id, name_ru, type FROM ingredient_categories'
    );
    const categoryByName = new Map((existingCategories || []).map((c) => [c.name_ru, c.id]));

    const categories = [
      { name_ru: 'Основа (чай)', name_zh: '茶底', type: 'base', display_order: 1 },
      { name_ru: 'Сиропы', name_zh: '风味糖浆', type: 'additive', display_order: 2 },
      { name_ru: 'Тапиока', name_zh: '珍珠', type: 'topping', display_order: 3 },
      { name_ru: 'Молоко', name_zh: '牛奶', type: 'milk', display_order: 4 }
    ];

    const newCategories = categories
      .filter((cat) => !categoryByName.has(cat.name_ru))
      .map((cat) => ({
        id: uuidv4(),
        ...cat,
        created_at: now,
        updated_at: now
      }));

    if (newCategories.length) {
      await queryInterface.bulkInsert('ingredient_categories', newCategories);
      newCategories.forEach((cat) => categoryByName.set(cat.name_ru, cat.id));
    }

    const getCategoryId = (name) => categoryByName.get(name);

    const [existingIngredients] = await queryInterface.sequelize.query('SELECT name_ru FROM ingredients');
    const existingNames = new Set((existingIngredients || []).map((row) => row.name_ru));

    const ingredients = [
      // Чаи (основа)
      {
        name_ru: 'Чёрный чай (English Breakfast / Earl Grey)',
        name_zh: '英式红茶',
        category: 'Основа (чай)',
        description_ru: 'Классический крепкий чёрный чай с глубоким вкусом.',
        description_zh: '经典浓郁的红茶。',
        flavor_profile: { sweet: 1, bitter: 5, sour: 1, spicy: 0, umami: 3, floral: 1 },
        effects: { energizing: 7, calming: 2, focusing: 5 },
        mood_tags: ['focused', 'tired'],
        caffeine_level: 'high',
        temperature_suitable: ['hot', 'cold'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 95°C, 3-4 мин.',
        cost_per_serving: 14
      },
      {
        name_ru: 'Зелёный чай с жасмином',
        name_zh: '茉莉绿茶',
        category: 'Основа (чай)',
        description_ru: 'Нежный зелёный чай с жасминовым ароматом.',
        description_zh: '清新茉莉香的绿茶。',
        flavor_profile: { sweet: 2, bitter: 3, sour: 1, spicy: 0, umami: 4, floral: 6 },
        effects: { energizing: 5, calming: 3, focusing: 6 },
        mood_tags: ['calm', 'focused'],
        caffeine_level: 'medium',
        temperature_suitable: ['hot', 'cold'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 80°C, 2-3 мин.',
        cost_per_serving: 15
      },
      {
        name_ru: 'Чёрный мятный чай',
        name_zh: '薄荷红茶',
        category: 'Основа (чай)',
        description_ru: 'Чёрный чай с освежающей мятной нотой.',
        description_zh: '带薄荷清香的红茶。',
        flavor_profile: { sweet: 1, bitter: 4, sour: 1, spicy: 0, umami: 3, floral: 2 },
        effects: { energizing: 6, calming: 4, focusing: 5, cooling: 5 },
        mood_tags: ['tired', 'calm'],
        caffeine_level: 'medium',
        temperature_suitable: ['hot', 'cold'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 90°C, 3 мин.',
        cost_per_serving: 14
      },
      {
        name_ru: 'Молочный улун',
        name_zh: '奶香乌龙',
        category: 'Основа (чай)',
        description_ru: 'Мягкий улун с сливочно‑молочным ароматом.',
        description_zh: '带奶香的乌龙茶。',
        flavor_profile: { sweet: 3, bitter: 2, sour: 0, spicy: 0, umami: 4, floral: 3 },
        effects: { energizing: 5, calming: 4, focusing: 4 },
        mood_tags: ['calm', 'romantic'],
        caffeine_level: 'medium',
        temperature_suitable: ['hot', 'cold'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 90°C, 2-3 мин.',
        cost_per_serving: 16
      },
      {
        name_ru: 'Белый чай Бай Му Дань',
        name_zh: '白牡丹',
        category: 'Основа (чай)',
        description_ru: 'Лёгкий белый чай с нежными цветочными нотами.',
        description_zh: '清淡柔和的白茶。',
        flavor_profile: { sweet: 3, bitter: 1, sour: 1, spicy: 0, umami: 3, floral: 5 },
        effects: { calming: 6, focusing: 4 },
        mood_tags: ['calm', 'romantic'],
        caffeine_level: 'low',
        temperature_suitable: ['hot', 'warm'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 80°C, 3-4 мин.',
        cost_per_serving: 16
      },
      {
        name_ru: 'Лапсанг Сушонг',
        name_zh: '正山小种',
        category: 'Основа (чай)',
        description_ru: 'Копчёный чёрный чай с древесным ароматом.',
        description_zh: '带烟熏木香的红茶。',
        flavor_profile: { sweet: 1, bitter: 4, sour: 1, spicy: 1, umami: 5, floral: 0 },
        effects: { energizing: 6, calming: 2, focusing: 5, warming: 4 },
        mood_tags: ['adventurous', 'focused'],
        caffeine_level: 'high',
        temperature_suitable: ['hot'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: [],
        serving_size: '3г',
        preparation_notes: 'Заваривать 95°C, 3-4 мин.',
        cost_per_serving: 18
      },
      // Сиропы
      { name_ru: 'Сироп ванильный', name_zh: '香草糖浆', category: 'Сиропы', description_ru: 'Мягкая ванильная сладость.', description_zh: '香草甜味。' },
      { name_ru: 'Сироп карамельный', name_zh: '焦糖糖浆', category: 'Сиропы', description_ru: 'Тёплый карамельный вкус.', description_zh: '温润焦糖风味。' },
      { name_ru: 'Сироп фундуковый', name_zh: '榛果糖浆', category: 'Сиропы', description_ru: 'Ореховая мягкость и аромат.', description_zh: '榛果香气。' },
      { name_ru: 'Сироп шоколадный', name_zh: '巧克力糖浆', category: 'Сиропы', description_ru: 'Густая шоколадная сладость.', description_zh: '浓郁巧克力风味。' },
      { name_ru: 'Сироп кленовый', name_zh: '枫糖浆', category: 'Сиропы', description_ru: 'Кленовая сладость с древесными нотами.', description_zh: '枫糖甜味。' },
      { name_ru: 'Сироп малиновый', name_zh: '覆盆子糖浆', category: 'Сиропы', description_ru: 'Яркая ягодная кислинка.', description_zh: '覆盆子果香。' },
      { name_ru: 'Сироп манговый', name_zh: '芒果糖浆', category: 'Сиропы', description_ru: 'Тропическая сладость манго.', description_zh: '芒果热带甜香。' },
      { name_ru: 'Сироп апельсиновый', name_zh: '橙子糖浆', category: 'Сиропы', description_ru: 'Цитрусовая свежесть.', description_zh: '橙子清新酸甜。' },
      { name_ru: 'Сироп кокосовый', name_zh: '椰子糖浆', category: 'Сиропы', description_ru: 'Сливочно‑кокосовый вкус.', description_zh: '椰香甜味。' },
      { name_ru: 'Сироп лавандовый', name_zh: '薰衣草糖浆', category: 'Сиропы', description_ru: 'Флоральная успокаивающая нота.', description_zh: '薰衣草花香。' },
      { name_ru: 'Сироп имбирный', name_zh: '姜糖浆', category: 'Сиропы', description_ru: 'Пряное согревающее послевкусие.', description_zh: '生姜辛香。' },
      { name_ru: 'Сироп цветков сливы', name_zh: '梅花糖浆', category: 'Сиропы', description_ru: 'Тонкий цветочный аромат.', description_zh: '梅花清雅香气。' },
      { name_ru: 'Сироп мятный', name_zh: '薄荷糖浆', category: 'Сиропы', description_ru: 'Освежающая мятная прохлада.', description_zh: '薄荷清凉感。' },
      { name_ru: 'Сироп коричный', name_zh: '肉桂糖浆', category: 'Сиропы', description_ru: 'Тёплая коричная специя.', description_zh: '肉桂暖香。' },
      { name_ru: 'Сироп миндальный', name_zh: '杏仁糖浆', category: 'Сиропы', description_ru: 'Нежный миндальный аромат.', description_zh: '杏仁香气。' },
      // Тапиока
      { name_ru: 'Тапиока классическая', name_zh: '黑珍珠', category: 'Тапиока', description_ru: 'Классические чёрные шарики тапиоки.', description_zh: '经典黑珍珠。' },
      { name_ru: 'Тапиока клубничная', name_zh: '草莓珍珠', category: 'Тапиока', description_ru: 'Сладкая клубничная тапиока.', description_zh: '草莓风味珍珠。' },
      { name_ru: 'Тапиока карамельная', name_zh: '焦糖珍珠', category: 'Тапиока', description_ru: 'Карамельная тапиока с янтарным вкусом.', description_zh: '焦糖风味珍珠。' },
      { name_ru: 'Тапиока медовая', name_zh: '蜂蜜珍珠', category: 'Тапиока', description_ru: 'Медовая тапиока с мягкой сладостью.', description_zh: '蜂蜜风味珍珠。' },
      { name_ru: 'Тапиока с матчей', name_zh: '抹茶珍珠', category: 'Тапиока', description_ru: 'Тапиока с оттенком матча.', description_zh: '抹茶风味珍珠。' },
      // Молоко
      {
        name_ru: 'Молоко обычное',
        name_zh: '牛奶',
        category: 'Молоко',
        description_ru: 'Классическое молоко для насыщенной текстуры.',
        description_zh: '经典牛奶。',
        flavor_profile: { sweet: 3, bitter: 0, sour: 0, spicy: 0, umami: 2, floral: 0 },
        effects: { calming: 3 },
        mood_tags: ['calm'],
        caffeine_level: 'none',
        temperature_suitable: ['hot', 'cold', 'warm'],
        is_vegan: false,
        is_sugar_free: true,
        allergens: ['dairy'],
        serving_size: '120мл',
        preparation_notes: 'Не кипятить.',
        cost_per_serving: 10
      },
      {
        name_ru: 'Молоко безлактозное',
        name_zh: '无乳糖牛奶',
        category: 'Молоко',
        description_ru: 'Лёгкое молоко без лактозы.',
        description_zh: '无乳糖牛奶。',
        flavor_profile: { sweet: 3, bitter: 0, sour: 0, spicy: 0, umami: 2, floral: 0 },
        effects: { calming: 3 },
        mood_tags: ['calm'],
        caffeine_level: 'none',
        temperature_suitable: ['hot', 'cold', 'warm'],
        is_vegan: false,
        is_sugar_free: true,
        allergens: ['dairy'],
        serving_size: '120мл',
        preparation_notes: 'Не кипятить.',
        cost_per_serving: 11
      },
      {
        name_ru: 'Молоко миндальное',
        name_zh: '杏仁奶',
        category: 'Молоко',
        description_ru: 'Ореховая растительная альтернатива.',
        description_zh: '杏仁风味植物奶。',
        flavor_profile: { sweet: 3, bitter: 0, sour: 0, spicy: 0, umami: 2, floral: 0 },
        effects: { calming: 3 },
        mood_tags: ['calm'],
        caffeine_level: 'none',
        temperature_suitable: ['hot', 'cold', 'warm'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: ['nuts'],
        serving_size: '120мл',
        preparation_notes: 'Не кипятить.',
        cost_per_serving: 12
      },
      {
        name_ru: 'Молоко кокосовое',
        name_zh: '椰奶',
        category: 'Молоко',
        description_ru: 'Сливочно‑кокосовый растительный вкус.',
        description_zh: '椰香植物奶。',
        flavor_profile: { sweet: 4, bitter: 0, sour: 0, spicy: 0, umami: 2, floral: 1 },
        effects: { calming: 4, romantic: 3 },
        mood_tags: ['romantic', 'calm'],
        caffeine_level: 'none',
        temperature_suitable: ['hot', 'cold', 'warm'],
        is_vegan: true,
        is_sugar_free: true,
        allergens: ['nuts'],
        serving_size: '120мл',
        preparation_notes: 'Не кипятить.',
        cost_per_serving: 12
      }
    ];

    const normalized = ingredients.map((item) => {
      const base = {
        id: uuidv4(),
        category_id: getCategoryId(item.category),
        name_ru: item.name_ru,
        name_zh: item.name_zh,
        description_ru: item.description_ru,
        description_zh: item.description_zh,
        flavor_profile: JSON.stringify(
          item.flavor_profile || { sweet: 6, bitter: 0, sour: 0, spicy: 0, umami: 0, floral: 0 }
        ),
        effects: JSON.stringify(item.effects || { calming: 2 }),
        mood_tags: JSON.stringify(item.mood_tags || []),
        caffeine_level: item.caffeine_level || 'none',
        temperature_suitable: JSON.stringify(item.temperature_suitable || ['hot', 'cold']),
        is_vegan: item.is_vegan ?? true,
        is_sugar_free: item.is_sugar_free ?? false,
        allergens: JSON.stringify(item.allergens || []),
        serving_size: item.serving_size || '15мл',
        preparation_notes: item.preparation_notes || 'Добавлять по вкусу.',
        origin_story: item.origin_story || null,
        cost_per_serving: item.cost_per_serving ?? 8,
        is_available: true,
        is_seasonal: false,
        image_url: item.image_url || '/images/ingredients/default.webp',
        created_at: now,
        updated_at: now
      };
      return base;
    });

    const rows = normalized.filter((item) => !existingNames.has(item.name_ru));
    if (rows.length) {
      await queryInterface.bulkInsert('ingredients', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ingredients', {
      name_ru: {
        [queryInterface.sequelize.Op.in]: [
          'Чёрный чай (English Breakfast / Earl Grey)',
          'Зелёный чай с жасмином',
          'Чёрный мятный чай',
          'Молочный улун',
          'Белый чай Бай Му Дань',
          'Лапсанг Сушонг',
          'Сироп ванильный',
          'Сироп карамельный',
          'Сироп фундуковый',
          'Сироп шоколадный',
          'Сироп кленовый',
          'Сироп малиновый',
          'Сироп манговый',
          'Сироп апельсиновый',
          'Сироп кокосовый',
          'Сироп лавандовый',
          'Сироп имбирный',
          'Сироп цветков сливы',
          'Сироп мятный',
          'Сироп коричный',
          'Сироп миндальный',
          'Тапиока классическая',
          'Тапиока клубничная',
          'Тапиока карамельная',
          'Тапиока медовая',
          'Тапиока с матчей',
          'Молоко обычное',
          'Молоко безлактозное',
          'Молоко миндальное',
          'Молоко кокосовое'
        ]
      }
    });
  }
};
