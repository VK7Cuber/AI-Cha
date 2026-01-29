# План разработки базовой части AI-Cha Terminal

## 1. Описание этапа разработки

### 1.1. Суть базового этапа
Базовый этап разработки включает создание полнофункционального интерфейса терминала для чайного кафе AI-Cha без интеграции AI-агента и голосовых технологий. На данном этапе реализуется вся визуальная часть, навигация между экранами, каталог товаров, корзина, заглушки оплаты и система оценки сервиса.

### 1.2. Границы этапа
**Включено:**
- Приветственный экран с двуязычным интерфейсом
- Экран выбора режима взаимодействия
- Полный каталог товаров с фильтрацией и поиском
- Корзина и управление заказом
- Экран оплаты с заглушками
- Система оценки сервиса
- Интерфейс для сотрудников (управление заказами)
- Главный экран отображения заказов
- Backend API для управления данными
- База данных для хранения товаров и заказов

**Исключено (реализуется на AI-этапе, см. DevelopmentPlan_AI.md):**
- AI-диалог с клиентом (голосовой)
- **Генерация уникальных рецептов напитков** (AI не подбирает из меню, а придумывает персональный рецепт)
- Распознавание речи (STT)
- Синтез речи (TTS)
- Интеграция с AI-моделями (GPT-4o)
- Реальная оплата (только заглушки)

### 1.3. Целевой результат
Полностью рабочий терминал с возможностью просмотра каталога, формирования заказа, "оплаты" и оценки сервиса. Терминал готов к интеграции AI-функционала на следующем этапе.

---

## 2. Архитектура проекта

### 2.1. Структура папок и файлов

```
AI-Cha/
│
├── docs/                                    # Документация проекта
│   ├── About_project/
│   ├── context/
│   └── Examples/
│
├── backend/                                 # Серверная часть
│   ├── src/
│   │   ├── api/                            # API endpoints
│   │   │   ├── routes/
│   │   │   │   ├── products.js            # Маршруты для стандартных товаров
│   │   │   │   ├── orders.js              # Маршруты для заказов
│   │   │   │   ├── categories.js          # Маршруты для категорий
│   │   │   │   ├── ratings.js             # Маршруты для оценок
│   │   │   │   ├── ingredients.js         # Маршруты для ингредиентов
│   │   │   │   └── recipes.js             # Маршруты для базовых рецептов
│   │   │   ├── controllers/
│   │   │   │   ├── productController.js   # Логика работы с товарами
│   │   │   │   ├── orderController.js     # Логика работы с заказами
│   │   │   │   ├── categoryController.js  # Логика категорий
│   │   │   │   ├── ratingController.js    # Логика оценок
│   │   │   │   ├── ingredientController.js # Логика ингредиентов
│   │   │   │   └── recipeController.js    # Логика базовых рецептов
│   │   │   └── middleware/
│   │   │       ├── validation.js          # Валидация запросов
│   │   │       ├── errorHandler.js        # Обработка ошибок
│   │   │       └── logger.js              # Логирование запросов
│   │   │
│   │   ├── database/                       # Работа с БД
│   │   │   ├── models/
│   │   │   │   ├── Product.js             # Модель стандартного товара
│   │   │   │   ├── Category.js            # Модель категории
│   │   │   │   ├── Ingredient.js          # Модель ингредиента
│   │   │   │   ├── IngredientCategory.js  # Модель категории ингредиентов
│   │   │   │   ├── BaseRecipe.js          # Модель базового рецепта
│   │   │   │   ├── GeneratedRecipe.js     # Модель AI-сгенерированного рецепта
│   │   │   │   ├── Order.js               # Модель заказа
│   │   │   │   ├── OrderItem.js           # Модель позиции заказа
│   │   │   │   └── Rating.js              # Модель оценки
│   │   │   ├── migrations/                # Миграции БД
│   │   │   └── seeds/                     # Начальные данные
│   │   │       └── initial_products.js    # Загрузка товаров и категорий
│   │   │
│   │   ├── services/                       # Бизнес-логика
│   │   │   ├── productService.js          # Сервис товаров
│   │   │   ├── orderService.js            # Сервис заказов
│   │   │   ├── categoryService.js         # Сервис категорий
│   │   │   └── ratingService.js           # Сервис оценок
│   │   │
│   │   ├── utils/                          # Вспомогательные функции
│   │   │   ├── validators.js              # Валидаторы данных
│   │   │   ├── formatters.js              # Форматирование данных
│   │   │   └── constants.js               # Константы приложения
│   │   │
│   │   ├── config/                         # Конфигурация
│   │   │   ├── database.js                # Настройки БД
│   │   │   ├── server.js                  # Настройки сервера
│   │   │   └── categories.js              # Конфигурация категорий
│   │   │
│   │   └── app.js                          # Точка входа backend
│   │
│   ├── tests/                              # Тесты backend
│   │   ├── unit/
│   │   │   ├── productService.test.js
│   │   │   └── orderService.test.js
│   │   └── integration/
│   │       └── api.test.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/                                # Клиентская часть
│   ├── public/
│   │   ├── images/                         # Изображения
│   │   │   ├── products/                  # Фото товаров
│   │   │   ├── animations/                # Lottie анимации
│   │   │   └── logo/                      # Логотипы
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/                     # React компоненты
│   │   │   ├── common/                    # Общие компоненты
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   └── Button.styles.ts
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   └── Loading/
│   │   │   │
│   │   │   ├── screens/                   # Экраны приложения
│   │   │   │   ├── WelcomeScreen/
│   │   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   │   └── WelcomeScreen.styles.ts
│   │   │   │   ├── ModeSelectionScreen/
│   │   │   │   ├── CatalogScreen/
│   │   │   │   ├── RecommendationsScreen/
│   │   │   │   ├── CartScreen/
│   │   │   │   ├── PaymentScreen/
│   │   │   │   └── RatingScreen/
│   │   │   │
│   │   │   ├── products/                  # Компоненты товаров
│   │   │   │   ├── ProductCard/
│   │   │   │   ├── ProductList/
│   │   │   │   ├── ProductFilters/
│   │   │   │   └── ProductSearch/
│   │   │   │
│   │   │   ├── cart/                      # Компоненты корзины
│   │   │   │   ├── CartItem/
│   │   │   │   ├── CartSummary/
│   │   │   │   └── CartIcon/
│   │   │   │
│   │   │   └── animations/                # Анимационные компоненты
│   │   │       ├── LottiePlayer/
│   │   │       └── PageTransition/
│   │   │
│   │   ├── hooks/                          # Custom React hooks
│   │   │   ├── useCart.ts                 # Логика корзины
│   │   │   ├── useProducts.ts             # Логика товаров
│   │   │   ├── useCategories.ts           # Логика категорий
│   │   │   └── useScreenTimeout.ts        # Логика таймаута экрана
│   │   │
│   │   ├── store/                          # State management (Zustand)
│   │   │   ├── cartStore.ts               # Store корзины
│   │   │   ├── productsStore.ts           # Store товаров
│   │   │   └── navigationStore.ts         # Store навигации
│   │   │
│   │   ├── services/                       # API сервисы
│   │   │   ├── api.ts                     # Базовая конфигурация API
│   │   │   ├── productService.ts          # Сервис товаров
│   │   │   ├── orderService.ts            # Сервис заказов
│   │   │   └── ratingService.ts           # Сервис оценок
│   │   │
│   │   ├── utils/                          # Утилиты
│   │   │   ├── formatters.ts              # Форматирование (цены, текст)
│   │   │   ├── validators.ts              # Валидация
│   │   │   └── constants.ts               # Константы
│   │   │
│   │   ├── styles/                         # Глобальные стили
│   │   │   ├── global.css                 # Глобальные стили
│   │   │   ├── colors.ts                  # Цветовая палитра
│   │   │   ├── typography.ts              # Типографика
│   │   │   └── animations.ts              # Анимации
│   │   │
│   │   ├── types/                          # TypeScript типы
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   └── category.ts
│   │   │
│   │   ├── App.tsx                         # Главный компонент
│   │   ├── main.tsx                        # Точка входа
│   │   └── Router.tsx                      # Роутинг
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── staff-panel/                             # Панель для сотрудников
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderList/                 # Список заказов
│   │   │   ├── OrderCard/                 # Карточка заказа
│   │   │   └── StatusButton/              # Кнопка изменения статуса
│   │   ├── screens/
│   │   │   └── StaffDashboard/            # Главный экран сотрудников
│   │   └── main.tsx
│   └── package.json
│
├── display-screen/                          # Экран отображения заказов
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderDisplay/              # Отображение заказа
│   │   │   └── StatusIndicator/           # Индикатор статуса
│   │   └── main.tsx
│   └── package.json
│
├── docker/                                  # Docker конфигурация
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
└── README.md
```

### 2.2. Обоснование архитектуры

**Монорепозиторий с разделением на модули:**
- `backend/` - серверная часть на Node.js
- `frontend/` - клиентская часть на React
- `staff-panel/` - отдельное приложение для сотрудников
- `display-screen/` - отдельное приложение для главного экрана

**Преимущества:**
- Четкое разделение ответственности
- Независимая разработка компонентов
- Возможность масштабирования каждой части
- Переиспользование общих типов и утилит

---

## 3. Технологический стек

### 3.1. Frontend (клиентская часть терминала)

