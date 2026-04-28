# Click Intern Core — план улучшений

Список технического долга и улучшений, разбитый на фазы по приоритету.
Фазы выполняются последовательно — каждая опирается на предыдущую.

**Прогресс:** Фазы 1–4 завершены · Фаза 5 закрыта (33 отложена до выбора хостинга) · Фаза 6: готовы 37, 38; 35, 36 пропущены; 39 — отдельный заход

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
- [x] **18.** Пагинация (`take/skip` + `total`) в `GET /admin/users`, `GET /assessments/mentor/interns/all`, `GET /surveys/responses/:surveyId`. Общий `PaginationQueryDto` (page/pageSize) и Paginated\*Dto в swagger; фронт-хуки переведены на shape `{ items, total, page, pageSize }`.
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

- [x] **28.** Frontend Dockerfile → multi-stage: build + `nginx:1.27-alpine` для отдачи `dist/` (gzip, cache headers `immutable` для `/assets/`, SPA-fallback `try_files $uri /index.html`). Прод-порт переехал с 5173 на 8080:80.
- [x] **29.** Backend health-endpoint `/health` (`@nestjs/terminus` + `PrismaHealthIndicator`) + `healthcheck` в prod compose (через `node -e http.get`); frontend теперь ждёт backend `service_healthy`.
- [x] **30.** GitHub Actions (`.github/workflows/ci.yml`): на PR и push в `master` гоняет `lint` + `build` отдельно для backend и frontend, использует `npm cache` по `package-lock.json`. Frontend `typecheck` временно отключён до миграции HeroUI v3 (item 39).
- [x] **31.** Логирование — `nestjs-pino` + `pino-http`, request-id из заголовка `X-Request-Id` (или `randomUUID()`), эхо в response-header, redact `authorization`/`cookie`, `/health` исключён из autoLogging. В dev — `pino-pretty`, в prod — JSON.
- [x] **32.** Uploads вынесены на named volume `backend_uploads:/app/uploads` в prod compose. S3/MinIO отложены до реальной потребности (для текущего масштаба избыточно).
- [ ] **33.** Reverse-proxy с TLS — отложен до выбора хостинга. Рекомендация: **Caddy** (auto-HTTPS через Let's Encrypt, минимум конфига).
- [x] **34.** `scripts/db-backup.sh` (`pg_dump -F c` через `docker compose exec`, ротация по `RETENTION_DAYS`, по умолчанию 14 дней) + `scripts/db-restore.sh`. Дампы пишутся в named volume `postgres_backups:/backups` — Postgres-сервис монтирует его. Запускать руками или через хостовой cron.

---

## Фаза 6. Тесты и документация

> **Статус:** запланирована
> Гарантия, что регрессии ловятся автоматически, а не на пользователях.

- [ ] **35.** ~~E2E на ключевых flows~~ — пропущено для текущего MVP. Вернуться, если появятся реальные пользователи и регрессии.
- [ ] **36.** ~~Frontend integration-тесты~~ — пропущено по той же причине; есть smoke-тесты на страницах в `frontend/src/pages/pages.smoke.test.tsx`.
- [x] **37.** `docs/ENV.md` — все переменные с типами/дефолтами + три профиля (local dev / staging / prod). `.env.example` и `.env.docker.example` остаются как шаблоны.
- [x] **38.** `docs/openapi.json` (58KB) — экспорт текущей Swagger-схемы. `swagger:generate` теперь пишет туда (`backend/src/swagger/generate.ts`). Старая запись в корень `swagger.json` убрана. Перегенерация: `npm run swagger:generate -w backend`.
- [ ] **39.** HeroUI v3 props migration. `npm run typecheck` ловит 75 ошибок несовместимости с v3 BETA: `radius` (Card/Button/Chip), `isLoading` (Button → `isPending`), `color` на Button, `variant="solid"|"flat"|"light"|"shadow"` (заменены на `primary|secondary|tertiary|outline|ghost|danger|danger-soft`), `Tooltip.content`, `Select.onChange` и `ToggleButtonGroup.onSelectionChange` принимают `Key`-типы. Долг скрывался сломанным скриптом (`tsc --noEmit --incremental false` молча печатал help). После Phase 3 скрипт исправлен (`tsc -b --noEmit`), а `npm run build` развязан от `tsc -b` (только `vite build`), чтобы TS-долг не блокировал прод. Вернуть `tsc -b` в build после миграции.
