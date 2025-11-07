# 📋 План разработки AI-Cha Terminal - Базовая часть (без AI)

## 🎯 Цель этапа

Создать полнофункциональную базу терминальной системы со всем необходимым интерфейсом, системой заказов и инфраструктурой, **БЕЗ** интеграции AI-диалога и голосовых технологий. На этом этапе кнопка "Подобрать товар" будет временно неактивна или перенаправлять на обычное меню.

**Ожидаемый результат:** Полностью работающий терминал с красивым интерфейсом, каталогом товаров, корзиной, заглушками оплаты, системой оценки и панелями для сотрудников.

**Время выполнения:** 4-6 недель

---

## 📦 Фаза 1: Настройка окружения разработки

### Задача 1.1: Установка базового ПО

#### Шаги выполнения:

1. **Установка Node.js**
   - Скачать и установить Node.js 20 LTS с официального сайта
   - Проверить установку: `node --version` и `npm --version`
   - Должны быть версии: Node.js >= 20.0.0, npm >= 10.0.0

2. **Установка Docker Desktop**
   - Скачать Docker Desktop для Windows с официального сайта
   - Установить и запустить Docker Desktop
   - Убедиться, что Docker работает: `docker --version` и `docker-compose --version`
   - Включить WSL 2 integration в настройках Docker (для лучшей производительности)

3. **Установка Git**
   - Скачать и установить Git для Windows
   - Настроить глобальные параметры через команду git config:
     - Установить имя пользователя глобально
     - Установить email глобально

4. **Установка редактора кода**
   - Рекомендуется VS Code с расширениями:
     - ESLint
     - Prettier
     - Docker
     - React Developer Tools
     - GitLens

**✅ Критерий завершения:** Все инструменты установлены и проверены командами --version

---

### Задача 1.2: Создание структуры проекта

#### Шаги выполнения:

1. **Инициализация Git репозитория**
   - Перейти в директорию проекта
   - Инициализировать Git репозиторий командой git init
   - Переименовать основную ветку в main

2. **Создание структуры папок проекта**
   
   Создать следующую иерархию папок:
   
   **Frontend (клиентская часть):**
   - Папка `frontend/` для React приложения
   - Внутри `src/` создать подпапки:
     - `components/` - переиспользуемые компоненты (кнопки, карточки товаров)
     - `pages/` - страницы приложения (главная, меню, корзина и т.д.)
     - `styles/` - CSS стили
     - `utils/` - вспомогательные функции
     - `hooks/` - custom React hooks
     - `context/` - React Context для управления состоянием
     - `api/` - API клиенты для связи с backend
     - `assets/` - изображения, анимации, шрифты
   - Файлы: App.tsx (главный компонент), main.tsx (точка входа)
   - Папка `public/` для статических файлов
   - Конфигурационные файлы: package.json, vite.config.ts, tsconfig.json, index.html

   **Backend (серверная часть):**
   - Папка `backend/` с подпапкой `order-service/` (микросервис управления заказами)
   - Внутри `order-service/src/` создать:
     - `routes/` - API эндпоинты
     - `models/` - модели базы данных
     - `controllers/` - бизнес-логика
     - `utils/` - утилиты
     - `config/` - конфигурация
   - Файл server.ts - точка входа сервера
   - Конфигурационные файлы: Dockerfile, package.json, tsconfig.json
   - Папка `shared/` для общего кода между сервисами

   **База данных:**
   - Папка `database/` с подпапками:
     - `migrations/` - миграции PostgreSQL
     - `seeds/` - начальные данные
   - Файл schema.sql - схема базы данных

   **Nginx:**
   - Папка `nginx/` с файлами конфигурации

   **Корневые файлы:**
   - docker-compose.yml - для оркестрации всех сервисов
   - .env.example - пример переменных окружения
   - .gitignore - исключения для Git
   - README.md - документация проекта

3. **Создать файл .gitignore**
   
   Добавить в .gitignore следующие правила исключения:
   - Папки зависимостей (node_modules)
   - Результаты сборки (dist, build)
   - Файлы окружения (.env, .env.local)
   - Папки IDE (.vscode, .idea)
   - Системные файлы (.DS_Store для Mac, Thumbs.db для Windows)
   - Лог файлы (*.log, npm-debug.log)

**✅ Критерий завершения:** Структура папок создана, репозиторий инициализирован

---

### Задача 1.3: Настройка PostgreSQL и создание базы данных

> **⚠️ ТОЧКА ОСТАНОВКИ ДЛЯ ПОЛЬЗОВАТЕЛЯ:**
> Вам нужно создать базу данных PostgreSQL. Есть два варианта:
> 1. **Локально в Docker** (рекомендуется для тестирования) - мы настроим автоматически
> 2. **Облачный сервис** (например, Supabase, Railway, или Neon) - нужно получить DATABASE_URL
> 
> **Если выбираете облако:** Зарегистрируйтесь на выбранной платформе, создайте базу и получите строку подключения (DATABASE_URL). Она выглядит так:
> ```
> postgresql://username:password@host:port/database_name
> ```
> Сохраните её, мы используем в следующем шаге.
>
> **Если выбираете Docker:** Просто продолжайте, мы настроим автоматически.

#### Шаги выполнения (для Docker варианта):

1. **Создать файл docker-compose.yml в корне проекта**
   ```yaml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:15-alpine
       container_name: aicha-postgres
       environment:
         POSTGRES_DB: aicha_terminal
         POSTGRES_USER: aicha_user
         POSTGRES_PASSWORD: aicha_password_dev_only
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
       networks:
         - aicha-network
   
     redis:
       image: redis:7-alpine
       container_name: aicha-redis
       ports:
         - "6379:6379"
       networks:
         - aicha-network
   
   volumes:
     postgres_data:
   
   networks:
     aicha-network:
       driver: bridge
   ```

2. **Создать схему базы данных database/schema.sql**
   ```sql
   -- Таблица категорий товаров
   CREATE TABLE categories (
       id SERIAL PRIMARY KEY,
       name_ru VARCHAR(100) NOT NULL,
       name_zh VARCHAR(100) NOT NULL,
       slug VARCHAR(50) UNIQUE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Таблица товаров
   CREATE TABLE products (
       id SERIAL PRIMARY KEY,
       category_id INTEGER REFERENCES categories(id),
       name_ru VARCHAR(200) NOT NULL,
       name_zh VARCHAR(200) NOT NULL,
       description_ru TEXT,
       description_zh TEXT,
       price DECIMAL(10, 2) NOT NULL,
       image_url VARCHAR(500),
       is_available BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Таблица заказов
   CREATE TABLE orders (
       id SERIAL PRIMARY KEY,
       order_number VARCHAR(20) UNIQUE NOT NULL,
       total_amount DECIMAL(10, 2) NOT NULL,
       status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
       payment_method VARCHAR(50), -- card, aicha_card, sbp
       payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Таблица позиций заказа
   CREATE TABLE order_items (
       id SERIAL PRIMARY KEY,
       order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
       product_id INTEGER REFERENCES products(id),
       quantity INTEGER NOT NULL DEFAULT 1,
       price DECIMAL(10, 2) NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Таблица оценок сервиса
   CREATE TABLE ratings (
       id SERIAL PRIMARY KEY,
       order_id INTEGER REFERENCES orders(id),
       rating INTEGER CHECK (rating >= 1 AND rating <= 10),
       created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Индексы для оптимизации
   CREATE INDEX idx_orders_status ON orders(status);
   CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_products_available ON products(is_available);
   ```

3. **Создать файл с начальными данными database/seeds/initial_data.sql**
   ```sql
   -- Добавление категорий
   INSERT INTO categories (name_ru, name_zh, slug) VALUES
   ('Зелёный чай', '绿茶', 'green-tea'),
   ('Черный чай', '红茶', 'black-tea'),
   ('Улун', '乌龙茶', 'oolong-tea'),
   ('Пуэр', '普洱茶', 'puer-tea'),
   ('Кофейные напитки', '咖啡饮品', 'coffee'),
   ('Холодные напитки', '冷饮', 'cold-drinks'),
   ('Десерты', '甜点', 'desserts');
   
   -- Добавление примеров товаров (можно расширить позже)
   INSERT INTO products (category_id, name_ru, name_zh, description_ru, description_zh, price, image_url) VALUES
   (1, 'Зелёный чай Лунцзин', '龙井绿茶', 'Классический китайский зелёный чай высшего качества', '经典高品质中国绿茶', 350.00, '/images/longjing.jpg'),
   (1, 'Билочунь', '碧螺春', 'Нежный зелёный чай с весенних плантаций', '春季嫩绿茶', 420.00, '/images/biluochun.jpg'),
   (2, 'Дянь Хун', '滇红', 'Красный чай из провинции Юньнань', '云南红茶', 380.00, '/images/dianhong.jpg'),
   (3, 'Те Гуань Инь', '铁观音', 'Популярный улун с богатым вкусом', '风味浓郁的乌龙茶', 450.00, '/images/tieguanyin.jpg'),
   (4, 'Шу Пуэр 5 лет', '熟普洱5年', 'Выдержанный тёмный чай с глубоким вкусом', '陈年熟普洱', 500.00, '/images/shupuer.jpg'),
   (5, 'Капучино', '卡布奇诺', 'Классический итальянский кофе', '经典意式咖啡', 280.00, '/images/cappuccino.jpg'),
   (6, 'Холодный зелёный чай с жасмином', '茉莉冰绿茶', 'Освежающий холодный чай', '清爽冰茶', 250.00, '/images/cold-jasmine.jpg'),
   (7, 'Моти с красной фасолью', '红豆麻薯', 'Традиционный японский десерт', '传统日式甜点', 180.00, '/images/mochi.jpg');
   ```

4. **Запустить базу данных**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Проверить подключение**
   ```bash
   docker exec -it aicha-postgres psql -U aicha_user -d aicha_terminal -c "\dt"
   ```
   Должны отобразиться созданные таблицы.

6. **Загрузить начальные данные**
   ```bash
   docker exec -i aicha-postgres psql -U aicha_user -d aicha_terminal < database/seeds/initial_data.sql
   ```

