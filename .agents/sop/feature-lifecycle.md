# SOP: Feature Lifecycle

> Covers the full product development cycle. For module building, use `/build-module` workflow.

## When to use this SOP
- New feature that spans multiple modules
- Feature requiring Chairman approval (>2 sprint effort)
- Feature with unclear requirements (needs discovery phase)

## Phases

### 1. DISCOVER (Javis + Chairman)
Problem statement: "For [persona], [problem] is painful because [impact]"
Check shared/roadmap.md — does this align with current phase priority?

### 2. DEFINE (Bella + Javis)
**Bella** writes/updates domain spec in shared/domain/{module}.md:
  - Entity definitions with Prisma schema
  - Business rules + state machine
  - API endpoints per api-contract.md
  - RBAC matrix
  - Cross-module dependencies
**Javis** validates: domain spec passes Bella's self-check (5 gates).

### 3. PLAN (Javis)
User stories + acceptance criteria (Given/When/Then).
Decompose into sub-tasks → route to agents per ROUTING.md.
ADR if needed (new dependency, boundary change).

### 4. BUILD (via /build-module or /new-feature workflow)
Execute full-stack build per workflow. Each agent self-checks.
Agent order: Jenny(schema) → Brian(API) → Sentry(auth) → Fiona(UI) → Quinn(test)

### 5. VERIFY (Javis)
Run shared/module-done.md checklist. ALL boxes = DONE.
Financial modules: extra verification per sop/financial-audit.md.

### 6. REVIEW (Javis on-demand)
/code-review workflow. Score ≥25/30 → proceed. <25 → fix and re-score.

### 7. RELEASE (via /release workflow)
Deploy per release workflow. Monitor 1h. Post-mortem if issues.
