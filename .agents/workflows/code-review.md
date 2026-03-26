---
description: Automated code review workflow for SGROUP ERP
---

# Code Review Workflow

Use this workflow to perform a systematic code review on changed files.

## Steps

1. **Identify Changed Files**
   // turbo
   - List recent changes: `git diff --name-only HEAD~1`
   - Or list staged changes: `git diff --name-only --cached`

2. **Check TypeScript Errors**
   // turbo
   - Frontend: `cd SGROUP-ERP-UNIVERSAL && npx tsc --noEmit`
   // turbo
   - Backend: `cd sgroup-erp-backend && npx tsc --noEmit`

3. **Run Linter**
   // turbo
   - Backend: `cd sgroup-erp-backend && npm run lint`

4. **Review Each File**
   For each changed file, check against the code-review skill checklist:
   - TypeScript quality (no `any`, proper types)
   - Architecture patterns followed
   - Error handling present
   - Performance considerations
   - Security checks
   - Naming conventions
   - No dead code

5. **Run Tests**
   // turbo
   - Backend: `cd sgroup-erp-backend && npm test`

6. **Generate Report**
   Create a summary with:
   - 🔴 BLOCKER issues (must fix)
   - 🟡 SUGGESTION issues (should fix)
   - 🟢 NICE highlights (well done)
   - 💡 QUESTION items (need clarification)


## 🚨 ARCHITECTURE RED-FLAG REVIEW
**CRITICAL STEP:** During Code Review, you MUST cross-reference the PR against the RED FLAGS defined in the `docs/architecture/*-architecture-rules.md` documents. Specifically hunt for Prisma N+1, direct Axios UI calls, Missing DTOs, and Hardcoded strings/secrets. Reject PR immediately on any single violation.