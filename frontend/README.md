# Click Intern Core Frontend

Frontend-приложение для платформы управления стажировкой `Click Intern Core`.

Текущий фокус:

- FSD-архитектура и устойчивый foundation
- role-based маршрутизация (`ADMIN`, `MENTOR`, `INTERN`)
- session bootstrap с `localStorage`
- API-контракты из OpenAPI (`swagger.json`) через `Orval`
- UI на `HeroUI` + минимальный `Tailwind v4` для layout/spacing

## Стек

- `React 19` + `TypeScript`
- `Vite 8`
- `HeroUI`
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
- `/dashboard/intern/:internId` — карточка стажера и создание assessment
- `/me` — кабинет стажера (оценки и leaderboard)
- `/admin/users` — CRUD пользователей для администратора

## Архитектура (FSD)

`src` разделен на слои:

- `app` — providers, bootstrap, роутинг
- `pages` — page composition без низкоуровневых API-вызовов
- `widgets` — layout/shell и крупные UI-блоки
- `features` — user-facing сценарии (например, auth form)
- `entities` — доменные хуки и модели (`session`, `mentor`, `intern`, `admin`)
- `shared` — API, config, ui primitives

Основные alias:

- `@/`
- `@pages/*`
- `@widgets/*`
- `@features/*`
- `@entities/*`
- `@shared/*`

Файл конфигурации линтера: [eslint.config.mjs](./eslint.config.mjs).

## Границы слоев (ESLint Boundaries)

Разрешенные направления импортов:

- `app -> pages/widgets/features/entities/shared`
- `pages -> widgets/features/entities/shared`
- `widgets -> features/entities/shared`
- `features -> entities/shared`
- `entities -> shared`
- `shared -> shared`

`generated` API-артефакт исключен из части правил:

- `src/shared/api/generated_api.ts`

## API-пайплайн (Swagger -> Orval -> Entity hooks)

Контракт берется из корневого файла:

- `../swagger.json` (из директории `frontend/`)

Конфиг Orval:

- [orval.config.cjs](./orval.config.cjs)

Генерируемый клиент:

- `src/shared/api/generated_api.ts`

Правило:

- `generated_api.ts` не редактируется вручную.
- UI-слой (`pages`, `features`) не должен обращаться к `generated_api.ts` напрямую.
- Паттерн: `generated_api -> entities/*/model/*.api.ts -> features/pages`.

### Как обновить API-клиент

1. Обновить backend Swagger snapshot:

```bash
cd <repo-root>/intern-track
npm run swagger:generate
```

2. Сгенерировать frontend-клиент:

```bash
cd <repo-root>/intern-track
npm run gen:api --workspace frontend
```

## Session/Auth flow

Ключевые элементы:

- `entities/session/model/session.service.ts` — чтение/запись `click_intern_session`
- `entities/session/model/store.ts` — Zustand store и bootstrap
- `app/session-bootstrap.tsx` — восстановление сессии на старте:
  - пробует `GET /users/me`
  - при `401` делает `POST /auth/refresh`
  - при провале очищает сессию
- `app/router/protected-route.tsx` — guard по токену и роли

Редиректы после login:

- `MENTOR -> /dashboard`
- `INTERN -> /me`
- `ADMIN -> /admin/users`

## UI система

`HeroUI` обернут в `shared/ui/heroui.ts`, чтобы централизовать импорт компонентов.

Глобальная палитра определена в [src/index.css](./src/index.css):

- `--bg`, `--sidebar`, `--surface`, `--surface-soft`
- `--border`, `--text`, `--muted`, `--primary`

Tailwind используется точечно:

- layout
- spacing
- responsive behavior

## Локальный запуск

Из корня репозитория:

```bash
cd <repo-root>/intern-track
npm install
npm install --workspace frontend
npm run dev --workspace frontend
```

Приложение:

- `http://localhost:5173`

API base URL:

- переменная `VITE_API_URL`
- по умолчанию в коде: `http://localhost:3000`

## Docker запуск

Для разработки (hot reload) используйте root compose:

```bash
cd <repo-root>/intern-track
docker compose -f docker-compose.dev.yml up --build -d
docker compose -f docker-compose.dev.yml ps
```

Остановка:

```bash
docker compose -f docker-compose.dev.yml down
```

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

Из корня:

```bash
npm run build --workspace frontend
npm run lint --workspace frontend
npm run typecheck --workspace frontend
npm run test --workspace frontend
npm run gen:api --workspace frontend
```

## Troubleshooting: gen:api

Если при `gen:api` появляется ошибка вида `Host version ... does not match binary version ...`:

```bash
cd <repo-root>/intern-track
npm ci
npm run gen:api --workspace frontend
```

`gen:api` использует wrapper-скрипт `frontend/scripts/gen-api.cjs`, который фиксирует `ESBUILD_BINARY_PATH` на бинарь `esbuild`, установленный вместе с `@orval/core`.

## Seed-аккаунты для проверки UI

Эти аккаунты создает backend seed:

- `ADMIN`: `admin@click.local` / `Admin@123`
- `MENTOR`: `mentor1@click.local`, `mentor2@click.local` / `Mentor@123`
- `INTERN`: `intern1@click.local` .. `intern5@click.local` / `Intern@123`

## Тесты

Текущие проверки включают:

- router smoke tests
- session bootstrap tests
- login form test

Конфиг тестов:

- [vitest.config.ts](./vitest.config.ts)
- [src/setupTests.ts](./src/setupTests.ts)

## Важные ограничения

- `search`, `notifications`, `settings`, `support` в layout сейчас UI-only (без бизнес-логики).
- При изменениях OpenAPI обязательно перегенерировать `generated_api.ts`, иначе типы на фронте устареют.
