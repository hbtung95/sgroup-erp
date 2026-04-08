# SOP: Financial Audit Trail

> **Actor:** Brian (backend) + Jenny (DB) + Sentry (auth)
> **Trigger:** Any module that handles monetary values (Commission, Accounting, HR/Payroll, Real Estate transactions)

## Mandatory Rules

### 1. Audit Log Table (per module)
```sql
CREATE TABLE {module}_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,     -- 'invoice', 'commission', 'payroll'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,          -- 'CREATED', 'APPROVED', 'PAID', 'CANCELLED'
  old_value JSONB,                      -- Previous state snapshot
  new_value JSONB,                      -- New state snapshot
  changed_by UUID NOT NULL,             -- User who made the change
  changed_by_name VARCHAR(255),         -- Denormalized (user may leave company)
  changed_by_role VARCHAR(50),          -- Role at time of action
  ip_address VARCHAR(45),
  trace_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_{module}_audit_entity ON {module}_audit_logs(entity_type, entity_id);
CREATE INDEX idx_{module}_audit_date ON {module}_audit_logs(created_at);
```

### 2. When to Log (MANDATORY — no exceptions)
- Invoice created / confirmed / paid / cancelled
- Commission calculated / approved / paid
- Payroll calculated / approved / paid
- Booking created / deposited / contracted
- Any monetary value changed
- Any status transition on financial entity

### 3. What to Log
```go
type AuditEntry struct {
    EntityType    string          `json:"entity_type"`
    EntityID      string          `json:"entity_id"`
    Action        string          `json:"action"`
    OldValue      json.RawMessage `json:"old_value,omitempty"`
    NewValue      json.RawMessage `json:"new_value"`
    ChangedBy     string          `json:"changed_by"`
    ChangedByName string          `json:"changed_by_name"`
    ChangedByRole string          `json:"changed_by_role"`
}
```

### 4. Immutability Rules
- Audit log entries are APPEND-ONLY — NEVER update or delete
- Financial records use soft delete — NEVER hard delete
- Cancelled transactions remain in DB with `status: CANCELLED` and audit entry

### 5. Retention
- Financial audit logs: 10 years minimum (Vietnamese regulation)
- Non-financial audit logs: 3 years minimum
