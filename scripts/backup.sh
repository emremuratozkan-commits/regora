#!/bin/bash
# REGORA Database Backup Script
# Usage: ./backup.sh [backup_name]

set -euo pipefail

# Configuration
BACKUP_NAME="${1:-$(date +%Y%m%d_%H%M%S)}"
BACKUP_DIR="/opt/regora/backups"
S3_BUCKET="${S3_BACKUP_BUCKET:-regora-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Colors for output
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting backup: $BACKUP_NAME"

# Get database credentials from environment or docker-compose
if [ -z "${DATABASE_URL:-}" ]; then
    source /opt/regora/.env.production 2>/dev/null || true
fi

# Extract connection details
DB_HOST="${POSTGRES_HOST:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-regora}"
DB_USER="${POSTGRES_USER:-regora}"
export PGPASSWORD="${POSTGRES_PASSWORD:-}"

BACKUP_FILE="$BACKUP_DIR/regora_${BACKUP_NAME}.sql.gz"

# Create PostgreSQL backup
log "Creating PostgreSQL dump..."
docker exec regora-postgres-prod pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --compress=9 \
    > "$BACKUP_FILE" || error "Database dump failed"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Upload to S3 if AWS CLI is available
if command -v aws &> /dev/null && [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
    log "Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database/$(basename $BACKUP_FILE)" \
        --storage-class STANDARD_IA \
        || warn "S3 upload failed, backup remains local only"
    log "Uploaded to s3://$S3_BUCKET/database/$(basename $BACKUP_FILE)"
else
    warn "AWS CLI not configured, skipping S3 upload"
fi

# Clean up old backups locally
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "regora_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Clean up old backups in S3
if command -v aws &> /dev/null && [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
    CUTOFF_DATE=$(date -d "-$RETENTION_DAYS days" +%Y-%m-%d)
    aws s3 ls "s3://$S3_BUCKET/database/" | while read -r line; do
        FILE_DATE=$(echo "$line" | awk '{print $1}')
        FILE_NAME=$(echo "$line" | awk '{print $4}')
        if [[ "$FILE_DATE" < "$CUTOFF_DATE" ]] && [[ -n "$FILE_NAME" ]]; then
            aws s3 rm "s3://$S3_BUCKET/database/$FILE_NAME"
            log "Deleted old backup: $FILE_NAME"
        fi
    done
fi

# Verify backup integrity
log "Verifying backup integrity..."
gzip -t "$BACKUP_FILE" 2>/dev/null || error "Backup verification failed"

log "✅ Backup completed successfully: $BACKUP_NAME"

# Optional: Send notification
if [ -n "${SLACK_WEBHOOK:-}" ]; then
    curl -s -X POST "$SLACK_WEBHOOK" \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ REGORA backup completed: $BACKUP_NAME ($BACKUP_SIZE)\"}" \
        || warn "Slack notification failed"
fi

echo "$BACKUP_FILE"
