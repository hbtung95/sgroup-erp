# TASK ROUTING — HERA V5 (MCP + A2A, 14 Agents)

JAVIS uses 4-Signal Classification. REF: shared/agent-dna.md for shared standards.

## Signal 1: Keyword → Agent
| Keywords | Agent | Files |
|----------|-------|-------|
| Decompose, plan, ADR, orchestrate | JAVIS | ROUTING.md, templates/ |
| Domain spec, entity, state machine, data model | BELLA | .agents/shared/domain/ |
| Process flow, user journey, BPMN, workflow | DIANA | docs/business-analysis/processes/ |
| Org chart, role, RBAC, KPI, approval | OSCAR | docs/business-analysis/organization/ |
| Regulation, compliance, tax, market, legal | MARCO | docs/business-analysis/industry/ |
| React, component, screen, route, page, frontend | FIONA | modules/*/web/, core/web-host/ |
| Go API, handler, service, repository, endpoint | BRIAN | modules/*/api/, core/api-gateway/ |
| SQL, migration, schema, table, index, database | JENNY | modules/*/api/migrations/ |
| @sgroup/ui, design token, reusable UI | NOVA | packages/ui/ |
| Docker, CI/CD, GitHub Actions, deploy | ATLAS | .github/, turbo.json, docker-compose.yml |
| Test, E2E, Vitest, Playwright, coverage | QUINN | **/*.test.*, e2e/ |
| JWT, auth, RBAC code, permission, security | SENTRY | packages/rbac/, middleware/ |
| Integration, BizFly, PayOS, webhook, sync | IRIS | modules/*/api/integrations/ |
| Evaluate, score, review quality, trajectory | MUSE | .agents/experience-library/ |

## Signal 2: Complexity (T-Shirt)
| Size | Criteria | Agents | DAG |
|:----:|----------|:------:|-----|
| XS | Single file, <20 lines | 1-2 | DAG-XS-BUGFIX |
| S | Single concern, 1 module, <3 files | 2-3 | DAG-S-API/UI |
| M | Multi-file, cross layers, 1 module | 3-5 | DAG-M-FEATURE |
| L | Full-stack, multi-module, needs spec | 6-10 | DAG-L-FULLSTACK |
| XL | New module, architectural impact | 10-14 | DAG-XL-MODULE |

## Signal 3: Experience Lookup
  `exp_search_trajectories({query})` → Match+Success=reuse DAG | Match+Fail=avoid | None=default

## Signal 4: Capability Discovery (V5)
  `registry_discover_agents({capabilities, skills, module})` → S4>S1 when ambiguous → higher score wins

## DAG Quick Reference
| Task | Flow |
|------|------|
| Bug fix (XS) | Agent → MUSE |
| New API (S) | Brian → Sentry → MUSE |
| New UI (S) | Fiona (+Nova) → MUSE |
| Schema (S) | Jenny → Brian → MUSE |
| Feature (M) | Bella → Brian+Fiona[∥] → MUSE |
| Full-stack (L) | Bella → Diana+Oscar[∥] → Jenny → Brian+Sentry[∥] → Fiona+Nova[∥] → Quinn → Atlas → MUSE |
| Module (XL) | Full BA → Jenny → Brian+Sentry+Iris → Nova+Fiona → Quinn → Atlas → MUSE |

## MCP Dispatch Flow
  1. Classify (4-Signal) → 2. Select DAG → 3. Per step: construct TaskContext JSON
  4. Include dag_dependencies_met → 5. Dispatch via MCP → 6. Receive AgentOutput
  7. Validate handoff → 8. Next agent → 9. After all → trigger MUSE

## Tiered Activation
  XS/S: Skip BA (unless spec missing). 1-3 + MUSE.
  M: Bella only. 3-5 + MUSE.  L/XL: Full BA + code pipeline.
  ALL: JAVIS dispatches + MUSE evaluates (non-negotiable).

## Credit Assignment (MUSE applies)
  Primary(+2) | Supporting(+1) | Neutral(0) | Blocking(-1) | Critical Block(-2)
  Score = (Self×0.3 + MUSE×0.7) | Rolling avg = last 10 tasks (recent weighted higher)

## RoPE Triggers
  <4.0 × 3 consecutive → MANDATORY prompt revision
  <6.0 × 5 consecutive → Review recommended
  >9.0 × 3 tasks → Capture winning patterns
  New anti-pattern → Prevent recurrence
  CAN evolve: standards, examples, checks, workflows, context
  CANNOT: core role, file boundaries, security/financial rules, tech stack (need ADR)

## Priority
  P0: Build broken, data loss, security, financial error → ALL agents
  P1: Feature blocking, auth/commission bug → Same day
  P2: New feature → 2-3 days
  P3: Tech debt → Backlog

## Domain Context Rule
  ALWAYS: `domain_get_spec({module})` before coding
  ALWAYS: `exp_search_trajectories({query})` before starting
