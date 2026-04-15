# ADR-007: MCP + A2A as Agent Communication Backbone

| Field | Value |
|-------|-------|
| **Decision** | Adopt MCP (Model Context Protocol) + A2A (Agent-to-Agent Protocol) as the standard communication backbone for the HERA agent team |
| **Date** | 2026-04-14 |
| **Status** | ✅ Accepted |
| **Proposer** | JAVIS (Orchestrator) |
| **Approver** | Chairman |
| **Impact** | All 14 agents, HERA protocol, Experience Library, ROUTING, Strategy |

## Context

HERA V4 uses **markdown-based communication** for agent dispatch:
- JAVIS reads ROUTING.md keywords → dispatches via free-form text instructions
- Agents load domain specs by reading `.agents/shared/domain/{module}.md` files
- Experience Library is queried by manual file scanning
- Agent capabilities are implicit (derived from AGENT.md text)
- No standardized context passing between DAG steps

### Problems with Status Quo
1. **Not discoverable:** JAVIS cannot dynamically discover agent capabilities
2. **Not structured:** Context passing is free-form markdown → easy to lose information
3. **Not auditable:** No trace of dispatches at protocol level
4. **Not composable:** Agents cannot invoke each other's tools
5. **Not scalable:** Adding a 15th agent requires manually updating ROUTING.md

## Decision

Adopt **MCP (Model Context Protocol)** for agent-to-tool/data communication and **A2A (Agent-to-Agent Protocol)** for agent discovery and delegation.

### MCP Servers (4)
| Server | Transport | Scope |
|--------|-----------|-------|
| `erp-domain-mcp-server` | stdio | Domain specs, module structure, code scaffolding |
| `experience-mcp-server` | stdio | Trajectory search, scorecard CRUD, RoPE triggers |
| `build-mcp-server` | stdio | Build, test, lint, dependency checks |
| `auth-mcp-server` | stdio | RBAC hierarchy, agent boundaries, financial rules |

### A2A Agent Cards
- Each agent registers a JSON Agent Card in `.agents/mcp/registry/agent-cards/`
- Cards declare: tools provided, tools consumed, skills, constraints, scoring
- JAVIS queries the registry during Signal 4 (Capability Discovery)

### Structured Context
- `TaskContext` (dispatch input) and `AgentOutput` (execution result) are TypeScript types
- Replaces free-form markdown instructions for inter-agent communication
- Validated at every DAG handoff boundary

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Custom JSON-RPC protocol | Reinvents the wheel; MCP is an industry standard with SDK support |
| gRPC inter-agent calls | Too heavyweight for prompt-driven agents; requires protobuf compilation |
| Keep markdown-only (V4) | Blocks scalability, not auditable, no discovery, context loss at handoffs |
| LangGraph/AutoGen | External framework dependency; HERA is self-contained and should remain so |

## Consequences

### Positive
- **Discoverable:** JAVIS can query agent capabilities dynamically via A2A
- **Structured:** TypeScript-typed context passing → zero information loss
- **Auditable:** Every MCP tool call is traceable
- **Composable:** Agents can invoke MCP tools from shared servers
- **Scalable:** New agents just register an Agent Card → immediately discoverable
- **Backward compatible:** MCP is additive; V4 workflows still function

### Negative
- **TypeScript in agent infra:** Introduces TypeScript to a project that bans Node backends (but MCP servers are infrastructure, not business logic)
- **Learning curve:** Agents need to understand MCP tool schemas
- **Maintenance:** 4 MCP servers + 14 Agent Cards to maintain
- **Complexity:** Additional layer of abstraction

### Mitigations
- TypeScript exception scoped strictly to `.agents/mcp/` — NOT in `modules/` or `core/`
- Gradual migration: Phase 1 pilots 3 agents, then expand
- MCP servers are small (~200-400 LOC each) and focused
- Agent Cards are JSON files that naturally evolve with AGENT.md changes

## Implementation

See: `.agents/mcp/README.md` for full architecture and directory structure.

---

*ADR-007 | Approved: 2026-04-14 | Owner: JAVIS + Chairman*
