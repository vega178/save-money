#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/safe-reset.sh
#
# ⚠️  This script DESTROYS the mysql_data volume (full reset).
# It ALWAYS creates an automatic backup first so your data is never lost.
#
# Usage:
#   npm run docker:reset        # backs up, then does docker compose down -v
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo ""
echo "⚠️  WARNING: This will delete the MySQL data volume (full reset)."
echo "   A backup will be created first automatically."
echo ""
read -rp "   Type 'yes' to continue: " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted. Nothing was changed."
  exit 0
fi

# ── Step 1: Auto-backup ───────────────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -q "^save_money_mysql$"; then
  echo ""
  echo "📦  Step 1/2 — Creating backup before reset..."
  bash "${SCRIPT_DIR}/backup-db.sh"
else
  echo "ℹ️   MySQL container is not running — skipping backup."
fi

# ── Step 2: Down with volumes ─────────────────────────────────────────────────
echo ""
echo "🗑   Step 2/2 — Tearing down containers and volumes..."
cd "$PROJECT_DIR"
docker compose down -v

echo ""
echo "✅  Reset complete. All containers and volumes removed."
echo "    Your backup is in: ${PROJECT_DIR}/backups/db/"
echo ""
echo "    To restore it after starting the stack again:"
echo "    npm run docker:up:detach && npm run docker:db:restore -- <backup-file>"
