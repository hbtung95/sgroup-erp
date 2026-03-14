# ADR-001: Microservices Extraction Strategy

## Status
**PROPOSED** — 2026-03-13

## Context
SGROUP ERP is a monolithic NestJS application serving 10+ modules. As the system scales, certain modules may face disproportionate load (Sales, Inventory, Notifications) while others remain low-traffic (Legal, HR).

## Decision

### Phase 1 — Current (Monolith + Event-Driven)
Maintain monolith with internal event bus (`@nestjs/event-emitter`). This is already partially implemented.

### Phase 2 — Extract High-Load Services (When Needed)
| Service | Trigger | Technology |
|---------|---------|------------|
| **Notification Service** | >1000 concurrent WebSocket connections | Separate NestJS + Redis Pub/Sub |
| **Inventory Sync Service** | >500 status changes/minute | Queue-based (BullMQ + Redis) |
| **Report/Analytics Service** | Slow queries blocking API | Read replica + separate process |

### Phase 3 — Full Microservices (When >100 users)
```
┌─────────────────────────────────────────────┐
│              API Gateway (Kong/Traefik)      │
├──────────┬──────────┬──────────┬────────────┤
│  Sales   │  Project │Notif Svc │ Analytics  │
│  Service │  Service │(ws/redis)│  Service   │
├──────────┴──────────┴──────────┴────────────┤
│           Shared DB (Neon Postgres)          │
│           Redis (Cache + Pub/Sub)            │
│           S3 (File Storage)                  │
└─────────────────────────────────────────────┘
```

## Recommendations

### Extract NOW (Low Effort, High Impact)
1. **WebSocket Gateway** → Already extracted as `NotificationsModule`. Can be deployed separately.
2. **Background Jobs** → Use BullMQ for email, report generation, lock expiry cleanup.

### Extract LATER (When Bottlenecks Appear)
3. **Sales Pipeline** → Heavy read/write, benefits from dedicated scaling.
4. **Inventory Service** → Already has its own service class, clean boundary.

### DON'T Extract (Low Traffic)
5. HR, Legal, Finance — Keep in monolith. Low traffic doesn't justify operational overhead.

## Communication Pattern
- **Sync**: REST via API Gateway (client↔service)
- **Async**: Redis Pub/Sub or BullMQ (service↔service)
- **Real-time**: Socket.io through Notification Service

## Decision Rationale
Premature microservices extraction adds operational complexity (deployment, monitoring, debugging) without performance benefit. The monolith with event-driven architecture provides 80% of the benefits at 20% of the cost.

**Trigger for extraction**: When a single module's P99 latency exceeds 500ms under normal load, OR when a module needs independent scaling.
