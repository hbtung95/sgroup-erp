# TASK ROUTING — Agent Dispatch (V3, 13 Agents)

Javis dùng bảng này để route task. Mỗi task → 1 agent lead.

## Route Table
| Keywords | Agent | Owned Files |
|----------|-------|-------------|
| Decompose, plan, ADR, architecture | JAVIS | ROUTING.md, templates/ |
| Domain spec, entity design, state machine, data model | BELLA | .agents/shared/domain/ |
| Process flow, user journey, BPMN, workflow mapping | DIANA | docs/business-analysis/processes/ |
| Org chart, role definition, RBAC, KPI, approval hierarchy | OSCAR | docs/business-analysis/organization/ |
| Regulation, compliance, tax, market analysis, legal context | MARCO | docs/business-analysis/industry/ |
| React Web, component, screen, route, page | FIONA | modules/*/web/, core/web-host/ |
| Go API, handler, service, repository, endpoint | BRIAN | modules/*/api/, core/api-gateway/ |
| SQL, migration, schema, table, index, database | JENNY | modules/*/api/migrations/ |
| @sgroup/ui, design token, NativeWind, reusable UI | NOVA | packages/ui/ |
| Docker, CI/CD, GitHub Actions, deploy, Turborepo | ATLAS | .github/, turbo.json, docker-compose.yml |
| Test, E2E, Vitest, Playwright, coverage | QUINN | **/*.test.*, e2e/ |
| JWT, auth, RBAC code, permission middleware, security | SENTRY | packages/rbac/, middleware/ |
| Integration, BizFly, PayOS, webhook, sync, API external | IRIS | modules/*/api/integrations/ |

## Cross-Domain Flows
| Task | Agent Flow |
|------|-----------|
| **Full-stack feature** | JAVIS → BELLA(spec) → DIANA(flow) → OSCAR(rbac) → JENNY(schema) → BRIAN(API) → SENTRY(auth) → FIONA(UI) → QUINN(test) → ATLAS(build) |
| **New module analysis** | JAVIS → BELLA(domain) + DIANA(processes) + OSCAR(roles) + MARCO(compliance) |
| **New API endpoint** | JAVIS → BRIAN → SENTRY |
| **New UI page** | JAVIS → FIONA (+ NOVA if new shared component) |
| **Schema change** | JAVIS → JENNY → BRIAN |
| **Auth change** | JAVIS → SENTRY |
| **Bug fix** | JAVIS → Domain Agent (+ QUINN regression test) |
| **Hotfix (P0)** | JAVIS → Domain Agent → ATLAS |
| **New domain spec** | JAVIS → BELLA (+ DIANA process + OSCAR roles) |
| **External integration** | JAVIS → IRIS → BRIAN |
| **Commission calculation** | JAVIS → BELLA(rules) → MARCO(tax) → JENNY(schema) → BRIAN(engine) → FIONA(UI) |
| **Real estate booking** | JAVIS → BELLA(state machine) → DIANA(flow) → JENNY(lock) → BRIAN(atomic) → SENTRY(RBAC) → FIONA(UI) |
| **Regulatory compliance** | JAVIS → MARCO → BELLA(constraints) |
| **KPI/Dashboard** | JAVIS → OSCAR(kpis) → DIANA(flow) → JENNY(schema) → BRIAN(API) → FIONA(UI) |

## BA Team Internal Coordination
```
Chairman asks "Build module X"
  ↓
JAVIS routes to BA Team:
  BELLA (lead)  → entity design, cross-module deps
  DIANA (flow)  → process maps, user journeys
  OSCAR (org)   → RBAC matrix, KPI defs
  MARCO (mkt)   → compliance check, tax rules
  ↓
BELLA consolidates → domain spec approved
  ↓
JAVIS dispatches to Code Agents
```

## Domain Context Rule
ALWAYS tell agent: "LOAD shared/domain/{module}.md before coding"
For BA agents: "ALSO CHECK docs/business-analysis/{area}/ for existing analysis"

## Priority
P0 Immediate: Build broken, data loss, security breach, financial data error
P1 Same day: Feature blocking, auth issue, commission calculation bug
P2 2-3 days: New feature, enhancement
P3 Backlog: Tech debt, optimization
