---
description: Step-by-step workflow for developing a new feature in SGROUP ERP
---

# Feature Development Workflow

Use this workflow when implementing a new feature. Follow each step in order.

## Steps

1. **Understand Requirements**
   - Read the feature requirements / user story
   - Identify affected modules (frontend, backend, database)
   - Check for existing patterns in similar features

2. **Plan the Implementation**
   - Create an implementation plan document
   - List all files to create/modify
   - Design the data model (if database changes needed)
   - Identify shared components to reuse

3. **Database Changes (if needed)**
   - Update `prisma/schema.prisma` with new models/fields
   // turbo
   - Create migration: `cd sgroup-erp-backend && npx prisma migrate dev --name <feature_name>`
   // turbo
   - Generate Prisma client: `cd sgroup-erp-backend && npx prisma generate`

4. **Backend Implementation**
   - Create/update DTOs in `src/modules/<feature>/dto/`
   - Create/update service in `src/modules/<feature>/<feature>.service.ts`
   - Create/update controller in `src/modules/<feature>/<feature>.controller.ts`
   - Create/update module in `src/modules/<feature>/<feature>.module.ts`
   - Register module in `app.module.ts` if new

5. **Frontend Implementation**
   - Create types in `src/features/<feature>/types/`
   - Create Zustand store in `src/features/<feature>/stores/`
   - Create screen components in `src/features/<feature>/screens/`
   - Create reusable components in `src/features/<feature>/components/`
   - Add navigation routes

6. **Error Handling (CRITICAL)**
   - Wrap feature module in ErrorBoundary
   - Add `try/catch` to all async store actions
   - Normalize API responses: `Array.isArray(data) ? data : data?.data ?? []`
   - Handle 401 (auto-logout) and 403 (access denied) responses
   - Add loading state (`SGSkeleton`) and empty state (`SGEmptyState`)

7. **Testing**
   // turbo
   - Run backend tests: `cd sgroup-erp-backend && npm test`
   - Test API endpoints manually or with Supertest
   - Verify frontend renders correctly on web (localhost:8081)
   - Test edge cases: empty data, API error, slow network

8. **Code Review**
   - Self-review using the code-review skill checklist
   - ⚠️ Check the **Common Bug Checklist** in code-review skill
   // turbo
   - Check TypeScript errors: `cd SGROUP-ERP-UNIVERSAL && npx tsc --noEmit`
   // turbo
   - Run lint: `cd sgroup-erp-backend && npm run lint`

9. **Polish**
   - Verify responsive design (mobile + web)
   - Add micro-animations per UI/UX design skill
   - Verify all data displays use `Array.isArray()` guards
   - Test with browser DevTools open (check for console errors)


## 🚨 ARCHITECTURE COMPLIANCE STEP
**CRITICAL ZERO-STEP:** Before writing any code for a feature, you MUST review all 7 pillars in `docs/architecture/` (UI, Frontend, Backend, Test, DevOps, Security, AI/Data) to verify that your technical design complies with the Enterprise Constraints and RED FLAGS.