**Основные технологии:**
- **React 18+** с TypeScript - для построения UI
- **Vite** - быстрая сборка и разработка
- **Zustand** - легковесный state management
- **React Router** - навигация между экранами
- **Tailwind CSS** - утилитарные стили
- **Lottie React** - воспроизведение анимаций
- **Axios** - HTTP запросы к API

**Дополнительные библиотеки:**
- **react-hot-toast** - уведомления пользователю
- **framer-motion** - плавные анимации и переходы
- **date-fns** - работа с датами

### 3.2. Backend (серверная часть)

**Основные технологии:**
- **Node.js 18+** - серверная платформа
- **Fastify** - быстрый web-фреймворк
- **PostgreSQL 15+** - реляционная база данных
- **Sequelize** - ORM для работы с БД
- **Redis** - для real-time обновлений и кэширования

**Дополнительные библиотеки:**
- **dotenv** - управление переменными окружения
- **joi** - валидация данных
- **pino** - структурированное логирование
- **ws** - WebSocket для real-time обновлений

### 3.3. DevOps

**Контейнеризация:**
- **Docker** - контейнеризация приложений
- **Docker Compose** - оркестрация сервисов
- **Nginx** - раздача статических файлов и reverse proxy

---

## 4. Архитектура базы данных

### 4.1. Основные таблицы

---

#### **БЛОК A: Ингредиенты и рецепты (для AI-генерации напитков)**

**⚠️ Ключевая особенность проекта:** 
AI-Cha не просто рекомендует товары из меню. AI **генерирует уникальные рецепты** напитков на основе диалога с клиентом, используя доступные ингредиенты. Каждый рецепт — персональный, с креативным названием, обоснованием и стилем подачи.

Таблицы этого блока создаются на базовом этапе, но активно используются на AI-этапе для генерации рецептов. Необходимо заполнить:
- Все ингредиенты кафе с подробными профилями вкуса и эффектов
- Таблицу совместимости (важно для создания вкусных рецептов!)
- Базовые рецепты (примеры для AI)

#### Таблица: **ingredient_categories**
Категории ингредиентов
- `id` (PK, UUID)
- `name_ru` (VARCHAR) - название на русском
- `name_zh` (VARCHAR) - название на китайском
- `type` (ENUM) - base/additive/topping/sweetener/spice/fruit/milk
- `display_order` (INTEGER)

**Примеры категорий ингредиентов:**
- Основа (base): чаи, кофе, травяные настои
- Добавки (additive): сиропы, экстракты
- Топпинги (topping): ягоды, фрукты, украшения
- Подсластители (sweetener): мёд, агава, финик
- Специи (spice): корица, кардамон, имбирь
- Фрукты (fruit): лимон, апельсин, грейпфрут
- Молоко (milk): коровье, овсяное, миндальное, кокосовое

#### Таблица: **ingredients**
Все доступные ингредиенты кафе (для AI-генерации рецептов)
- `id` (PK, UUID)
- `category_id` (FK → ingredient_categories.id)
- `name_ru` (VARCHAR) - название на русском
- `name_zh` (VARCHAR) - название на китайском
- `description_ru` (TEXT) - описание и характеристики
- `description_zh` (TEXT)
- `flavor_profile` (JSONB) - вкусовой профиль (шкала 0-10):
  ```json
  {"sweet": 3, "bitter": 7, "sour": 2, "spicy": 0, "umami": 5, "floral": 4}
  ```
- `effects` (JSONB) - эффекты для подбора под настроение:
  ```json
  {"energizing": 8, "calming": 2, "warming": 5, "cooling": 3, "focusing": 7, "romantic": 4}
  ```
- `mood_tags` (JSONB) - подходит для настроений:
  ```json
  ["tired", "focused", "happy", "romantic", "adventurous"]
  ```
- `caffeine_level` (ENUM) - none/low/medium/high
- `temperature_suitable` (JSONB) - подходящие температуры: ["hot", "cold", "warm"]
- `is_vegan` (BOOLEAN) - подходит для веганов
- `is_sugar_free` (BOOLEAN) - без сахара
- `allergens` (JSONB) - аллергены: ["nuts", "dairy", "gluten"]
- `serving_size` (VARCHAR) - рекомендуемая порция (например, "2г", "30мл")
- `preparation_notes` (TEXT) - заметки по приготовлению (температура, время)
- `origin_story` (TEXT, NULLABLE) - история происхождения для туристов ("Душица — с холмов за рекой")
- `cost_per_serving` (DECIMAL) - себестоимость порции
- `is_available` (BOOLEAN) - есть ли в наличии
- `is_seasonal` (BOOLEAN) - сезонный ингредиент
- `image_url` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Примеры ингредиентов с полными профилями:**
- **Зелёный чай сенча**: основа, flavor: {bitter: 4, umami: 6}, effects: {energizing: 6, focusing: 7}, caffeine: low
- **Матча церемониальный**: основа, flavor: {bitter: 5, umami: 8}, effects: {focusing: 9, energizing: 7}, caffeine: medium
- **Ромашка**: основа, flavor: {floral: 8, sweet: 3}, effects: {calming: 9}, caffeine: none
- **Имбирь свежий**: специя, flavor: {spicy: 7}, effects: {warming: 9, energizing: 5}
- **Овсяное молоко**: молоко, is_vegan: true, effects: {calming: 4}
- **Лаванда**: добавка, flavor: {floral: 9}, effects: {calming: 8, romantic: 7}, mood_tags: ["tired", "romantic"]

#### Таблица: **ingredient_compatibility**
Совместимость ингредиентов между собой (критически важна для генерации вкусных рецептов)
- `id` (PK, UUID)
- `ingredient_a_id` (FK → ingredients.id)
- `ingredient_b_id` (FK → ingredients.id)
- `compatibility_score` (INTEGER) - 1-10, где:
  - 10 = идеальное сочетание (матча + ваниль)
  - 7-9 = хорошо сочетаются (чёрный чай + имбирь)
  - 5-6 = нейтрально, допустимо (зелёный чай + корица)
  - 3-4 = слабо сочетаются, не рекомендуется
  - 1-2 = конфликт вкусов (не использовать вместе!)
- `notes` (TEXT) - заметки о сочетании ("Добавлять имбирь в конце, чтобы не горчило")

**ПРИМЕЧАНИЕ** На данном этапе проверять совместимость ингредиентов с помощью базы данных и заполнять эту таблицу не обязательно! Достаточно в промте для модели генерации рецептов указать, что все элементы должны сочетаться друг с другом! (такое решение принято для первичной разработки. Таблица совместимости ингредиентов будет заполнена позднее!!!)

**Примеры совместимости:**
- Ромашка + Лаванда = 10 (идеально для успокоения)
- Зелёный чай + Лимон = 9 (классика)
- Матча + Имбирь = 7 (интересное сочетание)
- Кофе + Лаванда = 4 (не рекомендуется)
- Молоко + Лимон = 2 (свернётся, конфликт!)

#### Таблица: **base_recipes**
Базовые рецепты из меню (примеры-шаблоны для AI, вдохновение для генерации)
- `id` (PK, UUID)
- `name_ru` (VARCHAR) - название (например, "Классический латте с овсяным молоком")
- `name_zh` (VARCHAR)
- `description_ru` (TEXT) - описание
- `description_zh` (TEXT)
- `category` (ENUM) - tea/coffee/herbal/cold/specialty
- `base_price` (DECIMAL) - базовая цена
- `preparation_time_minutes` (INTEGER)
- `serving_style` (JSONB) - стиль подачи:
  ```json
  {
    "container": "Керамическая кружка",
    "accessories": "Деревянная ложка",
    "decoration": "Корица сверху"
  }
  ```
- `mood_tags` (JSONB) - для каких настроений подходит: ["tired", "focused", "romantic", "adventurous"]
- `flavor_profile` (JSONB) - вкусовой профиль итогового напитка
- `effects` (JSONB) - эффекты итогового напитка
- `sample_card_message` (TEXT, NULLABLE) - пример послания для карточки
- `created_at` (TIMESTAMP)

**Примеры базовых рецептов для вдохновения AI:**
- "Утренний ритуал": чёрный чай + имбирь, для бодрости, подача с лимонной долькой
- "Тихий вечер": ромашка + лаванда + овсяное молоко, для расслабления
- "Матча-фокус": матча + куркума, для концентрации, карточка: "Ваш фокус уже здесь"

#### Таблица: **base_recipe_ingredients**
Ингредиенты базовых рецептов
- `id` (PK, UUID)
- `recipe_id` (FK → base_recipes.id)
- `ingredient_id` (FK → ingredients.id)
- `amount` (VARCHAR) - количество (например, "200мл", "1 ч.л.")
- `is_required` (BOOLEAN) - обязательный ингредиент
- `order_in_recipe` (INTEGER) - порядок добавления

#### Таблица: **generated_recipes**
Рецепты, сгенерированные AI для конкретных клиентов
- `id` (PK, UUID)
- `session_id` (FK → dialog_sessions.id) - сессия диалога
- `name_ru` (VARCHAR) - название напитка (креативное, придуманное AI, например "Тихий вечер")
- `name_zh` (VARCHAR)
- `description_ru` (TEXT) - поэтичное описание напитка (2-3 предложения)
- `reasoning_ru` (TEXT) - персонализированное обоснование (почему этот рецепт подходит клиенту)
- `personal_message` (TEXT, NULLABLE) - короткое послание клиенту для карточки (опционально)
- `preparation_steps` (JSONB) - пошаговые инструкции [{step, instruction}]
- `serving_style` (JSONB) - детальный стиль подачи:
  ```json
  {
    "container": "В керамической кружке с толстыми стенками",
    "accessories": "С деревянной ложечкой и тканевой салфеткой",
    "decoration": "Веточка свежей мяты сверху",
    "card_message": "Лето вернётся — а пока оно в вашей чашке"
  }
  ```
