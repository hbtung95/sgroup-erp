# SGROUP ERP — AGENT TEAM V5 (HERA + MCP Architecture)

Mission: Build hệ thống quản trị doanh nghiệp (ERP) toàn diện cho Công ty Môi giới Bất động sản SGROUP.
Design: HERA (Hierarchical Evolution) | MCP-Native | A2A Discovery | Experience-Driven | Self-Evolving Agents.

## 14 Agents (4 BA + 4 Code + 4 Specialist + 1 Evaluator + 1 Orchestrator)

```
LAYER 0: MCP INFRASTRUCTURE
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Agent Registry (A2A)  │  MCP Servers (4)  │  Security/Governance               │
│  14 Agent Cards        │  Domain | Exp | Build | Auth  │  Boundary Enforcement  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
LAYER 1: GLOBAL ORCHESTRATOR
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     JAVIS v5 (MCP-Native Adaptive Orchestrator)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │  4-Signal    │  │  DAG Builder  │  │  MCP Dispatch │  │  Post-Task Loop  │   │
│  │  Classify    │  │  (per task)   │  │  (structured) │  │  (trigger MUSE)  │   │
│  └──────────────┘  └──────────────┘  └───────────────┘  └──────────────────┘   │
│           │                                                                      │
│  ┌────────▼─────────────────────────────────┐                                   │
│  │ Signal 1: Keyword         (ROUTING.md)   │                                   │
│  │ Signal 2: Complexity      (T-shirt)      │                                   │
│  │ Signal 3: Experience      (Exp Library)  │                                   │
│  │ Signal 4: Capability      (A2A Registry) │ ← NEW                            │
│  └──────────────────────────────────────────┘                                   │
│                           │                                                      │
│                ┌──────────▼──────────────────────────────┐                       │
│                │     EXPERIENCE LIBRARY (Shared Memory)   │                       │
│                │  trajectories/ │ scorecards/ │ insights/ │                       │
│                └─────────────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
LAYER 2: EXECUTION AGENTS (MCP Tool Consumers + A2A Providers)
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│   BA TEAM       │ │   CODE TEAM     │ │   SUPPORT TEAM   │
│                 │ │                 │ │                  │
│ BELLA Lead BA   │ │ FIONA  FE       │ │ ATLAS  DevOps    │
│ DIANA Process   │ │ BRIAN  BE       │ │ QUINN  Test      │
│ OSCAR Org/RBAC  │ │ JENNY  DB       │ │ SENTRY Auth      │
│ MARCO Compliance│ │ NOVA   UI       │ │ IRIS   Integr.   │
└─────────────────┘ └─────────────────┘ └──────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
LAYER 3: FEEDBACK & EVOLUTION (MCP-Enhanced)
┌──────────────────────────────────────────────────────┐
│                  MUSE (MCP-Native Evaluator)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Score    │  │  Credit  │  │  RoPE    │            │
│  │ (rubric) │  │ (assign) │  │(evolve)  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│  MCP Tools: exp_capture_trajectory,                    │
│             exp_update_scorecard,                       │
│             exp_trigger_rope                            │
└──────────────────────────────────────────────────────┘
```

### All Team Members
| Agent | Role | Focus | MCP Tools Consumed | A2A Card |
|-------|------|-------|-------------------|----------|
| **JAVIS** | MCP Orchestrator | 4-Signal, DAG, MCP dispatch | `domain_*`, `exp_*`, `build_*`, `auth_*`, `registry_*` | ✅ |
| **BELLA** | Lead BA / Domain Architect | Entity design, cross-module deps | `domain_get_spec`, `exp_search_*` | 🔲 Phase 2 |
| **DIANA** | Process & Workflow Analyst | Business flows, BPMN, SOPs | `domain_get_spec`, `exp_search_*` | 🔲 Phase 2 |
| **OSCAR** | Organization & Role Analyst | Org chart, RBAC, KPI | `auth_get_role_hierarchy`, `exp_search_*` | 🔲 Phase 2 |
| **MARCO** | Industry & Compliance Expert | BĐS regulations, tax | `domain_get_spec`, `exp_search_*` | 🔲 Phase 2 |
| **FIONA** | Frontend Engineer | React pages, routes | `domain_get_spec`, `build_turbo`, `exp_search_*` | 🔲 Phase 2 |
| **BRIAN** | Backend Engineer | Go API endpoints | `domain_scaffold_endpoint`, `build_go_module`, `test_go_module` | ✅ |
| **JENNY** | Database Engineer | PostgreSQL schema | `domain_scaffold_migration`, `exp_search_*` | 🔲 Phase 2 |
| **NOVA** | UI/Design System Engineer | @sgroup/ui components | `domain_get_design_tokens`, `exp_search_*` | 🔲 Phase 2 |
| **ATLAS** | DevOps Engineer | CI/CD, Docker | `build_turbo`, `build_check_deps` | 🔲 Phase 2 |
| **QUINN** | Testing Engineer | Unit tests, E2E | `test_go_module`, `test_frontend_module`, `lint_*` | 🔲 Phase 2 |
| **SENTRY** | Security Engineer | Auth, RBAC middleware | `auth_*`, `exp_search_*` | 🔲 Phase 2 |
| **IRIS** | Integration Engineer | External APIs, webhooks | `domain_get_api_contract`, `exp_search_*` | 🔲 Phase 2 |
| **MUSE** ⭐ | MCP Evaluator | Scoring, credit, RoPE | `exp_capture_*`, `exp_update_*`, `exp_trigger_rope` | ✅ |

