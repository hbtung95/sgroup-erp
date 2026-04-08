---
description: How to add a new API endpoint in the Go backend
---
// turbo-all

# /new-api {module} {method} {path}

AGENT FLOW: Javis → Brian → Sentry → Quinn

## Step 1 — JAVIS: Classify + attach domain
Read shared/domain/{module}.md. Route to Brian with acceptance criteria.

## Step 2 — BRIAN: Implement endpoint
LOAD shared/domain/{module}.md

Inside `modules/{module}/api/`:
1. Model: `internal/model/{domain}.go`
2. Repository: `internal/repository/{domain}_repo.go`
3. Service: `internal/service/{domain}_service.go`
4. Handler: `internal/handler/{domain}_handler.go`
5. Register route in `cmd/main.go`
6. Self-test: `go test ./internal/service/... -race -count=1`

Financial rules: Decimal for money, $transaction for writes, audit log for state changes.

## Step 3 — SENTRY: Auth guard
Add middleware.RequireRole() for the new route per RBAC matrix in domain spec.

## Step 4 — BRIAN: Build verify
```powershell
cd "D:\SGROUP ERP\modules\{module}\api"
go build ./... ; go vet ./...
```
