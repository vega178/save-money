#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/setup-cron.sh
#
# Installs a cron job that runs the backup script automatically.
# Run this ONCE on your Mac to activate scheduled backups.
#
# Usage:
#   ./scripts/setup-cron.sh            # daily at 02:00 (default)
#   ./scripts/setup-cron.sh remove     # remove the cron job
#   npm run docker:db:cron             # via npm
#   npm run docker:db:cron:remove      # remove via npm
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-db.sh"
LOG_FILE="${SCRIPT_DIR}/../backups/db/backup-cron.log"
CRON_MARKER="save-money-db-backup"

# Default schedule: every day at 02:00
# Format: minute hour day-of-month month day-of-week
CRON_SCHEDULE="0 2 * * *"
CRON_JOB="${CRON_SCHEDULE} ${BACKUP_SCRIPT} >> ${LOG_FILE} 2>&1  # ${CRON_MARKER}"

ACTION="${1:-install}"

if [[ "$ACTION" == "remove" ]]; then
  echo "🗑   Removing backup cron job..."
  crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | crontab -
  echo "✅  Cron job removed."
  exit 0
fi

# Make scripts executable
chmod +x "$BACKUP_SCRIPT"
chmod +x "${SCRIPT_DIR}/restore-db.sh"

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Add to crontab (skip if already present)
CURRENT_CRON=$(crontab -l 2>/dev/null || true)
if echo "$CURRENT_CRON" | grep -q "$CRON_MARKER"; then
  echo "ℹ️   Cron job already installed. No changes made."
else
  (echo "$CURRENT_CRON"; echo "$CRON_JOB") | crontab -
  echo "✅  Cron job installed: runs every day at 02:00"
  echo "    Script : ${BACKUP_SCRIPT}"
  echo "    Log    : ${LOG_FILE}"
  echo ""
  echo "To change the schedule, edit the cron job with: crontab -e"
  echo "To remove it, run: npm run docker:db:cron:remove"
fi
