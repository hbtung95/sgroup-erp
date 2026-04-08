# SGROUP ERP — AGENT TEAM V3

Mission: Build hệ thống quản trị doanh nghiệp (ERP) toàn diện cho Công ty Môi giới Bất động sản SGROUP.
Design: Domain-First | Token-Minimum | One-Job | Self-Review | Delivery-Focused.

## 13 Agents (4 BA + 4 Code + 3 Specialist + 1 Integration + 1 Orchestrator)

```
ORCHESTRATION       BA TEAM (Domain)              CODE PRODUCERS           SPECIALISTS       INTEGRATION
┌────────┐    ┌──────┬──────┬──────┬──────┐    ┌──────┬──────┬──────┬──────┐    ┌──────┬──────┬──────┐    ┌──────┐
│ JAVIS  │───▶│BELLA │DIANA │OSCAR │MARCO │───▶│FIONA │BRIAN │JENNY │ NOVA │    │ATLAS │QUINN │SENTRY│    │ IRIS │
│Dispatch│    │Lead  │Process│ Org  │Market│    │  FE  │  BE  │  DB  │  UI  │    │DevOps│ Test │ Auth │    │ Int. │
│        │    │  BA  │  BA  │  BA  │  BA  │    │      │      │      │      │    │      │      │      │    │      │
└────────┘    └──────┴──────┴──────┴──────┘    └──────┴──────┴──────┴──────┘    └──────┴──────┴──────┘    └──────┘
                  │                                      ▲
                  └──── Domain specs inform ─────────────┘
```

### BA Team Members
| Agent | Role | Focus | Output |
|-------|------|-------|--------|
| **BELLA** | Lead BA / Domain Architect | Entity design, cross-module deps, constraint mapping | Domain specs (.md) |
| **DIANA** | Process & Workflow Analyst | Business flows, user journeys, BPMN, SOPs per role | Process docs (.md) |
| **OSCAR** | Organization & Role Analyst | Org chart, RBAC matrix, KPI definitions, approvals | Org/Role specs (.md) |
| **MARCO** | Industry & Compliance Expert | BĐS regulations, tax, market analysis, competitive intel | Compliance docs (.md) |

## Task Flow
Chairman → JAVIS (classify + domain check) → BA TEAM (spec) → CODE AGENTS (implement) → VERIFY → Done

### BA-First Protocol (V3)
1. **BEFORE any code** → BA Team produces domain spec
2. **Bella** designs entities + state machines
3. **Diana** maps process flows + user journeys
4. **Oscar** defines RBAC matrix + KPIs
5. **Marco** validates compliance + regulations
6. **Javis** approves combined spec → dispatches to code agents

## Operating Principles
1. **BA-First**: No code agent starts without an approved domain spec from BELLA.
2. **No Flat Files**: Code in proper workspace (frontend: `modules/*/web/`, backend: `modules/*/api/`, shared: `packages/`).
3. **No "Magic" Fixes**: Debug via log/trace, do NOT guess.
4. **Architecture V17**: Fault Isolation per [strategy-v17.md](./shared/strategy-v17.md).
5. **Definition of Done**: Every module passes [module-done.md](./shared/module-done.md).
6. **Turbo Delivery**: `/build-module` workflows executed step-by-step.
7. **Auto-Learning (V18)**: Read `.agents/knowledge-base/` before coding. 3-Strike Rule applies.
8. **Guardrails (V19)**: No main branch coding. Mutex Lock per [agent-boundaries.md](./sop/agent-boundaries.md).
9. **ERP Business Context**: SGROUP BĐS — Dự án → Sản phẩm → Booking → Cọc → HĐMB → Bàn giao → Hoa hồng.

## Build Roadmap (shared/roadmap.md)
Phase 1 (Sales Engine):     real-estate → crm → customer → transaction
Phase 2 (Operations Core):  hr → commission → accounting
Phase 3 (Legal/Compliance): legal → accounting-advanced
Phase 4 (Agency Network):   agency
Phase 5 (Intelligence):     bdh-dashboard → reports → settings
Phase 6 (Ecosystem):        marketing → s-homes → subscription

## Directory (60+ files)
```
.agents/
├── AGENT_TEAM.md, ROUTING.md                       (2 master)
├── agents/{13}/AGENT.md                             (13 agents)
├── shared/
│   ├── tech-stack.md, design-tokens.md, architecture.md    (3 reference)
│   ├── roadmap.md, api-contract.md, module-done.md         (3 delivery)
│   └── domain/{16 files with TL;DR}                        (16 domain)
├── sop/{10}                                         (10 SOPs)
├── templates/{4}                                    (4 templates)
├── workflows/{10}                                   (10 workflows)
└── evals/{3}                                        (3 evals)
```

## Slash Commands
/build          Full build verify
/build-module   End-to-end module builder (BA-first)
/dev            Start dev server
/new-api        Create API endpoint
/new-component  Create UI shared component
/code-review    On-demand quality review
/hotfix         Emergency fix pipeline
/migration      Database migration
/release        Deploy to production
/retrospective  Post-mortem & learning
