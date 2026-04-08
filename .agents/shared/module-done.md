# Module Definition-of-Done

A module is DONE when ALL checkboxes pass:

## Domain Spec (Bella)
- [ ] Domain spec exists in shared/domain/{module}.md
- [ ] All entities documented with Prisma-like schema
- [ ] Business rules + state machines documented
- [ ] API endpoints listed per api-contract.md
- [ ] RBAC matrix defined
- [ ] Cross-module dependencies listed

## Database (Jenny)
- [ ] Migration .up.sql creates all tables from shared/domain/{module}.md
- [ ] Migration .down.sql reverses .up.sql exactly
- [ ] UUID v7 PKs, soft deletes, FK indexes, CHECK constraints
- [ ] Apply → rollback → re-apply succeeds (idempotent)
- [ ] Decimal(18,4) for all monetary fields

## Backend API (Brian)
- [ ] All CRUD endpoints per api-contract.md URL pattern
- [ ] Non-CRUD action endpoints (book, deposit, approve, etc.) if needed
- [ ] Response schema matches api-contract.md exactly
- [ ] Error codes follow {MODULE}_{ACTION}_{REASON} convention
- [ ] Financial operations wrapped in DB transactions
- [ ] Self-tests: go test ./internal/service/... passes
- [ ] go build && go vet clean

## Auth (Sentry)
- [ ] RBAC middleware on every endpoint per domain spec RBAC matrix
- [ ] Input validation/sanitization on all write endpoints
- [ ] Rate limiting configured

## Integrations (Iris) — if applicable
- [ ] External API calls have retry + circuit breaker
- [ ] SyncLog entries for all integration operations
- [ ] Webhook signature verification
- [ ] API keys from environment variables only

## Frontend (Fiona)
- [ ] List page with pagination, sort, filter
- [ ] Detail/view page
- [ ] Create/edit form with validation
- [ ] Delete (with confirmation dialog)
- [ ] All strings via t() — keys in both en.json + vi.json
- [ ] All className via cn()
- [ ] Neo-Corporate Light theme (NOT dark-only)
- [ ] Lazy-loaded route registered
- [ ] Error boundary wrapping feature
- [ ] Domain rules from shared/domain/{module}.md correctly displayed

## Tests (Quinn)
- [ ] Unit tests for key components (≥70% coverage for standard, ≥90% for critical)
- [ ] E2E smoke: navigate to page → create → view → edit → delete
- [ ] Domain edge cases tested (from shared/domain/{module}.md)
- [ ] npx vitest run passes

## Build (Atlas)
- [ ] npx turbo run build exits 0
- [ ] No new TypeScript errors
- [ ] No console warnings in build output
- [ ] go build ./... exits 0 for backend
