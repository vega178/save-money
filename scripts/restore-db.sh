#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/restore-db.sh
#
# Restores a .sql.gz backup file into the running save_money_mysql container.
#
# Usage:
#   ./scripts/restore-db.sh backups/db/db_save_money_2026-05-21_10-00-00.sql.gz
#   npm run docker:db:restore -- backups/db/<filename>.sql.gz
#
# ⚠️  This OVERWRITES the current database. Make a backup first if needed.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

CONTAINER="save_money_mysql"
DB_NAME="db_save_money"
DB_USER="root"
DB_PASS="rootpassword"
HOST_PORT="3307"

ENV_FILE="$(dirname "$0")/../.env"
if [[ -f "$ENV_FILE" ]]; then
  DB_PASS=$(grep -E '^MYSQL_ROOT_PASSWORD=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '\r')
fi

BACKUP_FILE="${1:-}"

if [[ -z "$BACKUP_FILE" ]]; then
  echo "❌  Usage: $0 <path-to-backup.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -1t "$(dirname "$0")/../backups/db/"*.sql.gz 2>/dev/null || echo "  (none found)"
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌  File not found: $BACKUP_FILE"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "❌  Container '${CONTAINER}' is not running. Start the stack first."
  exit 1
fi

echo "⚠️   This will OVERWRITE the '${DB_NAME}' database."
read -rp "    Type 'yes' to continue: " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

echo "♻️   Restoring '${BACKUP_FILE}' → ${DB_NAME}..."

gunzip -c "$BACKUP_FILE" | mysql \
  -h 127.0.0.1 \
  -P "$HOST_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  2>/dev/null \
  "$DB_NAME"

echo "✅  Restore complete."
