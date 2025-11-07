# 🚀 План разработки AI-Cha Terminal - Финальная часть

## 🎯 Цель этапа

Оптимизировать систему, собрать физический терминал на Orange Pi Zero 3, провести полное тестирование и подготовить к развертыванию в кафе.

**Ожидаемый результат:** Полностью функциональный, оптимизированный и протестированный терминал, готовый к использованию в реальных условиях кафе.

**Время выполнения:** 2-3 недели

**Предварительные требования:** Завершены базовая и AI части из DevelopmentPlan_Base.md и DevelopmentPlan_AI.md

---

## 🔧 Фаза 1: Оптимизация и улучшение производительности

### Задача 1.1: Оптимизация Frontend

#### Шаги выполнения:

1. **Lazy Loading для страниц**
   ```typescript
   // В App.tsx использовать React.lazy для всех страниц
   import { lazy, Suspense } from 'react';
   
   const WelcomePage = lazy(() => import('./pages/WelcomePage/WelcomePage'));
   const MenuPage = lazy(() => import('./pages/MenuPage/MenuPage'));
   const AIDialogPage = lazy(() => import('./pages/AIDialogPage/AIDialogPage'));
   // ... остальные страницы
   
   // В Routes обернуть в Suspense
   <Suspense fallback={<div className="loading">Загрузка...</div>}>
     <Routes>
       <Route path="/" element={<WelcomePage />} />
       ...
     </Routes>
   </Suspense>
   ```

2. **Оптимизация изображений**
   - Конвертировать все изображения в WebP формат
   - Создать несколько размеров для responsive loading
   - Добавить lazy loading для изображений товаров
   
   ```typescript
   // В ProductCard компоненте
   <img 
     src={product.image_url} 
     alt={product.name_ru}
     loading="lazy"
     decoding="async"
   />
   ```

3. **Настроить Service Worker для PWA**
   Создать `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'aicha-terminal-v1';
   const urlsToCache = [
     '/',
     '/index.html',
     '/assets/style.css',
     '/assets/bundle.js',
     '/images/logo.png',
   ];
   
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(urlsToCache))
     );
   });
   
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then((response) => response || fetch(event.request))
     );
   });
   ```

4. **Minify и сжатие**
   - Убедиться, что Vite настроен для production build
   - Включить gzip/brotli сжатие в Nginx
   
   Обновить `vite.config.ts`:
   ```typescript
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true, // Удалить console.log в production
         },
       },
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom', 'react-router-dom'],
             utils: ['axios', 'lottie-react'],
           },
         },
       },
     },
   });
   ```

**✅ Критерий завершения:** Frontend оптимизирован, размер бандла уменьшен

---

### Задача 1.2: Оптимизация Backend

#### Шаги выполнения:

1. **Добавить connection pooling для PostgreSQL**
   ```typescript
   // В database.ts увеличить pool
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20, // Максимум соединений
     min: 5,  // Минимум соединений
     idleTimeoutMillis: 30000,
   });
   ```

