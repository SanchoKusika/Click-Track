# Click Intern Core Frontend

Frontend-приложение для платформы управления стажировкой `Click Intern Core`.

Текущий фокус:

- FSD-архитектура и устойчивый foundation
- role-based маршрутизация (`ADMIN`, `MENTOR`, `INTERN`)
- session bootstrap через refresh-cookie (без `localStorage`)
- API-контракты из OpenAPI (`swagger.json`) через `Orval`
- UI на `HeroUI v3` (BETA, зафиксирован `3.0.2`) + `Tailwind v4` для layout/spacing

## Стек

- `React 19` + `TypeScript`
- `Vite`
- `HeroUI v3` (BETA `3.0.2`)
- `TailwindCSS v4` (`@tailwindcss/vite`)
- `TanStack Query`
- `Zustand`
- `React Hook Form` + `Zod`
- `Orval` (генерация API-клиента)
- `Vitest` + Testing Library
- `ESLint` + `Prettier` + `Husky` + `lint-staged`

## Реализованные роли и страницы

- `/login` — авторизация и редирект по роли
- `/dashboard` — панель ментора (assigned interns + KPI)
- `/dashboard/intern/:internId` — карточка стажёра и создание assessment
- `/me` — кабинет стажёра (оценки и leaderboard)
- `/admin/users` — CRUD пользователей для администратора
- `/admin/surveys` — управление опросами и просмотр ответов
- `/surveys` — список опросов для прохождения

## Архитектура (FSD)

`src` разделён на слои:

- `app` — providers, bootstrap, роутинг
- `pages` — page composition без низкоуровневых API-вызовов
- `widgets` — layout/shell и крупные UI-блоки
- `features` — user-facing сценарии (auth form, manage users, surveys, …)
- `entities` — доменные хуки и модели (`session`, `mentor`, `intern`, `admin`, `surveys`, `settings`)
- `shared` — API, config, ui primitives

Основные alias:

- `@/`
- `@pages/*`
- `@widgets/*`
- `@features/*`
- `@entities/*`
- `@shared/*`

Файл конфигурации линтера: [eslint.config.mjs](./eslint.config.mjs).

## Границы слоёв (ESLint Boundaries)

Разрешённые направления импортов:

- `app -> pages/widgets/features/entities/shared`
- `pages -> widgets/features/entities/shared`
- `widgets -> features/entities/shared`
- `features -> entities/shared`
- `entities -> shared`
- `shared -> shared`

`generated` API-артефакт исключён из части правил:

- `src/shared/api/generated_api.ts`

## API-пайплайн (Swagger -> Orval -> Entity hooks)

Контракт берётся из корневого файла:

- `../swagger.json` (из директории `frontend/`)

Конфиг Orval:

- [orval.config.cjs](./orval.config.cjs)

Генерируемый клиент:

- `src/shared/api/generated_api.ts`

Правило:

- `generated_api.ts` не редактируется вручную (за исключением точечных сверок типов после изменений на бэке).
- UI-слой (`pages`, `features`) не должен обращаться к `generated_api.ts` напрямую.
- Паттерн: `generated_api -> entities/*/model/*.api.ts -> features/pages`.

### Как обновить API-клиент

1. Обновить backend Swagger snapshot (из корня):

```bash
npm run swagger:generate
```

2. Сгенерировать frontend-клиент:

```bash
npm run gen:api --workspace frontend
```

## Session/Auth flow

После Phase 1 (security) сессия живёт без `localStorage`:

- Refresh-токен — `HttpOnly Secure SameSite=Strict` cookie, ставится бэкендом на `/auth/login` и ротируется на `/auth/refresh`.
- Access-токен — только в памяти (Zustand), не сохраняется на диск, не читается из interceptor через `localStorage`.
- `axios` ходит с `withCredentials: true`, чтобы cookie долетал до `/auth/refresh`.

Ключевые элементы:

- `entities/session/model/store.ts` — Zustand store (только `accessToken` + `user` в памяти) и регистрация getter'а для interceptor'а.
- `app/session-bootstrap.tsx` — на старте вызывает `POST /auth/refresh`; если cookie валидна — подгружает пользователя через `GET /users/me`, иначе остаётся анонимным.
- `app/router/protected-route.tsx` — guard по access-токену и роли.
- `shared/api/api-instance.ts` — interceptor, тянущий access-токен из зарегистрированного getter'а (без circular import с store).

Редиректы после login:

- `MENTOR -> /dashboard`
- `INTERN -> /me`
- `ADMIN -> /admin/users`

## UI система

`HeroUI v3` re-export'ится через `shared/ui/heroui.ts` с нативными типами библиотеки (без `unknown`-кастов). Сохранён только реальный wrapper `Avatar` (логика инициалов).

Глобальная палитра определена в [src/index.css](./src/index.css):

- `--bg`, `--sidebar`, `--surface`, `--surface-soft`
- `--border`, `--text`, `--muted`, `--primary`

Tailwind используется точечно: layout, spacing, responsive behavior.

> v3 BETA: версия зафиксирована (`3.0.2`). Любой апгрейд патча — через PR с прогоном тайпчека и UI smoke. Стратегия — закрепление + e2e regress-тесты (Phase 6).

## Локальный запуск

Из корня репозитория:

```bash
npm install
npm run dev --workspace frontend
```

Приложение: `http://localhost:5173`. API base URL — переменная `VITE_API_URL` (попадает в build), по умолчанию `http://localhost:3000`.

## Docker запуск

Для разработки (hot reload) — root compose с `--env-file`:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml up --build
```

Остановка:

```bash
docker compose --env-file .env.docker -f docker-compose.dev.yml down
```

> Без `--env-file` Compose не подхватывает переменные на этапе интерполяции (нужны для `VITE_API_URL` build arg).

## Скрипты

Из `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run typecheck
npm run test
npm run format
npm run format:check
npm run gen:api
```

## Troubleshooting: gen:api

Если при `gen:api` появляется ошибка вида `Host version ... does not match binary version ...`:

```bash
npm ci
npm run gen:api --workspace frontend
```

`gen:api` использует wrapper-скрипт `frontend/scripts/gen-api.cjs`, который фиксирует `ESBUILD_BINARY_PATH` на бинарь `esbuild`, установленный вместе с `@orval/core`.

## Seed-аккаунты для проверки UI

Сид backend создаёт пользователей с одинаковым паролем `password123`:

- `ADMIN`: `admin@click.local`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local`
- `INTERN`: `intern1@click.local` … `intern5@click.local`

## Тесты

Текущие проверки:

- router smoke tests
- session bootstrap tests
- login form test

Конфиг тестов:

- [vitest.config.ts](./vitest.config.ts)
- [src/setupTests.ts](./src/setupTests.ts)

## Важные ограничения

- `search`, `notifications`, `support` в layout сейчас UI-only (без бизнес-логики).
- При изменениях OpenAPI обязательно перегенерировать `generated_api.ts`, иначе типы на фронте устареют.
- HeroUI v3 — BETA. Любой апгрейд требует ручной проверки UI и тайпчека.
