# SGROUP ERP — AGENT TEAM V5.1 (HERA + MCP + GitNexus)

Mission: ERP toàn diện cho Công ty Môi giới BĐS SGROUP.
Design: HERA V5.1 | MCP-Native | GitNexus Graph-RAG | A2A Discovery | Experience-Driven | Self-Evolving.
REF: shared/agent-dna.md | ROUTING.md | shared/strategy-v21.md

## Architecture (4 Layers)
```
L0: MCP INFRASTRUCTURE — Registry(A2A) + 5 MCP Servers + Boundary Enforcement
L1: JAVIS (Orchestrator) — 4-Signal Classify → DAG Build → MCP Dispatch → MUSE
L2: EXECUTION AGENTS — 13 agents consume MCP tools, produce AgentOutput
L3: MUSE (Evaluator) — Score → Credit → exp_capture → exp_update → RoPE
```

## 14 Agents
| Agent | Role | Domain | MCP Tools | A2A |
|-------|------|--------|-----------|:---:|
| JAVIS | Orchestrator | ROUTING.md | domain_*, exp_*, build_*, auth_*, registry_*, graph_impact, graph_detect | ✅ |
| BELLA | Lead BA | shared/domain/ | domain_get_spec, exp_search_* | 🔲 |
| DIANA | Process BA | docs/ba/processes/ | domain_get_spec, exp_search_* | 🔲 |
| OSCAR | Org/RBAC BA | docs/ba/organization/ | auth_get_role_hierarchy, exp_search_* | 🔲 |
| MARCO | Compliance BA | docs/ba/industry/ | domain_get_spec, exp_search_* | 🔲 |
| FIONA | Frontend | modules/*/web/ | domain_get_spec, build_turbo, graph_context, graph_query | 🔲 |
| BRIAN | Backend | modules/*/api/ | domain_scaffold_endpoint, build_go_module, graph_context, graph_query | ✅ |
| JENNY | Database | modules/*/api/migrations/ | domain_scaffold_migration, exp_search_*, graph_impact | 🔲 |
| NOVA | UI/Design | packages/ui/ | domain_get_design_tokens | 🔲 |
| ATLAS | DevOps | .github/, docker-compose | build_turbo, build_check_deps | 🔲 |
| QUINN | Testing | **/*.test.* | test_go_module, test_frontend_module, lint_* | 🔲 |
| SENTRY | Security | packages/rbac/ | auth_* | 🔲 |
| IRIS | Integration | modules/*/api/integrations/ | domain_get_api_contract | 🔲 |
| MUSE ⭐ | Evaluator | experience-library/ | exp_capture_*, exp_update_*, exp_trigger_rope | ✅ |

## MCP Servers (5)
| Server | Key Tools |
|--------|-----------|
| erp-domain-mcp | domain_get_spec, domain_list_modules, domain_scaffold_* |
| experience-mcp | exp_search_*, exp_capture_*, exp_update_*, exp_trigger_rope |
| build-mcp | build_turbo, build_go_module, test_*, lint_* |
| auth-mcp | auth_get_role_hierarchy, auth_check_agent_boundary, auth_get_financial_rules |
| gitnexus-mcp | graph_impact, graph_context, graph_query, graph_detect_changes, graph_cypher |

## Task Flow
```
Chairman → JAVIS(4-Signal → DAG → MCP Dispatch) → Agents(MCP tools → AgentOutput)
  → MUSE(Score → Credit → Trajectory → Scorecard) → Experience Library → Future tasks
```

## HERA V5 Protocol (7 steps)
1. CLASSIFY — 4 signals: keyword + complexity + experience + capability
2. PLAN — DAG with MCP tool calls per step
3. DISPATCH — Structured TaskContext (not markdown)
4. EXECUTE — Agents consume MCP, produce AgentOutput
5. HANDOFF — Validated context (a2a-handoff.md)
6. EVALUATE — MUSE scores, captures trajectory, assigns credit
7. EVOLVE — RoPE via exp_trigger_rope when thresholds breached

## Operating Principles (HERA V5 + Karpathy Skills)
1. Senior DNA (20+ YOE) — ALL agents Principal Engineers
2. Think Before Coding — State assumptions, stop when confused
3. Simplicity First — No speculative features, minimal code
4. Surgical Changes — Touch only what's needed, match existing style
5. Goal-Driven Execution — Define verifiable success criteria loops
6. BA-First — No code without approved domain spec
7. Experience-First — exp_search before any task
8. MCP-Native — Structured context > markdown
9. Adaptive Orchestration — DAGs per complexity
10. MUSE Always — Every task evaluated & Credit Assessed

## Build Roadmap
P1 Sales: real-estate→crm→customer→transaction
P2 Ops: hr→commission→accounting
P3 Legal: legal→accounting-advanced
P4 Agency: agency
P5 Intel: bdh-dashboard→reports→settings
P6 Eco: marketing→s-homes→subscription

## Directory
```
.agents/
├── AGENT_TEAM.md, ROUTING.md
├── agents/{14}/AGENT.md
├── mcp/ (servers/{4}, registry/agent-cards/{3+}, protocols/{3})
├── shared/ (agent-dna.md, tech-stack, design-tokens, architecture, roadmap, api-contract, module-done, dag-templates, strategy-v21, domain/{16})
├── experience-library/ (trajectories/, scorecards/, insights/, evolution/)
├── sop/{12}, templates/{6}, workflows/{10}, evals/{4}
```

## Slash Commands
/build /build-module /dev /new-api /new-component /code-review /hotfix /migration /release /retrospective
