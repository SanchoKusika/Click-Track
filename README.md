# Click Intern Core

`Click Intern Core` — внутренняя цифровая платформа для управления циклом стажировки:
- авторизация и разделение ролей (`ADMIN`, `MENTOR`, `INTERN`)
- оценка стажеров по критериям и комментариям
- просмотр личного прогресса и рейтинга
- администрирование пользователей

Проект заменяет бумажный процесс на единый web-интерфейс (Paperless), ускоряет работу менторов и делает систему оценки прозрачной для стажеров.

## Технологии

### Backend
- `NestJS` 11
- `PostgreSQL` 16
- `Prisma ORM`
- `JWT` access (Bearer) + refresh (HttpOnly cookie)
- `RBAC` (role-based access control)
- `helmet` + `@nestjs/throttler`
- `Joi` env validation

### Frontend
- `React` 19 + `TypeScript`
- `Vite`
- `TailwindCSS` v4 + `HeroUI v3` (beta)
- `Zustand`
- `TanStack Query`
- `React Hook Form` + `Zod`
- `i18next`

### Infrastructure
- `Docker` + `Docker Compose`

## Архитектура репозитория

- `backend/` — API, бизнес-логика, Prisma schema/seed
- `frontend/` — UI и клиентская логика (FSD: app / pages / widgets / features / entities / shared)
- `docker-compose.yml` — production-like запуск
- `docker-compose.dev.yml` — разработка с hot reload
- `docs/` — расширенная документация
- `.env.example` — шаблон env для локального запуска (без Docker)
- `.env.docker.example` — шаблон env для Docker

## Подготовка окружения

Все секреты (JWT, пароль БД) **обязательны** и валидируются на старте — приложение не запустится с пустыми/слабыми значениями. Минимум 32 символа для `JWT_*_SECRET`.

### Генерация секретов

Выполните **дважды** (для access и refresh) — каждый раз получите 64-символьную hex-строку:

```bash
openssl rand -hex 32
```

Если нет `openssl` (актуально для Windows без WSL), используйте Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

либо PowerShell:

```powershell
[System.BitConverter]::ToString((1..32 | ForEach-Object { Get-Random -Maximum 256 })) -replace '-',''
```

## Быстрый старт

### Вариант 1: Docker (рекомендуется)

#### 1. Создайте файл `.env.docker`

В корне репозитория есть шаблон `.env.docker.example`. Скопируйте его:

```bash
cp .env.docker.example .env.docker
```

Откройте `.env.docker` и **обязательно** замените:

| Переменная | Чем заменить |
|---|---|
| `POSTGRES_PASSWORD` | надёжный случайный пароль |
| `DATABASE_URL` | строка подключения с тем же паролем (`postgresql://postgres:<тот же пароль>@postgres:5432/click_intern_core?schema=public`) |
| `JWT_ACCESS_SECRET` | вывод первого `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | вывод второго `openssl rand -hex 32` (должен отличаться от access) |
| `CORS_ORIGINS` | `http://localhost:5173` для локалки или ваш прод-домен (через запятую) |
| `COOKIE_SECURE` | `true` за HTTPS, `false` для локального HTTP |

> Файл `.env.docker` — **локальный**, в репозиторий он не попадает (исключён `.gitignore`). Не коммитьте его и не делитесь содержимым.

#### 2. Запуск

Production-like (важно передать `--env-file`, чтобы compose увидел переменные **до** старта контейнеров — например, `VITE_API_URL` нужен на этапе сборки frontend):

```bash
docker compose --env-file .env.docker up --build
```

> Без `--env-file` Compose ругается `The "POSTGRES_USER" variable is not set` — он не читает `.env.docker` автоматически (по умолчанию ищет файл `.env`). Не путать с `env_file:` внутри сервисов: тот пробрасывает переменные **в контейнер**, но не в сам Compose-процесс для интерполяции.

Альтернатива — переименовать `.env.docker` в `.env` (тогда `docker compose up --build` работает без флагов). Минус — путается с `.env` для локального запуска без Docker.

#### 3. Применение миграций

При первом запуске `prisma migrate deploy` выполнится автоматически (внутри backend-контейнера). Если нужно засеять демо-данные:

```bash
docker compose --env-file .env.docker run --rm backend npm run prisma:seed
```

> **Важно:** в проде сидинг **не запускается автоматически** — это ручной one-shot шаг. Запускайте только если действительно нужны тестовые аккаунты.

#### Прочие команды

Откройте:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

Остановка:

```bash
docker compose --env-file .env.docker down
```

Полный сброс с удалением volume БД:

```bash
docker compose --env-file .env.docker down -v
```

### Вариант 2: Локально (без Docker)

1. Скопируйте env:
   ```bash
   cp .env.example .env
   ```
   Заполните `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (см. «Генерация секретов» выше) и проверьте `DATABASE_URL`.
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Подготовьте backend:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run prisma:seed   # опционально — демо-данные
   ```
4. Запустите в двух терминалах:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

## Режим разработки в Docker (Hot Reload)

Тоже использует `.env.docker`:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml up --build
```

Остановка:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml down
```

Сброс dev-volume:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml down -v
```

> Совет: чтобы не печатать `--env-file .env.docker` каждый раз, добавьте alias в shell:
> ```bash
> alias dcc='docker compose --env-file .env.docker'
> # потом просто: dcc up --build
> ```

## Аутентификация

- `POST /auth/login` — возвращает `{ accessToken, user }` в теле и устанавливает `refresh_token` как **HttpOnly Secure SameSite=Strict** cookie.
- `POST /auth/refresh` — читает refresh-токен из cookie, возвращает новый `accessToken` и ротирует cookie.
- `POST /auth/logout` — очищает cookie и инвалидирует refresh-хеш в БД.
- Frontend хранит access-токен **только в памяти** (Zustand). На refresh страницы вызывается `/auth/refresh` — если cookie валидна, сессия восстанавливается.
- На `/auth/login` и `/auth/refresh` действует жёсткий лимит запросов (`AUTH_THROTTLE_*`).

## Основные маршруты

### Frontend
- `/login`
- `/dashboard` — панель ментора
- `/me` — личный кабинет стажера
- `/admin/users` — админ-панель пользователей
- `/admin/surveys` — управление опросами
- `/surveys` — список опросов для прохождения

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

Полный список — в Swagger: `http://localhost:3000/api/docs`.

## Seed-аккаунты

Сид создаёт демо-пользователей с одинаковым паролем (`password123`). Запускается **вручную** (см. выше).

- `ADMIN`: `admin@click.local`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local`
- `INTERN`: `intern1@click.local` … `intern5@click.local`

## Переменные окружения

Все ключи валидируются Joi на старте backend; приложение упадёт с понятным сообщением, если что-то пропущено.

### Backend / общие
- `DATABASE_URL` — Postgres connection string
- `JWT_ACCESS_SECRET` — ≥32 символа
- `JWT_REFRESH_SECRET` — ≥32 символа, **отличается** от access
- `JWT_ACCESS_EXPIRES_IN` — например `15m`
- `JWT_REFRESH_EXPIRES_IN` — например `7d`
- `CORS_ORIGINS` — список allowed origins через запятую
- `COOKIE_SECURE` — `true` за HTTPS, `false` иначе
- `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` — глобальный rate-limit
- `AUTH_THROTTLE_TTL_MS` / `AUTH_THROTTLE_LIMIT` — лимит на `/auth/*`
- `UPLOAD_MAX_SIZE_BYTES` — лимит размера загружаемого файла (по умолчанию 5 MiB)
- `PORT` — порт backend (default `3000`)
- `NODE_ENV` — `development` / `production` / `test`

### Только для Docker
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`

### Frontend
- `VITE_API_URL` — base URL backend, попадает в build

См. шаблоны `.env.example` и `.env.docker.example`.

## Развертывание на сервере

1. Установить Docker и Docker Compose
2. Клонировать репозиторий
3. Создать `.env.docker` (см. «Подготовка окружения»)
4. `docker compose up --build -d`
5. (Опционально) Сидинг: `docker compose run --rm backend npm run prisma:seed`
6. Поднять reverse proxy с TLS (nginx / Traefik / Caddy)
7. Перевыпустить `JWT_*_SECRET` если они когда-либо попадали в логи/чат

Подробная инструкция: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

## Документация

- Development: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
- Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
