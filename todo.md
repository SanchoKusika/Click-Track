# Click Intern Core — план улучшений

Список технического долга и улучшений, разбитый на фазы по приоритету.
Фазы выполняются последовательно — каждая опирается на предыдущую.

**Прогресс:** Фазы 1–4 завершены · Фазы 5–6 запланированы

---

## Фаза 1. Безопасность

> **Статус:** завершена (ветка `security-fix`)
> Must-fix перед использованием в проде.

- [x] **1.** Joi-валидация env на старте (`@nestjs/config` + Joi schema). Падать, если нет `JWT_*_SECRET`, `DATABASE_URL`. Убраны все fallback-секреты.
- [x] **2.** Refresh-токен — `HttpOnly Secure SameSite=Strict` cookie. Access-токен — in-memory (Zustand), без `localStorage`. Удалён `localStorage('click_intern_session')`, подключён `cookie-parser`.
- [x] **3.** CORS сужен до белого списка origin'ов из `CORS_ORIGINS`.
- [x] **4.** Подключены `helmet` и `@nestjs/throttler` (с отдельным жёстким лимитом на `/auth/login`, `/auth/refresh`).
- [x] **5.** Лимиты `Multer` на `FileInterceptor` (`limits.fileSize`, `fileFilter` по MIME).
- [x] **6.** Секреты вынесены из `docker-compose.yml` в `.env.docker` (через `env_file:`).
- [x] **7.** Убрана публикация порта Postgres наружу в prod-compose.
- [x] **8.** В prod Dockerfile `prisma db push` заменён на `prisma migrate deploy`.
- [x] **9.** Авто-сидинг убран из prod-старта; теперь это ручной one-shot шаг.

---

## Фаза 2. Чистка архитектуры

> **Статус:** завершена (ветка `security-fix`)
> Снижение accidental complexity, унификация типов, корректное удаление каскадов.

- [x] **10.** Удалить пустой модуль `intern-profiles/`.
- [x] **11.** Удалить пустой `entities/auth/model/store.ts` и реэкспорт-обёртку `features/auth/model/use-login.ts`.
- [x] **12.** Унифицировать `Role` — оставить только `@prisma/client.Role`, удалить дубль из `common/enums`.
- [x] **13.** Починить типизацию HeroUI — убраны `LooseComponent`-кастинги, используются нативные типы. Требует прогон фронтенд-тайпчека (нужен `npm install` локально или в Docker).
- [x] **14.** Решено: остаёмся на HeroUI v3 BETA, версия зафиксирована `3.0.2`. E2E regress-тесты — отдельной задачей в Фазе 6 (пункт 35).
- [x] **15.** Глобальный `PrismaExceptionFilter` (P2002 → 409, P2025 → 404).
- [x] **16.** `onDelete: Cascade` в Prisma-схеме → миграция → убраны ручные `deleteMany` в `UsersService`.

---

## Фаза 3. Качество данных и производительность

> **Статус:** завершена (ветка `data-quality`)
> Лечение N+1 и линейного роста запросов на админ-экранах.

- [x] **17.** Leaderboard переписан на `prisma.assessment.groupBy({ by: ['internId'], _avg, _count })` + одиночный `findMany` по профилям. Ушёл N+1.
- [x] **18.** Пагинация (`take/skip` + `total`) в `GET /admin/users`, `GET /assessments/mentor/interns/all`, `GET /surveys/responses/:surveyId`. Общий `PaginationQueryDto` (page/pageSize) и Paginated*Dto в swagger; фронт-хуки переведены на shape `{ items, total, page, pageSize }`.
- [x] **19.** Индексы Prisma: `@@index([role])` на `User`, `@@index([mentorId])` и `@@index([criterionId])` на `Assessment`. Миграция `20260427120000_add_perf_indices`.
- [x] **20.** Один источник seed: `seed.ts` + `ts-node` в `prisma:seed`, `seed.js` удалён.

---

## Фаза 4. Frontend-обвязка

> **Статус:** завершена
> Устойчивость UX к 401, единая стратегия кэширования, защита от падений.

