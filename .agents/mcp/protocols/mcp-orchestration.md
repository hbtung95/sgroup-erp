# MCP Orchestration Protocol — HERA V5

> How JAVIS orchestrates agent tasks via Model Context Protocol.
> ALL agents MUST understand this protocol. JAVIS uses it for dispatch. Agents use it to understand their input/output contracts.

## 1. Overview

In HERA V5, JAVIS dispatches tasks through a standardized MCP protocol instead of free-form markdown instructions. This enables:
- **Structured context passing** — agents receive typed `TaskContext` objects
- **Tool discovery** — agents advertise capabilities via A2A Agent Cards
- **Auditable dispatch** — every dispatch is a traceable MCP tool call
- **Parallel execution** — independent DAG steps dispatch concurrently

## 2. Dispatch Flow

```
Chairman Request
      │
      ▼
┌─────────────────────────────────────────────┐
│ JAVIS: 4-Signal Classification               │
│                                               │
│ Signal 1: Keyword → Candidate agents          │
│ Signal 2: Complexity → T-shirt size           │
│ Signal 3: Experience → Trajectory lookup       │
│ Signal 4: Capability → A2A Registry query    │ ← NEW in V5
│                                               │
│ Output: Agent list + Complexity + DAG template│
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ JAVIS: DAG Construction                       │
│                                               │
│ 1. Select DAG template (dag-templates.md)     │
│ 2. Customize: remove unneeded agents          │
│ 3. Identify parallel opportunities            │
│ 4. Attach context + acceptance criteria       │
│ 5. Always end with MUSE                       │
│                                               │
│ Output: TaskContext per agent in DAG          │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ JAVIS: MCP Dispatch                           │
│                                               │
│ For each DAG step:                            │
│   dispatch_task(TaskContext) → AgentOutput    │
│                                               │
│ Sequential: Wait for output before next step  │
│ Parallel: Dispatch concurrent, merge outputs  │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ Agent Execution                               │
│                                               │
│ 1. Receive TaskContext (structured JSON)       │
│ 2. Load domain spec (MCP resource)            │
│ 3. Check experience library (MCP tool)         │
│ 4. Execute work (within file boundaries)       │
│ 5. Self-score using rubric                     │
│ 6. Produce AgentOutput (structured JSON)       │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ MUSE: Post-Task Evaluation                    │
│                                               │
│ 1. Collect all AgentOutputs                   │
│ 2. Score each agent (rubric)                   │
│ 3. Assign credit (evidence-based)              │
│ 4. Capture trajectory (exp_capture_trajectory) │
│ 5. Update scorecards (exp_update_scorecard)   │
│ 6. Extract insights if applicable              │
│ 7. Trigger RoPE if thresholds breached        │
└─────────────────────────────────────────────┘
```

## 3. Signal 4: Capability Discovery (NEW)

### Purpose
When keyword matching (Signal 1) is ambiguous or insufficient, JAVIS queries the A2A Agent Registry to find agents with matching capabilities.

### Process
```
1. Parse task requirements into capability tags
   Example: "Create HR payroll API endpoint"
     → capabilities: ["create_endpoint", "go_api", "financial_precision"]
     → skills: ["Go API development", "Financial precision"]
     → module: "hr"

2. Query A2A Registry
   registry_discover_agents({
     required_capabilities: ["create_endpoint"],
     required_skills: ["Go API development", "Financial precision"],
     module: "hr"
   })

3. Receive ranked results
   [{ card: BRIAN, relevance: 8 }, { card: IRIS, relevance: 2 }]

4. Cross-reference with Signal 1
   Signal 1 suggests: BRIAN (keyword "API endpoint")
   Signal 4 confirms: BRIAN (capability match + skill match)
   → High confidence: BRIAN is the correct agent

5. Resolve conflicts
   If Signal 1 ≠ Signal 4 → Signal 4 wins (capability > keyword)
   If multiple agents match → prefer higher relevance score
   If tie → prefer agent with higher rolling scorecard average
```

