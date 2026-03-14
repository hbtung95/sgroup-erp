#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# SGROUP ERP — Database Backup Script
# Supports: Neon Postgres (serverless), standard PostgreSQL
# Usage: bash backup-db.sh [daily|weekly|manual]
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ──
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_URL="${DATABASE_URL:?DATABASE_URL not set}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-manual}"
BACKUP_FILE="${BACKUP_DIR}/sgroup_erp_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

# ── Ensure backup directory exists ──
mkdir -p "$BACKUP_DIR"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  SGROUP ERP — Database Backup                        ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Type:      ${BACKUP_TYPE}"
echo "║  Timestamp: ${TIMESTAMP}"
echo "║  Output:    ${BACKUP_FILE}"
echo "╚══════════════════════════════════════════════════════╝"

# ── Step 1: pg_dump → gzip ──
echo "→ Running pg_dump..."
pg_dump "$DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --format=plain \
  2>/dev/null | gzip > "$BACKUP_FILE"

FILESIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "✓ Backup created: ${BACKUP_FILE} (${FILESIZE})"

# ── Step 2: Verify backup integrity ──
echo "→ Verifying backup integrity..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
  echo "✓ Backup integrity OK"
else
  echo "✗ Backup file is corrupted!"
  exit 1
fi

# ── Step 3: Cleanup old backups ──
echo "→ Cleaning backups older than ${RETENTION_DAYS} days..."
DELETED=$(find "$BACKUP_DIR" -name "sgroup_erp_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "✓ Deleted ${DELETED} old backup(s)"

# ── Step 4: Summary ──
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "sgroup_erp_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo "══════════════════════════════════════════════════════"
echo "  Backup complete!"
echo "  Total backups: ${TOTAL_BACKUPS} (${TOTAL_SIZE})"
echo "══════════════════════════════════════════════════════"

# ── Optional: Upload to S3 (uncomment to enable) ──
# aws s3 cp "$BACKUP_FILE" s3://sgroup-erp-backups/db/${BACKUP_TYPE}/ --storage-class STANDARD_IA
# echo "✓ Uploaded to S3"
