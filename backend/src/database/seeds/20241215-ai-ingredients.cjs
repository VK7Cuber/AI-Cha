/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const catIds = {
      baseTea: '11111111-1111-1111-1111-111111111111',
      spice: '22222222-2222-2222-2222-222222222222',
      milk: '33333333-3333-3333-3333-333333333333'
    };

    // очистим, чтобы сид был идемпотентным
    await queryInterface.bulkDelete('ingredient_compatibility', null, {});
    await queryInterface.bulkDelete('ingredients', null, {});
    await queryInterface.bulkDelete('ingredient_categories', null, {});

    await queryInterface.bulkInsert('ingredient_categories', [
      { id: catIds.baseTea, name_ru: 'Основа (чай)', name_zh: '茶底', type: 'base', display_order: 1, created_at: now, updated_at: now },
      { id: catIds.spice, name_ru: 'Специи', name_zh: '香料', type: 'spice', display_order: 2, created_at: now, updated_at: now },
      { id: catIds.milk, name_ru: 'Молоко', name_zh: '牛奶', type: 'milk', display_order: 3, created_at: now, updated_at: now }
    ]);

    const ingIds = {
      sencha: '44444444-4444-4444-4444-444444444444',
      ginger: '55555555-5555-5555-5555-555555555555',
      oatMilk: '66666666-6666-6666-6666-666666666666'
    };

    await queryInterface.bulkInsert('ingredients', [
      {
        id: ingIds.sencha,
        category_id: catIds.baseTea,
        name_ru: 'Сенча',
        name_zh: '煎茶',
        description_ru: 'Зелёный чай с лёгкой травяной горчинкой.',
        description_zh: '清新的绿茶，带轻微草本苦味。',
        flavor_profile: JSON.stringify({ sweet: 2, bitter: 4, sour: 1, spicy: 0, umami: 5, floral: 2 }),
        effects: JSON.stringify({ energizing: 6, calming: 2, focusing: 6 }),
        mood_tags: JSON.stringify(['focused', 'tired']),
        caffeine_level: 'low',
        temperature_suitable: JSON.stringify(['hot', 'cold']),
        is_vegan: true,
        is_sugar_free: true,
        allergens: JSON.stringify([]),
        serving_size: '3г',
        preparation_notes: 'Заваривать 80°C, 1-2 мин.',
        cost_per_serving: 15,
        is_available: true,
        is_seasonal: false,
        image_url: '/images/ingredients/sencha.webp',
        created_at: now,
        updated_at: now
      },
      {
        id: ingIds.ginger,
        category_id: catIds.spice,
        name_ru: 'Имбирь свежий',
        name_zh: '生姜',
        description_ru: 'Пряный, согревающий.',
        description_zh: '辛辣，温暖。',
        flavor_profile: JSON.stringify({ sweet: 1, bitter: 0, sour: 1, spicy: 7, umami: 0, floral: 0 }),
        effects: JSON.stringify({ energizing: 5, calming: 1, warming: 9 }),
        mood_tags: JSON.stringify(['tired', 'adventurous']),
        caffeine_level: 'none',
        temperature_suitable: JSON.stringify(['hot']),
        is_vegan: true,
        is_sugar_free: true,
        allergens: JSON.stringify([]),
        serving_size: '5г',
        preparation_notes: 'Добавлять в конце, не кипятить долго.',
        cost_per_serving: 5,
        is_available: true,
        is_seasonal: false,
        image_url: '/images/ingredients/ginger.webp',
        created_at: now,
        updated_at: now
      },
      {
        id: ingIds.oatMilk,
        category_id: catIds.milk,
        name_ru: 'Овсяное молоко',
        name_zh: '燕麦奶',
        description_ru: 'Нежная кремовая текстура, без лактозы.',
        description_zh: '柔滑的植物奶，无乳糖。',
        flavor_profile: JSON.stringify({ sweet: 3, bitter: 0, sour: 0, spicy: 0, umami: 2, floral: 0 }),
        effects: JSON.stringify({ calming: 4 }),
        mood_tags: JSON.stringify(['calm']),
        caffeine_level: 'none',
        temperature_suitable: JSON.stringify(['hot', 'cold', 'warm']),
        is_vegan: true,
        is_sugar_free: false,
        allergens: JSON.stringify(['gluten']),
        serving_size: '120мл',
        preparation_notes: 'Не кипятить.',
        cost_per_serving: 12,
        is_available: true,
        is_seasonal: false,
        image_url: '/images/ingredients/oat-milk.webp',
        created_at: now,
        updated_at: now
      }
    ]);

    await queryInterface.bulkInsert('ingredient_compatibility', [
      {
        id: '77777777-7777-7777-7777-777777777777',
        ingredient_a_id: ingIds.sencha,
        ingredient_b_id: ingIds.ginger,
        compatibility_score: 7,
        notes: 'Добавлять имбирь после заваривания сенчи.',
        created_at: now,
        updated_at: now
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        ingredient_a_id: ingIds.sencha,
        ingredient_b_id: ingIds.oatMilk,
        compatibility_score: 6,
        notes: 'Нейтральное сочетание, даёт мягкость.',
        created_at: now,
        updated_at: now
      }
    ]);

    await queryInterface.bulkInsert('base_recipes', [
      {
        id: '99999999-9999-9999-9999-999999999999',
        name_ru: 'Матча-фокус',
        name_zh: '抹茶专注',
        description_ru: 'Матча с мягкой пряностью имбиря и овсяным молоком.',
        description_zh: '抹茶配生姜与燕麦奶，柔和提神。',
        category: 'tea',
        base_price: 360,
        preparation_time_minutes: 4,
        serving_style: JSON.stringify({ container: 'Керамическая кружка', decoration: 'Щепотка матчи сверху' }),
        mood_tags: JSON.stringify(['focused', 'tired']),
        flavor_profile: JSON.stringify({ bitter: 4, umami: 6, spicy: 2, sweet: 2 }),
        effects: JSON.stringify({ focusing: 7, energizing: 6 }),
        created_at: now,
        updated_at: now
      }
    ]);

    await queryInterface.bulkInsert('base_recipe_ingredients', [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        recipe_id: '99999999-9999-9999-9999-999999999999',
        ingredient_id: ingIds.sencha,
        amount: '150мл',
        is_required: true,
        order_in_recipe: 1,
        created_at: now,
        updated_at: now
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        recipe_id: '99999999-9999-9999-9999-999999999999',
        ingredient_id: ingIds.ginger,
        amount: '5г',
        is_required: false,
        order_in_recipe: 2,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        recipe_id: '99999999-9999-9999-9999-999999999999',
        ingredient_id: ingIds.oatMilk,
        amount: '120мл',
        is_required: true,
        order_in_recipe: 3,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('base_recipe_ingredients', null, {});
    await queryInterface.bulkDelete('base_recipes', null, {});
    await queryInterface.bulkDelete('ingredient_compatibility', null, {});
    await queryInterface.bulkDelete('ingredients', null, {});
    await queryInterface.bulkDelete('ingredient_categories', null, {});
  }
};
