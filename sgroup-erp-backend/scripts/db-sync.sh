#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# SGROUP ERP — Database Sync Script (Self-hosted ↔ Supabase)
# ═══════════════════════════════════════════════════════════════════
#
# Usage:
#   ./scripts/db-sync.sh export-local     # Dump từ Docker container
#   ./scripts/db-sync.sh import-supabase  # Restore lên Supabase
#   ./scripts/db-sync.sh export-supabase  # Dump từ Supabase
#   ./scripts/db-sync.sh import-local     # Restore vào Docker container
#   ./scripts/db-sync.sh full-sync-up     # export-local + import-supabase
#   ./scripts/db-sync.sh full-sync-down   # export-supabase + import-local
#
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────
CONTAINER_NAME="${DB_CONTAINER:-sgroup_erp_db}"
LOCAL_DB_USER="${POSTGRES_USER:-sgroup_admin}"
LOCAL_DB_NAME="${POSTGRES_DB:-sgroup_erp}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="${BACKUP_DIR}/sgroup_erp_${TIMESTAMP}.sql"

# Supabase connection (from .env or environment)
SUPABASE_URL="${SUPABASE_DB_URL:-}"

# ── Helper Functions ─────────────────────────────────────────────
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
error() { log "❌ ERROR: $*" >&2; exit 1; }
success() { log "✅ $*"; }

ensure_backup_dir() {
  mkdir -p "${BACKUP_DIR}"
}

check_supabase_url() {
  if [ -z "${SUPABASE_URL}" ]; then
    error "SUPABASE_DB_URL not set. Add it to .env or export it."
  fi
}

# ── Commands ─────────────────────────────────────────────────────

export_local() {
  log "📦 Exporting from local Docker container '${CONTAINER_NAME}'..."
  ensure_backup_dir
  docker exec "${CONTAINER_NAME}" pg_dump \
    -U "${LOCAL_DB_USER}" \
    -d "${LOCAL_DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --format=plain \
    > "${DUMP_FILE}"
  success "Exported to ${DUMP_FILE} ($(du -h "${DUMP_FILE}" | cut -f1))"
}

import_supabase() {
  check_supabase_url
  local latest_dump
  latest_dump=$(ls -t "${BACKUP_DIR}"/sgroup_erp_*.sql 2>/dev/null | head -1)
  if [ -z "${latest_dump}" ]; then
    error "No dump files found in ${BACKUP_DIR}. Run 'export-local' first."
  fi
  log "📤 Importing ${latest_dump} to Supabase..."
  psql "${SUPABASE_URL}" < "${latest_dump}"
  success "Imported to Supabase successfully!"
}

export_supabase() {
  check_supabase_url
  ensure_backup_dir
  local supabase_dump="${BACKUP_DIR}/supabase_${TIMESTAMP}.sql"
  log "📦 Exporting from Supabase..."
  pg_dump "${SUPABASE_URL}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --format=plain \
    > "${supabase_dump}"
  success "Exported Supabase to ${supabase_dump} ($(du -h "${supabase_dump}" | cut -f1))"
}

import_local() {
  local latest_dump
  latest_dump=$(ls -t "${BACKUP_DIR}"/supabase_*.sql 2>/dev/null | head -1)
  if [ -z "${latest_dump}" ]; then
    error "No Supabase dump files found in ${BACKUP_DIR}. Run 'export-supabase' first."
  fi
  log "📥 Importing ${latest_dump} to local Docker container..."
  docker exec -i "${CONTAINER_NAME}" psql \
    -U "${LOCAL_DB_USER}" \
    -d "${LOCAL_DB_NAME}" \
    < "${latest_dump}"
  success "Imported to local container successfully!"
}

full_sync_up() {
  log "🔄 Full sync: Local → Supabase"
  export_local
  import_supabase
  success "Full sync UP completed!"
}

full_sync_down() {
  log "🔄 Full sync: Supabase → Local"
  export_supabase
  import_local
  success "Full sync DOWN completed!"
}

# ── Main ─────────────────────────────────────────────────────────
case "${1:-help}" in
  export-local)    export_local ;;
  import-supabase) import_supabase ;;
  export-supabase) export_supabase ;;
  import-local)    import_local ;;
  full-sync-up)    full_sync_up ;;
  full-sync-down)  full_sync_down ;;
  *)
    echo "Usage: $0 {export-local|import-supabase|export-supabase|import-local|full-sync-up|full-sync-down}"
    echo ""
    echo "Commands:"
    echo "  export-local      Dump local Docker DB to backups/"
    echo "  import-supabase   Restore latest local dump to Supabase"
    echo "  export-supabase   Dump Supabase DB to backups/"
    echo "  import-local      Restore latest Supabase dump to local Docker"
    echo "  full-sync-up      Local → Supabase (export + import)"
    echo "  full-sync-down    Supabase → Local (export + import)"
    exit 1
    ;;
esac
