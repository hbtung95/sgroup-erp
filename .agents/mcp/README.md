# SGROUP ERP — MCP Infrastructure (HERA V5)

> **Multi-Agent Orchestration via Model Context Protocol (MCP) + Agent-to-Agent Protocol (A2A)**
> All agents MUST read this document to understand the MCP-native communication backbone.

## What is this?

The MCP Infrastructure is the **protocol-driven communication layer** for the HERA V5 agent team. It replaces the V4 markdown-only dispatch with standardized, discoverable, and auditable protocols:

- **MCP (Model Context Protocol):** Agent-to-Tool/Data communication (vertical)
- **A2A (Agent-to-Agent Protocol):** Agent-to-Agent capability discovery (horizontal)

## Architecture

```
┌──────────────── LAYER 0: MCP INFRASTRUCTURE ────────────────┐
│  Agent Registry (A2A)  │  MCP Servers  │  Security/Audit    │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────── LAYER 1: ORCHESTRATOR ──────────────────────┐
│  JAVIS (MCP Client) — 4-Signal Classify → DAG → MCP Dispatch│
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────── LAYER 2: DOMAIN MCP SERVERS ────────────────┐
│  ERP Domain  │  Experience Library  │  Build/CI  │  Auth    │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────── LAYER 3: FEEDBACK & EVOLUTION ──────────────┐
│  MUSE (MCP Client) — Score → Credit → Trajectory → RoPE     │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
.agents/mcp/
├── README.md                     ← This file
├── package.json                  ← Shared dependencies
├── tsconfig.json                 ← TypeScript config
│
├── servers/                      ← MCP Servers (one per domain)
│   ├── erp-domain-mcp-server/   ← ERP business domain tools & resources
│   ├── experience-mcp-server/   ← Experience Library queryable service
│   ├── build-mcp-server/        ← Build, test, lint tools
│   └── auth-mcp-server/         ← RBAC & audit tools
│
├── registry/                     ← A2A Agent Registry
│   ├── agent-cards/             ← One JSON card per agent (14 total)
│   └── registry.ts              ← Discovery service
│
└── protocols/                    ← Protocol definitions
    ├── mcp-orchestration.md     ← How JAVIS orchestrates via MCP
    ├── a2a-handoff.md           ← Agent-to-agent context handoff
    └── context-schema.ts        ← Shared TypeScript types
```

## MCP Servers

| Server | Purpose | Transport | Tools |
|--------|---------|-----------|-------|
| **erp-domain-mcp-server** | ERP business domain data & scaffolding | stdio | `domain_get_spec`, `hr_*`, `crm_*`, `sales_*` |
| **experience-mcp-server** | Experience Library CRUD & search | stdio | `exp_search_*`, `exp_capture_*`, `exp_get_*` |
| **build-mcp-server** | Build, test, lint verification | stdio | `build_*`, `test_*`, `lint_*` |
| **auth-mcp-server** | RBAC queries & audit log access | stdio | `auth_*`, `audit_*` |

## How Agents Use MCP

### As MCP Clients (consuming tools)
Every agent can **consume** tools from MCP servers:
```
BRIAN needs domain spec → calls domain_get_spec("hr")
FIONA needs past UI patterns → calls exp_search_trajectories({ query: "dashboard component" })
JENNY needs RBAC context → calls auth_get_role_matrix("hr")
```

### As A2A Providers (discoverable capabilities)
Every agent **registers** their capabilities in Agent Cards:
```
JAVIS discovers agents by querying registry → finds BRIAN has "create_endpoint" capability
MUSE queries agent capabilities → knows which agents to score for which skills
```

## Protocol Rules

1. **ALL inter-agent communication** MUST use structured `TaskContext` (not free-form markdown)
2. **ALL tool invocations** MUST use MCP tool call protocol (JSON-RPC)
3. **ALL agent capabilities** MUST be registered in A2A Agent Cards
4. **BACKWARD COMPATIBILITY:** Existing AGENT.md, ROUTING.md, domain specs remain valid
5. **MCP is additive:** It enhances HERA V4, does not replace core principles

## Related Documents

- [HERA Protocol V5](../shared/hera-protocol.md) — Master protocol reference
- [MCP Orchestration Protocol](protocols/mcp-orchestration.md) — Dispatch via MCP
- [A2A Handoff Protocol](protocols/a2a-handoff.md) — Agent-to-agent context passing
- [Strategy V21](../shared/strategy-v21.md) — MCP mandate

---

*MCP Infrastructure v1.0 | Effective: 2026-04-14 | ADR-007 | Owner: JAVIS*
