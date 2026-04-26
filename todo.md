# Click Intern Core — план улучшений

Список технического долга и улучшений, разбитый на фазы по приоритету.
Фазы выполняются последовательно — каждая опирается на предыдущую.

**Прогресс:** Фазы 1–2 завершены · Фазы 3–6 запланированы

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

> **Статус:** запланирована
> Лечение N+1 и линейного роста запросов на админ-экранах.

- [ ] **17.** Переписать leaderboard на SQL-агрегацию (`groupBy` + `_avg`).
- [ ] **18.** Пагинация (`take/skip` + `total`) в `admin/users`, `assessments/interns/all`, `surveys/responses`.
- [ ] **19.** Индексы Prisma: `Assessment(mentorId)`, `Assessment(criterionId)` (если понадобятся), `User(role)`.
- [ ] **20.** Один источник seed: оставить `seed.ts` + `ts-node` в `prisma:seed`, удалить `seed.js`.

---

## Фаза 4. Frontend-обвязка

> **Статус:** запланирована
> Устойчивость UX к 401, единая стратегия кэширования, защита от падений.

- [ ] **21.** Axios refresh-interceptor: `401` → попытка refresh → retry оригинального запроса. С единой очередью, чтобы не было гонок параллельных рефрешей.
- [ ] **22.** `Error Boundary` на уровне `AppLayout` и pages.
- [ ] **23.** `QueryClient` defaults: `staleTime`, `retry`, `refetchOnWindowFocus`, глобальный `onError` → toast.
- [ ] **24.** Поднять `QueryClient` в `useState(() => new QueryClient(...))` или на module level.
- [ ] **25.** Доступ к access-токену из interceptor — через `useSessionStore.getState().accessToken`, не `localStorage`.
- [ ] **26.** Dashboard-метрики — либо мемоизировать, либо считать на бэке.
- [ ] **27.** `Husky` + `lint-staged` в корне репо, перекрыть оба workspace.

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
