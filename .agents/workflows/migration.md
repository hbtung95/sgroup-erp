---
description: How to create and apply database migrations safely
---

# /migration {module} {description}

AGENT FLOW: Javis → Jenny → Brian → Atlas

## Step 1 — JAVIS: Attach domain context
Read shared/domain/{module}.md. Route to Jenny with entity + rules.

## Step 2 — JENNY: Create migration files
LOAD shared/domain/{module}.md
```powershell
$migrationDir = "D:\SGROUP ERP\modules\{module}\api\migrations"
New-Item -ItemType Directory -Force -Path $migrationDir
$seq = (Get-ChildItem "$migrationDir\*.up.sql" -ErrorAction SilentlyContinue | Measure-Object).Count + 1
$name = "{description}"
New-Item "$migrationDir\${seq}_${name}.up.sql" -Force
New-Item "$migrationDir\${seq}_${name}.down.sql" -Force
```
Write SQL. Self-check per AGENT.md.

Financial tables MUST include:
- `Decimal(18,4)` for all monetary columns
- Audit log table (see `sop/financial-audit.md`)
- Soft delete (`deleted_at TIMESTAMPTZ`)

## Step 3 — BRIAN: Update repository code
Update Go model + repository to match new schema.
Self-test: `cd "D:\SGROUP ERP\modules\{module}\api" ; go test ./... -race -count=1`

## Step 4 — Verify locally
```powershell
# Apply → verify → rollback → re-apply (idempotent test)
docker exec -it sgroup-postgres psql -U erp_admin -d sgroup_erp -f /migrations/{seq}_{name}.up.sql
docker exec -it sgroup-postgres psql -U erp_admin -d sgroup_erp -f /migrations/{seq}_{name}.down.sql
docker exec -it sgroup-postgres psql -U erp_admin -d sgroup_erp -f /migrations/{seq}_{name}.up.sql
```
