# Strategy V21 — HERA V5: MCP-Native Architecture

ALL agents MUST comply. Supersedes V20.
History: V17(Microservices) → V18(Auto-Learn) → V19(Guardrails) → V20(HERA/DAG) → **V21(MCP-Native)**

## 1. Business: Real Estate Brokerage ERP
SGROUP manages Project & Inventory, Sales Pipeline, Commission, Agency, Finance, HR/Ops.

## 2. Architecture: Fault Isolation
FE: ErrorBoundary | BE: Docker microservices | Inter-service: HTTP/RPC + RabbitMQ

## 3. MCP-Native Mandate (V21)

### 4-Layer Model
L0: MCP Infrastructure (A2A Registry, 4 MCP Servers, Governance)
L1: JAVIS (4-Signal, DAG, MCP Dispatch)
L2: Domain MCP Servers (ERP Domain, Experience, Build, Auth)
L3: MUSE (Scoring, Credit, Trajectory, RoPE)

### MCP Servers
| Server | Key Tools |
|--------|-----------|
| erp-domain-mcp | domain_get_spec, domain_scaffold_endpoint |
| experience-mcp | exp_search_trajectories, exp_capture_trajectory |
| build-mcp | build_turbo, test_go_module |
| auth-mcp | auth_check_agent_boundary, auth_get_role_hierarchy |

### A2A Agent Cards
Every agent → `.agents/mcp/registry/agent-cards/{name}.json`
Declares: tools provided/consumed, file boundaries, scoring rubric, skills

### Structured Context
TaskContext + AgentOutput (typed, validated at handoff boundaries, auditable)
Schema: `.agents/mcp/protocols/context-schema.ts`

### 4-Signal Classification
S1:Keyword(ROUTING.md) | S2:Complexity(T-shirt) | S3:Experience(Library) | S4:Capability(A2A) ← NEW

### Backward Compatibility
MCP is additive — AGENT.md, ROUTING.md, Experience Library markdown, SOPs all still valid.
Migration: pilot 3 → expand to 14.

## 4. Roadmap: Revenue-First (P1-P6, unchanged from V17)

## 5. Agent Directives
- JAVIS: 4-Signal + DAG + MCP dispatch + MUSE trigger
- MUSE: Rubric scoring + exp_capture + exp_update + RoPE
- ALL: A2A Card + MCP tools + AgentOutput + self-score + Experience Library check
- Bella: Domain spec gate | Brian: domain_scaffold + Decimal | Sentry: auth_check

## 6. ADR Log
ADR-001 Vertical Slice | ADR-002 RN 0.85 + Repack | ADR-003 Go 1.26 | ADR-004 PostgreSQL 15
ADR-005 RabbitMQ | ADR-006 OpenAPI | **ADR-007 MCP+A2A Backbone**

*V21 effective: 2026-04-14 | Approved: Chairman*
