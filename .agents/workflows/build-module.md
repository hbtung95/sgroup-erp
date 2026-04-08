---
description: How to build a complete module end-to-end (full-stack)
---
// turbo-all

# /build-module {module}

End-to-end full-stack build for a single module.
AGENT FLOW: Javis → BA TEAM [Bella(spec) + Diana(flow) + Oscar(rbac) + Marco(compliance)] → Jenny(schema) → Brian(API) → Sentry(auth) → Fiona(UI) → Quinn(tests) → Atlas(build)
DOMAIN: LOAD shared/domain/{module}.md at EVERY step.
API: Follow shared/api-contract.md for all endpoints.
DONE: Check shared/module-done.md at the end.

## Step 0 — JAVIS: Git Sandboxing (V19 Guardrail)
```powershell
cd "D:\SGROUP ERP"
git checkout -b "feat/module-{module}"
```
*Crucial: Do not perform any file generation on the `main` branch.*

## Step 1 — JAVIS: Prerequisites
Verify all target directories exist before starting:
```powershell
@("D:\SGROUP ERP\modules\{module}\api","D:\SGROUP ERP\modules\{module}\web\src","D:\SGROUP ERP\modules\{module}\app") | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ }
```
If module API doesn't exist: scaffold it first (`cd modules/{module}/api ; go mod init sgroup-erp/modules/{module}/api`).

## Step 1.5 — BA TEAM: Domain Spec & Business Analysis

### BELLA (Lead): Domain Spec Verification
Read shared/domain/{module}.md. Verify:
- All entities defined with Prisma-like schema
- Business rules documented with code examples
- State machine transitions mapped
- API endpoints listed
- MANDATORY RULES section present
If domain spec is incomplete, Bella writes/updates it BEFORE coding starts.

### DIANA: Process Flow Mapping
Create/update docs/business-analysis/processes/{module}/:
- Map all business processes for this module
- Document user journeys per persona
- Identify approval gates and escalation paths
- Create Mermaid flowcharts for key processes

### OSCAR: RBAC & KPI Check
Verify in docs/business-analysis/organization/:
- RBAC matrix row for this module is complete
- KPIs defined for all affected roles
- Approval thresholds documented (VNĐ amounts)
- Data isolation scope defined (All/Branch/Team/Self)

### MARCO: Compliance Validation
Verify:
- Tax implications documented (VAT, PIT on commission)
- Regulatory requirements met (e-invoice, data retention)
- Industry-specific business rules correct

**BA Team must approve combined spec before Step 2.**

## Step 2 — JAVIS: Plan
Read shared/domain/{module}.md. List entities, endpoints needed, pages needed.
Read shared/roadmap.md — verify this module's dependencies are already built.

## Step 3 — JENNY: Schema
```powershell
$migrationDir = "D:\SGROUP ERP\modules\{module}\api\migrations"
New-Item -ItemType Directory -Force -Path $migrationDir
$seq = (Get-ChildItem "$migrationDir\*.up.sql" -ErrorAction SilentlyContinue | Measure-Object).Count + 1
New-Item "$migrationDir\${seq}_{module}.up.sql" -Force
New-Item "$migrationDir\${seq}_{module}.down.sql" -Force
```
Write SQL from domain entities. Self-check: constraints, rollback.

## Step 4 — BRIAN: API
Create inside `modules/{module}/api/`:
  internal/model → internal/repository (interface+impl) → internal/service → internal/handler → cmd/main.go
Follow api-contract.md: URL pattern, response schema, error codes.
Self-test: `cd modules/{module}/api ; go test ./internal/service/... -race -count=1`

## Step 5 — SENTRY: Auth
Add RequireRole() middleware per RBAC matrix in domain spec.
SGROUP RBAC: CEO > DIRECTOR > BRANCH_MANAGER > TEAM_LEAD > SALES > ACCOUNTANT > HR_MANAGER
Validate inputs on all write endpoints.

## Step 6 — FIONA: Frontend
```powershell
$base = "D:\SGROUP ERP\modules\{module}\web\src"
New-Item -ItemType Directory -Force -Path "$base\components","$base\hooks","$base\api","$base\types"
```
Create: types (match API response) → api hooks (TanStack Query) → pages (list+detail+form) → barrel export.
Add i18n keys to en.json + vi.json. Register module route in web-host App.tsx.
Use Neo-Corporate Light theme (NOT dark-only).

## Step 7 — QUINN: Tests
Write: unit tests for components + E2E smoke (create→view→edit→delete).
`npx vitest run --coverage`

## Step 8 — ATLAS: Build verify
```powershell
cd "D:\SGROUP ERP" ; npx turbo run build
```

## Step 9 — JAVIS: Verify DONE
Run through shared/module-done.md checklist. All boxes checked → module DONE. Do NOT merge to main, trigger `/code-review` workflow first.
