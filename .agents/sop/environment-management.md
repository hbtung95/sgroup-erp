# SOP: Environment Management

> **Actor:** Atlas (DevOps) + Javis (Orchestrator)
> **Trigger:** Code promotion across environments

## Environment Topology

```
LOCAL (Developer)          STAGING (Testing)        PRODUCTION
─────────────────         ─────────────────        ─────────────────
Docker Compose:           Docker Compose:          Kubernetes / Docker Swarm:
 - PostgreSQL 18           - PostgreSQL 18          - PostgreSQL 18 (Managed)
 - Redis 7                 - Redis 7                - Redis 7
 - RabbitMQ 3              - RabbitMQ 3             - RabbitMQ 3
 - MinIO                   - MinIO                  - MinIO / S3-compatible

Frontend: Vite dev        Frontend: Vite preview   Frontend: Vercel (CDN)
Backend: go run           Backend: Docker          Backend: Viettel IDC
```

## Promotion Rules

### LOCAL → STAGING
- [ ] All tests pass locally (`npx turbo run build && go test ./...`)
- [ ] Self-check completed per AGENT.md
- [ ] Feature branch pushed to GitHub
- [ ] PR created with `/code-review` workflow passed (≥25/30)

### STAGING → PRODUCTION
- [ ] Staging tests pass for ≥24h without regression
- [ ] Financial calculations verified on staging data
- [ ] Chairman approval obtained
- [ ] Database backup created
- [ ] Migration dry-run on staging DB successful
- [ ] Rollback plan documented

## Environment Variables
```env
# LOCAL (.env.local)
DATABASE_URL=postgresql://erp_admin:erp_password@localhost:5432/sgroup_erp
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://erp_admin:erp_password@localhost:5672
MINIO_ENDPOINT=localhost:9000

# STAGING (.env.staging)
DATABASE_URL=postgresql://...@staging-db:5432/sgroup_erp
JWT_SECRET=staging-secret-rotate-monthly

# PRODUCTION (.env.production)
DATABASE_URL=postgresql://...@prod-db:5432/sgroup_erp
JWT_SECRET=prod-secret-rotate-monthly
# NEVER commit production secrets to git
```

## Rollback Protocol
```bash
# Frontend: Vercel instant rollback
vercel rollback

# Backend: Docker image rollback
docker pull sgroup-erp/{service}:previous-tag
docker-compose up -d {service}

# Database: Point-in-time recovery
# Use managed PostgreSQL PITR or pg_restore from backup
```