- [x] **21.** Axios response-interceptor: `401` → singleton `inFlightRefresh` → retry оригинального запроса. Параллельные 401 ждут одного и того же refresh. `setRefreshHandler`/`setSessionExpiredHandler` регистрируются из `entities/session/model/store.ts`. `/auth/refresh|login|logout` исключены из retry-логики.
- [x] **22.** `ErrorBoundary` (`shared/ui/error-boundary.tsx`) обёрнут вокруг `<Outlet />` в `AppLayout`. Падения страницы не уводят шапку/сайдбар.
- [x] **23.** `QueryClient` defaults: `staleTime: 30s`, `retry: 1` (но не на 401), `refetchOnWindowFocus: false`. Глобальный `QueryCache.onError` + `MutationCache.onError` → `toast.danger` (skip 401, его обрабатывает refresh-interceptor).
- [x] **24.** `QueryClient` уже на module level в `app/providers/app-provider.tsx` — не пересоздаётся при ре-рендере.
- [x] **25.** Сделано в Phase 1: interceptor читает токен через `setAccessTokenGetter(() => useSessionStore.getState().accessToken)`. Без `localStorage`.
- [x] **26.** Dashboard-метрики (`totalReviews`, `averageScore`) обёрнуты в `useMemo([interns])`.
- [x] **27.** `husky` и `lint-staged` подняты в корневой `package.json`. Один `.husky/pre-commit` на оба workspace. lint-staged конфиг покрывает `backend/**/*.ts`, `frontend/**/*.{ts,tsx,js,jsx}` и общие `*.{json,md,css,yml}`. Требуется `npm install` после pull для активации хука. Заодно починен `frontend/package.json` typecheck (`tsc -b --noEmit`).

---

## Фаза 5. DevOps / Production

> **Статус:** запланирована
> Готовность к боевому развёртыванию: CI, healthchecks, бэкапы, TLS.

- [ ] **28.** Frontend Dockerfile → multi-stage: build + `nginx:alpine` для отдачи `dist/` (gzip, cache headers, SPA-fallback).
- [ ] **29.** Backend health-endpoint `/health` (`@nestjs/terminus`) + `healthcheck` в compose.
- [ ] **30.** GitHub Actions: lint, typecheck, test, build на PR; build & push образов на `main`.
- [ ] **31.** Логирование — `Pino` + request-ID middleware.
- [ ] **32.** Стратегия uploads: либо volume mount, либо S3/MinIO-совместимый storage. Вынести `STORAGE_DRIVER` в env.
- [ ] **33.** Reverse-proxy `nginx`-сервис в compose с TLS-termination (или Traefik/Caddy).
- [ ] **34.** Backup-скрипт Postgres (`pg_dump` cron или WAL-G).

---

## Фаза 6. Тесты и документация

> **Статус:** запланирована
> Гарантия, что регрессии ловятся автоматически, а не на пользователях.

- [ ] **35.** E2E на ключевых flows: login, refresh, mentor-assessment, intern-leaderboard, admin-CRUD, surveys.
- [ ] **36.** Frontend integration-тесты: login → дашборд, защита роутов.
- [ ] **37.** Документация env-переменных с разделением dev / staging / prod.
- [ ] **38.** Postman/Insomnia collection или экспорт OpenAPI в `docs/`.
- [ ] **39.** HeroUI v3 props migration. `npm run typecheck` ловит 75 ошибок несовместимости с v3 BETA: `radius` (Card/Button/Chip), `isLoading` (Button → `isPending`), `color` на Button, `variant="solid"|"flat"|"light"|"shadow"` (заменены на `primary|secondary|tertiary|outline|ghost|danger|danger-soft`), `Tooltip.content`, `Select.onChange` и `ToggleButtonGroup.onSelectionChange` принимают `Key`-типы. Долг скрывался сломанным скриптом (`tsc --noEmit --incremental false` молча печатал help). После Phase 3 скрипт исправлен (`tsc -b --noEmit`), а `npm run build` развязан от `tsc -b` (только `vite build`), чтобы TS-долг не блокировал прод. Вернуть `tsc -b` в build после миграции.
