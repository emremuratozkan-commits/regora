#!/bin/bash
# REGORA Database Restore Script
# Usage: ./restore.sh <backup_file_or_s3_key>

set -euo pipefail

BACKUP_SOURCE="${1:-}"
BACKUP_DIR="/opt/regora/backups"
S3_BUCKET="${S3_BACKUP_BUCKET:-regora-backups}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

if [ -z "$BACKUP_SOURCE" ]; then
    echo "Usage: $0 <backup_file_or_s3_key>"
    echo ""
    echo "Examples:"
    echo "  $0 /opt/regora/backups/regora_20240115_120000.sql.gz"
    echo "  $0 regora_20240115_120000.sql.gz  # Downloads from S3"
    echo ""
    echo "Available local backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  (none)"
    exit 1
fi

# Determine if we need to download from S3
if [ -f "$BACKUP_SOURCE" ]; then
    BACKUP_FILE="$BACKUP_SOURCE"
elif [ -f "$BACKUP_DIR/$BACKUP_SOURCE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_SOURCE"
else
    # Download from S3
    log "Downloading backup from S3..."
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_SOURCE"
    aws s3 cp "s3://$S3_BUCKET/database/$BACKUP_SOURCE" "$BACKUP_FILE" \
        || error "Failed to download from S3"
fi

log "Using backup file: $BACKUP_FILE"

# Load environment
source /opt/regora/.env.production 2>/dev/null || true

DB_HOST="${POSTGRES_HOST:-postgres}"
DB_NAME="${POSTGRES_DB:-regora}"
DB_USER="${POSTGRES_USER:-regora}"
export PGPASSWORD="${POSTGRES_PASSWORD:-}"

# Confirmation
echo ""
warn "⚠️  This will REPLACE ALL DATA in database: $DB_NAME"
warn "⚠️  This action cannot be undone!"
echo ""
read -p "Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
    error "Restore cancelled"
fi

# Create pre-restore backup
log "Creating pre-restore backup..."
./scripts/backup.sh "pre-restore-$(date +%Y%m%d_%H%M%S)"

# Stop backend to prevent writes
log "Stopping backend service..."
docker-compose -f docker-compose.prod.yml stop backend || true

# Restore database
log "Restoring database from backup..."
zcat "$BACKUP_FILE" | docker exec -i regora-postgres-prod pg_restore \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    || warn "Restore completed with warnings"

# Run any pending migrations
log "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npm run db:migrate:prod

# Restart backend
log "Restarting backend service..."
docker-compose -f docker-compose.prod.yml start backend

# Verify
log "Verifying restore..."
sleep 5
curl -f http://localhost:3001/health || warn "Health check failed"

log "✅ Database restore completed successfully!"

# Notify
if [ -n "${SLACK_WEBHOOK:-}" ]; then
    curl -s -X POST "$SLACK_WEBHOOK" \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ REGORA database restore completed from: $BACKUP_SOURCE\"}" \
        || true
fi