- `temperature` (ENUM) - hot/cold/warm
- `total_price` (DECIMAL) - итоговая цена
- `preparation_time_minutes` (INTEGER)
- `was_ordered` (BOOLEAN) - был ли заказан
- `rating` (INTEGER) - оценка от клиента (1-10)
- `created_at` (TIMESTAMP)

**Примеры названий сгенерированных рецептов:**
- "Тихий вечер" — для уставшего клиента
- "Пряный рассвет" — для бодрости утром
- "Clean Code" — для программиста
- "Первое впечатление" — для туриста
- "Ванильный закат" — для романтического настроения

#### Таблица: **generated_recipe_ingredients**
Ингредиенты сгенерированного рецепта
- `id` (PK, UUID)
- `generated_recipe_id` (FK → generated_recipes.id)
- `ingredient_id` (FK → ingredients.id)
- `amount` (VARCHAR) - количество
- `preparation_note` (TEXT) - заметка по приготовлению этого ингредиента
- `order_in_recipe` (INTEGER)

---

#### **БЛОК B: Стандартное меню и товары**

#### Таблица: **categories**
Категории товаров в стандартном меню кафе
- `id` (PK, UUID) - уникальный идентификатор
- `name_ru` (VARCHAR) - название на русском
- `name_zh` (VARCHAR) - название на китайском
- `slug` (VARCHAR, UNIQUE) - URL-friendly идентификатор
- `description_ru` (TEXT) - описание на русском
- `description_zh` (TEXT) - описание на китайском
- `display_order` (INTEGER) - порядок отображения
- `icon_url` (VARCHAR) - URL иконки категории
- `is_active` (BOOLEAN) - активна ли категория
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Примеры категорий стандартного меню:**
- Готовые чайные напитки (茶饮)
- Кофейные напитки (咖啡饮品)
- Холодные напитки (冷饮)
- Десерты и закуски (甜点)

#### Таблица: **products**
Стандартные товары и напитки кафе (обычный заказ без AI)
- `id` (PK, UUID) - уникальный идентификатор
- `category_id` (FK → categories.id) - категория товара
- `name_ru` (VARCHAR) - название на русском
- `name_zh` (VARCHAR) - название на китайском
- `description_ru` (TEXT) - описание на русском
- `description_zh` (TEXT) - описание на китайском
- `price` (DECIMAL) - цена в рублях
- `image_url` (VARCHAR) - URL изображения товара
- `ingredients_summary_ru` (TEXT) - краткий состав на русском
- `ingredients_summary_zh` (TEXT) - краткий состав на китайском
- `temperature` (ENUM) - hot/cold/both - температура подачи
- `is_available` (BOOLEAN) - доступен ли товар
- `tags` (JSONB) - теги для фильтрации
- `display_order` (INTEGER) - порядок отображения
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Таблица: **orders**
Заказы клиентов
- `id` (PK, UUID) - уникальный идентификатор заказа
- `order_number` (INTEGER, UNIQUE) - номер заказа для отображения
- `terminal_id` (VARCHAR) - идентификатор терминала
- `status` (ENUM) - pending/paid/preparing/ready/completed/cancelled
- `total_amount` (DECIMAL) - общая сумма заказа
- `payment_method` (ENUM) - card/aicha_card/sbp
- `payment_status` (ENUM) - pending/success/failed
- `rating` (INTEGER) - оценка сервиса (1-10)
- `created_at` (TIMESTAMP) - время создания заказа
- `paid_at` (TIMESTAMP) - время оплаты
- `completed_at` (TIMESTAMP) - время завершения
- `session_id` (VARCHAR) - идентификатор сессии терминала

#### Таблица: **order_items**
Позиции в заказе (поддержка как стандартных товаров, так и AI-рецептов)
- `id` (PK, UUID)
- `order_id` (FK → orders.id)
- `item_type` (ENUM) - product/generated_recipe - тип позиции
- `product_id` (FK → products.id, NULLABLE) - для стандартных товаров
- `generated_recipe_id` (FK → generated_recipes.id, NULLABLE) - для AI-рецептов
- `quantity` (INTEGER) - количество
- `price_at_order` (DECIMAL) - цена на момент заказа
- `item_name_ru` (VARCHAR) - название (копия для истории)
- `item_name_zh` (VARCHAR)
- `created_at` (TIMESTAMP)

**Примечание:** Хотя бы одно из полей product_id или generated_recipe_id должно быть заполнено в зависимости от item_type.

#### Таблица: **ratings**
Оценки сервиса
- `id` (PK, UUID)
- `order_id` (FK → orders.id, UNIQUE)
- `rating` (INTEGER) - оценка от 1 до 10
- `terminal_id` (VARCHAR) - терминал, на котором оставлена оценка
- `created_at` (TIMESTAMP)

### 4.2. Индексы для оптимизации

**Ингредиенты и рецепты:**
- `ingredients(category_id, is_available)`
- `ingredients(caffeine_level)`
- `ingredient_compatibility(ingredient_a_id, ingredient_b_id)` - UNIQUE
- `base_recipes(category, is_template)`
- `base_recipe_ingredients(recipe_id)`
- `generated_recipes(session_id)`
- `generated_recipes(was_ordered, rating)`
- `generated_recipe_ingredients(generated_recipe_id)`

**Стандартное меню:**
- `categories(slug)`
- `categories(display_order, is_active)`
- `products(category_id, is_available)`
- `products(display_order)`
- `orders(order_number)`
- `orders(status, created_at)`
- `orders(terminal_id, created_at)`
- `order_items(order_id)`
- `ratings(created_at)`

---

## 5. Пошаговый план разработки

### Этап 1: Подготовка инфраструктуры (2-3 дня)

#### 1.1. Инициализация проекта
**Задача:** Создать структуру проекта и настроить окружение разработки

**Действия:**
- Создать структуру папок согласно разделу 2.1
- Инициализировать Git репозиторий с .gitignore
- Создать README.md с описанием проекта и инструкциями по запуску
- Настроить EditorConfig для единообразия кода

#### 1.2. Настройка Backend
**Задача:** Подготовить серверную часть к разработке

**Действия:**
- Создать package.json с зависимостями (Fastify, Sequelize, PostgreSQL, Redis)
- Настроить TypeScript или использовать чистый Node.js
- Создать .env.example с необходимыми переменными окружения
- Настроить структуру логирования (pino)
- Создать базовую точку входа app.js с минимальным сервером

**Переменные окружения:**
- DATABASE_URL - строка подключения к PostgreSQL
- REDIS_URL - строка подключения к Redis
- PORT - порт сервера (по умолчанию 8080)
- NODE_ENV - окружение (development/production)

#### 1.3. Настройка Frontend
**Задача:** Подготовить клиентскую часть к разработке

**Действия:**
- Инициализировать Vite проект с React и TypeScript
- Установить зависимости (React Router, Zustand, Tailwind CSS, Lottie, Axios)
- Настроить Tailwind CSS с кастомной конфигурацией цветов
- Создать базовую структуру App.tsx и Router.tsx
- Настроить proxy для API запросов в vite.config.ts

#### 1.4. Настройка Docker
**Задача:** Подготовить контейнеризацию для удобной разработки

**Действия:**
- Создать docker-compose.yml с сервисами: PostgreSQL, Redis, backend, frontend, nginx
- Создать Dockerfile для backend и frontend
- Настроить nginx.conf для раздачи frontend и проксирования API
- Проверить запуск всех сервисов через docker-compose up

#### 1.5. Настройка базы данных
**Задача:** Инициализировать PostgreSQL и миграции

**Действия:**
- Установить и настроить Sequelize CLI
- Создать конфигурацию подключения к БД
- Настроить структуру миграций
- Создать миграцию с таблицами согласно разделу 4.1

---

### Этап 2: Разработка моделей и API (3-4 дня)

#### 2.1. Создание моделей данных
**Задача:** Реализовать ORM модели для работы с БД

**Модель Category (backend/src/database/models/Category.js):**
- Определить поля согласно разделу 4.1
- Настроить валидацию (name_ru и name_zh обязательны)
- Добавить методы: getActive(), getBySlug()
- Настроить связь с Product (hasMany)

**Модель Product (backend/src/database/models/Product.js):**
- Определить все поля включая JSONB для tags
- Настроить валидацию (цена > 0, обязательные поля)
- Добавить методы: getAvailable(), getByCategory(), searchByName()
- Настроить связь с Category (belongsTo)

**Модель Order (backend/src/database/models/Order.js):**
- Определить поля со всеми статусами
- Настроить автоинкремент для order_number
- Добавить методы: updateStatus(), complete(), cancel()
- Настроить связь с OrderItem (hasMany)

**Модель OrderItem (backend/src/database/models/OrderItem.js):**
- Определить поля с денормализацией названий
- Добавить метод calculateSubtotal()
- Настроить связи с Order и Product

**Модель Rating (backend/src/database/models/Rating.js):**
- Определить поля с ограничением rating от 1 до 10
- Настроить уникальность order_id
- Добавить метод getAverageRating()

#### 2.2. Создание seed данных
**Задача:** Заполнить БД начальными данными для разработки

