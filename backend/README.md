# Click Intern Core Backend

Backend-сервис платформы `Click Intern Core` для управления стажерами, оценками, опросами и ролями.

## Стек

- `NestJS` 11
- `Prisma ORM` (миграции, не `db push`)
- `PostgreSQL` 16
- JWT access (Bearer) + refresh (HttpOnly cookie)
- `helmet` + `@nestjs/throttler`
- `Joi` env validation
- `Swagger / OpenAPI`

## Что покрывает backend

Сервис реализует сценарии для трёх ролей:

- `ADMIN`
  - CRUD пользователей и менторов
  - управление критериями
  - управление опросами и просмотр ответов
- `MENTOR`
  - доступ только к своим стажёрам
  - детальная карточка стажёра
  - создание оценок
  - прохождение опросов с `target = MENTOR`
- `INTERN`
  - просмотр собственных оценок
  - агрегированный leaderboard
  - прохождение опросов с `target = INTERN`

## Схема данных

Prisma schema: [prisma/schema.prisma](./prisma/schema.prisma)

Основные модели:

- `User` — `email`, `passwordHash`, `fullName`, `role`, `phone?`, `photoUrl?`, `refreshTokenHash?`. Роли: `ADMIN | MENTOR | INTERN`.
- `InternProfile` — связь стажёра с ментором (`userId`, `mentorId?`). Удаление ментора → `mentorId = NULL` (`SetNull`). Удаление пользователя-стажёра → каскадно сносит профиль и его оценки.
- `Criterion` — критерий оценки (`maxScore`, по умолчанию `5`).
- `Assessment` — оценка (`score`, `comment?`, `createdAt`). Каскад на удаление профиля и ментора.
- `Survey` / `SurveyQuestion` / `SurveyResponse` / `SurveyAnswer` — опросы (target = `MENTOR | INTERN`). Каскад на удаление опроса.

## Безопасность и бизнес-правила

- Все секреты обязательны и проверяются Joi (`backend/src/common/config/env.validation.ts`). Минимум 32 символа для `JWT_*_SECRET`. Приложение не стартует с пустыми/слабыми значениями.
- `helmet` подключён в `main.ts`.
- `@nestjs/throttler` с двумя профилями: глобальный (`THROTTLE_*`) и жёсткий на `/auth/login`, `/auth/refresh` (`AUTH_THROTTLE_*`).
- Refresh-токен — `HttpOnly Secure SameSite=Strict` cookie (`refresh_token`). Access-токен — Bearer.
- CORS — белый список из `CORS_ORIGINS` (через запятую).
- `Multer` (загрузка фото) с `limits.fileSize` и `fileFilter` по MIME.
- Глобальный `PrismaExceptionFilter`: `P2002` → `409 Conflict`, `P2025` → `404 Not Found`.
- `score` ограничен `1..5`, mentor видит только своих стажёров, intern — только свои оценки.

## Модульная структура

- `src/auth` — login / refresh / logout, cookie-helpers
- `src/users` — модель текущего пользователя (используется внутри других модулей)
- `src/admin` — админские операции с пользователями и менторами
- `src/assessments` — mentor flow (создание оценок, список стажёров)
- `src/intern` — intern flow (свои оценки, leaderboard)
- `src/criteria` — критерии оценок
- `src/settings` — `GET/PATCH /settings/me`, загрузка фото
- `src/surveys` — управление опросами и ответы
- `src/common` — guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@Roles`, `@CurrentUser`), фильтры, shared DTO, Joi-схема env
- `src/swagger` — настройка и генерация OpenAPI

## Переменные окружения

Минимальный набор для запуска (детали — в корневом `README.md` и `docs/DEVELOPMENT.md`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/click_intern_core?schema=public
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
COOKIE_SECURE=false
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100
AUTH_THROTTLE_TTL_MS=60000
AUTH_THROTTLE_LIMIT=30
UPLOAD_MAX_SIZE_BYTES=5242880
PORT=3000
```

## Локальный запуск (без Docker)

Из корня репозитория:

```bash
npm install
cd backend
npx prisma migrate dev          # применить миграции
npm run prisma:seed             # опционально, демо-данные
npm run start:dev
```

Backend будет доступен на `http://localhost:3000`. Swagger — `http://localhost:3000/api/docs`.

## Docker запуск

См. корневой `README.md`. Кратко:

```bash
# dev (hot reload)
docker compose --env-file .env.docker -f docker-compose.dev.yml up --build

# prod-like
docker compose --env-file .env.docker up --build
```

В обоих сценариях backend на старте выполняет `prisma migrate deploy`. Сидинг — отдельной командой:

```bash
docker compose --env-file .env.docker run --rm backend npm run prisma:seed
```

## Seed-аккаунты

Сид создаёт демо-пользователей с одинаковым паролем `password123`:

- `ADMIN`: `admin@click.local`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local`
- `INTERN`: `intern1@click.local` … `intern5@click.local`

## Swagger / OpenAPI

- UI: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs-json`

Локальная генерация snapshot для frontend-клиента (Orval):

```bash
npm run swagger:generate                   # из корня — пишет ../swagger.json
npm run gen:api --workspace frontend       # перегенерирует frontend/src/shared/api/generated_api.ts
```

`swagger.json` исключён из git.

## Основные endpoint'ы

Auth:

- `POST /auth/login`
- `POST /auth/refresh` (cookie-based)
- `POST /auth/logout`

Current user:

- `GET /users/me`
- `GET /settings/me`
- `PATCH /settings/me` (`multipart/form-data`, optional `phone`, `removePhoto`, `photo`)

Admin:

- `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`
- `GET /admin/mentors`

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

Surveys:

- `GET /surveys` — мои опросы для прохождения
- `POST /surveys/:id/responses` — отправить ответ
- `GET /admin/surveys`, `POST /admin/surveys`, `DELETE /admin/surveys/:id`
- `GET /admin/surveys/:id/responses`

Полный список — в Swagger.

## Полезные команды

Из директории `backend/`:

```bash
npm run build
npm run start:dev
npm run start:prod
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate     # = prisma migrate dev
npm run prisma:seed
npm run swagger:generate
```
