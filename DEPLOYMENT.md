# ÅKRONA Deployment Guide

Complete guide for deploying ÅKRONA to production.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Backups](#backups)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/your-org/akrona.git
cd akrona
cp .env.example .env

# 2. Start development environment
docker-compose up -d

# 3. Access
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Database Admin: http://localhost:8080
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Without Docker

```bash
# Frontend
npm install
npm run dev

# Backend (in separate terminal)
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### With Docker

```bash
docker-compose up -d
docker-compose logs -f  # View logs
```

---

## Docker Deployment

### Development

```bash
docker-compose up -d
```

Services:
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | Vite dev server |
| Backend | 3001 | Express API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| Adminer | 8080 | DB Admin UI |

### Production

```bash
# 1. Configure environment
cp .env.production.example .env.production
# Edit .env.production with secure values

# 2. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify
curl http://localhost/api/health
```

### SSL Setup (Let's Encrypt)

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate certificates (using certbot)
certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com

# Copy to nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push/PR | Lint, test, build, Docker |
| `deploy-staging.yml` | Push to `develop` | Deploy to staging |
| `deploy-production.yml` | Release tag | Deploy to production |

### Required Secrets

Configure in GitHub → Settings → Secrets:

```
# Registry
GITHUB_TOKEN (automatic)

# Staging Server
STAGING_HOST
STAGING_USER
STAGING_SSH_KEY

# Production Server
PRODUCTION_HOST
PRODUCTION_USER
PRODUCTION_SSH_KEY

# Monitoring
SENTRY_AUTH_TOKEN

# Notifications
SLACK_WEBHOOK
```

### Required Variables

Configure in GitHub → Settings → Variables:

```
VITE_API_URL=https://api.yourdomain.com
SENTRY_ORG=your-org
SENTRY_PROJECT=akrona
```

### Manual Deployment

```bash
# Deploy specific version
gh workflow run deploy-production.yml -f version=v1.2.3
```

---

## Monitoring

### Prometheus + Grafana

Access after production deploy:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin / $GRAFANA_ADMIN_PASSWORD)

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to `.env.production`:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# Metrics (Prometheus format)
curl http://localhost:3001/metrics
```

### UptimeRobot Setup

1. Add HTTP(s) monitor for `https://yourdomain.com/api/health`
2. Set check interval: 5 minutes
3. Configure alerting (email, Slack, etc.)

---

## Backups

### Manual Backup

```bash
./scripts/backup.sh my-backup-name
```

### Scheduled Backups

Add to crontab:
```bash
# Daily at 3 AM
0 3 * * * /opt/akrona/scripts/backup.sh daily-$(date +\%Y\%m\%d)

# Weekly on Sunday at 4 AM
0 4 * * 0 /opt/akrona/scripts/backup.sh weekly-$(date +\%Y\%m\%d)
```

### Restore from Backup

```bash
# List available backups
ls -la /opt/akrona/backups/

# Restore
./scripts/restore.sh akrona_20240115_120000.sql.gz
```

### S3 Backup Configuration

Add to `.env.production`:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-central-1
S3_BACKUP_BUCKET=akrona-backups
```

---

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker-compose logs backend
docker-compose logs postgres
```

**Database connection failed:**
```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Connect manually
docker exec -it akrona-postgres psql -U akrona -d akrona
```

**Migrations failed:**
```bash
# Reset migrations (DEV ONLY)
docker-compose exec backend npx prisma migrate reset --force
```

### Rollback

```bash
./scripts/rollback.sh
```

### Full Reset (Development)

```bash
docker-compose down -v
docker-compose up -d
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Nginx                             │
│                   (Reverse Proxy + SSL)                  │
└────────────────┬──────────────────┬─────────────────────┘
                 │                  │
                 ▼                  ▼
┌────────────────────┐    ┌────────────────────┐
│     Frontend       │    │      Backend       │
│   (React + Vite)   │    │ (Express + Prisma) │
└────────────────────┘    └─────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │ PostgreSQL│   │   Redis   │   │  Gemini   │
            │ (Database)│   │  (Cache)  │   │   API     │
            └───────────┘   └───────────┘   └───────────┘
```

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review [Troubleshooting](#troubleshooting)
3. Open GitHub issue with logs and reproduction steps