**✅ Критерий завершения:** База данных создана, таблицы и начальные данные загружены

---

## 🎨 Фаза 2: Разработка Frontend (клиентская часть)

### Задача 2.1: Инициализация React проекта

#### Шаги выполнения:

1. **Создать React приложение с Vite**
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```

2. **Установить необходимые зависимости**
   ```bash
   # Основные библиотеки
   npm install react-router-dom
   
   # Для работы с API
   npm install axios
   
   # Для WebSocket (real-time обновления)
   npm install socket.io-client
   
   # Для анимаций
   npm install lottie-react
   
   # Для иконок
   npm install lucide-react
   
   # Для работы с формами (если понадобится)
   npm install react-hook-form
   
   # Dev зависимости
   npm install -D @types/node
   ```

3. **Настроить Vite конфигурацию (vite.config.ts)**
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import path from 'path'
   
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'http://localhost:8080',
           changeOrigin: true,
         },
       },
     },
   })
   ```

4. **Настроить TypeScript (tsconfig.json)**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   ```

**✅ Критерий завершения:** Проект инициализирован, зависимости установлены, можно запустить `npm run dev`

---

### Задача 2.2: Создание дизайн-системы и глобальных стилей

#### Шаги выполнения:

1. **Создать файл глобальных CSS переменных src/styles/variables.css**
   ```css
   :root {
     /* Цветовая палитра из PRD */
     --color-primary-red: #D32F2F;
     --color-primary-gold: #FFD700;
     --color-primary-green: #388E3C;
     --color-secondary-gray: #757575;
     --color-bg-white: #FFFFFF;
     --color-text-black: #212121;
     
     /* Градиенты */
     --gradient-chinese: linear-gradient(135deg, #D32F2F 0%, #FF6F00 100%);
     --gradient-tea: linear-gradient(135deg, #388E3C 0%, #66BB6A 100%);
     
     /* Тени */
     --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
     --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
     --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
     
     /* Размеры шрифтов */
     --font-size-xs: 14px;
     --font-size-sm: 16px;
     --font-size-md: 20px;
     --font-size-lg: 24px;
     --font-size-xl: 32px;
     --font-size-xxl: 48px;
     
     /* Отступы */
     --spacing-xs: 8px;
     --spacing-sm: 16px;
     --spacing-md: 24px;
     --spacing-lg: 32px;
     --spacing-xl: 48px;
     
     /* Скругления углов */
     --radius-sm: 8px;
     --radius-md: 12px;
     --radius-lg: 16px;
     
     /* Transitions */
     --transition-fast: 150ms ease;
     --transition-normal: 300ms ease;
     --transition-slow: 500ms ease;
   }
   ```

2. **Создать файл глобальных стилей src/styles/global.css**
   ```css
   @import './variables.css';
   
   /* Сброс стилей и базовые настройки */
   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }
   
   html, body {
     width: 100%;
     height: 100%;
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
   }
   
   body {
     background: var(--color-bg-white);
     color: var(--color-text-black);
     font-size: var(--font-size-sm);
     overflow: hidden; /* Для kiosk режима */
   }
   
   #root {
     width: 100%;
     height: 100%;
   }
   
   /* Стили для кнопок */
   button {
     font-family: inherit;
     cursor: pointer;
     border: none;
     outline: none;
     transition: all var(--transition-normal);
   }
   
   button:active {
     transform: scale(0.95);
   }
   
   /* Для сенсорных экранов - увеличенные области клика */
   @media (pointer: coarse) {
     button {
       min-height: 60px;
       min-width: 60px;
       padding: var(--spacing-sm) var(--spacing-md);
     }
   }
   ```

3. **Создать компонент Button src/components/Button/Button.tsx**
   ```typescript
   import React from 'react';
   import './Button.css';
   
   interface ButtonProps {
     children: React.ReactNode;
     variant?: 'primary' | 'secondary' | 'ghost';
     size?: 'small' | 'medium' | 'large';
     fullWidth?: boolean;
     onClick?: () => void;
     disabled?: boolean;
     className?: string;
   }
   
   export const Button: React.FC<ButtonProps> = ({
     children,
     variant = 'primary',
     size = 'medium',
     fullWidth = false,
     onClick,
     disabled = false,
     className = '',
   }) => {
     const classes = [
       'button',
       `button--${variant}`,
       `button--${size}`,
       fullWidth ? 'button--full-width' : '',
       className,
     ].filter(Boolean).join(' ');
   
     return (
       <button className={classes} onClick={onClick} disabled={disabled}>
         {children}
       </button>
     );
   };
   ```

4. **Создать стили для кнопки src/components/Button/Button.css**
   ```css
   .button {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     border-radius: var(--radius-md);
     font-weight: 600;
     transition: all var(--transition-normal);
     box-shadow: var(--shadow-sm);
   }
   
   .button:hover:not(:disabled) {
     box-shadow: var(--shadow-md);
     transform: translateY(-2px);
   }
   
   .button:active:not(:disabled) {
     transform: translateY(0) scale(0.95);
   }
   
   .button:disabled {
     opacity: 0.5;
     cursor: not-allowed;
   }
   
   /* Варианты */
   .button--primary {
     background: var(--gradient-chinese);
     color: white;
   }
   
   .button--secondary {
     background: var(--color-secondary-gray);
     color: white;
   }
   
   .button--ghost {
     background: transparent;
     border: 2px solid var(--color-primary-red);
     color: var(--color-primary-red);
     box-shadow: none;
   }
   
   /* Размеры */
   .button--small {
     padding: var(--spacing-xs) var(--spacing-sm);
     font-size: var(--font-size-xs);
   }
   
   .button--medium {
     padding: var(--spacing-sm) var(--spacing-md);
     font-size: var(--font-size-sm);
   }
   
   .button--large {
     padding: var(--spacing-md) var(--spacing-lg);
     font-size: var(--font-size-md);
     min-height: 70px;
   }
   
   .button--full-width {
     width: 100%;
   }
   ```

**✅ Критерий завершения:** Дизайн-система настроена, компоненты Button готовы к использованию

---

### Задача 2.3: Создание макета приложения и роутинга

#### Шаги выполнения:

1. **Создать структуру страниц в src/pages/**
   ```
   src/pages/
   ├── WelcomePage/
   │   ├── WelcomePage.tsx
   │   └── WelcomePage.css
   ├── ModeSelectorPage/
   │   ├── ModeSelectorPage.tsx
   │   └── ModeSelectorPage.css
   ├── MenuPage/
   │   ├── MenuPage.tsx
   │   └── MenuPage.css
   ├── CartPage/
   │   ├── CartPage.tsx
   │   └── CartPage.css
   ├── PaymentPage/
   │   ├── PaymentPage.tsx
   │   └── PaymentPage.css
   ├── RatingPage/
   │   ├── RatingPage.tsx
   │   └── RatingPage.css
   └── StaffPanel/
       ├── StaffPanel.tsx
       └── StaffPanel.css
   ```

2. **Создать App.tsx с роутингом**
   ```typescript
   import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { WelcomePage } from './pages/WelcomePage/WelcomePage';
   import { ModeSelectorPage } from './pages/ModeSelectorPage/ModeSelectorPage';
   import { MenuPage } from './pages/MenuPage/MenuPage';
   import { CartPage } from './pages/CartPage/CartPage';
   import { PaymentPage } from './pages/PaymentPage/PaymentPage';
   import { RatingPage } from './pages/RatingPage/RatingPage';
   import { StaffPanel } from './pages/StaffPanel/StaffPanel';
   import './styles/global.css';
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           {/* Клиентские маршруты */}
           <Route path="/" element={<WelcomePage />} />
           <Route path="/mode" element={<ModeSelectorPage />} />
           <Route path="/menu" element={<MenuPage />} />
           <Route path="/cart" element={<CartPage />} />
           <Route path="/payment" element={<PaymentPage />} />
           <Route path="/rating" element={<RatingPage />} />
           
           {/* Панель сотрудников */}
           <Route path="/staff" element={<StaffPanel />} />
           
           {/* Redirect неизвестных путей */}
           <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
       </BrowserRouter>
     );
   }
   
   export default App;
   ```

3. **Создать Context для корзины src/context/CartContext.tsx**
   ```typescript
   import React, { createContext, useContext, useState, ReactNode } from 'react';
   
   interface Product {
     id: number;
     name_ru: string;
     name_zh: string;
     price: number;
     image_url?: string;
   }
   
   interface CartItem extends Product {
     quantity: number;
   }
   
   interface CartContextType {
     items: CartItem[];
     addItem: (product: Product) => void;
     removeItem: (productId: number) => void;
     updateQuantity: (productId: number, quantity: number) => void;
     clearCart: () => void;
     totalAmount: number;
     itemCount: number;
   }
   
   const CartContext = createContext<CartContextType | undefined>(undefined);
   
   export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
     const [items, setItems] = useState<CartItem[]>([]);
   
     const addItem = (product: Product) => {
       setItems((prev) => {
         const existingItem = prev.find((item) => item.id === product.id);
         if (existingItem) {
           return prev.map((item) =>
             item.id === product.id
               ? { ...item, quantity: item.quantity + 1 }
               : item
           );
         }
         return [...prev, { ...product, quantity: 1 }];
       });
     };
   
     const removeItem = (productId: number) => {
       setItems((prev) => prev.filter((item) => item.id !== productId));
     };
   
     const updateQuantity = (productId: number, quantity: number) => {
       if (quantity <= 0) {
         removeItem(productId);
         return;
       }
       setItems((prev) =>
         prev.map((item) =>
           item.id === productId ? { ...item, quantity } : item
         )
       );
     };
   
     const clearCart = () => {
       setItems([]);
     };
   
     const totalAmount = items.reduce(
       (sum, item) => sum + item.price * item.quantity,
       0
     );
   
     const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
   
     return (
       <CartContext.Provider
         value={{
           items,
           addItem,
           removeItem,
           updateQuantity,
           clearCart,
           totalAmount,
           itemCount,
         }}
       >
         {children}
       </CartContext.Provider>
     );
   };
   
   export const useCart = () => {
     const context = useContext(CartContext);
     if (!context) {
       throw new Error('useCart must be used within CartProvider');
     }
     return context;
   };
   ```

4. **Обернуть приложение в Provider в main.tsx**
   ```typescript
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import App from './App.tsx'
   import { CartProvider } from './context/CartContext'
   
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <CartProvider>
         <App />
       </CartProvider>
     </React.StrictMode>,
   )
   ```

**✅ Критерий завершения:** Роутинг настроен, Context для корзины работает

---

### Задача 2.4: Разработка приветственного экрана (WelcomePage)

#### Шаги выполнения:

1. **Создать страницу WelcomePage.tsx**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   import { useEffect } from 'react';
   import './WelcomePage.css';
   
   export const WelcomePage = () => {
     const navigate = useNavigate();
   
     // Автоматический переход через 10 секунд
     useEffect(() => {
       const timeout = setTimeout(() => {
         navigate('/mode');
       }, 10000);
   
       return () => clearTimeout(timeout);
     }, [navigate]);
   
     const handleTouch = () => {
       navigate('/mode');
     };
   
     return (
       <div className="welcome-page" onClick={handleTouch}>
         <div className="welcome-content">
           <img 
             src="/images/logo.png" 
             alt="AI-Cha Logo" 
             className="welcome-logo"
           />
           <h1 className="welcome-title-ru">Добро пожаловать в AI Cha!</h1>
           <h2 className="welcome-title-zh">欢迎来到爱茶!</h2>
           <p className="welcome-hint">Коснитесь экрана для начала</p>
         </div>
       </div>
     );
   };
   ```