2. **Добавить кэширование Redis для часто запрашиваемых данных**
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis({
     host: 'localhost',
     port: 6379,
   });
   
   export class ProductModel {
     static async findAll(): Promise<Product[]> {
       // Проверить кэш
       const cached = await redis.get('products:all');
       if (cached) {
         return JSON.parse(cached);
       }
       
       // Запросить из БД
       const result = await query('SELECT * FROM products WHERE is_available = true');
       const products = result.rows;
       
       // Кэшировать на 5 минут
       await redis.setex('products:all', 300, JSON.stringify(products));
       
       return products;
     }
   }
   ```

3. **Добавить компрессию ответов**
   ```typescript
   // В server.ts
   import compress from '@fastify/compress';
   
   fastify.register(compress, {
     global: true,
     threshold: 1024, // Сжимать ответы > 1KB
   });
   ```

4. **Настроить rate limiting**
   ```typescript
   import rateLimit from '@fastify/rate-limit';
   
   fastify.register(rateLimit, {
     max: 100, // 100 запросов
     timeWindow: '1 minute',
   });
   ```

**✅ Критерий завершения:** Backend оптимизирован, добавлено кэширование

---

### Задача 1.3: Оптимизация AI Dialog Service

#### Шаги выполнения:

1. **Увеличить размер кэша TTS**
   ```typescript
   export class TextToSpeechService {
     private cache: Map<string, Buffer> = new Map();
     private maxCacheSize = 200; // Увеличить до 200 фраз
     
     async synthesize(text: string, options: TTSOptions = {}): Promise<Buffer> {
       // Проверяем кэш
       const cacheKey = this.getCacheKey(text, options);
       if (this.cache.has(cacheKey)) {
         return this.cache.get(cacheKey)!;
       }
       
       // ... синтез речи ...
       
       // Кэшировать с учетом лимита
       if (this.cache.size >= this.maxCacheSize) {
         // Удалить самый старый элемент
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }
       
       this.cache.set(cacheKey, audioBuffer);
       return audioBuffer;
     }
   }
   ```

2. **Добавить параллельную обработку STT и TTS**
   ```typescript
   // В dialog routes
   const response = await openaiService.continueDialog(context, userText);
   
   // Запустить TTS параллельно с сохранением контекста
   const [audioBuffer] = await Promise.all([
     ttsService.synthesize(response.message),
     // Другие операции
   ]);
   ```

3. **Настроить timeout и retry для OpenAI**
   ```typescript
   import { OpenAI } from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
     timeout: 10000, // 10 секунд timeout
     maxRetries: 2,   // 2 повтора при ошибке
   });
   ```

**✅ Критерий завершения:** AI сервис оптимизирован, латентность снижена

---

## 🖥️ Фаза 2: Сборка терминала на Orange Pi Zero 3

> **⚠️ ТОЧКА ОСТАНОВКИ ДЛЯ ПОЛЬЗОВАТЕЛЯ:**
> Вам нужно собрать физический терминал перед этой фазой:
> - Orange Pi Zero 3 (4GB RAM)
> - Сенсорный экран 10.1" (USB + HDMI)
> - Петличный микрофон (USB)
> - Колонки или встроенный звук
> - SD карта минимум 32GB (рекомендуется 64GB)
> - Блок питания 5V 3A

### Задача 2.1: Установка и настройка Ubuntu на Orange Pi

#### Шаги выполнения:

1. **Скачать и записать Ubuntu на SD карту**
   - Скачать Ubuntu 22.04 LTS для Orange Pi Zero 3
   - Использовать Balena Etcher для записи образа на SD карту
   - Вставить SD карту в Orange Pi

2. **Первая загрузка и настройка**
   ```bash
   # После загрузки войти с дефолтными кредами
   # Login: orangepi
   # Password: orangepi
   
   # Обновить систему
   sudo apt update && sudo apt upgrade -y
   
   # Установить необходимые пакеты
   sudo apt install -y curl wget git build-essential
   ```

3. **Настроить Wi-Fi**
   ```bash
   # Подключиться к Wi-Fi
   sudo nmcli device wifi connect "SSID" password "PASSWORD"
   
   # Проверить подключение
   ping -c 4 google.com
   
   # Узнать IP адрес
   ip addr show
   ```

4. **Настроить SSH для удобного доступа**
   ```bash
   # Включить SSH (обычно уже включен)
   sudo systemctl enable ssh
   sudo systemctl start ssh
   
   # Сменить пароль для безопасности
   passwd
   ```

**✅ Критерий завершения:** Ubuntu установлена и настроена на Orange Pi

---

### Задача 2.2: Установка Docker на Orange Pi

#### Шаги выполнения:

1. **Установить Docker**
   ```bash
   # Установить зависимости
   sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
   
   # Добавить Docker GPG ключ
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   
   # Добавить Docker репозиторий
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   
   # Установить Docker
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   
   # Добавить пользователя в группу docker
   sudo usermod -aG docker $USER
   newgrp docker
   
   # Проверить установку
   docker --version
   docker compose version
   ```

2. **Настроить Docker для работы на ARM**
   ```bash
   # Убедиться, что Docker работает
   docker run hello-world
   ```

**✅ Критерий завершения:** Docker установлен и работает

---

### Задача 2.3: Настройка Chromium в kiosk-режиме

#### Шаги выполнения:

1. **Установить Chromium и X11**
   ```bash
   sudo apt install -y chromium-browser x11-xserver-utils unclutter
   ```

2. **Создать скрипт запуска kiosk-режима**
   ```bash
   sudo nano /usr/local/bin/start-kiosk.sh
   ```
   
   Содержимое скрипта:
   ```bash
   #!/bin/bash
   
   # Отключить спящий режим
   xset s noblank
   xset s off
   xset -dpms
   
   # Скрыть курсор
   unclutter -idle 0.5 -root &
   
   # Подождать загрузку сети
   while ! ping -c 1 -W 1 192.168.1.100; do
       sleep 1
   done
   
   # Запустить Chromium в kiosk-режиме
   chromium-browser \
     --kiosk \
     --noerrdialogs \
     --disable-infobars \
     --no-first-run \
     --fast \
     --fast-start \
     --disable-features=TranslateUI \
     --disable-pinch \
     --overscroll-history-navigation=0 \
     --disable-session-crashed-bubble \
     http://192.168.1.100:3000
   ```
   
   Сделать скрипт исполняемым:
   ```bash
   sudo chmod +x /usr/local/bin/start-kiosk.sh
   ```

3. **Настроить автозапуск через systemd**
   ```bash
   sudo nano /etc/systemd/system/kiosk.service
   ```
   
   Содержимое:
   ```ini
   [Unit]
   Description=AI-Cha Terminal Kiosk Mode
   After=network-online.target
   Wants=network-online.target
   
   [Service]
   Type=simple
   Environment=DISPLAY=:0
   Environment=XAUTHORITY=/home/orangepi/.Xauthority
   ExecStart=/usr/local/bin/start-kiosk.sh
   Restart=always
   RestartSec=10
   User=orangepi
   
   [Install]
   WantedBy=graphical.target
   ```
   
   Включить сервис:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable kiosk.service
   ```