## 4. MCP Tool Calls in DAG Execution

### Dispatch Schema
```json
{
  "tool": "dispatch_task",
  "input": {
    "agent": "BRIAN",
    "context": {
      "task_id": "01926a7b-...",
      "task_name": "Create HR Payroll API endpoints",
      "priority": "P2",
      "complexity": "M",
      "module": "hr",
      "domain_spec_ref": "domain://specs/hr",
      "dag_template": "DAG-M-FEATURE",
      "dag_step": 2,
      "dag_total_steps": 5,
      "dag_dependencies_met": [{
        "agent": "BELLA",
        "outputs": { "spec_approved": true, "entities": ["Payroll", "PayrollItem"] }
      }],
      "parallel_with": ["SENTRY"],
      "similar_trajectories": [{
        "id": "traj-2026-04-10-crm-api",
        "summary": "Created CRM API endpoints",
        "outcome": "SUCCESS",
        "relevance": 0.85
      }],
      "criteria": [{
        "given": "Domain spec has Payroll entity with salary, deductions, net_pay fields",
        "when": "BRIAN creates the API endpoint",
        "then": "Handler, Service, Repository follow clean architecture with Decimal for money"
      }]
    }
  }
}
```

### Output Schema
```json
{
  "agent_name": "BRIAN",
  "task_id": "01926a7b-...",
  "completed_at": "2026-04-14T23:15:00+07:00",
  "files_modified": [
    { "path": "modules/hr/api/internal/model/payroll.go", "operation": "CREATE" },
    { "path": "modules/hr/api/internal/handler/payroll_handler.go", "operation": "CREATE" }
  ],
  "build_status": "PASS",
  "self_score": {
    "correctness": 8, "quality": 8, "efficiency": 7, "learning": 8,
    "total": 7.9
  },
  "blockers": [],
  "handoff_context": {
    "endpoints_created": ["/api/v1/hr/payroll", "/api/v1/hr/payroll/:id"],
    "models_updated": ["Payroll", "PayrollItem"]
  },
  "summary": "Created payroll API with 5 endpoints. Used Decimal for all money fields. Tests passing."
}
```

## 5. MCP Servers Used During Orchestration

| Phase | MCP Server | Tools Used |
|-------|-----------|------------|
| Classification | Experience Library | `exp_search_trajectories` |
| Classification | Auth | `auth_check_agent_boundary` |
| DAG Construction | ERP Domain | `domain_get_spec`, `domain_list_modules` |
| Dispatch | ERP Domain | `domain_get_spec`, `domain_scaffold_endpoint` |
| Dispatch | Experience Library | `exp_search_trajectories`, `exp_read_patterns` |
| Verification | Build | `build_turbo`, `build_go_module` |
| Evaluation | Experience Library | `exp_capture_trajectory`, `exp_update_scorecard` |

## 6. Error Handling

| Error | Action |
|-------|--------|
| Agent fails build verification | Retry once with specific error context → if still fails, MUSE captures failure trajectory |
| Agent stuck after 3 attempts | STOP execution, MUSE captures failure, run Post-Mortem |
| MCP Server unreachable | Fall back to markdown-based dispatch (V4 compatibility) |
| Context schema validation fails | Log error, ask JAVIS to rebuild context |
| Agent boundary violation | Reject dispatch, log security event |
| Task unclear | JAVIS escalates to Chairman — do NOT guess |

## 7. Backward Compatibility

HERA V5 is **additive** — it enhances V4 but does not break it:
- Existing AGENT.md files remain valid directive documents
- ROUTING.md keyword matching (Signal 1) still works
- Free-form markdown instructions still accepted (but structured context preferred)
- Experience Library markdown files still readable (MCP server wraps them)
- All SOPs, templates, and workflows remain unchanged

The migration path is:
1. Agents receive both markdown instructions AND structured TaskContext
2. Gradually, agents shift to consuming structured context primarily
3. Eventually, markdown instructions become supplementary only

---

*Protocol version: V5.0 | Effective: 2026-04-14 | Owner: JAVIS*
