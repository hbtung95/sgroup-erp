# A2A Handoff Protocol — HERA V5

> Defines how agents pass context to each other during DAG execution.
> Critical for sequential DAG steps where Agent B depends on Agent A's output.

## 1. Handoff Principle

A **handoff** occurs when one agent's output becomes the next agent's input in the DAG:

```
Agent A (produces AgentOutput) → Handoff → Agent B (receives TaskContext with dependencies)
```

The goal: **zero context loss** between agents. Every handoff carries:
- Agent A's files modified
- Agent A's build status
- Agent A's handoff_context (domain-specific structured data)
- Agent A's self-score (for MUSE's reference)

## 2. Handoff Types

### 2.1 Sequential Handoff (A → B)
Agent B waits for Agent A to complete before starting.

```
Example: JENNY (schema) → BRIAN (API)
  JENNY produces: { files_modified: ["migrations/001_create_employees.sql"],
                     handoff_context: { tables_created: ["employees", "departments"] } }
  BRIAN receives: TaskContext with dag_dependencies_met containing JENNY's output
```

### 2.2 Parallel Merge (A ∥ B → C)
Agent C waits for both Agent A and Agent B to complete.

```
Example: BRIAN (API) ∥ SENTRY (auth) → FIONA (UI)
  BRIAN produces:  { handoff_context: { endpoints: ["/api/v1/hr/employees"] } }
  SENTRY produces: { handoff_context: { auth_guards: ["requireRole('HR_ADMIN')"] } }
  FIONA receives:  Both outputs merged into dag_dependencies_met
```

### 2.3 Fork Handoff (A → B ∥ C)
One agent's output fans out to multiple parallel agents.

```
Example: BELLA (spec) → BRIAN ∥ FIONA
  BELLA produces: { handoff_context: { entities: ["Employee"], approved: true } }
  Both BRIAN and FIONA receive BELLA's output independently
```

## 3. Handoff Context Schemas

Each agent type produces domain-specific handoff data:

### BA Team → Code Team
```json
{
  "entities_defined": ["Employee", "Department", "Position"],
  "state_machines": { "Employee": ["ACTIVE", "ON_LEAVE", "TERMINATED"] },
  "cross_module_deps": ["crm.Customer"],
  "rbac_matrix": { "HR_ADMIN": ["EMPLOYEE_MANAGE"], "HR_VIEWER": ["EMPLOYEE_VIEW"] },
  "spec_approved": true
}
```

### JENNY → BRIAN
```json
{
  "tables_created": ["employees", "departments", "positions"],
  "tables_modified": [],
  "migration_files": ["20260414_create_hr_tables.sql"],
  "indexes_added": ["idx_employees_department_id"],
  "constraints": ["fk_employees_department_id"]
}
```

### BRIAN → FIONA
```json
{
  "endpoints_created": [
    { "method": "GET", "path": "/api/v1/hr/employees", "auth": "requireRole('HR_VIEWER')" },
    { "method": "POST", "path": "/api/v1/hr/employees", "auth": "requireRole('HR_ADMIN')" }
  ],
  "models_created": ["Employee", "Department"],
  "response_format": "{ success: boolean, data: T, meta: { total, page, limit } }"
}
```

### SENTRY → BRIAN / FIONA
```json
{
  "auth_middleware": ["JWTVerify", "RBACGuard"],
  "role_guards": {
    "HR_ADMIN": ["employee.create", "employee.update", "employee.delete"],
    "HR_VIEWER": ["employee.list", "employee.get"]
  },
  "rls_policies": ["tenant_isolation"]
}
```

### FIONA → QUINN
```json
{
  "pages_created": ["/hr/employees", "/hr/employees/:id", "/hr/departments"],
  "components_created": ["EmployeeTable", "EmployeeForm", "DepartmentCard"],
  "shared_components_used": ["@sgroup/ui/DataTable", "@sgroup/ui/FormField"],
  "routes_registered": true
}
```

## 4. Context Validation

At every handoff boundary, the receiving agent MUST validate:

```
✓ Task ID matches — same task context flows through the DAG
✓ Build status is PASS — do not build on broken foundation
✓ Expected outputs present — handoff_context has required fields
✓ File changes are within boundaries — no rogue file modifications
```

### Validation Rules
| Check | Action on Failure |
|-------|-------------------|
| Task ID mismatch | JAVIS mediates — possible routing error |
| Build FAIL from previous agent | STOP — previous agent must fix before handoff |
| Missing expected output | JAVIS re-dispatches previous agent with clarification |
| Boundary violation detected | Log security event, JAVIS investigates |

## 5. Conflict Resolution at Handoff

### File Conflict
If two parallel agents modify the same file:
1. JAVIS detects conflict before merging handoff contexts
2. First agent's changes are preserved (temporal priority)
3. Second agent is re-dispatched with "merge with existing changes" instruction
4. MUSE logs the conflict in the trajectory

### Output Schema Conflict
If Agent A's output doesn't match Agent B's expected input:
1. JAVIS inspects both Agent Cards for compatibility
2. If resolvable — JAVIS transforms the output format
3. If not resolvable — JAVIS re-dispatches Agent A with corrected acceptance criteria

### Dependency Chain Failure
If an agent in the middle of the DAG fails:
1. All downstream agents are paused
2. JAVIS attempts retry (1 time) with specific error context
3. If retry fails → MUSE captures failure trajectory
4. JAVIS may re-route to an alternative DAG (if experience suggests one)

## 6. Handoff Tracing

Every handoff is logged for auditability:

```json
{
  "trace_id": "handoff-01926a7b-...",
  "timestamp": "2026-04-14T23:10:00+07:00",
  "from_agent": "JENNY",
  "to_agent": "BRIAN",
  "task_id": "01926a7b-...",
  "dag_step": { "from": 2, "to": 3 },
  "context_size_bytes": 1234,
  "validation": "PASS",
  "duration_ms": 50
}
```

These traces become part of the MUSE trajectory capture, enabling:
- Performance analysis (which handoffs are bottlenecks?)
- Failure root cause analysis (which handoff caused the break?)
- DAG optimization (which handoffs can be parallelized?)

## 7. Backward Compatibility

For agents not yet migrated to MCP-native handoffs:
- JAVIS appends handoff context to markdown instructions
- Agents can read structured JSON from the instruction preamble
- Gradually, agents shift to consuming TaskContext directly

---

*Protocol version: V5.0 | Effective: 2026-04-14 | Owner: JAVIS + MUSE*
