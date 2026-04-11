# Deployment Guide

Этот документ описывает развертывание `Click Intern Core` на сервере через Docker Compose.

## 1) Подготовка сервера

Минимально:

- Linux сервер (Ubuntu 22.04+)
- 2 CPU, 4 GB RAM (для MVP)
- Открытые порты:
  - `80/443` (через reverse proxy)
  - внутренние `3000`, `5173`, `5432` можно не публиковать наружу

Установите Docker и Docker Compose plugin:

- [Install Docker Engine](https://docs.docker.com/engine/install/)
- [Install Docker Compose](https://docs.docker.com/compose/install/linux/)

## 2) Деплой проекта

1. Склонируйте репозиторий:
   - `git clone <repo-url> click-intern-core`
   - `cd click-intern-core`
2. Запустите production-стек:
   - `docker compose up --build -d`
3. Проверьте сервисы:
   - `docker compose ps`
   - `docker compose logs -f backend`
   - `docker compose logs -f frontend`

## 3) Доступ к приложению

По умолчанию:

- Frontend: `http://<server-ip>:5173`
- Backend: `http://<server-ip>:3000`

Для production рекомендуется reverse proxy (Nginx/Caddy) и HTTPS.

## 4) Обновление версии

1. Подтянуть изменения:
   - `git pull`
2. Пересобрать и перезапустить:
   - `docker compose up --build -d`
3. Проверить логи:
   - `docker compose logs -f --tail=200`

## 5) Backup и восстановление PostgreSQL

Backup:

- `docker exec -t click-intern-postgres pg_dump -U postgres -d click_intern_core > backup.sql`

Restore:

- `cat backup.sql | docker exec -i click-intern-postgres psql -U postgres -d click_intern_core`

## 6) Рекомендации для production hardening

- Заменить JWT секреты на сильные случайные значения
- Не публиковать `5432` в интернет
- Добавить reverse proxy + HTTPS
- Добавить мониторинг и алерты (Prometheus/Grafana, Uptime checks)
- Регулярные backup БД и проверка восстановления
