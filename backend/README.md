# Click Intern Core Backend

Backend-сервис платформы `Click Intern Core` для управления стажерами, оценками и ролями.

## Стек

- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- `JWT` (access + refresh)
- `Swagger / OpenAPI`

## Что покрывает backend

Сервис реализует сценарии для трех ролей:

- `ADMIN`
  - просмотр пользователей
  - список менторов
  - CRUD пользователей
- `MENTOR`
  - доступ только к своим стажерам
  - детальная карточка стажера
  - создание оценок
- `INTERN`
  - просмотр только своих оценок
  - просмотр агрегированного leaderboard

## Схема данных

Prisma schema: [prisma/schema.prisma](./prisma/schema.prisma)

Основные модели:

- `User`
  - `email`, `passwordHash`, `fullName`, `role`, `phone`, `photoUrl`
  - роли: `ADMIN | MENTOR | INTERN`
- `InternProfile`
  - связь стажера с ментором (`userId`, `mentorId`)
- `Criterion`
  - критерии оценки (`maxScore` по умолчанию `5`)
- `Assessment`
  - запись оценки (`score`, `comment`, `createdAt`)

## Бизнес-правила и безопасность

- шкала `score`: `1..5`
- стажер должен быть привязан к конкретному `mentorId`
- mentor видит только своих стажеров
- intern получает только собственные подробные оценки
- leaderboard intern’у выдается в агрегированном виде
- `GET /users/me` возвращает безопасную публичную модель

## Модульная структура

- `src/auth` — login/refresh/logout
- `src/users` — профиль текущего пользователя
- `src/admin` — админские операции с пользователями
- `src/assessments` — mentor flow
- `src/intern` — intern flow
- `src/criteria` — критерии
- `src/prisma` — инфраструктура Prisma
- `src/common` — guards, decorators, shared DTO
- `src/swagger` — настройка и генерация OpenAPI

## Переменные окружения

Минимальный набор для запуска:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/click_intern_core?schema=public
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## Локальный запуск (без Docker)

Из корня репозитория:

```bash
cd <repo-root>/intern-track
npm install
npm install --workspace backend
npm run build --workspace backend
npm run start:dev --workspace backend
```

Backend будет доступен на `http://localhost:3000`.

## Docker запуск

### Dev stack (рекомендуется для разработки)

```bash
cd <repo-root>/intern-track
docker compose -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.dev.yml ps
```

Поднимаются сервисы:

- `postgres` (`5432`)
- `backend` (`3000`)
- `frontend` (`5173`)

Поведение `backend` контейнера в dev:

1. `npm install`
2. `npx prisma generate`
3. `npx prisma db push`
4. `npm run prisma:seed`
5. `npm run start:dev`

Комментарий:

- На текущем этапе в проекте нет набора миграций в `prisma/migrations`, поэтому dev bootstrap сделан через `db push`.

### Prod-like stack

Файл: `docker-compose.yml`  
Сборка идет через [Dockerfile](./Dockerfile), затем стартует `node dist/src/main.js`.

## Seed данные

Команда:

```bash
cd <repo-root>/intern-track
npm run prisma:seed --workspace backend
```

Seed создает:

- admin
- mentors
- interns
- criteria
- стартовые assessments

Логины/пароли по ролям:

- `ADMIN`: `admin@click.local` / `Admin@123`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local` / `Mentor@123`
- `INTERN`: `intern1@click.local` .. `intern5@click.local` / `Intern@123`

## Swagger / OpenAPI

### Live Swagger

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs-json`

Swagger настроен в:

- [src/swagger/document.ts](./src/swagger/document.ts)
- [src/main.ts](./src/main.ts)

### Локальная генерация `swagger.json`

Генерация snapshot в корень монорепозитория:

```bash
cd <repo-root>/intern-track
npm run swagger:generate
```

Что делает команда:

1. собирает backend
2. запускает генератор [`src/swagger/generate.ts`](./src/swagger/generate.ts)
3. сохраняет схему в `../swagger.json` (то есть в корневой `swagger.json` монорепозитория)

`swagger.json` добавлен в root `.gitignore`, чтобы локальные snapshot-изменения не попадали в git.

## Контракт для frontend

Рекомендуемый pipeline:

1. `npm run swagger:generate` (root)
2. `npm run gen:api --workspace frontend`

Так frontend использует стабильный OpenAPI snapshot и не зависит от live backend в момент генерации типов.

## Основные endpoint’ы

Auth:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Current user:

- `GET /users/me`
- `GET /settings/me`
- `PATCH /settings/me` (`multipart/form-data`, optional `phone`, `removePhoto`, `photo`)

Admin:

- `GET /admin/users`
- `GET /admin/mentors`
- `POST /admin/users`
- `PATCH /admin/users/:id`
- `DELETE /admin/users/:id`

Mentor:

- `GET /assessments/mentor/interns`
- `GET /assessments/mentor/interns/:internId`
- `POST /assessments`

Criteria:

- `GET /criteria`
- `POST /criteria` (ADMIN only)

Intern:

- `GET /intern/me/assessments`
- `GET /intern/leaderboard`

## Полезные команды

Из корня репозитория:

```bash
npm run build --workspace backend
npm run lint --workspace backend
npm run test --workspace backend
npm run swagger:generate
```

Из директории `backend/`:

```bash
npm run build
npm run start:dev
npm run start:prod
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run swagger:generate
```

## Текущие ограничения

- Нет полноценного migration pipeline (`db push` в dev).
- При изменении DTO/контрактов нужно синхронно обновлять Swagger-декораторы.
- `/` (root ping endpoint) технический и не является бизнес-контрактом.
