# Development Guide

Этот документ описывает процесс разработки `Click Intern Core` локально и в Docker dev-режиме.

## Требования

- Node.js `20+`
- npm `10+`
- PostgreSQL `16+` (если запуск без Docker)
- Docker + Docker Compose (если запуск в контейнерах)

## Перед стартом — секреты

Все JWT-секреты валидируются на старте (`Joi`); пустых/слабых значений достаточно для падения backend. Минимум 32 символа для `JWT_*_SECRET`. Сгенерируйте два разных значения:

```bash
openssl rand -hex 32   # JWT_ACCESS_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
```

Альтернатива без `openssl` — Node.js (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) или PowerShell (см. корневой `README.md`).

## Локальная разработка (без Docker)

1. Скопируйте переменные окружения и заполните секреты:
   - `cp .env.example .env`
2. Установите зависимости:
   - `npm install`
   - `npm install --workspace backend`
   - `npm install --workspace frontend`
3. Подготовьте базу и Prisma:
   - `cd backend`
   - `npx prisma migrate dev`
   - `npm run prisma:seed` (опционально, демо-данные)
4. Запустите сервисы в двух терминалах:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## Разработка в Docker (Hot Reload)

Использует тот же `.env.docker`, что и prod-стек:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml up --build
```

Без `--env-file` Compose не подхватывает переменные на этапе интерполяции (см. корневой `README.md`).

Приложения:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

Остановка:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml down
```

Сброс с удалением volume:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml down -v
```

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
- Typecheck: `npm run typecheck`

## Переменные окружения

Шаблоны: `.env.example` (локальный), `.env.docker.example` (Docker).

Ключевые:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — ≥32 символа, **разные**
- `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` — например `15m` / `7d`
- `CORS_ORIGINS` — список allowed origins через запятую
- `COOKIE_SECURE` — `true` за HTTPS, `false` для HTTP
- `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` — глобальный rate-limit
- `AUTH_THROTTLE_TTL_MS` / `AUTH_THROTTLE_LIMIT` — лимит на `/auth/*`
- `UPLOAD_MAX_SIZE_BYTES` — потолок upload (по умолчанию 5 MiB)
- `PORT` — порт backend
- `VITE_API_URL` — base URL backend для frontend (попадает в build)

Для Docker дополнительно: `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`.

## Отладка частых проблем

- `Joi validation` падает на старте → проверьте, что `.env` / `.env.docker` содержит все обязательные ключи и `JWT_*_SECRET` ≥32 символов.
- Compose ругается `The "POSTGRES_USER" variable is not set` → забыли `--env-file .env.docker`.
- `column users.phone does not exist` → миграции не догнали схему, либо забыли применить новые. В dev: `npx prisma migrate dev`. В Docker: `down -v && up --build`.
- `401 Unauthorized` на frontend → проверьте `VITE_API_URL` (должен попасть в build), `CORS_ORIGINS` (должен содержать origin frontend) и `COOKIE_SECURE` (для HTTP localhost = `false`).
- Ошибка Prisma Client → `npm run prisma:generate` в `backend`.
