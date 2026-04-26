## Фаза 1. Безопасность (must-fix перед прод-использованием)

1. Добавить @nestjs/config validation schema (Joi/Zod) — упасть на старте, если нет JWT\_\*\_SECRET, DATABASE_URL. Убрать все fallback-секреты.
2. Перевести refresh-токен в HttpOnly Secure SameSite=Strict cookie; access-токен — in-memory (Zustand) без localStorage. Удалить localStorage('click_intern_session'). Подключить cookie-parser.
3. Сузить CORS до белого списка origin'ов из env.
4. Добавить helmet и @nestjs/throttler (особенно на /auth/login, /auth/refresh).
5. Лимиты Multer на FileInterceptor (limits.fileSize, fileFilter).
6. Перенести секреты из docker-compose.yml в .env (загружать через env_file:).
7. Убрать публикацию порта Postgres наружу в prod compose.
8. Заменить prisma db push на prisma migrate deploy в prod Dockerfile.
9. Убрать авто-сидинг из prod-старта; вынести в отдельный one-shot job.

## Фаза 2. Чистка архитектуры

10. Удалить пустой модуль intern-profiles/.
11. Удалить пустой entities/auth/model/store.ts и реэкспорт-обёртку features/auth/model/use-login.ts.
12. Унифицировать Role — оставить только @prisma/client.Role, удалить дубль из common/enums.
13. Починить типизацию HeroUI — убрать LooseComponent-кастинги, использовать нативные типы (или wrap-компоненты только там, где реально нужно).
14. Решить с HeroUI v3 BETA: либо downgrade на v2 (stable), либо принять риск и зафиксировать 3.0.2 (already done) + e2e regress-тесты.
15. Глобальный PrismaExceptionFilter (P2002 → 409, P2025 → 404).
16. onDelete: Cascade в схеме Prisma → миграция → убрать ручные deleteMany в UsersService.

## Фаза 3. Качество данных и производительность

17. Переписать leaderboard на SQL-агрегацию (groupBy + \_avg).
18. Добавить пагинацию (take/skip + total) в admin/users, assessments/interns/all, surveys/responses.
19. Индексы Prisma: Assessment(mentorId), Assessment(criterionId) если нужны; User(role).
20. Один источник seed: оставить seed.ts + ts-node в prisma:seed, удалить seed.js.

## Фаза 4. Frontend-обвязка

21. Axios refresh-interceptor: 401 → попытка refresh → retry оригинального запроса. С единой очередью, чтобы не было гонок.
22. Error Boundary на уровне AppLayout и pages.
23. QueryClient defaults: staleTime, retry, refetchOnWindowFocus, глобальный onError → toast.
24. Поднять QueryClient в useState(() => new QueryClient(...)) или модуль-level.
25. Привести localStorage access из interceptor к Zustand-store (useSessionStore.getState().accessToken).
26. Dashboard-метрики — либо мемоизировать, либо вернуть с бека.
27. Husky + lint-staged на корне репозитория, перекрыть оба workspace.

## Фаза 5. DevOps / Production

28. Frontend Dockerfile → multi-stage: build + nginx:alpine для отдачи dist/ (gzip, cache headers, SPA-fallback).
29. Backend health-endpoint /health (@nestjs/terminus) + healthcheck в compose.
30. GitHub Actions: lint, typecheck, test, build на PR; build & push образов на main.
31. Logger — Pino + request-ID middleware.
32. Стратегия uploads: либо volume mount, либо S3/MinIO-совместимый storage. Вынести STORAGE_DRIVER в env.
33. Reverse-proxy nginx-сервис в compose с TLS-termination (или Traefik/Caddy).
34. Backup-скрипт Postgres (pg_dump cron или WAL-G).

## Фаза 6. Тесты и документация

35. E2E на ключевых flows: login, refresh, mentor-assessment, intern-leaderboard, admin-CRUD, surveys.
36. Frontend integration-тесты на login → дашборд, протекшен роутов.
37. Документировать env-переменные с разделением dev / staging / prod.
38. Postman/Insomnia collection или экспорт OpenAPI в docs/.