**Файл seeds/initial_products.js:**
- Создать 5 категорий товаров
- Для каждой категории создать 5-10 товаров
- Указать реалистичные названия, описания, цены
- Добавить теги для фильтрации (сладкий, горький, крепкий, легкий, фруктовый и т.д.)
- Общее количество товаров: 30-40 для демонстрации

**Примеры товаров:**
- Зеленый чай "Лунцзин" (龙井茶) - 250 руб
- Пуэр выдержанный (普洱茶) - 350 руб
- Молочный улун (乌龙茶) - 280 руб
- Матча латте (抹茶拿铁) - 320 руб

#### 2.3. Разработка API endpoints
**Задача:** Создать RESTful API для работы с данными

**Routes для ингредиентов (backend/src/api/routes/ingredients.js):**
- GET /api/ingredients - получить все доступные ингредиенты
  - Query параметры: category, caffeine_level, is_vegan, is_available
- GET /api/ingredients/:id - получить конкретный ингредиент
- GET /api/ingredients/categories - получить категории ингредиентов
- GET /api/ingredients/compatibility/:id - получить совместимость ингредиента

**Routes для базовых рецептов (backend/src/api/routes/recipes.js):**
- GET /api/recipes - получить все базовые рецепты (шаблоны)
  - Query параметры: category, mood_tags
- GET /api/recipes/:id - получить рецепт с ингредиентами
- GET /api/recipes/:id/ingredients - получить ингредиенты рецепта

**Routes для стандартных товаров (backend/src/api/routes/products.js):**
- GET /api/products - получить все стандартные товары с фильтрами
  - Query параметры: category, temperature, search, tags
- GET /api/products/:id - получить конкретный товар

**Routes для категорий стандартного меню (backend/src/api/routes/categories.js):**
- GET /api/categories - получить все активные категории
- GET /api/categories/:slug/products - получить товары категории

**Routes для заказов (backend/src/api/routes/orders.js):**
- POST /api/orders - создать новый заказ
  - Body: { terminal_id, items: [{ item_type, product_id?, generated_recipe_id?, quantity }] }
  - Поддержка как стандартных товаров, так и AI-сгенерированных рецептов
- GET /api/orders/:id - получить заказ по ID
- PATCH /api/orders/:id/status - обновить статус заказа
  - Body: { status: 'preparing' | 'ready' | 'completed' }
- POST /api/orders/:id/payment - "оплатить" заказ (заглушка)
  - Body: { payment_method: 'card' | 'aicha_card' | 'sbp' }

**Routes для оценок (backend/src/api/routes/ratings.js):**
- POST /api/ratings - оставить оценку
  - Body: { order_id, rating, terminal_id }
- GET /api/ratings/average - получить среднюю оценку

#### 2.4. Разработка контроллеров
**Задача:** Реализовать бизнес-логику обработки запросов

**ProductController (backend/src/api/controllers/productController.js):**
- getAll() - получение товаров с фильтрацией и пагинацией
- getById() - получение товара по ID с проверкой доступности
- getRecommended() - получение рекомендуемых (пока просто случайные 6 товаров)

**OrderController (backend/src/api/controllers/orderController.js):**
- create() - создание заказа с валидацией товаров и расчетом суммы
- getById() - получение заказа
- updateStatus() - обновление статуса с WebSocket уведомлением
- processPayment() - обработка "оплаты" (заглушка, всегда success)

**RatingController (backend/src/api/controllers/ratingController.js):**
- create() - сохранение оценки с проверкой существования заказа
- getAverage() - расчет средней оценки за период

#### 2.5. Разработка сервисного слоя
**Задача:** Вынести бизнес-логику в отдельные сервисы

**ProductService (backend/src/services/productService.js):**
- Методы для работы с товарами
- Логика фильтрации и поиска
- Проверка доступности товара

**OrderService (backend/src/services/orderService.js):**
- Создание заказа с валидацией и расчетом
- Обновление статусов
- Логика работы с номерами заказов
- Отправка WebSocket уведомлений при изменении статуса

**CategoryService (backend/src/services/categoryService.js):**
- Получение категорий с товарами
- Кэширование категорий в Redis

**RatingService (backend/src/services/ratingService.js):**
- Сохранение оценок
- Расчет статистики оценок

#### 2.6. Middleware и валидация
**Задача:** Создать общие middleware для обработки запросов

**Validation middleware (backend/src/api/middleware/validation.js):**
- validateCreateOrder() - валидация создания заказа
- validatePayment() - валидация данных оплаты
- validateRating() - валидация оценки (1-10)

**Error handler (backend/src/api/middleware/errorHandler.js):**
- Централизованная обработка ошибок
- Форматирование ответов с ошибками
- Логирование ошибок

**Logger middleware (backend/src/api/middleware/logger.js):**
- Логирование всех входящих запросов
- Замер времени выполнения запросов

---

### Этап 3: Разработка дизайн-системы и UI компонентов (4-5 дней)

**⚠️ Важно: Особенности дизайна для терминала**
Прототип терминала использует экран 10.1" с разрешением 1024x600 пикселей. Все UI-элементы должны быть крупнее обычных веб-интерфейсов для комфортного использования на малом экране. Дизайн НЕ адаптивный - одинаковый вид на всех экранах, так как изначально прототип будет тестироваться на обычном ноутбуке (MacBook Air, экран 13.6" c разрешением 2560 × 1664 пикселей), и важно, чтобы при тестах и при реальной работе интерфейс выглядел одинаково. Указывайте размеры в относительных единицах (rem, em, %) для масштабируемости.

Все указанные ниже размеры примерные и могут быть изменены в процессе разработки в угоду дизайну.

#### 3.1. Настройка цветовой палитры и типографики
**Задача:** Создать единую дизайн-систему согласно PRD

**Файл colors.ts (frontend/src/styles/colors.ts):**

**Светлая тема (Light Theme):**
- primary: '#D32F2F' (китайский красный - акценты, кнопки)
- primaryHover: '#B71C1C' (красный при наведении)
- gold: '#FFD700' (золотой для премиум-элементов)
- green: '#388E3C' (чайная тематика, успех)
- gray: '#757575' (второстепенные элементы)
- grayLight: '#E0E0E0' (разделители, границы)
- background: '#FAFAFA' (фон страницы)
- surface: '#FFFFFF' (карточки, модальные окна)
- textPrimary: '#212121' (основной текст)
- textSecondary: '#757575' (вторичный текст)

**Темная тема (Dark Theme):**
- primary: '#EF5350' (светлее красный для контраста на темном)
- primaryHover: '#F44336' (красный при наведении)
- gold: '#FFD54F' (мягкий золотой)
- green: '#66BB6A' (светлее зеленый)
- gray: '#9E9E9E' (второстепенные элементы)
- grayLight: '#424242' (разделители, границы)
- background: '#121212' (фон страницы, глубокий черный)
- surface: '#1E1E1E' (карточки, модальные окна)
- surfaceElevated: '#2D2D2D' (приподнятые карточки)
- textPrimary: '#FFFFFF' (основной текст)
- textSecondary: '#B0B0B0' (вторичный текст)

**Общие цвета (одинаковы для обеих тем):**
- error: '#F44336' (ошибки)
- warning: '#FFC107' (предупреждения)
- success: '#4CAF50' (успех)
- info: '#2196F3' (информация)

- Определить оттенки для hover, active состояний
- Экспортировать палитру для использования в Tailwind через CSS-переменные

**Файл typography.ts (frontend/src/styles/typography.ts):**
- Определить размеры шрифтов увеличенные для малого экрана:
  - Базовый текст: минимум 1.125rem (18px эквивалент)
  - Заголовки: 1.75rem - 2.5rem
  - Кнопки: минимум 1.25rem
  - Мелкий текст (теги, подписи): минимум 0.875rem
- Настроить веса шрифтов (regular, medium, bold)
- Поддержка китайских символов (шрифт Noto Sans SC)

**Конфигурация Tailwind (frontend/tailwind.config.js):**
- Добавить кастомные цвета из colors.ts
- Настроить размеры для сенсорного интерфейса
- Добавить кастомные анимации
- Настроить darkMode: 'class' для переключения тем через CSS-класс

**Система переключения темы:**
- Хранить выбранную тему в localStorage (ключ: 'ai-cha-theme', значения: 'light' | 'dark')
- При загрузке приложения читать сохраненную тему
- По умолчанию использовать светлую тему
- Применять тему через добавление класса 'dark' на элемент html

**Плавная анимация смены темы:**
- Все цвета задаются через CSS-переменные (--color-background, --color-surface и т.д.)
- При смене темы значения переменных меняются
- Добавить transition на все элементы, использующие цветовые переменные:
  - transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease
- Анимация должна быть достаточно плавной (300-400ms) но не замедлять интерфейс

#### 3.2. Создание базовых UI компонентов
**Задача:** Разработать переиспользуемые компоненты

**Компонент Button (frontend/src/components/common/Button/):**
- Варианты: primary (красная), secondary (серая), outline
- Размеры для сенсорного управления:
  - small: минимум 3.5rem высота
  - medium: 4rem высота
  - large: 5rem высота
- Состояния: default, hover, active, disabled
- Поддержка иконок и загрузки
- Минимальная область нажатия 3.5rem × 3.5rem для комфортного тача

**Компонент Card (frontend/src/components/common/Card/):**
- Карточка с тенью и скругленными углами
- Варианты: default, elevated, outlined
- Используется для товаров, заказов

