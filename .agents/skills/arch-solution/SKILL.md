---
name: Solution Architect
description: System architecture design, API design, integration patterns, and scalability planning for SGROUP ERP
---

# Solution Architect Skill — SGROUP ERP

## Role Overview
The SA designs the overall system architecture, defines integration patterns, ensures scalability, and creates architecture decision records for SGROUP ERP.

## Current Architecture

### System Context (C4 Level 1)
```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Sales Rep    │────>│  SGROUP ERP      │────>│ BizFly CRM   │
│ (Mobile/Web) │     │  Platform        │     │ (External)   │
└──────────────┘     └──────────────────┘     └──────────────┘
                            │
┌──────────────┐            │         ┌──────────────┐
│ Manager      │────────────┘         │ PostgreSQL   │
│ (Web)        │                      │ Database     │
└──────────────┘                      └──────────────┘
```

### Container Diagram (C4 Level 2)
```
┌─────────────────────────────────────────────────┐
│                 SGROUP ERP Platform              │
│                                                  │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ Frontend          │  │ Backend              │  │
│  │ React Native      │  │ NestJS               │  │
│  │ + Expo             │─>│ REST API             │  │
│  │ (Universal:       │  │ JWT Auth             │  │
│  │  iOS/Android/Web) │  │ Prisma ORM           │  │
│  └──────────────────┘  │ AI Module (LangChain) │  │
│                         └─────────┬─────────────┘  │
│                                   │                │
│                         ┌─────────▼─────────────┐  │
│                         │ PostgreSQL Database   │  │
│                         │ Prisma Migrations     │  │
│                         └───────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Architecture Patterns

### 1. Modular Monolith (Current)
```
src/modules/
├── auth/           # Authentication & authorization
├── sales-ops/      # Sales operations
├── sales-planning/ # Sales planning
├── marketing-planning/ # Marketing planning
├── exec-planning/  # Executive planning
├── sales-report/   # Sales reporting
├── bizfly-sync/    # External CRM integration
└── ai/             # AI agent services
```

**Benefits**: Simple deployment, easy to refactor, shared database
**Growth path**: Extract to microservices when modules become too large

### 2. API Design Standards

#### RESTful Conventions
```
GET    /api/{resource}          # List (paginated)
GET    /api/{resource}/:id      # Get one
POST   /api/{resource}          # Create
PUT    /api/{resource}/:id      # Full update
PATCH  /api/{resource}/:id      # Partial update
DELETE /api/{resource}/:id      # Delete (soft)
```

#### API Response Format
```json
// Success
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-12T08:00:00Z",
    "requestId": "uuid-v7"
  }
}

// List with pagination
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Must be valid email" }
    ]
  },
  "meta": {
    "timestamp": "2026-03-12T08:00:00Z",
    "requestId": "uuid-v7"
  }
}
```

#### Versioning Strategy
```
/api/v1/sales      # Current stable
/api/v2/sales      # New version (breaking changes)
```

### 3. Integration Patterns

#### Sync (REST/HTTP)
```
Frontend ──HTTP──> Backend ──HTTP──> BizFly API
                                     │
                              Response/Error
```

#### Async (Event-Driven — Future)
```
Producer ──publish──> Message Queue ──subscribe──> Consumer
(Backend)             (Redis/NATS)                 (Worker)
```

#### Integration Checklist
- [ ] Define API contract (OpenAPI/Swagger)
- [ ] Implement retry with exponential backoff
- [ ] Add circuit breaker for external services
- [ ] Log all integration calls
- [ ] Handle partial failures gracefully
- [ ] Rate limiting for external APIs

### 4. Database Architecture

#### Schema Organization
```sql
-- Core schemas
public.users          -- Authentication & user profiles
public.roles          -- RBAC roles & permissions

-- Sales domain
sales.leads           -- Customer leads
sales.deals           -- Active deals/opportunities
sales.activities      -- Sales activities log
sales.appointments    -- Customer appointments

-- Planning domain
planning.exec_plans    -- Executive planning
planning.sales_plans   -- Sales planning targets
planning.marketing_plans -- Marketing allocation

-- Reporting domain
reporting.sales_reports -- Generated reports cache
reporting.kpi_snapshots -- KPI historical data
```

#### Data Flow Pattern
```
Frontend (Zustand Store)
    │ API call
    ▼
Controller (Validate + Transform)
    │ DTO
    ▼
Service (Business Logic)
    │ Prisma Query
    ▼
Database (PostgreSQL)
```

### 5. Scalability Planning

#### Current Capacity (Single Server)
| Metric | Current | 10x Target |
|--------|---------|-----------|
| Users | 50 | 500 |
| API req/sec | 100 | 1,000 |
| Database size | 1 GB | 50 GB |
| Response time | < 200ms | < 200ms |

#### Scaling Strategy
```
Phase 1 (Current): Single Server
├── App + DB on same machine
└── Suitable for < 200 users

Phase 2 (Next): Separated Services
├── App server (scalable horizontally)
├── Database server (dedicated, replicas)
├── Redis cache
└── Suitable for 200-1,000 users

Phase 3 (Future): Distributed
├── Load balancer (Nginx/ALB)
├── Multiple app instances (Docker/K8s)
├── Database cluster (primary + read replicas)
├── CDN for static assets
├── Message queue for async tasks
└── Suitable for 1,000+ users
```

### 6. Security Architecture

```
                    ┌─────────────┐
Internet ──HTTPS──> │ Load Balancer│
                    │ (SSL Term)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway  │
                    │ Rate Limiting│
                    │ CORS         │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Auth Layer   │
                    │ JWT Verify   │
                    │ RBAC Check   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Application  │
                    │ Input Valid.  │
                    │ Business Logic│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Database     │
                    │ Encrypted    │
                    │ Parameterized│
                    └─────────────┘
```

### 7. Architecture Decision Record Template

```markdown
## ADR-{NNN}: {Title}

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated
**Deciders**: {Names}

### Context
What situation or requirement drives this decision?

### Decision
What architecture choice are we making?

### Rationale
Why this choice over alternatives?

### Consequences
- Positive: ...
- Negative: ...
- Risks: ...

### Alternatives Considered
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
```

## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/api-architecture-rules.md` when designing APIs. The API responses, DTOs, versioning, and RESTful conventions are non-negotiable standards for SGROUP ERP.
