#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SGROUP ERP — Automated Database Backup Script
# ═══════════════════════════════════════════════════════════════════
#
# Usage:
#   ./scripts/db-backup.sh              # Run backup
#   ./scripts/db-backup.sh --cleanup    # Run backup + delete old backups
#
# Cron example (daily at 2am):
#   0 2 * * * /path/to/scripts/db-backup.sh --cleanup >> /var/log/db-backup.log 2>&1
#
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────
CONTAINER_NAME="${DB_CONTAINER:-sgroup_erp_db}"
DB_USER="${POSTGRES_USER:-sgroup_admin}"
DB_NAME="${POSTGRES_DB:-sgroup_erp}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ── Helper ───────────────────────────────────────────────────────
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Backup ───────────────────────────────────────────────────────
mkdir -p "${BACKUP_DIR}"

DUMP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

log "📦 Starting backup of '${DB_NAME}' from container '${CONTAINER_NAME}'..."

docker exec "${CONTAINER_NAME}" pg_dump \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --format=plain \
  | gzip > "${DUMP_FILE}"

FILESIZE=$(du -h "${DUMP_FILE}" | cut -f1)
log "✅ Backup completed: ${DUMP_FILE} (${FILESIZE})"

# ── Cleanup Old Backups ──────────────────────────────────────────
if [ "${1:-}" = "--cleanup" ]; then
  log "🗑️  Cleaning backups older than ${RETENTION_DAYS} days..."
  DELETED=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete -print | wc -l)
  log "   Deleted ${DELETED} old backup(s)"
fi

# ── Summary ──────────────────────────────────────────────────────
TOTAL=$(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1)
log "📊 Total backups: ${TOTAL} (${TOTAL_SIZE})"