4. **Настроить автологин**
   ```bash
   sudo nano /etc/lightdm/lightdm.conf
   ```
   
   Добавить:
   ```ini
   [SeatDefaults]
   autologin-user=orangepi
   autologin-user-timeout=0
   user-session=ubuntu
   ```

**✅ Критерий завершения:** Chromium в kiosk-режиме настроен и автозапускается

---

### Задача 2.4: Настройка микрофона и звука

#### Шаги выполнения:

1. **Проверить подключение устройств**
   ```bash
   # Проверить микрофон
   arecord -l
   
   # Проверить аудиовыход
   aplay -l
   ```

2. **Настроить ALSA**
   ```bash
   sudo apt install -y alsa-utils pulseaudio
   
   # Настроить громкость
   alsamixer
   ```

3. **Тест записи и воспроизведения**
   ```bash
   # Записать тест (10 секунд)
   arecord -d 10 -f cd test.wav
   
   # Воспроизвести
   aplay test.wav
   ```

4. **Настроить PulseAudio для автозапуска**
   ```bash
   systemctl --user enable pulseaudio
   systemctl --user start pulseaudio
   ```

**✅ Критерий завершения:** Микрофон и звук работают корректно

---

## 🧪 Фаза 3: Тестирование на реальном оборудовании

### Задача 3.1: Функциональное тестирование

#### Чек-лист полного тестирования:

**Базовая функциональность:**
- [ ] Приветственный экран загружается быстро (< 3 сек)
- [ ] Навигация плавная, без задержек
- [ ] Сенсорный экран реагирует точно
- [ ] Все кнопки работают правильно
- [ ] Анимации проигрываются плавно

**Каталог и заказы:**
- [ ] Товары загружаются из базы данных
- [ ] Категории фильтруют товары
- [ ] Корзина сохраняет товары
- [ ] Расчет суммы правильный
- [ ] Заказы создаются в БД

**AI-диалог:**
- [ ] Микрофон записывает звук
- [ ] STT распознает речь (> 90% точность)
- [ ] AI генерирует адекватные вопросы
- [ ] TTS озвучивает ответы четко
- [ ] Рекомендации генерируются

**Производительность:**
- [ ] Время загрузки страницы < 2 сек
- [ ] Латентность AI-ответа < 4 сек
- [ ] CPU использование < 70%
- [ ] RAM использование < 2.5GB
- [ ] Температура CPU < 70°C

**Надежность:**
- [ ] Система работает 1 час без сбоев
- [ ] Перезагрузка происходит корректно
- [ ] Сеть восстанавливается после разрыва
- [ ] Нет memory leaks

---

### Задача 3.2: Stress testing (нагрузочное тестирование)

#### Шаги выполнения:

1. **Имитация множественных заказов**
   - Создать 20+ заказов подряд
   - Проверить, что система не замедляется
   - Проверить, что память не растет

2. **Длительное тестирование**
   - Оставить терминал работать на 8 часов
   - Периодически проверять состояние
   - Мониторить ресурсы

