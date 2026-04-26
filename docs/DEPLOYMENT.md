# Deployment Guide

Этот документ описывает развертывание `Click Intern Core` на сервере через Docker Compose.

## 1) Подготовка сервера

Минимально:

- Linux сервер (Ubuntu 22.04+)
- 2 CPU, 4 GB RAM (для MVP)
- Открыть наружу только `80/443` (через reverse proxy). Backend (`3000`) и frontend (`5173`) внутри docker-сети, Postgres (`5432`) **никогда** не публикуется наружу — `docker-compose.yml` не маппит его порт.

Установите Docker и Docker Compose plugin:

- [Install Docker Engine](https://docs.docker.com/engine/install/)
- [Install Docker Compose](https://docs.docker.com/compose/install/linux/)

## 2) Подготовка `.env.docker`

1. Склонируйте репозиторий:
   - `git clone <repo-url> click-intern-core`
   - `cd click-intern-core`
2. Скопируйте шаблон и заполните секреты:
   - `cp .env.docker.example .env.docker`
3. Сгенерируйте два разных JWT-секрета (≥32 символа каждый):
   - `openssl rand -hex 32` (для `JWT_ACCESS_SECRET`)
   - `openssl rand -hex 32` (для `JWT_REFRESH_SECRET`)
4. Замените в `.env.docker`:
   - `POSTGRES_PASSWORD` — сильный случайный пароль
   - `DATABASE_URL` — должен использовать тот же пароль
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — выводы команд выше
   - `CORS_ORIGINS` — прод-домен(ы) frontend через запятую
   - `COOKIE_SECURE=true` (за HTTPS)
   - `VITE_API_URL` — публичный URL backend для frontend-сборки

> Файл `.env.docker` **локальный**, исключён `.gitignore`. Не коммитьте его и не пересылайте через мессенджеры/чаты.

## 3) Запуск production-стека

```bash
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f backend
```

При старте backend-контейнер автоматически выполнит `prisma migrate deploy` и применит все миграции из `backend/prisma/migrations/`. Сидинг (`prisma:seed`) **не запускается автоматически** — это опциональный one-shot шаг:

```bash
docker compose --env-file .env.docker run --rm backend npm run prisma:seed
```

## 4) Reverse-proxy и HTTPS

Опубликовать наружу только `443/80`. Backend и frontend проксировать через nginx / Traefik / Caddy с TLS-termination. После настройки HTTPS:

- `COOKIE_SECURE=true` в `.env.docker` (иначе браузер дропнет refresh-cookie)
- `CORS_ORIGINS` должен содержать публичный HTTPS-домен(ы) frontend
- Перезапустить backend: `docker compose --env-file .env.docker up -d --force-recreate backend`

## 5) Обновление версии

```bash
git pull
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker logs -f --tail=200
```

Новые миграции применяются автоматически на старте backend.

## 6) Backup и восстановление PostgreSQL

Контейнер БД называется `click-intern-postgres`.

Backup:

```bash
docker exec -t click-intern-postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > backup.sql
```

Restore:

```bash
cat backup.sql | docker exec -i click-intern-postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

> Подменяйте `$POSTGRES_USER` / `$POSTGRES_DB` своими значениями или экспортируйте их перед командой из `.env.docker`.

## 7) Production hardening

- ✅ Сильные JWT-секреты, разные для access и refresh.
- ✅ `5432` не публикуется наружу (по умолчанию compose так и сделан).
- ✅ Refresh-токен живёт в `HttpOnly Secure SameSite=Strict` cookie; access-токен — в памяти frontend.
- ✅ `helmet`, CORS-whitelist, throttler с отдельным жёстким лимитом на `/auth/*`.
- ✅ Joi-валидация env на старте (приложение не поднимется без обязательных ключей).
- 🔲 Reverse proxy с HTTPS (см. п.4).
- 🔲 Регулярные backup БД и проверка восстановления (см. п.6).
- 🔲 Мониторинг и алерты (Prometheus/Grafana, Uptime checks).
- 🔲 Перевыпустить `JWT_*_SECRET`, если они когда-либо попадали в логи / чат / git.
