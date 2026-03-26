---
name: DevOps Engineer
description: CI/CD pipeline design, Docker/Kubernetes, monitoring, infrastructure, and SRE practices for SGROUP ERP
---

# DevOps Engineer Skill — SGROUP ERP

## Role Overview
The DevOps Engineer automates deployment, manages infrastructure, ensures system reliability, and enables the team to ship fast and safely.

## CI/CD Pipeline

### GitHub Actions — Full Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: SGROUP ERP CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ──── Stage 1: Code Quality ────
  lint-and-type-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [sgroup-erp-backend, SGROUP-ERP-UNIVERSAL]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm', cache-dependency-path: '${{ matrix.project }}/package-lock.json' }
      - run: cd ${{ matrix.project }} && npm ci
      - run: cd ${{ matrix.project }} && npx tsc --noEmit

  # ──── Stage 2: Testing ────
  test-backend:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: cd sgroup-erp-backend && npm ci
      - run: cd sgroup-erp-backend && npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      - run: cd sgroup-erp-backend && npm test -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          JWT_SECRET: test-secret-key

  # ──── Stage 3: Build ────
  build:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Backend Docker Image
        run: docker build -t sgroup-backend:${{ github.sha }} ./sgroup-erp-backend
      - name: Build Frontend
        run: |
          cd SGROUP-ERP-UNIVERSAL && npm ci
          npx expo export --platform web

  # ──── Stage 4: Deploy ────
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging server"

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: echo "Deploy to production server"
```

### Branch Strategy
```
main (production)
  ↑ merge (after review)
develop (staging)
  ↑ merge (after CI passes)
feature/TASK-123-add-leads (development)
```

## Docker Configuration

### Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports: ['80:80', '443:443']
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
    depends_on: [backend, frontend]

  backend:
    build:
      context: ./sgroup-erp-backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      replicas: 2
      resources:
        limits: { cpus: '1', memory: '512M' }
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./SGROUP-ERP-UNIVERSAL
      dockerfile: Dockerfile.web
    depends_on: [backend]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    deploy:
      resources:
        limits: { cpus: '2', memory: '1G' }

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

## Monitoring & Observability

### Health Check Endpoint
```typescript
// health.controller.ts
@Controller('health')
@Public()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const dbHealthy = await this.checkDatabase();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch { return false; }
  }
}
```

### Monitoring Stack
```
Application Metrics → Prometheus → Grafana (Dashboards)
Application Logs   → Fluentd   → Elasticsearch → Kibana
Error Tracking     → Sentry
Uptime Monitoring  → UptimeRobot / Better Uptime
```

### Key Alerts
| Alert | Condition | Action |
|-------|-----------|--------|
| API Error Rate High | > 5% errors in 5 min | Page on-call |
| Response Time Slow | p95 > 2s for 10 min | Investigate |
| Database Connection | Pool > 80% | Scale/investigate |
| Disk Usage | > 85% | Expand storage |
| Memory Usage | > 90% | Restart/scale |
| SSL Certificate | Expires in < 14 days | Renew cert |

## Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh — Run via cron: 0 2 * * * /path/to/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="sgroup_erp"

# Database backup
pg_dump -U postgres -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://sgroup-backups/
```

### Recovery Procedures
| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| App crash | 5 min | 0 | Docker auto-restart |
| DB corruption | 30 min | 24h | Restore from backup |
| Server failure | 1 hour | 24h | Provision new server, restore |
| Region outage | 4 hours | 24h | Failover to secondary region |

## SRE Practices

### SLI / SLO / SLA
| Service | SLI | SLO | SLA |
|---------|-----|-----|-----|
| API | Request success rate | 99.9% | 99.5% |
| Web App | Page load < 3s | 95% of loads | 90% |
| Database | Query time < 100ms | 99% of queries | 95% |

### Error Budget
```
Error Budget = 1 - SLO = 0.1% (for 99.9% SLO)

Monthly budget: 0.1% × 43,200 min = 43.2 minutes of downtime

If budget exhausted → freeze deployments, focus on reliability
```


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/devops-architecture-rules.md`. Git Flow, Zero-downtime Deployments, and CI/CD pipelines must follow the Red Flags.