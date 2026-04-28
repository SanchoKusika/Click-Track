#!/usr/bin/env bash
set -euo pipefail

# Postgres dump rotation script.
# Usage:  ./scripts/db-backup.sh
# Runs pg_dump inside the running postgres container and writes a custom-format
# dump into the postgres_backups volume. Keeps the last RETENTION_DAYS days.

RETENTION_DAYS="${RETENTION_DAYS:-14}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${POSTGRES_SERVICE:-postgres}"
ENV_FILE="${ENV_FILE:-.env.docker}"

if [ ! -f "$ENV_FILE" ]; then
  echo "env file not found: $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

TS="$(date +%Y%m%d-%H%M%S)"
DUMP_FILE="/backups/db-${TS}.dump"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$SERVICE" \
  sh -c "mkdir -p /backups && pg_dump -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\" -F c -f \"$DUMP_FILE\" && find /backups -name 'db-*.dump' -mtime +${RETENTION_DAYS} -delete && ls -lh \"$DUMP_FILE\""

echo "OK: $DUMP_FILE"
