# A2A Handoff Protocol — HERA V5

Context passing between DAG agents. Goal: **zero context loss**.

## Handoff Types
- **Sequential (A→B):** B waits for A. Example: JENNY(schema)→BRIAN(API)
- **Parallel Merge (A∥B→C):** C waits for both. Example: BRIAN∥SENTRY→FIONA
- **Fork (A→B∥C):** A fans out. Example: BELLA→BRIAN∥FIONA

## Handoff Context Schemas

### BA Team → Code Team
```json
{"entities_defined":["Employee"],"state_machines":{"Employee":["ACTIVE","ON_LEAVE","TERMINATED"]},
 "cross_module_deps":["crm.Customer"],"rbac_matrix":{"HR_ADMIN":["EMPLOYEE_MANAGE"]},"spec_approved":true}
```

### JENNY → BRIAN
```json
{"tables_created":["employees","departments"],"migration_files":["20260414_create_hr.sql"],
 "indexes_added":["idx_employees_dept"],"constraints":["fk_employees_dept"]}
```

### BRIAN → FIONA
```json
{"endpoints_created":[{"method":"GET","path":"/api/v1/hr/employees","auth":"requireRole('HR_VIEWER')"}],
 "models_created":["Employee"],"response_format":"{ success, data, meta }"}
```

### SENTRY → BRIAN/FIONA
```json
{"auth_middleware":["JWTVerify","RBACGuard"],
 "role_guards":{"HR_ADMIN":["employee.create","employee.update"],"HR_VIEWER":["employee.list"]}}
```

### FIONA → QUINN
```json
{"pages_created":["/hr/employees"],"components_created":["EmployeeTable","EmployeeForm"],
 "shared_components_used":["@sgroup/ui/DataTable"],"routes_registered":true}
```

## Validation (every handoff)
✓ Task ID matches | ✓ Build PASS | ✓ Expected outputs present | ✓ Files within boundaries

| Failure | Action |
|---------|--------|
| Task ID mismatch | JAVIS mediates |
| Build FAIL | STOP — previous agent fixes first |
| Missing output | JAVIS re-dispatches previous agent |
| Boundary violation | Log security event |

## Conflict Resolution
- **File conflict:** First agent preserved → second re-dispatched with merge instruction
- **Schema conflict:** JAVIS transforms or re-dispatches with corrected criteria
- **Chain failure:** Pause downstream → retry 1× → fail → MUSE captures → alt DAG

*V5.0 | 2026-04-14 | Owner: JAVIS + MUSE*
