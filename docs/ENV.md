# Переменные окружения

В проекте два env-файла:

- `.env` (или `backend/.env`) — локальный dev без Docker (`npm run dev:backend`). Шаблон: `.env.example`.
- `.env.docker` — оба docker-стека (`docker-compose.yml` для прод, `docker-compose.dev.yml` для dev). Шаблон: `.env.docker.example`.

Оба загружаются через `@nestjs/config` и валидируются Joi на старте — бэкенд не запустится, если обязательная переменная отсутствует или неверного формата.

## Список переменных

| Переменная                                            | Обязательна     | По умолчанию            | Комментарий                                                                                                                                          |
| ----------------------------------------------------- | --------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                            | нет             | `development`           | Одно из `development \| production \| test`. Влияет на формат логов (Pino pretty vs JSON) и установку devDeps в контейнерах.                         |
| `PORT`                                                | нет             | `3000`                  | HTTP-порт бэкенда.                                                                                                                                   |
| `DATABASE_URL`                                        | **да**          | —                       | Строка подключения к Postgres. В Docker host — `postgres` (имя сервиса), локально обычно `localhost`.                                                |
| `JWT_ACCESS_SECRET`                                   | **да**          | —                       | Минимум 32 символа. Сгенерировать: `openssl rand -hex 32`.                                                                                           |
| `JWT_REFRESH_SECRET`                                  | **да**          | —                       | Минимум 32 символа. Должен отличаться от access.                                                                                                     |
| `JWT_ACCESS_EXPIRES_IN`                               | нет             | `15m`                   | TTL access-токена (формат ms / vercel-ms).                                                                                                           |
| `JWT_REFRESH_EXPIRES_IN`                              | нет             | `7d`                    | TTL refresh-cookie.                                                                                                                                  |
| `CORS_ORIGINS`                                        | нет             | `http://localhost:5173` | Белый список через запятую. **В проде обязан содержать реальный origin фронта** (например `https://app.example.com`).                                |
| `COOKIE_SECURE`                                       | нет             | `false`                 | `true` только за HTTPS. Браузеры молча отбрасывают `Secure`-куки на голом HTTP — если оставить `true` на `http://localhost`, refresh-flow сломается. |
| `THROTTLE_TTL_MS`                                     | нет             | `60000`                 | Окно глобального rate-limit (мс).                                                                                                                    |
| `THROTTLE_LIMIT`                                      | нет             | `100`                   | Запросов в окно с одного IP для дефолтного бакета.                                                                                                   |
| `AUTH_THROTTLE_TTL_MS`                                | нет             | `60000`                 | Окно для `/auth/login` и `/auth/refresh`.                                                                                                            |
| `AUTH_THROTTLE_LIMIT`                                 | нет             | `10`                    | Жёсткий лимит на auth-эндпоинты. В dev можно поднять до 30–50, если упираешься.                                                                      |
| `UPLOAD_MAX_SIZE_BYTES`                               | нет             | `5242880` (5 МБ)        | Лимит Multer на размер одного файла.                                                                                                                 |
| `VITE_API_URL`                                        | да (build-time) | `http://localhost:3000` | Зашивается в бандл фронта на этапе `vite build`. После смены — пересобрать образ.                                                                    |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | только docker   | —                       | Используются сервисом `postgres`. Должны совпадать с теми, что в `DATABASE_URL`.                                                                     |

## Различия профилей

### Локальный dev (`.env`)

- `NODE_ENV=development`
- `COOKIE_SECURE=false`
- `DATABASE_URL` указывает на `localhost:5432` (или туда, где у тебя локальный Postgres).
- `CORS_ORIGINS=http://localhost:5173`
- Throttling можно расслабить.

### Staging (прод-compose за HTTPS-фронтом)

- `NODE_ENV=production`
- `COOKIE_SECURE=true` (обязательно за HTTPS).
- `CORS_ORIGINS=https://staging.example.com`
- `VITE_API_URL=https://api.staging.example.com` (после смены — пересобрать образ фронта).
- JWT-секреты те же, что в проде? **Нет** — для каждого окружения свои.
- `AUTH_THROTTLE_LIMIT=10` (дефолт ок).

### Production

- `NODE_ENV=production`
- `COOKIE_SECURE=true`.
- Сильные уникальные секреты — никогда не переиспользовать staging.
- `CORS_ORIGINS=https://app.example.com` (только реальные origin'ы прод-фронта; никаких wildcard).
- `POSTGRES_PASSWORD` сильный, ротируется, не коммитится.
- `UPLOAD_MAX_SIZE_BYTES` согласован с лимитом reverse-proxy (`client_max_body_size` в nginx).

## Секреты и хранение

- `.env` и `.env.docker` в `.gitignore`. В репе только `.env.example` и `.env.docker.example`.
- В реальном проде лучше использовать секрет-менеджер (Doppler, 1Password, AWS SSM, Vault), а не env-файл на сервере.
