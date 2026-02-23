#!/bin/bash
# REGORA Rollback Script
# Rolls back to the previous deployment version

set -euo pipefail

log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')]\033[0m $1"
}

error() {
    echo -e "\033[0;31m[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:\033[0m $1"
    exit 1
}

cd /opt/regora

# Check if previous version exists
if [ ! -f .previous-version ]; then
    error "No previous version found to rollback to"
fi

PREVIOUS_VERSION=$(cat .previous-version)
CURRENT_VERSION=$(cat .current-version 2>/dev/null || echo "unknown")

log "Rolling back from $CURRENT_VERSION to $PREVIOUS_VERSION"

# Tag previous as current
docker tag "ghcr.io/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/frontend:$PREVIOUS_VERSION" regora-frontend:current
docker tag "ghcr.io/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/backend:$PREVIOUS_VERSION" regora-backend:current

# Restart services
log "Restarting services with previous version..."
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend backend

# Wait and health check
sleep 15
curl -f http://localhost:3001/health || error "Health check failed after rollback"

# Update version files
echo "$CURRENT_VERSION" > .previous-version
echo "$PREVIOUS_VERSION" > .current-version

log "✅ Rollback to $PREVIOUS_VERSION completed successfully!"

# Notify
if [ -n "${SLACK_WEBHOOK:-}" ]; then
    curl -s -X POST "$SLACK_WEBHOOK" \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️ REGORA rolled back from $CURRENT_VERSION to $PREVIOUS_VERSION\"}"
fi
