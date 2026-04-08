# SGROUP ERP — Build Roadmap (Real Estate Brokerage)

TL;DR: 6 phases, Revenue-First approach. Each module is built full-stack (schema ──▶ Go Microservice ──▶ React Frontend ──▶ Tests) and containerized independently before proceeding.

## Business Priorities (Revenue-Impact Logic)
1. **Sales First (Revenue Engine):** Real estate sales pipeline = blood of the company.
2. **Operations:** HR, Attendance, Payroll, Commission — keep the machine running.
3. **Finance & Compliance:** Accounting, Legal, Tax — protect the business.
4. **Agency Network:** F1/F2 distribution network — scale reach.
5. **Intelligence:** BDH Dashboard, Reports, KPI — make decisions.
6. **Ecosystem:** Marketing, S-Homes, Integrations — grow the business.

---

## Phase Order + Deliverables

### 🎯 PHASE 1: "Sales Engine" (Revenue-generating core)
*Goal: Digitize the real estate sales pipeline — from project → product → booking → HĐMB.*
- **modules:** `real-estate`, `crm`, `customer`, `transaction`
- **features:** Project/product management, customer 360, BizFly CRM sync, booking with pessimistic lock, deposit → contract flow.
- **priority:** P0 — MVP
- **dependencies:** API Gateway, Auth, DB schema

### 🎯 PHASE 2: "Operations Core" (Keep the company running)
*Goal: HR and payroll management for sales teams + commission calculation.*
- **modules:** `hr`, `commission`, `accounting`
- **features:** Staff profiles, attendance, payroll calculation, commission multi-level split, invoice management, AR/AP tracking.
- **priority:** P0 — MVP
- **dependencies:** Phase 1 (deals feed into commission)

### 🎯 PHASE 3: "Legal & Compliance" (Protect the business)
*Goal: Contract lifecycle, legal document management, financial compliance.*
- **modules:** `legal`, `accounting` (advanced: tax, audit trail)
- **features:** HĐMB generation, notarization tracking, handover protocol, tax compliance, financial audit trail.
- **priority:** P1 — Launch
- **dependencies:** Phase 1 (transactions), Phase 2 (accounting)

### 🎯 PHASE 4: "Agency Network" (Scale distribution)
*Goal: F1/F2 agency management, multi-level commission sharing.*
- **modules:** `agency`, `commission` (advanced: F1/F2 split)
- **features:** Agency onboarding, territory assignment, 2-tier commission split, agency performance tracking.
- **priority:** P1 — Launch
- **dependencies:** Phase 1 (sales data), Phase 2 (commission engine)

### 🎯 PHASE 5: "Intelligence" (Decision-making tools)
*Goal: Executive dashboard, KPI tracking, advanced reporting.*
- **modules:** `bdh-dashboard`, `reports`, `settings`
- **features:** Revenue KPI, target vs actual, drill-down analytics, export PDF/Excel, notification center.
- **priority:** P2 — Post-launch
- **dependencies:** All data from Phase 1-4

### 🎯 PHASE 6: "Ecosystem" (Growth & Expansion)
*Goal: Marketing, property management, and external integrations.*
- **modules:** `marketing`, `s-homes`, `subscription`
- **features:** Campaign tracking, lead attribution, property rental management, SaaS subscription for agency partners.
- **priority:** P2 — Post-launch

---

## Technical Definition of Done (Microservice Context)
For a module to cross the finish line, it must:
1. Work locally in isolated `modules/<name>/api/` Go module.
2. Ensure its failure does not crash the API Gateway.
3. Render completely isolated in `modules/<name>/web/`.
4. Gracefully show an Error Boundary if the backend is down without freezing the portal.