**Компонент Modal (frontend/src/components/common/Modal/):**
- Модальное окно с backdrop
- Анимация появления/исчезновения
- Кнопка закрытия
- Используется для подтверждений

**Компонент Loading (frontend/src/components/common/Loading/):**
- Индикатор загрузки с чайной тематикой
- Fullscreen и inline варианты
- Анимация вращения или Lottie анимация

**Компонент ThemeToggle (frontend/src/components/common/ThemeToggle/):**
- Кнопка переключения между светлой и темной темой
- Размер: 3rem × 3rem (для удобного нажатия на сенсорном экране)
- Иконки: солнце (светлая тема) / луна (темная тема)
- Плавная анимация смены иконки при переключении (rotate + fade, 300ms)
- При нажатии:
  - Переключить тему в store
  - Сохранить в localStorage
  - Добавить/убрать класс 'dark' на html
- Расположение: в шапке экрана справа (рядом с корзиной) или в боковом меню

**Hook useTheme (frontend/src/hooks/useTheme.ts):**
- Чтение текущей темы из store/localStorage
- Функция toggleTheme() для переключения
- Функция setTheme(theme) для явной установки
- Автоматическое применение темы при инициализации приложения

#### 3.3. Создание компонентов анимации
**Задача:** Реализовать плавные переходы и анимации

**Компонент LottiePlayer (frontend/src/components/animations/LottiePlayer/):**
- Обертка для lottie-react
- Автоматическое воспроизведение
- Управление размером
- Используется на экранах выбора режима и диалога

**Компонент PageTransition (frontend/src/components/animations/PageTransition/):**
- Плавные переходы между экранами
- Анимации fade, slide
- Используется в Router для всех переходов

---

### Этап 4: Разработка экранов терминала (7-10 дней)

#### 4.1. Приветственный экран (WelcomeScreen)
**Задача:** Реализовать стартовый экран с двуязычным приветствием

**Компонент WelcomeScreen (frontend/src/components/screens/WelcomeScreen/):**

**Визуальная структура:**
- Полноэкранный фон с китайской тематикой (градиент, адаптируется под тему)
- Кнопка смены темы в верхнем правом углу (ThemeToggle, полупрозрачная)
- Логотип AI-Cha по центру (крупный размер)
- Текст приветствия двуязычный:
  - "Добро пожаловать в AI Cha!" (русский, размер 3rem)
  - "欢迎来到爱茶!" (китайский, размер 2.625rem)
- Подсказка "Нажмите на экран для начала" внизу (fade in/out анимация)

**Логика:**
- При монтировании: плавное появление всех элементов
- При касании любой области экрана: переход на экран выбора режима
- Автопереход через 10 секунд без активности
- Проверка соединения с сервером при загрузке

**Анимации:**
- Fade in логотипа (0.5s)
- Slide up текста приветствия (0.7s)
- Pulse анимация подсказки

#### 4.2. Экран выбора режима (ModeSelectionScreen)
**Задача:** Реализовать выбор между AI-подбором и обычным заказом

**Компонент ModeSelectionScreen (frontend/src/components/screens/ModeSelectionScreen/):**