## MCP Infrastructure

### 4 MCP Servers
| Server | Tools | Owner |
|--------|-------|-------|
| `erp-domain-mcp-server` | `domain_get_spec`, `domain_list_modules`, `domain_scaffold_*` | Domain Agents |
| `experience-mcp-server` | `exp_search_*`, `exp_capture_*`, `exp_update_*`, `exp_trigger_rope` | MUSE |
| `build-mcp-server` | `build_turbo`, `build_go_module`, `test_*`, `lint_*` | ATLAS, QUINN |
| `auth-mcp-server` | `auth_get_role_hierarchy`, `auth_check_agent_boundary`, `auth_get_financial_rules` | SENTRY |

### A2A Agent Registry
- Location: `.agents/mcp/registry/agent-cards/`
- Phase 1 (complete): JAVIS, BRIAN, MUSE → 3 cards
- Phase 2 (pending): Remaining 11 agents

## Task Flow (HERA V5)

```
Chairman → JAVIS (4-Signal Classify → DAG Build → MCP Dispatch)
  → Execution Agents (work per DAG, consume MCP tools, produce AgentOutput)
    → MUSE (Score → Credit → exp_capture_trajectory → exp_update_scorecard)
      → Experience Library (updated via MCP)
        → Future tasks benefit from accumulated experience + capability discovery
```

### HERA V5 Protocol Summary
1. **CLASSIFY** — 4 signals: keyword + complexity + experience + capability discovery
2. **PLAN** — Build DAG with MCP tool calls per step
3. **DISPATCH** — Structured `TaskContext` via MCP (not free-form markdown)
4. **EXECUTE** — Agents consume MCP tools, produce `AgentOutput`
5. **HANDOFF** — Validated context passing between DAG steps (a2a-handoff.md)
6. **EVALUATE** — MUSE scores via MCP, captures trajectory, assigns credit
7. **EVOLVE** — RoPE triggered via `exp_trigger_rope` when thresholds breached

## Operating Principles (HERA V5)
1. **Senior DNA (20+ YOE)**: ALL agents act as Principal Engineers.
2. **BA-First**: No code without approved domain spec.
3. **Experience-First**: `exp_search_trajectories` BEFORE any task.
4. **MCP-Native**: Structured context > free-form markdown.
5. **A2A Discovery**: Agents discoverable via Agent Cards.
6. **Adaptive Orchestration**: DAGs per task complexity.
7. **Tiered Activation**: Only needed agents activated.
8. **Self-Score Always**: Every agent self-scores.
9. **MUSE Evaluates Always**: Every task ends with MUSE.
10. **Credit Assignment**: Evidence-based, per agent.
11. **Continuous Evolution (RoPE)**: Prompt evolution on performance data.
12. **Backward Compatible**: MCP enhances V4, doesn't break it.
13. **Architecture V21**: Per [strategy-v21.md](./shared/strategy-v21.md).
14. **Definition of Done**: Module passes [module-done.md](./shared/module-done.md) + MUSE ≥ 7.0.
15. **ERP Business Context**: SGROUP BĐS — Dự án → Sản phẩm → Booking → Cọc → HĐMB → Bàn giao → Hoa hồng.

## Build Roadmap (shared/roadmap.md)
Phase 1 (Sales Engine):     real-estate → crm → customer → transaction
Phase 2 (Operations Core):  hr → commission → accounting
Phase 3 (Legal/Compliance): legal → accounting-advanced
Phase 4 (Agency Network):   agency
Phase 5 (Intelligence):     bdh-dashboard → reports → settings
Phase 6 (Ecosystem):        marketing → s-homes → subscription

## Directory (100+ files)
```
.agents/
├── AGENT_TEAM.md, ROUTING.md                       (2 master)
├── agents/{14}/AGENT.md                             (14 agents)
├── mcp/                                             (MCP Infrastructure — NEW)
│   ├── README.md, package.json, tsconfig.json       (3 config)
│   ├── servers/{4}/src/index.ts                     (4 MCP servers)
│   ├── registry/agent-cards/{3+}.json               (Agent Cards — 3 Phase 1)
│   ├── registry/registry.ts                         (Discovery service)
│   └── protocols/                                   (3 protocol files)
│       ├── context-schema.ts                        (Shared types)
│       ├── mcp-orchestration.md                     (MCP dispatch protocol)
│       └── a2a-handoff.md                           (Agent handoff protocol)
├── shared/
│   ├── tech-stack.md, design-tokens.md, architecture.md   (3 reference)
│   ├── roadmap.md, api-contract.md, module-done.md        (3 delivery)
│   ├── hera-protocol.md, dag-templates.md                 (2 HERA)
│   ├── strategy-v21.md                                    (1 strategy — V21)
│   └── domain/{16 files with TL;DR}                       (16 domain)
├── experience-library/                                     (HERA Experience)
│   ├── trajectories/ │ scorecards/ │ insights/ │ evolution/
├── sop/{12}                                         (12 SOPs)
├── templates/{6}                                    (6 templates)
├── workflows/{10}                                   (10 workflows)
└── evals/{4}                                        (4 evals)
```

## Slash Commands
/build          Full build verify
/build-module   End-to-end module builder (HERA-enhanced)
/dev            Start dev server
/new-api        Create API endpoint
/new-component  Create UI shared component
/code-review    On-demand quality review
/hotfix         Emergency fix pipeline
/migration      Database migration
/release        Deploy to production
/retrospective  Post-mortem & learning (HERA-enhanced)
