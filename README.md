# AI-Cha Terminal

Терминальная система кафе AI Cha с русско-китайским интерфейсом. Проект следует архитектуре тонкого клиента: React-приложение в киоск-режиме + backend на Fastify с PostgreSQL и Redis. Голосовой и AI-функционал будут добавлены на следующих этапах.

## Структура монорепозитория
- `backend/` — API (Fastify, PostgreSQL, Sequelize, Redis)
- `frontend/` — терминал для клиентов (React + Vite + TS)
- `staff-panel/` — панель сотрудников (React)
- `display-screen/` — экран готовых заказов (React)
- `docker/` — Docker Compose, образы и nginx
- `docs/` — документация (PRD, планы разработки)

## Быстрый старт (черновик базового этапа)
1) Установите Node 18+ и Docker Compose.  
2) Скопируйте `.env.example` в `.env` в `backend/` и `frontend/` (базовые переменные уже добавлены).  
3) Установите зависимости в каждом пакете: `npm install`.  
4) Локальный запуск:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
5) Docker (черновик):
   - `cd docker && docker-compose up --build`
   - фронтенд доступен на `http://localhost`, API — `http://localhost/api`

Подробные шаги разработки описаны в `docs/context/DevelopmentPlan_Base.md`.
