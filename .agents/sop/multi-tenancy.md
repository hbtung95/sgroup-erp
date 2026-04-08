# SOP: Multi-Tenancy Strategy

> **Actor:** Jenny (DB schema) + Brian (backend) + Sentry (auth)
> **Trigger:** Data isolation between branches, teams, or future SaaS tenants

## Strategy: Schema-Level Isolation with RLS

### 1. Tenant Model
SGROUP operates as a single company with multiple branches:
```
SGROUP (Company)
├── Chi nhánh HCM (Branch)
│   ├── Team A (Team Lead + Sales)
│   └── Team B
├── Chi nhánh Hà Nội
├── Chi nhánh Đà Nẵng
└── HQ (CEO, Directors, Accounting, HR)
```

### 2. Data Visibility Matrix
| Role | See Own Data | See Team Data | See Branch Data | See Company Data |
|------|:---:|:---:|:---:|:---:|
| Sales | ✅ | ❌ | ❌ | ❌ |
| Team Lead | ✅ | ✅ | ❌ | ❌ |
| Branch Manager | ✅ | ✅ | ✅ | ❌ |
| Director | ✅ | ✅ | ✅ | ✅ |
| CEO | ✅ | ✅ | ✅ | ✅ |
| Accountant | Financial data only | ✅ | ✅ | ✅ |
| HR Manager | HR data only | ✅ | ✅ | ✅ |

### 3. Implementation
```sql
-- Every business table includes:
branch_id UUID NOT NULL REFERENCES branches(id),
team_id UUID REFERENCES teams(id),
created_by UUID NOT NULL REFERENCES staff(id),

-- PostgreSQL Row-Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY deals_sales_policy ON deals
  FOR ALL TO app_user
  USING (created_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY deals_team_lead_policy ON deals
  FOR SELECT TO app_team_lead
  USING (team_id = current_setting('app.current_team_id')::UUID);

CREATE POLICY deals_branch_manager_policy ON deals
  FOR SELECT TO app_branch_manager
  USING (branch_id = current_setting('app.current_branch_id')::UUID);
```

### 4. API Gateway Enforcement
```go
// Set PostgreSQL session variables from JWT claims
func SetTenantContext(ctx context.Context, db *pgx.Conn, claims jwt.Claims) {
    db.Exec(ctx, "SET app.current_user_id = $1", claims.UserID)
    db.Exec(ctx, "SET app.current_branch_id = $1", claims.BranchID)
    db.Exec(ctx, "SET app.current_team_id = $1", claims.TeamID)
    db.Exec(ctx, "SET app.current_role = $1", claims.Role)
}
```

### 5. Future SaaS Scaling
If SGROUP expands to white-label ERP for other brokerages:
- Add `tenant_id UUID` to all tables
- Create separate PostgreSQL schemas per tenant
- Tenant routing at API Gateway level
