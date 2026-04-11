# Development Guide

Этот документ описывает процесс разработки `Click Intern Core` локально и в Docker dev-режиме.

## Требования

- Node.js `20+`
- npm `10+`
- PostgreSQL `16+` (если запуск без Docker)
- Docker + Docker Compose (если запуск в контейнерах)

## Локальная разработка (без Docker)

1. Скопируйте переменные окружения:
   - `cp .env.example .env`
2. Установите зависимости:
   - `npm install`
   - `npm install --workspace backend`
   - `npm install --workspace frontend`
3. Подготовьте базу и Prisma:
   - `cd backend`
   - `npx prisma migrate dev --name init`
   - `npm run prisma:seed`
4. Запустите сервисы в двух терминалах:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## Разработка в Docker (Hot Reload)

1. Запуск:
   - `docker compose -f docker-compose.dev.yml up --build`
2. Приложения:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`
3. Остановка:
   - `docker compose -f docker-compose.dev.yml down`
4. Сброс с удалением volume:
   - `docker compose -f docker-compose.dev.yml down -v`

## Полезные команды

Из корня репозитория:

- Backend dev: `npm run dev:backend`
- Frontend dev: `npm run dev:frontend`
- Build всех пакетов: `npm run build`
- Lint всех пакетов: `npm run lint`

Из `backend`:

- Build: `npm run build`
- Unit tests: `npm run test`
- E2E smoke: `npm run test:e2e`
- Prisma generate: `npm run prisma:generate`
- Prisma seed: `npm run prisma:seed`

Из `frontend`:

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Переменные окружения

Базовый пример в `.env.example`.

Ключевые переменные:

- `DATABASE_URL` — PostgreSQL строка подключения
- `JWT_ACCESS_SECRET` — секрет access token
- `JWT_REFRESH_SECRET` — секрет refresh token
- `JWT_ACCESS_EXPIRES_IN` — срок жизни access token (например `15m`)
- `JWT_REFRESH_EXPIRES_IN` — срок жизни refresh token (например `7d`)
- `PORT` — порт backend
- `VITE_API_URL` — URL backend для frontend

## Отладка частых проблем

- Ошибка подключения к БД:
  - проверьте `DATABASE_URL`
  - убедитесь, что PostgreSQL доступен и база создана
- Ошибка Prisma Client:
  - выполните `npm run prisma:generate` в `backend`
- `401` на frontend:
  - проверьте `VITE_API_URL`
  - убедитесь, что backend запущен и токены корректны