3. **Тест на перегрев**
   - Запустить AI-диалог 10 раз подряд
   - Проверить температуру:
     ```bash
     cat /sys/class/thermal/thermal_zone0/temp
     ```
   - Убедиться, что < 75000 (75°C)

**✅ Критерий завершения:** Система стабильна под нагрузкой

---

## 📦 Фаза 4: Подготовка к развертыванию

### Задача 4.1: Создание резервной копии

#### Шаги выполнения:

1. **Создать backup SD карты**
   ```bash
   # На компьютере (Linux/Mac)
   sudo dd if=/dev/sdX of=aicha-terminal-backup.img bs=4M status=progress
   
   # Сжать для экономии места
   gzip aicha-terminal-backup.img
   ```

2. **Документировать конфигурацию**
   Создать файл `DEPLOYMENT.md`:
   ```markdown
   # AI-Cha Terminal Deployment Guide
   
   ## IP конфигурация
   - Сервер: 192.168.1.100
   - Терминал 1: 192.168.1.101
   - Терминал 2: 192.168.1.102
   
   ## Credentials
   - Orange Pi: orangepi / [пароль]
   - PostgreSQL: aicha_user / [пароль]
   - WiFi: AI-Cha-Staff / [пароль]
   
   ## Сервисы
   - Frontend: http://192.168.1.100:3000
   - Backend: http://192.168.1.100:8080
   - AI Dialog: http://192.168.1.100:8081
   - Staff Panel: http://192.168.1.100:3000/staff
   
   ## Restart команды
   - Перезапустить все: `docker compose restart`
   - Перезапустить терминал: `sudo systemctl restart kiosk`
   ```

**✅ Критерий завершения:** Backup создан, документация готова

---

### Задача 4.2: Настройка центрального сервера в кафе

> **⚠️ ТОЧКА ОСТАНОВКИ ДЛЯ ПОЛЬЗОВАТЕЛЯ:**
> Вам нужно подготовить сервер в кафе - мощный ПК с Ubuntu Server

#### Шаги выполнения:

1. **Установить Ubuntu Server на ПК**
   - Ubuntu Server 22.04 LTS
   - Минимум 16GB RAM, 6-core CPU, 500GB SSD

2. **Настроить статический IP**
   ```bash
   sudo nano /etc/netplan/00-installer-config.yaml
   ```
   
   ```yaml
   network:
     ethernets:
       eth0:
         addresses:
           - 192.168.1.100/24
         gateway4: 192.168.1.1
         nameservers:
           addresses:
             - 8.8.8.8
             - 8.8.4.4
     version: 2
   ```
   
   ```bash
   sudo netplan apply
   ```

3. **Установить Docker и Docker Compose**
   (Аналогично установке на Orange Pi)

4. **Склонировать репозиторий проекта**
   ```bash
   git clone https://github.com/your-repo/AI-Cha.git
   cd AI-Cha
   ```

5. **Настроить .env файл**
   ```bash
   cp .env.example .env
   nano .env
   ```

6. **Запустить все сервисы**
   ```bash
   docker compose up -d
   ```

7. **Проверить работу**
   ```bash
   docker compose ps
   curl http://localhost:8080/health
   curl http://localhost:8081/health
   ```

**✅ Критерий завершения:** Сервер настроен и все сервисы работают

---

### Задача 4.3: Настройка Wi-Fi роутера

#### Шаги выполнения:

1. **Создать две Wi-Fi сети:**
   - **AI-Cha-Guest** (без пароля, ограниченная скорость)
   - **AI-Cha-Staff** (с паролем, высокая скорость)

2. **Настроить DHCP для статических IP:**
   - Сервер: 192.168.1.100 (зарезервировать по MAC)
   - Терминалы: 192.168.1.101-110 (зарезервировать)

3. **Настроить QoS (Quality of Service):**
   - Приоритет для сети Staff
   - Ограничить скорость Guest сети

**✅ Критерий завершения:** Wi-Fi настроен, терминалы подключаются

---

## 📋 Фаза 5: Финальная проверка и запуск

### Задача 5.1: Итоговое тестирование всей системы

#### Финальный чек-лист:

**Инфраструктура:**
- [ ] Сервер работает стабильно
- [ ] База данных содержит актуальные товары
- [ ] Redis работает
- [ ] Все Docker контейнеры running
- [ ] Логи не содержат критических ошибок

