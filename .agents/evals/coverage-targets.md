# Eval: Coverage Targets

## Gates
  CRITICAL ≥90%: auth, commission-calculation, booking-lock, payroll, RBAC, transaction-state-machine
  STANDARD ≥70%: CRUD, transformations, validations, API formatting
  UI COMPONENTS ≥60%: @sgroup/ui

## Financial Precision Tests (MANDATORY)
  Decimal arithmetic must be exact — no floating-point drift
  Commission split % must sum to exactly 100
  VND currency formatting verified
  Rounding rules: DOWN for payables, UP for receivables

## Commands
  Frontend: npx vitest run --coverage
  Backend:  cd modules/{name}/api ; go test ./... -coverprofile=coverage.out -count=1

## Rules
  New code must NOT decrease total coverage
  Critical modules must test: happy path + error path + boundary + auth + financial precision
  Every bug fix must include regression test
  Flaky tests = SEV3 (fix immediately)
  State machine tests: valid + INVALID transitions (must reject)
