#!/usr/bin/env bash
set -euo pipefail

# Restore a Postgres dump produced by db-backup.sh.
# Usage:  ./scripts/db-restore.sh <dump-file-name>
#         (file must already live inside the postgres_backups volume,
#          i.e. /backups/<name> in the postgres container)

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <dump-file-name>" >&2
  exit 1
fi

DUMP_NAME="$1"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE="${POSTGRES_SERVICE:-postgres}"
ENV_FILE="${ENV_FILE:-.env.docker}"

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T \
  -e PGPASSWORD="$POSTGRES_PASSWORD" \
  "$SERVICE" \
  sh -c "pg_restore --clean --if-exists -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\" \"/backups/$DUMP_NAME\""

echo "OK: restored from $DUMP_NAME"
