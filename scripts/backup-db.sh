#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/backup-db.sh
#
# Creates a timestamped MySQL dump from the running save_money_mysql container.
# Safe to run at any time while the stack is up — does NOT stop the database.
#
# Usage:
#   ./scripts/backup-db.sh                  # manual run
#   npm run docker:db:backup                # via npm script
#
# Output:
#   backups/db/db_save_money_YYYY-MM-DD_HH-MM-SS.sql.gz
#
# Restore a backup:
#   npm run docker:db:restore -- backups/db/<filename>.sql.gz
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
CONTAINER="save_money_mysql"
DB_NAME="db_save_money"
# Use root for the dump — appuser lacks DROP TABLE privileges needed for a full
# restorable dump. Root credentials are read from .env below.
DB_USER="root"
DB_PASS="rootpassword"
HOST_PORT="3307"   # port exposed on the Mac host (maps to container 3306)
BACKUP_DIR="$(dirname "$0")/../backups/db"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"

# Override root password from .env if it exists
ENV_FILE="$(dirname "$0")/../.env"
if [[ -f "$ENV_FILE" ]]; then
  DB_PASS=$(grep -E '^MYSQL_ROOT_PASSWORD=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '\r')
fi

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "❌  Container '${CONTAINER}' is not running. Start the stack first."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# ── Dump ──────────────────────────────────────────────────────────────────────
echo "📦  Backing up '${DB_NAME}' → ${BACKUP_DIR}/${FILENAME}"

mysqldump \
  -h 127.0.0.1 \
  -P "$HOST_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  "$DB_NAME" \
  2>/dev/null \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "✅  Backup complete: ${BACKUP_DIR}/${FILENAME} (${SIZE})"

# ── Retention: keep only the last 30 backups ─────────────────────────────────
KEEP=30
COUNT=$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
if (( COUNT > KEEP )); then
  DELETE=$(( COUNT - KEEP ))
  echo "🧹  Removing ${DELETE} old backup(s) (keeping last ${KEEP})..."
  ls -1t "${BACKUP_DIR}"/*.sql.gz | tail -n "$DELETE" | xargs rm -f
fi
