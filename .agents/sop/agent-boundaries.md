# Agent Boundaries & Guardrails (V19)

> **CRITICAL DIRECTIVE**: If you are an Agent operating in this project, you are restricted by Sandbox Physics. You MUST NOT cross your role boundary unless explicitly forced by the User. Violating these rules will corrupt the project.

## 1. Directory Lock (Role-Based Access Control)
Agents must only touch directories that they "own".
- **Brian (Backend):** 
  - ✅ Permitted files: `modules/*/api/**/*.go`, `core/api-gateway/**/*.go`
  - ❌ DENIED files: `modules/*/web/**/*`, `packages/ui/**/*`, React components.
- **Fiona (Frontend):** 
  - ✅ Permitted files: `modules/*/web/src/**/*`, `core/web-host/src/**/*` (React/TS).
  - ❌ DENIED files: `modules/*/api/**/*`, Go files.
- **Jenny (DBA):** 
  - ✅ Permitted files: `modules/*/api/migrations/*.sql`, database schema files.
- **Nova (UI/Design):**
  - ✅ Permitted files: `packages/ui/**/*`, design system files.
  - ❌ DENIED files: module-specific code.
- **Sentry (Auth):**
  - ✅ Permitted files: `packages/rbac/**/*`, `core/api-gateway/middleware/**/*`.
- **Bella (Lead BA):**
  - ✅ Permitted files: `.agents/shared/domain/**/*`, `docs/business-analysis/**/*`.
  - ❌ DENIED files: ALL source code files.
- **Diana (Process BA):**
  - ✅ Permitted files: `docs/business-analysis/processes/**/*`, `docs/business-analysis/user-journeys/**/*`.
  - ❌ DENIED files: ALL source code files, domain specs (Bella's territory).
- **Oscar (Org BA):**
  - ✅ Permitted files: `docs/business-analysis/organization/**/*`.
  - ❌ DENIED files: ALL source code files, domain specs.
- **Marco (Industry BA):**
  - ✅ Permitted files: `docs/business-analysis/industry/**/*`.
  - ❌ DENIED files: ALL source code files, domain specs.
- **Iris (Integration):**
  - ✅ Permitted files: `modules/*/api/integrations/**/*`, external API connectors.
  - ❌ DENIED files: Frontend code, UI components.

*Note: Javis (Orchestrator) only drafts plans, but CANNOT code.*

## 2. Mutex Rule (Cross-Module Barrier)
If you are building Module B (e.g. `crm`), you **MUST NOT** directly edit or import internal code from Module A (e.g. `hr`). 
- **Forbidden Action:** Modifying the handler/service of `hr` just to make your `crm` module work.
- **Allowed Action:** Reading the `api-contract.md` of `hr` and making an HTTP request or calling the shared interface.

## 3. Git Sandboxing (The "No Main" Rule)
- Agents are BANNED from generating or refactoring code while checked out on the `main` branch.
- **Mandatory First Step:** All tasks must start with a branch creation `git checkout -b feat/<task-name>`.
- **Mandatory Final Step:** Code remains on the feature branch. Do not merge into `main` without invoking the `/code-review` workflow to verify architectural compliance.

## 4. Financial Data Rule (SGROUP-specific)
- ALL monetary values MUST use `Decimal(18,4)` — NEVER Float.
- ALL financial write operations MUST be wrapped in database transactions.
- ALL financial state changes MUST create an audit log entry.
- NEVER hard-delete financial records — soft delete only.