**Терминалы:**
- [ ] Все терминалы автоматически подключаются
- [ ] Kiosk-режим запускается после загрузки
- [ ] Микрофоны и звук работают на всех устройствах
- [ ] Сенсорные экраны откалиброваны

**Функциональность:**
- [ ] Полный customer journey работает
- [ ] AI-диалог функционирует
- [ ] Заказы сохраняются в БД
- [ ] Staff Panel отображает заказы
- [ ] Real-time обновления работают

**Производительность:**
- [ ] Система работает без зависаний
- [ ] Латентность приемлемая (< 3 сек ответ AI)
- [ ] Нет перегрева оборудования

---

### Задача 5.2: Обучение персонала

#### Что показать сотрудникам:

1. **Staff Panel:**
   - Как просматривать заказы
   - Как менять статусы
   - Что делать при зависании

2. **Устранение простых проблем:**
   - Перезагрузка терминала
   - Что делать, если отвалилась сеть
   - Когда звонить в поддержку

3. **Мониторинг:**
   - Где смотреть заказы
   - Как понять, что система работает

**Создать инструкцию для персонала:**
```markdown
# AI-Cha Terminal - Инструкция для персонала

## Панель сотрудника
1. Откройте http://192.168.1.100:3000/staff
2. Заказы делятся на колонки: Ожидают, Готовятся, Готовы
3. Нажимайте кнопки для смены статуса

## Что делать если...
- Терминал завис: Перезагрузить (кнопка питания)
- Нет заказов: Проверить сеть, позвонить поддержке
- Микрофон не работает: Переподключить USB, перезагрузить

## Контакты поддержки
- Телефон: [ваш номер]
- Telegram: @support
```

**✅ Критерий завершения:** Персонал обучен, инструкции розданы

---

### Задача 5.3: Мягкий запуск (soft launch)

#### План мягкого запуска:

1. **День 1-2: Внутреннее тестирование**
   - Использовать терминал только персоналом
   - Выявить последние баги
   - Убедиться, что все работает

2. **День 3-5: Закрытое бета-тестирование**
   - Пригласить друзей и знакомых
   - Попросить обратную связь
   - Собрать статистику использования

3. **День 6-7: Доработки**
   - Исправить найденные проблемы
   - Оптимизировать на основе feedback

4. **День 8+: Полный запуск**
   - Открыть для всех клиентов
   - Активно собирать отзывы
   - Мониторить систему

**✅ Критерий завершения:** Система запущена в production

---

## 📊 Мониторинг и поддержка

### Настройка мониторинга

1. **Настроить Grafana для мониторинга**
   ```bash
   # Добавить в docker-compose.yml
   grafana:
     image: grafana/grafana:latest
     ports:
       - "3001:3000"
     volumes:
       - grafana-data:/var/lib/grafana
   ```

2. **Ключевые метрики для отслеживания:**
   - CPU и RAM использование
   - Количество заказов в час
   - Латентность AI-ответов
   - Температура Orange Pi
   - Использование AI-режима vs обычного заказа
   - Средняя оценка сервиса

3. **Настроить алерты:**
   - CPU > 80% - предупреждение
   - Температура > 75°C - критично
   - Сервис недоступен > 5 минут - критично

---

## 🎬 Заключение

### Что было сделано:

✅ **Оптимизация:**
- Frontend оптимизирован с lazy loading и PWA
- Backend с кэшированием и connection pooling
- AI сервис с увеличенным кэшем TTS

✅ **Сборка терминала:**
- Ubuntu установлена на Orange Pi
- Docker настроен для ARM
- Chromium в kiosk-режиме
- Микрофон и звук работают

✅ **Тестирование:**
- Функциональное тестирование пройдено
- Stress testing выполнен
- Система стабильна

✅ **Развертывание:**
- Сервер в кафе настроен
- Wi-Fi сети созданы
- Персонал обучен
- Система запущена

---

## 🚀 Следующие шаги (Post-launch)

1. **Неделя 1:** Активный мониторинг, быстрое реагирование на проблемы
2. **Неделя 2:** Сбор и анализ аналитики, первая итерация улучшений
3. **Месяц 1:** Оптимизация промптов AI на основе реальных диалогов
4. **Месяц 2:** Добавление новых функций (программа лояльности, мобильное приложение)

---

**Версия документа:** 1.0  
**Дата создания:** 7 ноября 2024  
**Статус:** Готово для финальной сборки и запуска

**Поздравляем! Вы завершили разработку AI-Cha Terminal!** 🎉