2. **Создать стили WelcomePage.css**
   ```css
   .welcome-page {
     width: 100%;
     height: 100vh;
     background: var(--gradient-chinese);
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     position: relative;
     overflow: hidden;
   }
   
   /* Анимированный фон с китайскими мотивами */
   .welcome-page::before {
     content: '';
     position: absolute;
     top: -50%;
     left: -50%;
     width: 200%;
     height: 200%;
     background: 
       radial-gradient(circle, rgba(255, 215, 0, 0.1) 1%, transparent 1%),
       radial-gradient(circle, rgba(255, 215, 0, 0.1) 1%, transparent 1%);
     background-size: 80px 80px;
     background-position: 0 0, 40px 40px;
     animation: float 20s linear infinite;
   }
   
   @keyframes float {
     0% {
       transform: translate(0, 0);
     }
     100% {
       transform: translate(40px, 40px);
     }
   }
   
   .welcome-content {
     position: relative;
     z-index: 1;
     text-align: center;
     animation: fadeInUp 1s ease-out;
   }
   
   @keyframes fadeInUp {
     from {
       opacity: 0;
       transform: translateY(30px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   
   .welcome-logo {
     width: 200px;
     height: auto;
     margin-bottom: var(--spacing-xl);
     animation: pulse 2s ease-in-out infinite;
   }
   
   @keyframes pulse {
     0%, 100% {
       transform: scale(1);
     }
     50% {
       transform: scale(1.05);
     }
   }
   
   .welcome-title-ru {
     font-size: var(--font-size-xxl);
     font-weight: 700;
     color: white;
     margin-bottom: var(--spacing-sm);
     text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   }
   
   .welcome-title-zh {
     font-size: var(--font-size-xl);
     font-weight: 600;
     color: rgba(255, 255, 255, 0.9);
     margin-bottom: var(--spacing-xl);
     text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
   }
   
   .welcome-hint {
     font-size: var(--font-size-md);
     color: rgba(255, 255, 255, 0.7);
     animation: blink 2s ease-in-out infinite;
   }
   
   @keyframes blink {
     0%, 100% {
       opacity: 0.7;
     }
     50% {
       opacity: 1;
     }
   }
   ```

> **⚠️ ПРИМЕЧАНИЕ:** Вам нужно добавить логотип AI-Cha в папку `public/images/logo.png`

**✅ Критерий завершения:** Приветственный экран работает с автопереходом и по касанию

---

### Задача 2.5: Разработка экрана выбора режима (ModeSelectorPage)

#### Шаги выполнения:

1. **Создать анимацию для центра экрана**
   - Скачать или создать lottie-анимацию для нейро-облака/чайной темы
   - Сохранить JSON анимации в `src/assets/animations/tea-cloud.json`
   - Альтернатива: можно использовать готовые анимации с https://lottiefiles.com/