**Визуальная структура:**
- Центральная Lottie анимация (нейро-облако или чайная тематика)
- Две кнопки под анимацией:
  - **"Подобрать товар"** (主按钮):
    - Ярко-красная (#D32F2F)
    - Крупный размер (300x80px)
    - Иконка AI/мозга слева от текста
    - Двуязычный текст
  - **"Обычный заказ"** (次按钮):
    - Серая (#757575)
    - Размер чуть меньше (280x70px)
    - Иконка меню
    - Двуязычный текст
- Кнопки расположены вертикально с отступом 20px

**Логика:**
- При нажатии "Подобрать товар":
  - Сохранить mode: 'ai' в store
  - Показать заглушку "Функция AI-подбора будет доступна позже"
  - Предложить перейти к обычному заказу
- При нажатии "Обычный заказ":
  - Сохранить mode: 'manual' в store
  - Переход на экран каталога
- Таймаут возврата на Welcome через 30 секунд без активности

**Состояния:**
- Hover эффекты для кнопок (увеличение scale: 1.05)
- Active эффект (scale: 0.98)

#### 4.3. Экран каталога товаров (CatalogScreen)
**Задача:** Реализовать полный каталог с фильтрацией и поиском

**Компонент CatalogScreen (frontend/src/components/screens/CatalogScreen/):**

**Визуальная структура:**
- **Шапка экрана (фиксированная):**
  - Логотип AI-Cha слева (маленький)
  - Поле поиска по центру (ширина 50%)
  - Справа (в ряд): кнопка смены темы (ThemeToggle) + иконка корзины с badge
  - Фон: var(--color-surface) с тенью
  - Высота: 5rem

- **Панель категорий (горизонтальный скролл):**
  - Табы категорий (чайные, кофейные, холодные и т.д.)
  - Активная категория подсвечена красным
  - Иконка категории + название двуязычное
  - Высота 60px

- **Фильтры (опциональная панель):**
  - Кнопка "Фильтры" открывает боковую панель
  - Фильтры: температура (горячее/холодное), теги (сладкий, горький и т.д.)
  - Применение фильтров обновляет список товаров

- **Сетка товаров (скроллируемая область):**
  - Сетка 2 колонки (оптимально для экрана 1024x600, товары крупные и хорошо видны)
  - Карточки товаров с компонентом ProductCard
  - Отступы между карточками 1rem
  - Каждая карточка растянута на ~48% ширины контейнера

- **Футер (фиксированный):**
  - Кнопка "Перейти к оплате" (только если корзина не пуста)
  - Сумма заказа
  - Высота 80px

**Компонент ProductCard (frontend/src/components/products/ProductCard/):**

**Структура карточки товара:**
- Изображение товара (квадрат, 100% ширины карточки)
- Название двуязычное:
  - Русский: 1.25rem, bold
  - Китайский: 1rem
- Краткое описание (1-2 строки, ellipsis, размер 0.875rem)
- Цена (2rem шрифт, bold, контрастный)
- Теги (badge 0.75rem: сладкий, холодный и т.д.)
- Кнопка "+" крупная (минимум 3rem × 3rem) для добавления в корзину
- Индикатор "Недоступно" если is_available = false

**Логика карточки:**
- При нажатии на карточку (не на кнопку "+") - открыть модальное окно с полной информацией
- При нажатии на "+" - добавить товар в корзину с анимацией

**Модальное окно товара (ProductModal):**
- Полноразмерное изображение
- Полное описание двуязычное
- Состав (ingredients)
- Цена
- Кнопки: "-" (количество) "+" для управления количеством
- Кнопка "Добавить в корзину"
- Кнопка закрытия

**Логика экрана:**
- При монтировании: загрузка категорий и товаров через API
- Поиск: debounce 300ms, поиск по name_ru и name_zh
- Фильтрация: клиентская (данные уже загружены)
- Добавление в корзину: анимация товара летящего в иконку корзины
- Кнопка корзины: открывает CartScreen
- Таймаут возврата на Welcome через 60 секунд без активности

#### 4.4. Экран корзины (CartScreen)
**Задача:** Реализовать управление заказом

**Компонент CartScreen (frontend/src/components/screens/CartScreen/):**

**Визуальная структура:**
- **Шапка:**
  - Заголовок "Ваш заказ" / "您的订单"
  - Кнопка "Назад к каталогу"
  - Кнопка "Очистить корзину" (справа)

- **Список товаров в корзине:**
  - Компоненты CartItem для каждого товара
  - Скроллируемая область

- **Итоговая панель (фиксированная внизу):**
  - Строка "Итого:" с суммой заказа
  - Строка "Количество товаров:" с числом
  - Кнопка "Оплатить" (крупная, красная, на всю ширину)

**Компонент CartItem (frontend/src/components/cart/CartItem/):**

**Структура элемента корзины:**
- Миниатюра товара (4rem × 4rem)
- Название двуязычное (1.125rem)
- Цена за единицу (1.25rem)
- Управление количеством:
  - Кнопка "-" (3rem × 3rem, минимум 1)
  - Число (1.5rem, крупный шрифт)
  - Кнопка "+" (3rem × 3rem)
- Кнопка удаления (иконка 2.5rem)
- Промежуточная сумма (1.5rem bold)

**Логика:**
- Изменение количества: обновление store с анимацией
- Удаление товара: анимация slide out
- Пустая корзина: показать заглушку "Корзина пуста" с кнопкой "Перейти к каталогу"
- Кнопка "Оплатить": переход на PaymentScreen
- Таймаут возврата на Welcome через 60 секунд без активности

#### 4.5. Экран оплаты (PaymentScreen)
**Задача:** Реализовать выбор способа оплаты (заглушки)

**Компонент PaymentScreen (frontend/src/components/screens/PaymentScreen/):**

**Визуальная структура:**
- **Шапка:**
  - Заголовок "Оплата заказа" / "支付订单"
  - Кнопка "Назад"

- **Информация о заказе:**
  - Номер заказа (генерируется при создании)
  - Список товаров (компактный)
  - Итоговая сумма (крупный шрифт)

- **Способы оплаты (3 крупные кнопки для сенсорного управления):**
  - **"Банковская карта"** (银行卡):
    - Иконка карты (2.5rem)
    - Текст двуязычный (1.5rem)
    - Размер 100% ширины × минимум 6rem высота
  
  - **"AI Cha карта"** (AI Cha卡):
    - Иконка фирменной карты (2.5rem)
    - Текст двуязычный (1.5rem)
    - Размер 100% ширины × минимум 6rem высота
  
  - **"Оплата по СБП"** (快速支付系统):
    - Иконка QR кода (2.5rem)
    - Текст двуязычный (1.5rem)
    - Размер 100% ширины × минимум 6rem высота

**Логика:**
- При монтировании: создать заказ через API (POST /api/orders)
  - Получить order_id и order_number
  - Сохранить в локальном state
- При нажатии на любой способ оплаты:
  - Показать loading 2 секунды
  - Вызвать API (POST /api/orders/:id/payment) - всегда возвращает success
  - Показать экран успешной оплаты с анимацией (галочка)
  - Через 3 секунды переход на RatingScreen
- При ошибке: показать модальное окно с ошибкой и возможностью повтора

#### 4.6. Экран оценки сервиса (RatingScreen)
**Задача:** Реализовать сбор обратной связи

**Компонент RatingScreen (frontend/src/components/screens/RatingScreen/):**

**Визуальная структура:**
- **Заголовок:**
  - "Как вы оцените процесс заказа в AI Cha?"
  - "您如何评价AI Cha的订购流程?"
  - Размер 2rem, по центру

- **Звезды оценки:**
  - 10 звезд в ряд (крупные для сенсорного управления, 3.5rem × 3.5rem каждая)
  - Интерактивные: при наведении/нажатии подсвечиваются
  - Градиент цвета: от красного (1-3) через желтый (4-7) к зеленому (8-10)
  - Анимация при выборе
  - Отступы между звездами 0.5rem

- **Кнопки:**
  - Кнопка "Пропустить" внизу (серая, outline, высота 4rem)

**Логика:**
- При нажатии на звезду:
  - Анимация выбора
  - Отправка оценки через API (POST /api/ratings)
  - Показать сообщение "Спасибо за оценку!" / "感谢您的评价!"
  - Через 2 секунды переход на WelcomeScreen
- При нажатии "Пропустить":
  - Сразу переход на WelcomeScreen
- Автопереход через 60 секунд без активности
- Очистка корзины после завершения

#### 4.7. Экран рекомендаций (RecommendationsScreen)
**Задача:** Подготовить заглушку для будущего AI-функционала

**Компонент RecommendationsScreen (frontend/src/components/screens/RecommendationsScreen/):**

**Визуальная структура:**
- Заголовок "Рекомендации для вас" / "为您推荐"
- Список рекомендованных товаров (заглушка: случайные 6 товаров)
- Для каждого товара:
  - ProductCard стандартный
  - Дополнительно: короткое обоснование (заглушка: "Подходит вашему настроению")
- Кнопка внизу "Добавить другие товары" - переход на CatalogScreen

**Логика:**
- Пока AI не реализован - загрузка случайных товаров через API
- В будущем: получение персонализированных рекомендаций
- Возможность добавления товаров в корзину
- Переход к полному каталогу

---

### Этап 5: Разработка State Management (2-3 дня)

#### 5.1. Store корзины (cartStore)
**Задача:** Управление состоянием корзины

**Файл frontend/src/store/cartStore.ts:**

**Структура state:**
- items: массив { product, quantity }
- totalAmount: общая сумма
- totalItems: общее количество товаров

**Методы:**
- addItem(product, quantity) - добавить товар
- removeItem(productId) - удалить товар
- updateQuantity(productId, quantity) - обновить количество
- clearCart() - очистить корзину
- getItemCount() - получить количество товаров

**Особенности:**
- Сохранение в localStorage для восстановления при перезагрузке
- Автоматический пересчет totalAmount и totalItems
- Проверка доступности товара перед добавлением

#### 5.2. Store товаров (productsStore)
**Задача:** Управление данными о товарах и категориях

**Файл frontend/src/store/productsStore.ts:**

**Структура state:**
- products: массив всех товаров
- categories: массив категорий
- loading: флаг загрузки
- error: ошибка загрузки
- filters: активные фильтры
- searchQuery: поисковый запрос

**Методы:**
- loadProducts() - загрузка товаров с API
- loadCategories() - загрузка категорий
- setFilter(filterType, value) - установка фильтра
- setSearchQuery(query) - установка поискового запроса
- getFilteredProducts() - получение отфильтрованных товаров

**Особенности:**
- Кэширование товаров (не перезагружать при каждом переходе)
- Клиентская фильтрация для быстрого отклика

#### 5.3. Store навигации (navigationStore)
**Задача:** Управление состоянием навигации и таймаутами

**Файл frontend/src/store/navigationStore.ts:**

**Структура state:**
- currentScreen: текущий экран
- previousScreen: предыдущий экран
- inactivityTimeout: таймаут до возврата на Welcome
- orderMode: 'ai' | 'manual'

**Методы:**
- navigate(screen) - переход на экран
- goBack() - возврат назад
- resetInactivityTimeout() - сброс таймаута
- setOrderMode(mode) - установка режима заказа

**Особенности:**
- Автоматический возврат на WelcomeScreen при неактивности
- История навигации для кнопки "Назад"

#### 5.4. Store темы (themeStore)
**Задача:** Управление светлой/темной темой

**Файл frontend/src/store/themeStore.ts:**

**Структура state:**
- theme: 'light' | 'dark' - текущая тема
- isTransitioning: boolean - идет ли анимация смены темы

**Методы:**
- toggleTheme() - переключить тему
- setTheme(theme) - установить конкретную тему
- initTheme() - инициализировать тему при загрузке (из localStorage)

**Особенности:**
- Сохранение в localStorage (ключ: 'ai-cha-theme')
- При смене темы добавлять/убирать класс 'dark' на html элемент
- Установка флага isTransitioning на 300ms для плавной анимации
- По умолчанию светлая тема

---

### Этап 6: Интеграция Frontend с Backend (3-4 дня)

#### 6.1. Настройка API клиента
**Задача:** Создать централизованный клиент для API запросов

**Файл frontend/src/services/api.ts:**

**Конфигурация:**
- Базовый URL: `http://localhost:8080/api` (из env)
- Timeout: 10 секунд
- Headers: Content-Type: application/json
- Interceptors для обработки ошибок

**Обработка ошибок:**
- Network errors: показать уведомление "Проблемы с подключением"
- 500 errors: показать "Ошибка сервера"
- Retry логика для GET запросов (3 попытки)

#### 6.2. Сервис товаров
**Задача:** API методы для работы с товарами

**Файл frontend/src/services/productService.ts:**

**Методы:**
- getProducts(filters) - получение товаров с фильтрами
- getProductById(id) - получение товара
- getCategories() - получение категорий
- getRecommended() - получение рекомендованных

**Использование:**
- В productsStore для загрузки данных
- Автоматическое обновление store при успешном ответе

#### 6.3. Сервис заказов
**Задача:** API методы для работы с заказами

**Файл frontend/src/services/orderService.ts:**

**Методы:**
- createOrder(terminalId, items) - создание заказа
- processPayment(orderId, paymentMethod) - "оплата" заказа
- getOrder(orderId) - получение заказа

**Использование:**
- В PaymentScreen для создания и оплаты заказа
- Обработка ошибок создания заказа

#### 6.4. Сервис оценок
**Задача:** API методы для оценок

**Файл frontend/src/services/ratingService.ts:**

**Методы:**
- submitRating(orderId, rating, terminalId) - отправка оценки

**Использование:**
- В RatingScreen при выборе звезды

#### 6.5. Тестирование интеграции
**Задача:** Проверить работу всех API запросов

**Сценарии тестирования:**
- Загрузка категорий и товаров при старте
- Фильтрация товаров
- Добавление товаров в корзину
- Создание заказа
- Оплата заказа (заглушка)
- Отправка оценки
- Обработка ошибок сети

---

### Этап 7: Разработка панели для сотрудников (3-4 дня)

#### 7.1. Структура панели сотрудников
**Задача:** Создать интерфейс управления заказами

**Приложение staff-panel (отдельное React приложение):**

**Структура:**
- Используется общий backend API
- Отдельный роутинг и сборка
- Адрес: `http://server/staff`

#### 7.2. Главный экран (StaffDashboard)
**Задача:** Отображение активных заказов

**Компонент StaffDashboard (staff-panel/src/screens/StaffDashboard/):**

**Визуальная структура:**
- **Шапка:**
  - Логотип AI-Cha
  - Заголовок "Панель сотрудников"
  - Текущее время
  - Кнопка обновления

- **Фильтры статусов:**
  - Табы: "Новые", "Готовятся", "Готовые", "Все"
  - Счетчик заказов в каждом статусе

- **Список заказов (сетка 2-3 колонки):**
  - Компоненты OrderCard для каждого заказа
  - Сортировка: новые сверху
  - Обновление в real-time через WebSocket

**Компонент OrderCard (staff-panel/src/components/OrderCard/):**

**Структура карточки заказа:**
- Номер заказа (крупно)
- Статус (цветной badge)
- Время создания
- Список товаров (компактно)
- Общая сумма
- Кнопки управления статусом:
  - "Принять" (pending → preparing)
  - "Готово" (preparing → ready)
  - "Выдано" (ready → completed)
- Цветовая кодировка:
  - Новый (pending) - красный border
  - Готовится (preparing) - жёлтый border
  - Готов (ready) - зеленый border

**Логика:**
- При монтировании: загрузка всех активных заказов (не completed, не cancelled)
- WebSocket подписка на обновления заказов
- При изменении статуса: API запрос PATCH /api/orders/:id/status
- Звуковое уведомление при новом заказе
- Автообновление списка каждые 30 секунд (fallback для WebSocket)

#### 7.3. WebSocket интеграция
**Задача:** Real-time обновления заказов

**Backend WebSocket (backend/src/services/orderService.js):**
- При создании заказа: broadcast события 'new_order'
- При обновлении статуса: broadcast события 'order_updated'
- Клиенты подписываются на события

**Frontend WebSocket (staff-panel):**
- Подключение при монтировании StaffDashboard
- Обработка событий new_order и order_updated
- Автоматическое обновление списка заказов
- Переподключение при разрыве соединения

---

### Этап 8: Разработка экрана отображения заказов (2-3 дня)

#### 8.1. Структура display-screen
**Задача:** Создать большой экран для зала с готовыми заказами

**Приложение display-screen (отдельное React приложение):**

**Структура:**
- Fullscreen режим
- Адрес: `http://server/display`
- Подключение через WebSocket

#### 8.2. Главный экран (DisplayScreen)
**Задача:** Отображение готовых заказов для клиентов

**Компонент DisplayScreen (display-screen/src/screens/DisplayScreen/):**

**Визуальная структура:**
- **Шапка:**
  - Логотип AI-Cha по центру
  - Заголовок "Готовые заказы" / "准备好的订单"

- **Сетка заказов (3-4 колонки):**
  - Крупные карточки с номерами заказов
  - Отображаются только заказы со статусом 'ready'
  - Анимация появления новых заказов
  - Автоматическое удаление при смене статуса на 'completed'

**Компонент OrderDisplay (display-screen/src/components/OrderDisplay/):**

**Структура карточки:**
- Номер заказа (очень крупный шрифт, 72px)
- Статус "Готов" с зеленым индикатором
- Анимация пульсации для привлечения внимания

**Логика:**
- WebSocket подписка на события order_updated
- Фильтрация только заказов со статусом 'ready'
- Звуковой сигнал при появлении готового заказа
- Анимация fade out при выдаче заказа (completed)
- Автоочистка старых заказов (> 10 минут в статусе ready)

---

### Этап 9: Оптимизация и полировка (3-4 дня)

#### 9.1. Оптимизация производительности
**Задача:** Улучшить скорость работы приложения

**Frontend оптимизации:**
- Lazy loading для компонентов экранов
- Мемоизация компонентов (React.memo)
- Оптимизация ре-рендеров в Zustand stores
- Compression изображений товаров (WebP формат)
- Code splitting по роутам
- Service Worker для кэширования статики

**Backend оптимизации:**
- Индексы в БД (уже созданы на этапе 4)
- Кэширование категорий в Redis (TTL 1 час)
- Кэширование списка товаров в Redis (TTL 10 минут)
- Connection pooling для PostgreSQL
- Compression для API ответов (gzip)

#### 9.2. Адаптивность и отзывчивость
**Задача:** Обеспечить работу на разных размерах экранов

**Тестирование на разных разрешениях:**
- 1280x800 (основной экран терминала)
- 1920x1080 (экран отображения заказов)
- Портретная и ландшафтная ориентация

**Адаптации:**
- Media queries для разных размеров
- Масштабирование шрифтов и элементов
- Изменение сетки товаров (2-4 колонки в зависимости от ширины)

#### 9.3. Доступность
**Задача:** Улучшить доступность интерфейса

**Улучшения:**
- Высокий контраст текста и фона
- Минимальный размер интерактивных элементов 60x60px
- Aria-labels для всех кнопок
- Focus visible для клавиатурной навигации
- Поддержка screen readers (если необходимо)

#### 9.4. Обработка ошибок и edge cases
**Задача:** Покрыть все возможные сценарии ошибок

**Сценарии:**
- Отсутствие соединения с сервером: показать экран "Нет соединения"
- Ошибка загрузки товаров: показать кнопку "Повторить"
- Товар стал недоступен после добавления в корзину: уведомление и удаление
- Ошибка создания заказа: уведомление с возможностью повтора
- Пустая корзина на экране оплаты: редирект на каталог
- Долгая загрузка: показывать Loading индикатор

#### 9.5. Полировка анимаций
**Задача:** Сделать все переходы плавными

**Анимации:**
- Переходы между экранами (fade + slide)
- Добавление товара в корзину (flying animation)
- Обновление количества в корзине (bounce)
- Появление модальных окон (scale + fade)
- Hover эффекты на кнопках и карточках
- Loading состояния с skeleton screens

---

### Этап 10: Тестирование (4-5 дней)

#### 10.1. Unit тесты Backend
**Задача:** Покрыть тестами бизнес-логику

**Файлы тестов (backend/tests/unit/):**

**productService.test.js:**
- Тест фильтрации товаров по категории
- Тест поиска товаров
- Тест проверки доступности

**orderService.test.js:**
- Тест создания заказа
- Тест расчета суммы заказа
- Тест обновления статуса
- Тест валидации товаров

**Инструменты:**
- Jest для тестирования
- Supertest для тестирования API
- Mock данных для БД

#### 10.2. Integration тесты API
**Задача:** Проверить все API endpoints

**Файл backend/tests/integration/api.test.js:**

**Тесты endpoints:**
- GET /api/categories - получение категорий
- GET /api/products - получение товаров с фильтрами
- GET /api/products/:id - получение товара
- POST /api/orders - создание заказа
- PATCH /api/orders/:id/status - обновление статуса
- POST /api/orders/:id/payment - оплата заказа
- POST /api/ratings - отправка оценки

**Проверки:**
- Статус коды ответов
- Структура данных в ответе
- Валидация входных данных
- Обработка ошибок

#### 10.3. E2E тесты Frontend
**Задача:** Протестировать полные сценарии пользователя

**Инструменты:**
- Playwright или Cypress

**Сценарии:**
- **Сценарий 1: Обычный заказ**
  1. Открыть приложение
  2. Пройти Welcome screen
  3. Выбрать "Обычный заказ"
  4. Просмотреть каталог
  5. Добавить 3 товара в корзину
  6. Перейти к оплате
  7. Выбрать способ оплаты
  8. Оставить оценку
  9. Вернуться на Welcome

- **Сценарий 2: Поиск и фильтрация**
  1. Перейти в каталог
  2. Использовать поиск
  3. Применить фильтры
  4. Добавить товар в корзину

- **Сценарий 3: Управление корзиной**
  1. Добавить товары
  2. Изменить количество
  3. Удалить товар
  4. Очистить корзину

#### 10.4. Ручное тестирование
**Задача:** Проверить UX и поведение на реальном устройстве

**Чек-лист:**
- Работа на сенсорном экране (тачскрин)
- Читаемость текста на расстоянии
- Размеры кнопок удобны для нажатия
- Плавность анимаций
- Скорость загрузки экранов
- Работа WebSocket обновлений
- Корректность двуязычных надписей
- Таймауты неактивности работают

#### 10.5. Тестирование панели сотрудников
**Задача:** Проверить функционал для сотрудников

**Сценарии:**
- Просмотр новых заказов
- Обновление статусов заказов
- Real-time обновления
- Отображение на display-screen
- Работа при большом количестве заказов

---

### Этап 11: Развертывание и документация (3-4 дня)

#### 11.1. Подготовка Docker образов
**Задача:** Создать production-ready образы

**Dockerfile для Backend (docker/Dockerfile.backend):**
- Базовый образ: node:18-alpine
- Установка зависимостей
- Копирование кода
- Запуск через node (не nodemon)
- Healthcheck endpoint

**Dockerfile для Frontend (docker/Dockerfile.frontend):**
- Multi-stage build
- Stage 1: сборка с Vite
- Stage 2: раздача через nginx
- Оптимизация размера образа

**Docker Compose (docker/docker-compose.yml):**

**Сервисы:**
- postgres (PostgreSQL 15)
- redis (Redis 7)
- backend (Node.js API)
- frontend (Nginx с React)
- staff-panel (Nginx с React)
- display-screen (Nginx с React)
- nginx (главный reverse proxy)

**Volumes:**
- postgres_data - данные БД
- redis_data - данные Redis

**Networks:**
- internal - для внутренней связи сервисов
- external - для внешнего доступа

#### 11.2. Настройка Nginx
**Задача:** Настроить роутинг и раздачу приложений

**Конфигурация nginx (docker/nginx.conf):**

**Роуты:**
- `/` → frontend (главный терминал)
- `/staff` → staff-panel (панель сотрудников)
- `/display` → display-screen (экран отображения)
- `/api` → backend (проксирование API)
- `/ws` → backend WebSocket

**Настройки:**
- Gzip compression
- Кэширование статики (1 год для неизменяемых файлов)
- Timeouts для WebSocket соединений
- CORS headers для API

#### 11.3. Переменные окружения
**Задача:** Настроить конфигурацию для production

**Файл .env.example (для документации):**

**Backend:**
- NODE_ENV=production
- PORT=8080
- DATABASE_URL=postgresql://user:password@postgres:5432/aicha
- REDIS_URL=redis://redis:6379
- LOG_LEVEL=info

**Frontend:**
- VITE_API_URL=http://server-ip:8080/api
- VITE_WS_URL=ws://server-ip:8082/ws

#### 11.4. Миграции и seed данных
**Задача:** Подготовить БД к первому запуску

**Скрипт инициализации (backend/scripts/init-db.js):**
- Запуск миграций
- Загрузка seed данных (категории и товары)
- Проверка успешности

**Содержимое seed:**
- 5 категорий товаров
- 40 товаров с реалистичными данными
- Изображения товаров (плейсхолдеры или реальные фото)

#### 11.5. Инструкция по развертыванию
**Задача:** Написать подробную документацию

**Файл DEPLOYMENT.md:**

**Содержание:**
1. Требования к серверу (мощный ПК)
   - CPU: 4+ ядра
   - RAM: 16GB
   - Disk: 100GB SSD
   - OS: Ubuntu 22.04 

2. Установка Docker и Docker Compose

3. Клонирование репозитория

4. Настройка .env файлов

5. Запуск через Docker Compose:
   ```bash
   docker-compose up -d
   ```

6. Инициализация БД:
   ```bash
   docker-compose exec backend npm run db:init
   ```

7. Проверка работоспособности:
   - Frontend: http://server-ip/
   - Staff panel: http://server-ip/staff
   - Display screen: http://server-ip/display

8. Настройка терминалов Orange Pi:
   - Установка Chromium
   - Настройка kiosk-режима
   - Автозапуск через systemd

#### 11.6. Документация для разработчиков
**Задача:** Описать архитектуру и API

**Файл README.md:**

**Содержание:**
- Описание проекта
- Архитектура (ссылка на схему)
- Технологический стек
- Структура проекта
- Инструкции по локальной разработке
- Запуск тестов
- Contributing guidelines

**Файл API.md:**

**Содержание:**
- Список всех endpoints
- Формат запросов и ответов
- Примеры использования
- Коды ошибок

---

### Этап 12: Финальная проверка и оптимизация (2-3 дня)

#### 12.1. Проверка производительности
**Задача:** Измерить и оптимизировать критичные метрики

**Метрики Frontend:**
- Time to Interactive < 2 секунды
- First Contentful Paint < 1 секунда
- Плавность анимаций (60 FPS)
- Размер bundle < 500KB (gzipped)

**Метрики Backend:**
- Время ответа API < 200ms (P95)
- Throughput > 100 req/sec
- Время запросов к БД < 50ms

**Инструменты:**
- Lighthouse для Frontend
- Artillery для нагрузочного тестирования Backend

#### 12.2. Проверка безопасности
**Задача:** Обеспечить базовую безопасность

**Чек-лист:**
- Валидация всех входных данных
- Защита от SQL injection (через ORM)
- Rate limiting на API endpoints
- HTTPS в production (через nginx)
- Безопасное хранение переменных окружения
- Защита от XSS (React делает автоматически)

#### 12.3. Мониторинг и логирование
**Задача:** Настроить базовый мониторинг

**Логирование Backend:**
- Структурированные логи (JSON формат)
- Уровни: error, warn, info, debug
- Логирование всех API запросов
- Логирование ошибок БД

**Мониторинг (базовый):**
- Docker logs для быстрой диагностики
- Healthcheck endpoints для проверки статуса
- В будущем: Prometheus + Grafana

#### 12.4. Финальное тестирование на целевом железе
**Задача:** Проверить работу на Orange Pi и настоящем экране

**Тестирование:**
- Установка на Orange Pi Zero 3
- Подключение сенсорного экрана
- Запуск в kiosk-режиме
- Проверка производительности
- Проверка работы микрофона (для будущего AI)
- Проверка отклика сенсорного ввода

**Оптимизации для Orange Pi:**
- Уменьшение качества анимаций при необходимости
- Оптимизация памяти
- Preloading критичных ресурсов

#### 12.5. Подготовка демо-данных
**Задача:** Создать красивые данные для демонстрации

**Демо-данные:**
- Фотографии товаров высокого качества
- Переводы на китайский от носителя языка
- Реалистичные описания товаров
- Правильные цены (исследование рынка)

---

## 6. Критерии приемки базового этапа

### 6.1. Функциональные требования

**Обязательные функции:**
- ✅ Приветственный экран с двуязычным интерфейсом работает
- ✅ Экран выбора режима отображается корректно
- ✅ Полный каталог товаров загружается и отображается
- ✅ Фильтрация и поиск товаров работают
- ✅ Добавление товаров в корзину работает с анимацией
- ✅ Корзина отображает товары и позволяет управлять количеством
- ✅ Создание заказа работает
- ✅ Экран оплаты с заглушками работает
- ✅ Система оценки сервиса работает
- ✅ Автоматический возврат на Welcome экран при неактивности
- ✅ Панель сотрудников отображает заказы
- ✅ Обновление статусов заказов работает
- ✅ Экран отображения заказов работает
- ✅ Real-time обновления через WebSocket работают

### 6.2. Технические требования

**Backend:**
- ✅ API отвечает быстро (< 200ms)
- ✅ База данных работает стабильно
- ✅ Миграции применяются корректно
- ✅ Seed данные загружаются
- ✅ WebSocket соединения работают
- ✅ Логирование настроено

**Frontend:**
- ✅ Приложение загружается быстро (< 2s)
- ✅ Анимации плавные (60 FPS)
- ✅ Нет ошибок в консоли
- ✅ Корректная работа на сенсорном экране
- ✅ Двуязычность реализована везде
- ✅ Адаптивность под разные экраны

### 6.3. UX требования

**Интерфейс:**
- ✅ Все кнопки достаточно большие (минимум 60x60px)
- ✅ Текст читается легко (минимум 16px)
- ✅ Высокий контраст для читаемости
- ✅ Понятная навигация
- ✅ Быстрый отклик на действия пользователя

**Дизайн:**
- ✅ Соответствие цветовой палитре (китайский красный, золотой, зеленый)
- ✅ Китайская тематика в дизайне
- ✅ Качественные изображения товаров
- ✅ Плавные переходы между экранами

---

## 7. Потенциальные проблемы и решения

### 7.1. Производительность на Orange Pi
**Проблема:** Orange Pi Zero 3 имеет ограниченные ресурсы (4GB RAM, ARM процессор)

**Решения:**
- Оптимизация bundle size Frontend
- Использование Service Worker для кэширования
- Lazy loading компонентов
- Оптимизация изображений (WebP, compression)
- Вся тяжелая логика на сервере (архитектура тонкого клиента)

### 7.2. Работа сенсорного экрана
**Проблема:** Могут быть проблемы с распознаванием тачей

**Решения:**
- Увеличенные зоны касания (минимум 60px)
- Отключение двойного тапа для зума
- Debounce для предотвращения случайных двойных нажатий
- Тестирование на реальном экране

### 7.3. Проблемы с сетью
**Проблема:** WiFi может быть нестабильным

**Решения:**
- Retry логика для API запросов
- Показ понятных сообщений об ошибках
- Сохранение корзины в localStorage
- Возможность восстановления сессии

### 7.4. Синхронизация между терминалами
**Проблема:** Товар может стать недоступным пока клиент формирует заказ

**Решения:**
- Проверка доступности при создании заказа
- WebSocket уведомления об изменении доступности
- Автоматическое удаление недоступных товаров из корзины

### 7.5. Большое количество заказов
**Проблема:** При большом потоке клиентов может быть сложно управлять заказами

**Решения:**
- Пагинация в панели сотрудников
- Фильтрация по статусам
- Автоматическая архивация старых заказов
- Звуковые уведомления для новых заказов

---

## 8. Метрики успеха

### 8.1. Технические метрики
- Время загрузки приложения < 2 секунд
- Время ответа API < 200ms
- Uptime системы > 99%
- Плавность анимаций 60 FPS
- Отсутствие критических ошибок

### 8.2. Пользовательские метрики
- Время от старта до оплаты < 3 минут
- Интуитивная навигация (пользователь не застревает)
- Читаемость на расстоянии 50-70 см
- Корректная работа двуязычного интерфейса

### 8.3. Бизнес-метрики
- Количество заказов через терминал
- Средний чек
- Средняя оценка сервиса
- Время обработки заказа сотрудниками

---

## 9. Следующие шаги

После завершения базового этапа разработки, проект будет готов к:

1. **Интеграции AI-агента** (следующий этап разработки)
   - Подключение Speech-to-Text (Yandex SpeechKit)
   - Подключение Text-to-Speech
   - Интеграция AI-модели для диалога (GPT-4o или Llama-3)
   - Реализация логики подбора товаров

2. **Тестированию на реальных клиентах**
   - Пилотный запуск в кафе
   - Сбор обратной связи
   - Итерации улучшений

3. **Интеграции реальной оплаты**
   - Подключение эквайринга
   - Интеграция СБП
   - Система лояльности AI Cha

---

## Заключение

Данный план разработки базовой части проекта AI-Cha Terminal представляет собой детальное руководство для создания полнофункционального терминала самообслуживания для чайного кафе.

**Ключевые принципы:**
- Модульная архитектура для легкой интеграции AI на следующем этапе
- Двуязычность (русский + китайский) во всем интерфейсе
- Оптимизация под ограниченные ресурсы Orange Pi
- Китайская тематика в дизайне
- Удобство использования для всех возрастных групп

**Расчетное время разработки:** 6-8 недель для команды из 2-3 разработчиков (1 backend, 1-2 frontend).

**Технологический стек:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Fastify + PostgreSQL + Redis
- DevOps: Docker + Docker Compose + Nginx

После завершения этого этапа система будет готова к интеграции AI-функционала и тестированию в реальных условиях кафе.

