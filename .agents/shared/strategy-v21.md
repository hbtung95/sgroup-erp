# SGROUP ERP Strategy V21 — HERA V5: MCP-Native Architecture

**Notice to All Agents:** This document supersedes V20. ALL agents MUST comply with these constraints.

## Version History
| Version | Focus | Date |
|:-------:|-------|------|
| V17 | Microservices & Revenue-First Roadmap | 2026-04-08 |
| V18 | Auto-Learning (Knowledge Base, 3-Strike Rule) | 2026-04-08 |
| V19 | Guardrails (Branch protection, Agent boundaries) | 2026-04-08 |
| V20 | HERA Adaptive Architecture (DAG, Experience Library, RoPE) | 2026-04-14 |
| **V21** | **HERA V5: MCP-Native Multi-Agent Orchestration** | **2026-04-14** |

## 1. Business Context: Real Estate Brokerage ERP
*(Unchanged from V17)*
SGROUP is a **real estate brokerage company** (Công ty Môi giới Bất Động Sản). The ERP system manages Project & Inventory, Sales Pipeline, Commission, Agency Network, Finance, and HR/Ops.

## 2. Architectural Mandate: Fault Isolation
*(Unchanged from V17)*
Frontend isolation via ErrorBoundary, Backend isolation via Docker microservices, Inter-service via HTTP/RPC or RabbitMQ.

## 3. MCP-Native Mandate: Protocol-Driven Agent Orchestration (NEW in V21)

### 3.1 Four-Layer MCP Architecture (Supersedes V20 Three-Layer)
All agent operations MUST follow the HERA V5 four-layer model:

```
Layer 0: MCP Infrastructure — Agent Registry (A2A), MCP Servers, Security/Governance
Layer 1: Orchestrator (JAVIS) — 4-Signal Classification, DAG Builder, MCP Dispatch
Layer 2: Domain MCP Servers — ERP Domain, Experience Library, Build/CI, Auth/RBAC
Layer 3: Feedback (MUSE) — Scoring, Credit, Trajectory Capture, RoPE
```

### 3.2 MCP Servers (4 servers)
| Server | Scope | Key Tools |
|--------|-------|-----------|
| **erp-domain-mcp-server** | Business domain data, specs, scaffolding | `domain_get_spec`, `domain_scaffold_endpoint` |
| **experience-mcp-server** | Experience Library search, capture, RoPE | `exp_search_trajectories`, `exp_capture_trajectory` |
| **build-mcp-server** | Build, test, lint verification | `build_turbo`, `test_go_module` |
| **auth-mcp-server** | RBAC, agent boundaries, audit | `auth_check_agent_boundary`, `auth_get_role_hierarchy` |

### 3.3 A2A Agent Cards
Every agent MUST have a registered Agent Card (`.agents/mcp/registry/agent-cards/{name}.json`) declaring:
- **Tools provided** — what the agent can do for others
- **Tools consumed** — what MCP tools the agent needs
- **File boundaries** — permitted and denied paths
- **Scoring rubric** — dimensions and weights
- **Skills** — human-readable capability descriptions

### 3.4 Structured Context (Replaces Free-Form Markdown)
Agent-to-agent communication uses typed `TaskContext` and `AgentOutput` schemas (`.agents/mcp/protocols/context-schema.ts`). This ensures:
- Zero context loss during DAG handoffs
- Validation at handoff boundaries
- Auditable trace of every dispatch

### 3.5 4-Signal Classification (Enhanced from V20's 3-Signal)
| Signal | Source | Purpose |
|--------|--------|---------|
| **1: Keyword** | ROUTING.md | Traditional keyword → agent mapping |
| **2: Complexity** | HERA protocol | T-shirt sizing for tiered activation |
| **3: Experience** | Experience Library | Past trajectory lookup |
| **4: Capability** | A2A Registry | Dynamic capability discovery ← **NEW** |

### 3.6 Backward Compatibility
MCP is **additive** — it enhances HERA V4 without breaking it:
- Existing AGENT.md directives remain valid
- ROUTING.md keyword matching still works
- Experience Library markdown files still readable
- All SOPs, templates, and workflows remain unchanged
- Migration is gradual: pilot 3 agents → expand to all 14

## 4. Delivery Roadmap: The "Revenue-First" Strategy
*(Unchanged from V17)*
Phase 1–6 roadmap remains the same.

## 5. Agent Directives (Updated for HERA V21)

1. **JAVIS (MCP Orchestrator):** Use 4-Signal Classification. Build DAGs with MCP tool calls. Dispatch via structured `TaskContext`. Query A2A Registry for capability discovery. Always trigger MUSE.
2. **MUSE (MCP Evaluator):** Score via rubric. Use `exp_capture_trajectory` and `exp_update_scorecard` MCP tools. Trigger RoPE via `exp_trigger_rope`.
3. **ALL Execution Agents:** Register capabilities in A2A Agent Cards. Consume MCP tools for domain specs, experience lookup, build verification. Produce structured `AgentOutput` after every task.
4. **Bella (Lead BA):** Curate cross-module insights. Domain spec MUST exist before code agents start. Use `domain_get_spec` to verify.
5. **Brian (Backend):** Use `domain_scaffold_endpoint` for consistent code structure. `build_go_module` for verification. Decimal(18,4) for money.
6. **Sentry (Security):** Use `auth_get_module_permissions` for RBAC matrix. `auth_check_agent_boundary` for enforcement.
7. **ALL agents:** Read `shared/hera-protocol.md` AND `mcp/protocols/mcp-orchestration.md`. Self-score every task. Check Experience Library before starting. Register in A2A Registry.

## 6. ADR Log (Updated)
| ADR | Decision | Date | Status |
|-----|----------|------|--------|
| ADR-001 | Vertical Slice architecture | 2026-04-08 | ✅ Accepted |
| ADR-002 | React Native 0.85 & Repack Module Federation | 2026-04-08 | ✅ Accepted |
| ADR-003 | Golang 1.26 Microservices | 2026-04-08 | ✅ Accepted |
| ADR-004 | PostgreSQL 15 (Schema per service) | 2026-04-08 | ✅ Accepted |
| ADR-005 | RabbitMQ for Event-Driven decoupling | 2026-04-08 | ✅ Accepted |
| ADR-006 | OpenAPI for API Contracts | 2026-04-08 | ✅ Accepted |
| **ADR-007** | **MCP + A2A as Agent Communication Backbone** | **2026-04-14** | **✅ Accepted** |

---

*Strategy V21 effective: 2026-04-14 | Approved by: Chairman*