2. **Создать страницу ModeSelectorPage.tsx**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   import Lottie from 'lottie-react';
   import { Button } from '@/components/Button/Button';
   import teaCloudAnimation from '@/assets/animations/tea-cloud.json';
   import './ModeSelectorPage.css';
   
   export const ModeSelectorPage = () => {
     const navigate = useNavigate();
   
     const handleAIMode = () => {
       // TODO: В следующей фазе добавим AI-диалог
       // Пока перенаправляем на обычное меню
       alert('AI-подбор будет доступен в следующей версии!');
       navigate('/menu');
     };
   
     const handleRegularOrder = () => {
       navigate('/menu');
     };
   
     return (
       <div className="mode-selector-page">
         <div className="mode-animation">
           <Lottie 
             animationData={teaCloudAnimation} 
             loop 
             className="lottie-animation"
           />
         </div>
         
         <div className="mode-buttons">
           <Button
             variant="primary"
             size="large"
             fullWidth
             onClick={handleAIMode}
             className="mode-button mode-button--ai"
           >
             <span className="button-text-ru">Подобрать товар</span>
             <span className="button-text-zh">推荐商品</span>
           </Button>
           
           <Button
             variant="secondary"
             size="large"
             fullWidth
             onClick={handleRegularOrder}
             className="mode-button mode-button--regular"
           >
             <span className="button-text-ru">Обычный заказ</span>
             <span className="button-text-zh">常规订单</span>
           </Button>
         </div>
       </div>
     );
   };
   ```

3. **Создать стили ModeSelectorPage.css**
   ```css
   .mode-selector-page {
     width: 100%;
     height: 100vh;
     background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: space-between;
     padding: var(--spacing-xl) var(--spacing-lg);
   }
   
   .mode-animation {
     flex: 1;
     display: flex;
     align-items: center;
     justify-content: center;
     max-width: 500px;
     width: 100%;
   }
   
   .lottie-animation {
     width: 100%;
     height: 100%;
   }
   
   .mode-buttons {
     width: 100%;
     max-width: 600px;
     display: flex;
     flex-direction: column;
     gap: var(--spacing-md);
   }
   
   .mode-button {
     display: flex;
     flex-direction: column;
     gap: var(--spacing-xs);
     padding: var(--spacing-lg) !important;
   }
   
   .mode-button--ai {
     background: var(--gradient-chinese) !important;
     box-shadow: var(--shadow-lg) !important;
   }
   
   .mode-button--regular {
     opacity: 0.7;
   }
   
   .button-text-ru {
     font-size: var(--font-size-lg);
     font-weight: 700;
   }
   
   .button-text-zh {
     font-size: var(--font-size-md);
     font-weight: 500;
     opacity: 0.9;
   }
   ```

**✅ Критерий завершения:** Экран выбора режима работает, кнопки перенаправляют на меню

---

### Задача 2.6: Разработка страницы меню (MenuPage)

Эта задача большая, поэтому разобьем на подзадачи.

#### Подзадача 2.6.1: Создание API клиента для товаров

1. **Создать API клиент src/api/products.ts**
   ```typescript
   import axios from 'axios';
   
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
   
   export interface Category {
     id: number;
     name_ru: string;
     name_zh: string;
     slug: string;
   }
   
   export interface Product {
     id: number;
     category_id: number;
     name_ru: string;
     name_zh: string;
     description_ru: string;
     description_zh: string;
     price: number;
     image_url: string;
     is_available: boolean;
   }
   
   export const productsApi = {
     // Получить все категории
     getCategories: async (): Promise<Category[]> => {
       const response = await axios.get(`${API_BASE_URL}/categories`);
       return response.data;
     },
   
     // Получить все товары
     getProducts: async (): Promise<Product[]> => {
       const response = await axios.get(`${API_BASE_URL}/products`);
       return response.data;
     },
   
     // Получить товары по категории
     getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
       const response = await axios.get(`${API_BASE_URL}/products`, {
         params: { category_id: categoryId },
       });
       return response.data;
     },
   };
   ```

2. **Создать .env файл в корне frontend/**
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

#### Подзадача 2.6.2: Создание компонента карточки товара

1. **Создать ProductCard.tsx в src/components/ProductCard/**
   ```typescript
   import { Button } from '@/components/Button/Button';
   import { Plus } from 'lucide-react';
   import type { Product } from '@/api/products';
   import './ProductCard.css';
   
   interface ProductCardProps {
     product: Product;
     onAddToCart: (product: Product) => void;
   }
   
   export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
     return (
       <div className="product-card">
         <div className="product-image-container">
           <img 
             src={product.image_url || '/images/placeholder.jpg'} 
             alt={product.name_ru}
             className="product-image"
           />
         </div>
         
         <div className="product-info">
           <h3 className="product-name-ru">{product.name_ru}</h3>
           <p className="product-name-zh">{product.name_zh}</p>
           <p className="product-description">{product.description_ru}</p>
           
           <div className="product-footer">
             <span className="product-price">{product.price} ₽</span>
             <Button
               variant="primary"
               size="small"
               onClick={() => onAddToCart(product)}
               disabled={!product.is_available}
             >
               <Plus size={20} />
               <span>Добавить</span>
             </Button>
           </div>
         </div>
       </div>
     );
   };
   ```

2. **Создать стили ProductCard.css**
   ```css
   .product-card {
     background: white;
     border-radius: var(--radius-lg);
     overflow: hidden;
     box-shadow: var(--shadow-sm);
     transition: all var(--transition-normal);
     display: flex;
     flex-direction: column;
     height: 100%;
   }
   
   .product-card:hover {
     box-shadow: var(--shadow-md);
     transform: translateY(-4px);
   }
   
   .product-image-container {
     width: 100%;
     aspect-ratio: 1;
     overflow: hidden;
     background: #f5f5f5;
   }
   
   .product-image {
     width: 100%;
     height: 100%;
     object-fit: cover;
   }
   
   .product-info {
     padding: var(--spacing-sm);
     display: flex;
     flex-direction: column;
     gap: var(--spacing-xs);
     flex: 1;
   }
   
   .product-name-ru {
     font-size: var(--font-size-md);
     font-weight: 600;
     color: var(--color-text-black);
   }
   
   .product-name-zh {
     font-size: var(--font-size-sm);
     color: var(--color-secondary-gray);
   }
   
   .product-description {
     font-size: var(--font-size-xs);
     color: var(--color-secondary-gray);
     line-height: 1.4;
     flex: 1;
   }
   
   .product-footer {
     display: flex;
     align-items: center;
     justify-content: space-between;
     margin-top: auto;
   }
   
   .product-price {
     font-size: var(--font-size-lg);
     font-weight: 700;
     color: var(--color-primary-red);
   }
   ```

#### Подзадача 2.6.3: Создание страницы меню

1. **Создать MenuPage.tsx**
   ```typescript
   import { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { ShoppingCart } from 'lucide-react';
   import { productsApi, Category, Product } from '@/api/products';
   import { ProductCard } from '@/components/ProductCard/ProductCard';
   import { useCart } from '@/context/CartContext';
   import { Button } from '@/components/Button/Button';
   import './MenuPage.css';
   
   export const MenuPage = () => {
     const navigate = useNavigate();
     const { addItem, itemCount } = useCart();
     const [categories, setCategories] = useState<Category[]>([]);
     const [products, setProducts] = useState<Product[]>([]);
     const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
     const [loading, setLoading] = useState(true);
   
     useEffect(() => {
       loadData();
     }, []);
   
     const loadData = async () => {
       try {
         setLoading(true);
         const [categoriesData, productsData] = await Promise.all([
           productsApi.getCategories(),
           productsApi.getProducts(),
         ]);
         setCategories(categoriesData);
         setProducts(productsData);
       } catch (error) {
         console.error('Ошибка загрузки данных:', error);
       } finally {
         setLoading(false);
       }
     };
   
     const filteredProducts = selectedCategory
       ? products.filter((p) => p.category_id === selectedCategory)
       : products;
   
     const handleAddToCart = (product: Product) => {
       addItem(product);
       // Небольшая анимация или уведомление
     };
   
     if (loading) {
       return <div className="menu-loading">Загрузка меню...</div>;
     }
   
     return (
       <div className="menu-page">
         <header className="menu-header">
           <h1 className="menu-title">
             <span className="title-ru">Меню</span>
             <span className="title-zh">菜单</span>
           </h1>
           
           <button 
             className="cart-button"
             onClick={() => navigate('/cart')}
           >
             <ShoppingCart size={24} />
             {itemCount > 0 && (
               <span className="cart-badge">{itemCount}</span>
             )}
           </button>
         </header>
   
         <div className="categories-tabs">
           <button
             className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
             onClick={() => setSelectedCategory(null)}
           >
             Все товары
           </button>
           {categories.map((category) => (
             <button
               key={category.id}
               className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
               onClick={() => setSelectedCategory(category.id)}
             >
               <span className="category-name-ru">{category.name_ru}</span>
               <span className="category-name-zh">{category.name_zh}</span>
             </button>
           ))}
         </div>
   
         <div className="products-grid">
           {filteredProducts.map((product) => (
             <ProductCard
               key={product.id}
               product={product}
               onAddToCart={handleAddToCart}
             />
           ))}
         </div>
   
         {itemCount > 0 && (
           <div className="checkout-bar">
             <Button
               variant="primary"
               size="large"
               fullWidth
               onClick={() => navigate('/cart')}
             >
               Перейти к оформлению ({itemCount} товар{itemCount > 1 ? 'а' : ''})
             </Button>
           </div>
         )}
       </div>
     );
   };
   ```

2. **Создать стили MenuPage.css**
   ```css
   .menu-page {
     width: 100%;
     min-height: 100vh;
     background: #f9f9f9;
     display: flex;
     flex-direction: column;
     padding-bottom: 100px; /* Место для кнопки оформления */
   }
   
   .menu-header {
     background: white;
     padding: var(--spacing-md) var(--spacing-lg);
     box-shadow: var(--shadow-sm);
     display: flex;
     justify-content: space-between;
     align-items: center;
     position: sticky;
     top: 0;
     z-index: 10;
   }
   
   .menu-title {
     display: flex;
     flex-direction: column;
   }
   
   .title-ru {
     font-size: var(--font-size-xl);
     font-weight: 700;
     color: var(--color-text-black);
   }
   
   .title-zh {
     font-size: var(--font-size-md);
     color: var(--color-secondary-gray);
   }
   
   .cart-button {
     position: relative;
     background: var(--color-primary-red);
     color: white;
     width: 60px;
     height: 60px;
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     box-shadow: var(--shadow-md);
   }
   
   .cart-badge {
     position: absolute;
     top: -5px;
     right: -5px;
     background: var(--color-primary-gold);
     color: var(--color-text-black);
     font-size: 12px;
     font-weight: 700;
     padding: 4px 8px;
     border-radius: 12px;
     min-width: 24px;
     text-align: center;
   }
   
   .categories-tabs {
     display: flex;
     gap: var(--spacing-sm);
     padding: var(--spacing-md) var(--spacing-lg);
     overflow-x: auto;
     background: white;
     border-bottom: 1px solid #e0e0e0;
   }
   
   .category-tab {
     flex-shrink: 0;
     padding: var(--spacing-sm) var(--spacing-md);
     background: #f5f5f5;
     border-radius: var(--radius-md);
     border: 2px solid transparent;
     transition: all var(--transition-normal);
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 4px;
   }
   
   .category-tab.active {
     background: var(--color-primary-red);
     color: white;
   }
   
   .category-name-ru {
     font-weight: 600;
     font-size: var(--font-size-sm);
   }
   
   .category-name-zh {
     font-size: var(--font-size-xs);
     opacity: 0.8;
   }
   
   .products-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
     gap: var(--spacing-md);
     padding: var(--spacing-lg);
   }
   
   .checkout-bar {
     position: fixed;
     bottom: 0;
     left: 0;
     right: 0;
     background: white;
     padding: var(--spacing-md) var(--spacing-lg);
     box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
     z-index: 100;
   }
   
   .menu-loading {
     width: 100%;
     height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: var(--font-size-lg);
     color: var(--color-secondary-gray);
   }
   ```

**✅ Критерий завершения:** Страница меню отображает товары из API, работает фильтрация по категориям, товары добавляются в корзину

---

### Задача 2.7: Разработка страницы корзины (CartPage)

#### Шаги выполнения:

1. **Создать компонент CartItem src/components/CartItem/CartItem.tsx**
   ```typescript
   import { Trash2, Plus, Minus } from 'lucide-react';
   import './CartItem.css';
   
   interface CartItemProps {
     id: number;
     name_ru: string;
     name_zh: string;
     price: number;
     quantity: number;
     image_url?: string;
     onUpdateQuantity: (id: number, quantity: number) => void;
     onRemove: (id: number) => void;
   }
   
   export const CartItem: React.FC<CartItemProps> = ({
     id,
     name_ru,
     name_zh,
     price,
     quantity,
     image_url,
     onUpdateQuantity,
     onRemove,
   }) => {
     return (
       <div className="cart-item">
         <img 
           src={image_url || '/images/placeholder.jpg'} 
           alt={name_ru}
           className="cart-item-image"
         />
         
         <div className="cart-item-info">
           <h3 className="cart-item-name-ru">{name_ru}</h3>
           <p className="cart-item-name-zh">{name_zh}</p>
           <p className="cart-item-price">{price} ₽</p>
         </div>
         
         <div className="cart-item-controls">
           <div className="quantity-controls">
             <button 
               className="quantity-btn"
               onClick={() => onUpdateQuantity(id, quantity - 1)}
             >
               <Minus size={16} />
             </button>
             <span className="quantity-value">{quantity}</span>
             <button 
               className="quantity-btn"
               onClick={() => onUpdateQuantity(id, quantity + 1)}
             >
               <Plus size={16} />
             </button>
           </div>
           
           <button 
             className="remove-btn"
             onClick={() => onRemove(id)}
           >
             <Trash2 size={20} />
           </button>
         </div>
         
         <div className="cart-item-total">
           {(price * quantity).toFixed(2)} ₽
         </div>
       </div>
     );
   };
   ```

2. **Создать стили CartItem.css**
   ```css
   .cart-item {
     background: white;
     border-radius: var(--radius-md);
     padding: var(--spacing-sm);
     display: grid;
     grid-template-columns: 80px 1fr auto auto;
     gap: var(--spacing-sm);
     align-items: center;
     box-shadow: var(--shadow-sm);
   }
   
   .cart-item-image {
     width: 80px;
     height: 80px;
     object-fit: cover;
     border-radius: var(--radius-sm);
   }
   
   .cart-item-info {
     display: flex;
     flex-direction: column;
     gap: 4px;
   }
   
   .cart-item-name-ru {
     font-size: var(--font-size-sm);
     font-weight: 600;
   }
   
   .cart-item-name-zh {
     font-size: var(--font-size-xs);
     color: var(--color-secondary-gray);
   }
   
   .cart-item-price {
     font-size: var(--font-size-sm);
     color: var(--color-primary-red);
     font-weight: 600;
   }
   
   .cart-item-controls {
     display: flex;
     flex-direction: column;
     gap: var(--spacing-xs);
   }
   
   .quantity-controls {
     display: flex;
     align-items: center;
     gap: 8px;
     background: #f5f5f5;
     padding: 4px;
     border-radius: var(--radius-sm);
   }
   
   .quantity-btn {
     width: 32px;
     height: 32px;
     border-radius: 50%;
     background: white;
     display: flex;
     align-items: center;
     justify-content: center;
     box-shadow: var(--shadow-sm);
   }
   
   .quantity-value {
     min-width: 30px;
     text-align: center;
     font-weight: 600;
   }
   
   .remove-btn {
     background: transparent;
     color: var(--color-secondary-gray);
     padding: var(--spacing-xs);
   }
   
   .remove-btn:hover {
     color: var(--color-primary-red);
   }
   
   .cart-item-total {
     font-size: var(--font-size-lg);
     font-weight: 700;
     color: var(--color-text-black);
     text-align: right;
     min-width: 100px;
   }
   ```

3. **Создать CartPage.tsx**
   ```typescript
   import { useNavigate } from 'react-router-dom';
   import { ArrowLeft } from 'lucide-react';
   import { useCart } from '@/context/CartContext';
   import { CartItem } from '@/components/CartItem/CartItem';
   import { Button } from '@/components/Button/Button';
   import './CartPage.css';
   
   export const CartPage = () => {
     const navigate = useNavigate();
     const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
   
     if (items.length === 0) {
       return (
         <div className="cart-empty">
           <h2>Корзина пуста</h2>
           <p>Добавьте товары из меню</p>
           <Button onClick={() => navigate('/menu')}>
             Перейти к меню
           </Button>
         </div>
       );
     }
   
     return (
       <div className="cart-page">
         <header className="cart-header">
           <button className="back-btn" onClick={() => navigate('/menu')}>
             <ArrowLeft size={24} />
           </button>
           <h1 className="cart-title">
             <span className="title-ru">Корзина</span>
             <span className="title-zh">购物车</span>
           </h1>
           <button className="clear-btn" onClick={clearCart}>
             Очистить
           </button>
         </header>
   
         <div className="cart-items">
           {items.map((item) => (
             <CartItem
               key={item.id}
               id={item.id}
               name_ru={item.name_ru}
               name_zh={item.name_zh}
               price={item.price}
               quantity={item.quantity}
               image_url={item.image_url}
               onUpdateQuantity={updateQuantity}
               onRemove={removeItem}
             />
           ))}
         </div>
   
         <div className="cart-summary">
           <div className="summary-row">
             <span>Итого товаров:</span>
             <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
           </div>
           <div className="summary-row total">
             <span>К оплате:</span>
             <span>{totalAmount.toFixed(2)} ₽</span>
           </div>
         </div>
   
         <div className="cart-actions">
           <Button
             variant="ghost"
             size="large"
             fullWidth
             onClick={() => navigate('/menu')}
           >
             Добавить ещё
           </Button>
           <Button
             variant="primary"
             size="large"
             fullWidth
             onClick={() => navigate('/payment')}
           >
             Перейти к оплате
           </Button>
         </div>
       </div>
     );
   };
   ```

4. **Создать стили CartPage.css**
   ```css
   .cart-page {
     width: 100%;
     min-height: 100vh;
     background: #f9f9f9;
     display: flex;
     flex-direction: column;
   }
   
   .cart-header {
     background: white;
     padding: var(--spacing-md) var(--spacing-lg);
     box-shadow: var(--shadow-sm);
     display: flex;
     justify-content: space-between;
     align-items: center;
   }
   
   .back-btn {
     background: transparent;
     padding: var(--spacing-xs);
   }
   
   .clear-btn {
     background: transparent;
     color: var(--color-primary-red);
     padding: var(--spacing-xs) var(--spacing-sm);
   }
   
   .cart-items {
     flex: 1;
     padding: var(--spacing-lg);
     display: flex;
     flex-direction: column;
     gap: var(--spacing-sm);
   }
   
   .cart-summary {
     background: white;
     padding: var(--spacing-lg);
     border-top: 1px solid #e0e0e0;
   }
   
   .summary-row {
     display: flex;
     justify-content: space-between;
     padding: var(--spacing-sm) 0;
     font-size: var(--font-size-md);
   }
   
   .summary-row.total {
     border-top: 2px solid var(--color-primary-red);
     font-size: var(--font-size-lg);
     font-weight: 700;
     color: var(--color-primary-red);
     padding-top: var(--spacing-md);
   }
   
   .cart-actions {
     padding: var(--spacing-lg);
     background: white;
     display: flex;
     gap: var(--spacing-sm);
     box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
   }
   
   .cart-empty {
     width: 100%;
     height: 100vh;
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: var(--spacing-md);
     text-align: center;
   }
   ```

**✅ Критерий завершения:** Корзина работает, можно изменять количество, удалять товары, переходить к оплате

---

## ⏸️ ТОЧКА ОСТАНОВКИ №1

**Вы успешно завершили первую часть Frontend разработки!**

На этом этапе у вас должно быть:
- ✅ Приветственный экран
- ✅ Экран выбора режима
- ✅ Страница меню с категориями
- ✅ Корзина с управлением товарами

**Что нужно сделать перед продолжением:**
1. Протестировать все созданные страницы
2. Убедиться, что навигация работает
3. Проверить, что корзина сохраняет товары

**Следующие шаги:** Разработка страниц оплаты, оценки и панели для сотрудников.

---

### Задача 2.8: Разработка страницы оплаты (PaymentPage)

#### Шаги выполнения:

1. **Создать PaymentPage.tsx**
   ```typescript
   import { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { CreditCard, Smartphone, QrCode } from 'lucide-react';
   import { useCart } from '@/context/CartContext';
   import { Button } from '@/components/Button/Button';
   import './PaymentPage.css';
   
   type PaymentMethod = 'card' | 'aicha_card' | 'sbp';
   
   export const PaymentPage = () => {
     const navigate = useNavigate();
     const { totalAmount, clearCart } = useCart();
     const [processing, setProcessing] = useState(false);
   
     const handlePayment = async (method: PaymentMethod) => {
       setProcessing(true);
       
       // Имитация обработки платежа (заглушка)
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       // Очищаем корзину
       clearCart();
       
       // Переходим к странице оценки
       navigate('/rating');
     };
   
     return (
       <div className="payment-page">
         <div className="payment-container">
           <h1 className="payment-title">
             <span className="title-ru">Оплата заказа</span>
             <span className="title-zh">订单支付</span>
           </h1>
   
           <div className="payment-amount">
             <span className="amount-label">К оплате:</span>
             <span className="amount-value">{totalAmount.toFixed(2)} ₽</span>
           </div>
   
           <div className="payment-methods">
             <button 
               className="payment-method-btn"
               onClick={() => handlePayment('card')}
               disabled={processing}
             >
               <CreditCard size={48} />
               <span className="method-name-ru">Банковская карта</span>
               <span className="method-name-zh">银行卡</span>
             </button>
   
             <button 
               className="payment-method-btn"
               onClick={() => handlePayment('aicha_card')}
               disabled={processing}
             >
               <Smartphone size={48} />
               <span className="method-name-ru">Карта AI Cha</span>
               <span className="method-name-zh">爱茶卡</span>
             </button>
   
             <button 
               className="payment-method-btn"
               onClick={() => handlePayment('sbp')}
               disabled={processing}
             >
               <QrCode size={48} />
               <span className="method-name-ru">СБП (QR-код)</span>
               <span className="method-name-zh">快速支付</span>
             </button>
           </div>
   
           {processing && (
             <div className="processing-overlay">
               <div className="spinner"></div>
               <p>Обработка платежа...</p>
             </div>
           )}
   
           <Button
             variant="ghost"
             size="medium"
             fullWidth
             onClick={() => navigate('/cart')}
             disabled={processing}
           >
             Вернуться к корзине
           </Button>
   
           <p className="payment-note">
             ⚠️ Примечание: Это демо-версия. Реальная оплата будет подключена позже.
           </p>
         </div>
       </div>
     );
   };
   ```

2. **Создать стили PaymentPage.css**
   ```css
   .payment-page {
     width: 100%;
     min-height: 100vh;
     background: var(--gradient-chinese);
     display: flex;
     align-items: center;
     justify-content: center;
     padding: var(--spacing-lg);
   }
   
   .payment-container {
     background: white;
     border-radius: var(--radius-lg);
     padding: var(--spacing-xl);
     max-width: 600px;
     width: 100%;
     box-shadow: var(--shadow-lg);
   }
   
   .payment-title {
     text-align: center;
     margin-bottom: var(--spacing-xl);
     display: flex;
     flex-direction: column;
     gap: var(--spacing-xs);
   }
   
   .payment-amount {
     background: #f5f5f5;
     padding: var(--spacing-lg);
     border-radius: var(--radius-md);
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: var(--spacing-xl);
   }
   
   .amount-label {
     font-size: var(--font-size-md);
     color: var(--color-secondary-gray);
   }
   
   .amount-value {
     font-size: var(--font-size-xxl);
     font-weight: 700;
     color: var(--color-primary-red);
   }
   
   .payment-methods {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
     gap: var(--spacing-md);
     margin-bottom: var(--spacing-xl);
   }
   
   .payment-method-btn {
     background: white;
     border: 2px solid #e0e0e0;
     border-radius: var(--radius-md);
     padding: var(--spacing-lg);
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: var(--spacing-sm);
     transition: all var(--transition-normal);
     cursor: pointer;
     min-height: 180px;
   }
   
   .payment-method-btn:hover:not(:disabled) {
     border-color: var(--color-primary-red);
     transform: translateY(-4px);
     box-shadow: var(--shadow-md);
   }
   
   .payment-method-btn:disabled {
     opacity: 0.5;
     cursor: not-allowed;
   }
   
   .payment-method-btn svg {
     color: var(--color-primary-red);
   }
   
   .method-name-ru {
     font-size: var(--font-size-sm);
     font-weight: 600;
     text-align: center;
   }
   
   .method-name-zh {
     font-size: var(--font-size-xs);
     color: var(--color-secondary-gray);
     text-align: center;
   }
   
   .processing-overlay {
     position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: rgba(0, 0, 0, 0.7);
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: var(--spacing-md);
     color: white;
     font-size: var(--font-size-lg);
     z-index: 1000;
   }
   
   .spinner {
     width: 60px;
     height: 60px;
     border: 4px solid rgba(255, 255, 255, 0.3);
     border-top-color: white;
     border-radius: 50%;
     animation: spin 1s linear infinite;
   }
   
   @keyframes spin {
     to { transform: rotate(360deg); }
   }
   
   .payment-note {
     margin-top: var(--spacing-md);
     text-align: center;
     font-size: var(--font-size-xs);
     color: var(--color-secondary-gray);
     font-style: italic;
   }
   ```

**✅ Критерий завершения:** Страница оплаты работает с заглушками, переходит к оценке после "оплаты"

---

### Задача 2.9: Разработка страницы оценки сервиса (RatingPage)

#### Шаги выполнения:

1. **Создать RatingPage.tsx**
   ```typescript
   import { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { Star } from 'lucide-react';
   import { Button } from '@/components/Button/Button';
   import './RatingPage.css';
   
   export const RatingPage = () => {
     const navigate = useNavigate();
     const [rating, setRating] = useState<number | null>(null);
     const [hoverRating, setHoverRating] = useState<number | null>(null);
     const [submitted, setSubmitted] = useState(false);
   
     const handleRatingClick = (value: number) => {
       setRating(value);
     };
   
     const handleSubmit = async () => {
       if (rating) {
         // TODO: Отправить оценку на сервер
         console.log('Оценка:', rating);
         setSubmitted(true);
         
         // Через 2 секунды вернуться на главную
         setTimeout(() => {
           navigate('/');
         }, 2000);
       }
     };
   
     const handleSkip = () => {
       navigate('/');
     };
   
     if (submitted) {
       return (
         <div className="rating-page">
           <div className="rating-container">
             <div className="success-animation">✓</div>
             <h2 className="success-title">Спасибо за отзыв!</h2>
             <p className="success-message">Возврат на главную...</p>
           </div>
         </div>
       );
     }
   
     return (
       <div className="rating-page">
         <div className="rating-container">
           <h1 className="rating-title">
             <span className="title-ru">Как вы оцените процесс заказа в AI Cha?</span>
             <span className="title-zh">您如何评价爱茶的订餐流程？</span>
           </h1>
   
           <div className="stars-container">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
               <button
                 key={value}
                 className={`star-btn ${value <= (hoverRating || rating || 0) ? 'active' : ''}`}
                 onClick={() => handleRatingClick(value)}
                 onMouseEnter={() => setHoverRating(value)}
                 onMouseLeave={() => setHoverRating(null)}
               >
                 <Star 
                   size={48} 
                   fill={value <= (hoverRating || rating || 0) ? 'currentColor' : 'none'}
                 />
                 <span className="star-number">{value}</span>
               </button>
             ))}
           </div>
   
           {rating && (
             <p className="rating-text">
               {rating <= 3 && 'Нам жаль, что вам не понравилось 😢'}
               {rating > 3 && rating <= 6 && 'Спасибо за оценку! Мы будем улучшаться 🙂'}
               {rating > 6 && rating <= 8 && 'Отлично! Рады, что вам понравилось 😊'}
               {rating > 8 && 'Превосходно! Вы сделали наш день! 🎉'}
             </p>
           )}
   
           <div className="rating-actions">
             <Button
               variant="primary"
               size="large"
               fullWidth
               onClick={handleSubmit}
               disabled={!rating}
             >
               Отправить оценку
             </Button>
             <Button
               variant="ghost"
               size="medium"
               fullWidth
               onClick={handleSkip}
             >
               Пропустить
             </Button>
           </div>
         </div>
       </div>
     );
   };
   ```

2. **Создать стили RatingPage.css**
   ```css
   .rating-page {
     width: 100%;
     min-height: 100vh;
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     display: flex;
     align-items: center;
     justify-content: center;
     padding: var(--spacing-lg);
   }
   
   .rating-container {
     background: white;
     border-radius: var(--radius-lg);
     padding: var(--spacing-xl);
     max-width: 800px;
     width: 100%;
     box-shadow: var(--shadow-lg);
     text-align: center;
   }
   
   .rating-title {
     margin-bottom: var(--spacing-xl);
     display: flex;
     flex-direction: column;
     gap: var(--spacing-sm);
   }
   
   .stars-container {
     display: flex;
     justify-content: center;
     gap: var(--spacing-sm);
     margin-bottom: var(--spacing-lg);
     flex-wrap: wrap;
   }
   
   .star-btn {
     background: transparent;
     border: none;
     cursor: pointer;
     padding: var(--spacing-xs);
     transition: all var(--transition-fast);
     position: relative;
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 4px;
   }
   
   .star-btn svg {
     color: #ddd;
     transition: all var(--transition-fast);
   }
   
   .star-btn.active svg {
     /* Градиент от красного к зеленому */
     color: #ffd700;
     transform: scale(1.1);
   }
   
   .star-btn:nth-child(-n+3).active svg {
     color: #ff4444; /* Красный для 1-3 */
   }
   
   .star-btn:nth-child(n+4):nth-child(-n+6).active svg {
     color: #ffaa00; /* Оранжевый для 4-6 */
   }
   
   .star-btn:nth-child(n+7):nth-child(-n+8).active svg {
     color: #ffd700; /* Золотой для 7-8 */
   }
   
   .star-btn:nth-child(n+9).active svg {
     color: #44ff44; /* Зеленый для 9-10 */
   }
   
   .star-btn:hover {
     transform: scale(1.2);
   }
   
   .star-number {
     font-size: var(--font-size-xs);
     font-weight: 600;
     color: var(--color-secondary-gray);
   }
   
   .rating-text {
     font-size: var(--font-size-lg);
     color: var(--color-text-black);
     margin-bottom: var(--spacing-lg);
     min-height: 40px;
     animation: fadeIn 0.3s ease;
   }
   
   @keyframes fadeIn {
     from { opacity: 0; transform: translateY(-10px); }
     to { opacity: 1; transform: translateY(0); }
   }
   
   .rating-actions {
     display: flex;
     flex-direction: column;
     gap: var(--spacing-sm);
   }
   
   .success-animation {
     width: 100px;
     height: 100px;
     background: var(--color-primary-green);
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     font-size: 60px;
     color: white;
     margin: 0 auto var(--spacing-lg);
     animation: successPop 0.5s ease;
   }
   
   @keyframes successPop {
     0% { transform: scale(0); }
     50% { transform: scale(1.2); }
     100% { transform: scale(1); }
   }
   
   .success-title {
     font-size: var(--font-size-xl);
     color: var(--color-primary-green);
     margin-bottom: var(--spacing-sm);
   }
   
   .success-message {
     font-size: var(--font-size-md);
     color: var(--color-secondary-gray);
   }
   ```

**✅ Критерий завершения:** Страница оценки работает, отправляет оценку (пока в консоль) и возвращает на главную

---

### Задача 2.10: Разработка панели для сотрудников (StaffPanel)

#### Шаги выполнения:

1. **Создать API для заказов src/api/orders.ts**
   ```typescript
   import axios from 'axios';
   
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
   
   export interface Order {
     id: number;
     order_number: string;
     total_amount: number;
     status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
     payment_method: string;
     payment_status: string;
     created_at: string;
     items: OrderItem[];
   }
   
   export interface OrderItem {
     id: number;
     product_id: number;
     product_name_ru: string;
     product_name_zh: string;
     quantity: number;
     price: number;
   }
   
   export const ordersApi = {
     // Получить все заказы
     getOrders: async (): Promise<Order[]> => {
       const response = await axios.get(`${API_BASE_URL}/orders`);
       return response.data;
     },
   
     // Получить заказы по статусу
     getOrdersByStatus: async (status: string): Promise<Order[]> => {
       const response = await axios.get(`${API_BASE_URL}/orders`, {
         params: { status },
       });
       return response.data;
     },
   
     // Обновить статус заказа
     updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
       const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
         status,
       });
       return response.data;
     },
   };
   ```

2. **Создать компонент OrderCard src/components/OrderCard/OrderCard.tsx**
   ```typescript
   import { Clock, CheckCircle } from 'lucide-react';
   import { Button } from '@/components/Button/Button';
   import type { Order } from '@/api/orders';
   import './OrderCard.css';
   
   interface OrderCardProps {
     order: Order;
     onUpdateStatus: (orderId: number, status: string) => void;
   }
   
   export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
     const getStatusText = (status: string) => {
       const statusMap = {
         'pending': 'Ожидает',
         'preparing': 'Готовится',
         'ready': 'Готов',
         'completed': 'Выдан',
         'cancelled': 'Отменен',
       };
       return statusMap[status as keyof typeof statusMap] || status;
     };
   
     const getStatusClass = (status: string) => {
       return `order-status order-status--${status}`;
     };
   
     const getNextStatus = (currentStatus: string): string | null => {
       const statusFlow = {
         'pending': 'preparing',
         'preparing': 'ready',
         'ready': 'completed',
       };
       return statusFlow[currentStatus as keyof typeof statusFlow] || null;
     };
   
     const nextStatus = getNextStatus(order.status);
   
     return (
       <div className="order-card">
         <div className="order-header">
           <div>
             <h3 className="order-number">Заказ #{order.order_number}</h3>
             <span className={getStatusClass(order.status)}>
               {getStatusText(order.status)}
             </span>
           </div>
           <span className="order-time">
             <Clock size={16} />
             {new Date(order.created_at).toLocaleTimeString('ru-RU', {
               hour: '2-digit',
               minute: '2-digit',
             })}
           </span>
         </div>
   
         <div className="order-items">
           {order.items.map((item) => (
             <div key={item.id} className="order-item">
               <span className="item-name">
                 {item.product_name_ru} <span className="item-name-zh">{item.product_name_zh}</span>
               </span>
               <span className="item-quantity">x{item.quantity}</span>
             </div>
           ))}
         </div>
   
         <div className="order-footer">
           <span className="order-total">Итого: {order.total_amount.toFixed(2)} ₽</span>
           {nextStatus && (
             <Button
               variant="primary"
               size="medium"
               onClick={() => onUpdateStatus(order.id, nextStatus)}
             >
               <CheckCircle size={18} />
               {nextStatus === 'preparing' && 'Начать готовить'}
               {nextStatus === 'ready' && 'Готов'}
               {nextStatus === 'completed' && 'Выдано'}
             </Button>
           )}
         </div>
       </div>
     );
   };
   ```

3. **Создать стили OrderCard.css**
   ```css
   .order-card {
     background: white;
     border-radius: var(--radius-md);
     padding: var(--spacing-md);
     box-shadow: var(--shadow-sm);
     border-left: 4px solid var(--color-secondary-gray);
   }
   
   .order-card[class*="order-status--pending"] {
     border-left-color: #ff9800;
   }
   
   .order-card[class*="order-status--preparing"] {
     border-left-color: #2196f3;
   }
   
   .order-card[class*="order-status--ready"] {
     border-left-color: #4caf50;
   }
   
   .order-header {
     display: flex;
     justify-content: space-between;
     align-items: flex-start;
     margin-bottom: var(--spacing-sm);
   }
   
   .order-number {
     font-size: var(--font-size-lg);
     font-weight: 700;
     margin-bottom: 4px;
   }
   
   .order-status {
     display: inline-block;
     padding: 4px 12px;
     border-radius: 12px;
     font-size: var(--font-size-xs);
     font-weight: 600;
   }
   
   .order-status--pending {
     background: #fff3e0;
     color: #f57c00;
   }
   
   .order-status--preparing {
     background: #e3f2fd;
     color: #1976d2;
   }
   
   .order-status--ready {
     background: #e8f5e9;
     color: #388e3c;
   }
   
   .order-time {
     display: flex;
     align-items: center;
     gap: 4px;
     font-size: var(--font-size-sm);
     color: var(--color-secondary-gray);
   }
   
   .order-items {
     margin: var(--spacing-sm) 0;
     padding: var(--spacing-sm);
     background: #f9f9f9;
     border-radius: var(--radius-sm);
   }
   
   .order-item {
     display: flex;
     justify-content: space-between;
     padding: 4px 0;
   }
   
   .item-name {
     font-weight: 500;
   }
   
   .item-name-zh {
     font-size: var(--font-size-xs);
     color: var(--color-secondary-gray);
     margin-left: 4px;
   }
   
   .item-quantity {
     font-weight: 600;
     color: var(--color-primary-red);
   }
   
   .order-footer {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-top: var(--spacing-sm);
     padding-top: var(--spacing-sm);
     border-top: 1px solid #e0e0e0;
   }
   
   .order-total {
     font-size: var(--font-size-md);
     font-weight: 700;
   }
   ```

4. **Создать StaffPanel.tsx**
   ```typescript
   import { useState, useEffect } from 'react';
   import { ordersApi, Order } from '@/api/orders';
   import { OrderCard } from '@/components/OrderCard/OrderCard';
   import './StaffPanel.css';
   
   export const StaffPanel = () => {
     const [orders, setOrders] = useState<Order[]>([]);
     const [filter, setFilter] = useState<string>('all');
     const [loading, setLoading] = useState(true);
   
     useEffect(() => {
       loadOrders();
       
       // Обновление каждые 5 секунд
       const interval = setInterval(loadOrders, 5000);
       return () => clearInterval(interval);
     }, [filter]);
   
     const loadOrders = async () => {
       try {
         const data = filter === 'all' 
           ? await ordersApi.getOrders()
           : await ordersApi.getOrdersByStatus(filter);
         setOrders(data);
       } catch (error) {
         console.error('Ошибка загрузки заказов:', error);
       } finally {
         setLoading(false);
       }
     };
   
     const handleUpdateStatus = async (orderId: number, status: string) => {
       try {
         await ordersApi.updateOrderStatus(orderId, status);
         await loadOrders(); // Перезагрузить список
       } catch (error) {
         console.error('Ошибка обновления статуса:', error);
       }
     };
   
     const getOrdersByStatus = (status: string) => {
       return orders.filter(order => order.status === status);
     };
   
     return (
       <div className="staff-panel">
         <header className="staff-header">
           <h1>Панель сотрудника</h1>
           <div className="staff-filters">
             <button 
               className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
               onClick={() => setFilter('all')}
             >
               Все заказы
             </button>
             <button 
               className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
               onClick={() => setFilter('pending')}
             >
               Ожидают
             </button>
             <button 
               className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`}
               onClick={() => setFilter('preparing')}
             >
               Готовятся
             </button>
             <button 
               className={`filter-btn ${filter === 'ready' ? 'active' : ''}`}
               onClick={() => setFilter('ready')}
             >
               Готовы
             </button>
           </div>
         </header>
   
         <div className="orders-columns">
           <div className="orders-column">
             <h2 className="column-title">Ожидают ({getOrdersByStatus('pending').length})</h2>
             <div className="orders-list">
               {getOrdersByStatus('pending').map(order => (
                 <OrderCard 
                   key={order.id} 
                   order={order}
                   onUpdateStatus={handleUpdateStatus}
                 />
               ))}
             </div>
           </div>
   
           <div className="orders-column">
             <h2 className="column-title">Готовятся ({getOrdersByStatus('preparing').length})</h2>
             <div className="orders-list">
               {getOrdersByStatus('preparing').map(order => (
                 <OrderCard 
                   key={order.id} 
                   order={order}
                   onUpdateStatus={handleUpdateStatus}
                 />
               ))}
             </div>
           </div>
   
           <div className="orders-column">
             <h2 className="column-title">Готовы ({getOrdersByStatus('ready').length})</h2>
             <div className="orders-list">
               {getOrdersByStatus('ready').map(order => (
                 <OrderCard 
                   key={order.id} 
                   order={order}
                   onUpdateStatus={handleUpdateStatus}
                 />
               ))}
             </div>
           </div>
         </div>
       </div>
     );
   };
   ```

5. **Создать стили StaffPanel.css**
   ```css
   .staff-panel {
     width: 100%;
     min-height: 100vh;
     background: #f5f5f5;
   }
   
   .staff-header {
     background: white;
     padding: var(--spacing-lg);
     box-shadow: var(--shadow-sm);
   }
   
   .staff-header h1 {
     font-size: var(--font-size-xl);
     margin-bottom: var(--spacing-md);
   }
   
   .staff-filters {
     display: flex;
     gap: var(--spacing-sm);
   }
   
   .filter-btn {
     padding: var(--spacing-sm) var(--spacing-md);
     background: #f5f5f5;
     border-radius: var(--radius-sm);
     font-size: var(--font-size-sm);
     font-weight: 600;
     transition: all var(--transition-normal);
   }
   
   .filter-btn.active {
     background: var(--color-primary-red);
     color: white;
   }
   
   .orders-columns {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
     gap: var(--spacing-lg);
     padding: var(--spacing-lg);
   }
   
   .orders-column {
     background: white;
     border-radius: var(--radius-md);
     padding: var(--spacing-md);
     box-shadow: var(--shadow-sm);
   }
   
   .column-title {
     font-size: var(--font-size-lg);
     font-weight: 700;
     margin-bottom: var(--spacing-md);
     padding-bottom: var(--spacing-sm);
     border-bottom: 2px solid #e0e0e0;
   }
   
   .orders-list {
     display: flex;
     flex-direction: column;
     gap: var(--spacing-sm);
   }
   ```

**✅ Критерий завершения:** Панель сотрудников отображает заказы, можно менять статусы

---

## 🔧 Фаза 3: Разработка Backend (серверная часть)

### Задача 3.1: Инициализация order-service

#### Шаги выполнения:

1. **Создать структуру backend/order-service/**
   ```bash
   cd backend
   mkdir -p order-service/src/{routes,models,controllers,utils,config}
   cd order-service
   npm init -y
   ```

2. **Установить зависимости**
   ```bash
   npm install fastify @fastify/cors @fastify/env pg
   npm install -D typescript @types/node @types/pg tsx nodemon
   ```

3. **Настроить TypeScript tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "moduleResolution": "node"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

4. **Настроить scripts в package.json**
   ```json
   {
     "scripts": {
       "dev": "tsx watch src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js"
     }
   }
   ```

**✅ Критерий завершения:** Структура backend создана, зависимости установлены

---

### Задача 3.2: Создание подключения к базе данных

#### Шаги выполнения:

1. **Создать src/config/database.ts**
   ```typescript
   import { Pool } from 'pg';
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL || 'postgresql://aicha_user:aicha_password_dev_only@localhost:5432/aicha_terminal',
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   
   pool.on('error', (err) => {
     console.error('Unexpected error on idle client', err);
     process.exit(-1);
   });
   
   export const query = (text: string, params?: any[]) => pool.query(text, params);
   export default pool;
   ```

2. **Создать модели src/models/Product.ts**
   ```typescript
   import { query } from '../config/database';
   
   export interface Product {
     id: number;
     category_id: number;
     name_ru: string;
     name_zh: string;
     description_ru: string;
     description_zh: string;
     price: number;
     image_url: string;
     is_available: boolean;
     created_at: Date;
     updated_at: Date;
   }
   
   export class ProductModel {
     static async findAll(): Promise<Product[]> {
       const result = await query('SELECT * FROM products WHERE is_available = true ORDER BY id');
       return result.rows;
     }
   
     static async findByCategory(categoryId: number): Promise<Product[]> {
       const result = await query(
         'SELECT * FROM products WHERE category_id = $1 AND is_available = true ORDER BY id',
         [categoryId]
       );
       return result.rows;
     }
   
     static async findById(id: number): Promise<Product | null> {
       const result = await query('SELECT * FROM products WHERE id = $1', [id]);
       return result.rows[0] || null;
     }
   }
   ```

3. **Создать модель src/models/Category.ts**
   ```typescript
   import { query } from '../config/database';
   
   export interface Category {
     id: number;
     name_ru: string;
     name_zh: string;
     slug: string;
     created_at: Date;
   }
   
   export class CategoryModel {
     static async findAll(): Promise<Category[]> {
       const result = await query('SELECT * FROM categories ORDER BY id');
       return result.rows;
     }
   }
   ```

4. **Создать модель src/models/Order.ts**
   ```typescript
   import { query } from '../config/database';
   
   export interface Order {
     id: number;
     order_number: string;
     total_amount: number;
     status: string;
     payment_method: string;
     payment_status: string;
     created_at: Date;
     updated_at: Date;
   }
   
   export interface OrderItem {
     id: number;
     order_id: number;
     product_id: number;
     quantity: number;
     price: number;
   }
   
   export class OrderModel {
     static async create(totalAmount: number, paymentMethod: string): Promise<Order> {
       const orderNumber = `AI-${Date.now().toString().slice(-8)}`;
       const result = await query(
         `INSERT INTO orders (order_number, total_amount, payment_method, status, payment_status) 
          VALUES ($1, $2, $3, 'pending', 'paid') 
          RETURNING *`,
         [orderNumber, totalAmount, paymentMethod]
       );
       return result.rows[0];
     }
   
     static async addItems(orderId: number, items: { productId: number; quantity: number; price: number }[]): Promise<void> {
       for (const item of items) {
         await query(
           'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
           [orderId, item.productId, item.quantity, item.price]
         );
       }
     }
   
     static async findAll(): Promise<Order[]> {
       const result = await query(`
         SELECT * FROM orders 
         WHERE status != 'completed' 
         ORDER BY created_at DESC
       `);
       return result.rows;
     }
   
     static async findByStatus(status: string): Promise<Order[]> {
       const result = await query(
         'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
         [status]
       );
       return result.rows;
     }
   
     static async findById(id: number): Promise<Order | null> {
       const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
       return result.rows[0] || null;
     }
   
     static async getOrderItems(orderId: number): Promise<any[]> {
       const result = await query(`
         SELECT 
           oi.*,
           p.name_ru as product_name_ru,
           p.name_zh as product_name_zh
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1
       `, [orderId]);
       return result.rows;
     }
   
     static async updateStatus(id: number, status: string): Promise<Order> {
       const result = await query(
         'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
         [status, id]
       );
       return result.rows[0];
     }
   }
   ```

**✅ Критерий завершения:** Модели данных созданы, подключение к БД настроено

---

### Задача 3.3: Создание API эндпоинтов

#### Шаги выполнения:

1. **Создать роуты для товаров src/routes/products.ts**
   ```typescript
   import { FastifyInstance } from 'fastify';
   import { ProductModel } from '../models/Product';
   import { CategoryModel } from '../models/Category';
   
   export default async function productsRoutes(fastify: FastifyInstance) {
     // Получить все товары
     fastify.get('/products', async (request, reply) => {
       try {
         const { category_id } = request.query as any;
         const products = category_id 
           ? await ProductModel.findByCategory(parseInt(category_id))
           : await ProductModel.findAll();
         return products;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to fetch products' });
       }
     });
   
     // Получить товар по ID
     fastify.get('/products/:id', async (request, reply) => {
       try {
         const { id } = request.params as { id: string };
         const product = await ProductModel.findById(parseInt(id));
         if (!product) {
           return reply.code(404).send({ error: 'Product not found' });
         }
         return product;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to fetch product' });
       }
     });
   
     // Получить категории
     fastify.get('/categories', async (request, reply) => {
       try {
         const categories = await CategoryModel.findAll();
         return categories;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to fetch categories' });
       }
     });
   }
   ```

2. **Создать роуты для заказов src/routes/orders.ts**
   ```typescript
   import { FastifyInstance } from 'fastify';
   import { OrderModel } from '../models/Order';
   
   export default async function ordersRoutes(fastify: FastifyInstance) {
     // Получить все заказы
     fastify.get('/orders', async (request, reply) => {
       try {
         const { status } = request.query as any;
         const orders = status 
           ? await OrderModel.findByStatus(status)
           : await OrderModel.findAll();
         
         // Добавить items к каждому заказу
         const ordersWithItems = await Promise.all(
           orders.map(async (order) => ({
             ...order,
             items: await OrderModel.getOrderItems(order.id),
           }))
         );
         
         return ordersWithItems;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to fetch orders' });
       }
     });
   
     // Создать заказ
     fastify.post('/orders', async (request, reply) => {
       try {
         const { total_amount, payment_method, items } = request.body as any;
         
         const order = await OrderModel.create(total_amount, payment_method);
         await OrderModel.addItems(order.id, items);
         
         return order;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to create order' });
       }
     });
   
     // Обновить статус заказа
     fastify.patch('/orders/:id/status', async (request, reply) => {
       try {
         const { id } = request.params as { id: string };
         const { status } = request.body as any;
         
         const order = await OrderModel.updateStatus(parseInt(id), status);
         return order;
       } catch (error) {
         reply.code(500).send({ error: 'Failed to update order status' });
       }
     });
   }
   ```

3. **Создать главный файл сервера src/server.ts**
   ```typescript
   import Fastify from 'fastify';
   import cors from '@fastify/cors';
   import productsRoutes from './routes/products';
   import ordersRoutes from './routes/orders';
   
   const fastify = Fastify({
     logger: true,
   });
   
   // Регистрация CORS
   fastify.register(cors, {
     origin: true, // В продакшене указать конкретный домен
   });
   
   // Регистрация роутов
   fastify.register(productsRoutes, { prefix: '/api' });
   fastify.register(ordersRoutes, { prefix: '/api' });
   
   // Health check
   fastify.get('/health', async () => {
     return { status: 'ok' };
   });
   
   // Запуск сервера
   const start = async () => {
     try {
       await fastify.listen({ port: 8080, host: '0.0.0.0' });
       console.log('Server listening on http://localhost:8080');
     } catch (err) {
       fastify.log.error(err);
       process.exit(1);
     }
   };
   
   start();
   ```

4. **Запустить backend в режиме разработки**
   ```bash
   cd backend/order-service
   npm run dev
   ```

**✅ Критерий завершения:** Backend запущен, API эндпоинты работают

---

### Задача 3.4: Настройка Docker Compose для всей системы

#### Шаги выполнения:

1. **Создать Dockerfile для frontend**
   ```dockerfile
   FROM node:20-alpine as build
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Создать Dockerfile для backend**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   EXPOSE 8080
   CMD ["node", "dist/server.js"]
   ```

3. **Обновить docker-compose.yml для всех сервисов**
   ```yaml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:15-alpine
       container_name: aicha-postgres
       environment:
         POSTGRES_DB: aicha_terminal
         POSTGRES_USER: aicha_user
         POSTGRES_PASSWORD: aicha_password_dev_only
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
       networks:
         - aicha-network
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U aicha_user -d aicha_terminal"]
         interval: 10s
         timeout: 5s
         retries: 5
   
     redis:
       image: redis:7-alpine
       container_name: aicha-redis
       ports:
         - "6379:6379"
       networks:
         - aicha-network
   
     backend:
       build:
         context: ./backend/order-service
         dockerfile: Dockerfile
       container_name: aicha-backend
       environment:
         DATABASE_URL: postgresql://aicha_user:aicha_password_dev_only@postgres:5432/aicha_terminal
       ports:
         - "8080:8080"
       depends_on:
         postgres:
           condition: service_healthy
       networks:
         - aicha-network
   
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       container_name: aicha-frontend
       ports:
         - "3000:80"
       depends_on:
         - backend
       networks:
         - aicha-network
   
   volumes:
     postgres_data:
   
   networks:
     aicha-network:
       driver: bridge
   ```

4. **Запустить всю систему**
   ```bash
   docker-compose up --build
   ```

**✅ Критерий завершения:** Вся система запущена в Docker, frontend доступен на localhost:3000

---

## 🧪 Фаза 4: Тестирование базовой части

### Задача 4.1: Ручное тестирование функциональности

#### Чек-лист тестирования:

**Навигация:**
- [ ] Приветственный экран отображается корректно
- [ ] Переход на экран выбора режима работает
- [ ] Кнопка "Обычный заказ" ведет в меню
- [ ] Навигация между страницами плавная

**Каталог товаров:**
- [ ] Товары загружаются из базы данных
- [ ] Категории отображаются и фильтруют товары
- [ ] Карточки товаров показывают всю информацию
- [ ] Двуязычность работает (русский + китайский)

**Корзина:**
- [ ] Товары добавляются в корзину
- [ ] Количество можно изменять
- [ ] Товары можно удалять
- [ ] Итоговая сумма рассчитывается правильно

**Оплата:**
- [ ] Все способы оплаты отображаются
- [ ] Заглушка "успешной оплаты" работает
- [ ] Корзина очищается после оплаты

**Оценка сервиса:**
- [ ] Звезды интерактивны
- [ ] Оценка отправляется
- [ ] Возврат на главную работает

**Панель сотрудников:**
- [ ] Заказы отображаются
- [ ] Фильтрация по статусам работает
- [ ] Статусы заказов обновляются
- [ ] Real-time обновления работают

**Backend API:**
- [ ] GET /api/products возвращает товары
- [ ] GET /api/categories возвращает категории
- [ ] POST /api/orders создает заказ
- [ ] PATCH /api/orders/:id/status обновляет статус

---

## 📊 Завершение базовой части

### Что было реализовано:

✅ **Frontend (клиентская часть):**
- Все страницы пользовательского интерфейса
- Роутинг и навигация
- Управление состоянием (корзина)
- Двуязычный интерфейс
- Адаптивный дизайн

✅ **Backend (серверная часть):**
- REST API для товаров и заказов
- Подключение к PostgreSQL
- Модели данных
- Роуты и контроллеры

✅ **База данных:**
- Схема таблиц
- Начальные данные
- Миграции

✅ **Инфраструктура:**
- Docker Compose настройка
- Контейнеризация сервисов
- Панель для сотрудников

### Что НЕ реализовано (будет в следующих частях):

❌ AI-диалог и голосовое взаимодействие
❌ Речевые технологии (STT/TTS)
❌ Анализ предпочтений и рекомендации
❌ Реальная система оплаты
❌ Оптимизация для Orange Pi
❌ Финальное тестирование на оборудовании

---

## 🎯 Следующие шаги

После завершения базовой части переходите к документу **DevelopmentPlan_AI.md**, где будет описана интеграция:
- Yandex SpeechKit для распознавания и синтеза речи
- OpenAI GPT-4o или Llama-3 для AI-диалогов
- Анализ настроения и подбор товаров
- WebSocket для real-time коммуникации
- Обработка аудио потоков

---

**Версия документа:** 1.0  
**Дата создания:** 7 ноября 2024  
**Статус:** Готово для начала разработки базовой части
