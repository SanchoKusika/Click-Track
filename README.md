# Click Intern Core

`Click Intern Core` — внутренняя цифровая платформа для управления циклом стажировки:
- авторизация и разделение ролей (`ADMIN`, `MENTOR`, `INTERN`)
- оценка стажеров по критериям и комментариям
- просмотр личного прогресса и рейтинга
- администрирование пользователей

Проект заменяет бумажный процесс на единый web-интерфейс (Paperless), ускоряет работу менторов и делает систему оценки прозрачной для стажеров.

## Технологии

### Backend
- `NestJS`
- `PostgreSQL`
- `Prisma ORM`
- `JWT` (access + refresh)
- `RBAC` (role-based access control)

### Frontend
- `React` + `TypeScript`
- `Vite`
- `TailwindCSS`
- `Zustand`
- `TanStack Query`
- `React Hook Form` + `Zod`

### Infrastructure
- `Docker` + `Docker Compose`

## Архитектура репозитория

- `backend/` — API, бизнес-логика, Prisma schema/seed
- `frontend/` — UI и клиентская логика
- `docker-compose.yml` — production-like запуск
- `docker-compose.dev.yml` — разработка с hot reload
- `docs/` — расширенная документация

## Быстрый старт

### Вариант 1: Docker (рекомендуется)

Production-like запуск:

```bash
docker compose up --build
```

Откройте:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Остановка:

```bash
docker compose down
```

Полный сброс с удалением volume БД:

```bash
docker compose down -v
```

### Вариант 2: Локально (без Docker)

1. Скопируйте env:
   - `cp .env.example .env`
2. Установите зависимости:
   - `npm install`
   - `npm install --workspace backend`
   - `npm install --workspace frontend`
3. Подготовьте backend:
   - `cd backend`
   - `npx prisma migrate dev --name init`
   - `npm run prisma:seed`
4. Запустите в двух терминалах:
   - `npm run dev:backend`
   - `npm run dev:frontend`

## Режим разработки в Docker (Hot Reload)

Запуск:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Остановка:

```bash
docker compose -f docker-compose.dev.yml down
```

Сброс dev-volume:

```bash
docker compose -f docker-compose.dev.yml down -v
```

## Основные маршруты

### Frontend
- `/login`
- `/dashboard` — панель ментора
- `/me` — личный кабинет стажера
- `/admin/users` — админ-панель пользователей

### Backend API
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /admin/users` (+ CRUD `/admin/users/:id`)
- `GET /settings/me`
- `PATCH /settings/me`
- `GET /assessments/mentor/interns`
- `POST /assessments`
- `GET /intern/me/assessments`
- `GET /intern/leaderboard`

## Seed-аккаунты

Пароли разделены по ролям, чтобы удобно тестировать RBAC-сценарии:

- `ADMIN`: `admin@click.local` / `Admin@123`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local` / `Mentor@123`
- `INTERN`: `intern1@click.local` .. `intern5@click.local` / `Intern@123`

## Переменные окружения

См. `.env.example`.

Ключевые:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `PORT`
- `VITE_API_URL`

## Развертывание на сервере

Кратко:
1. Установить Docker и Docker Compose на сервер
2. Склонировать репозиторий
3. Запустить `docker compose up --build -d`
4. Настроить reverse proxy + HTTPS

Подробная инструкция: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

## Документация

- Development: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
