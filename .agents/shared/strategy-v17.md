# SGROUP ERP Strategy V17 — Microservices & Revenue-First Roadmap

**Notice to All Agents:** This document outlines the V17 architectural and business strategy for the SGROUP ERP Platform. ALL modules engineered from this point forward MUST adhere to these constraints.

## 1. Business Context: Real Estate Brokerage ERP
SGROUP is a **real estate brokerage company** (Công ty Môi giới Bất Động Sản). The ERP system must manage:
- **Project & Inventory:** Track real estate projects, units (apartments/land/townhouses), pricing, availability.
- **Sales Pipeline:** Booking → Deposit → Contract (HĐMB) → Handover, with race condition prevention.
- **Commission:** Multi-level commission (Direct Sales 60% / Team Lead 20% / Branch Manager 15% / Company 5%).
- **Agency Network:** F1/F2 distribution partners with tiered commission sharing.
- **Finance:** Invoice, AR/AP, payroll, tax compliance (Vietnamese regulation).
- **HR/Ops:** Staff management, attendance, KPI, performance reviews.

## 2. Architectural Mandate: Fault Isolation
To ensure massive stability, the SGROUP ERP uses **Modular Frontends** paired with **Dockerized Microservices Backend**.

- **Frontend isolation:** UI modules must be rendered through React's `TolerantErrorBoundary` inside `core/web-host`. A crash in the "Commission" UI must NEVER crash the "CRM" UI.
- **Backend isolation (Microservices):** 
  - Sub-domains (e.g. `modules/crm/api/`, `modules/hr/api/`) MUST be built as standalone Go executables intended for isolated Docker containers.
  - A panic or fatal error in a particular service must only take down its own container. Other services must continue operating.
  - Inter-service communication should happen via HTTP/RPC or RabbitMQ event bus, NOT via direct internal Go imports spanning across different service domains.

## 3. Delivery Roadmap: The "Revenue-First" Strategy
Prioritization focuses on **sales revenue generation first**, then operations, then intelligence.

- 🎯 **Phase 1: "Sales Engine" (Revenue Pipeline)**
  - Modules: `real-estate`, `crm`, `customer`, `transaction`.
  - Goal: Digitize the end-to-end sales pipeline, CRM integration with BizFly.
  - Status: *Domain specs ready, scaffolding in progress*.

- 🎯 **Phase 2: "Operations Core" (HR + Finance)**
  - Modules: `hr`, `commission`, `accounting`.
  - Goal: Payroll, attendance, commission calculation, invoice management.

- 🎯 **Phase 3: "Legal & Compliance"**
  - Modules: `legal`, `accounting` (advanced).
  - Goal: Contract lifecycle, tax compliance, audit trail.

- 🎯 **Phase 4: "Agency Network"**
  - Modules: `agency`.
  - Goal: F1/F2 partner management, territory assignment, multi-tier commission.

- 🎯 **Phase 5: "Intelligence" (BDH Dashboard)**
  - Modules: `bdh-dashboard`, `reports`, `settings`.
  - Goal: Revenue KPIs, target tracking, executive decision tools.

- 🎯 **Phase 6: "Ecosystem"**
  - Modules: `marketing`, `s-homes`, `subscription`.
  - Goal: Marketing campaigns, rental property management, SaaS for partners.

## Agent Directives
1. **Javis (Orchestrator):** Ensure all plans align strictly with the V17 roadmap order. Do not build Phase 5 features before Phase 2.
2. **Brian (Backend API):** Ensure that you craft APIs inside `modules/[domain]/api/` as standalone Go modules. Use `Decimal(18,4)` for all monetary values, `$transaction` for all multi-table writes.
3. **Fiona (Frontend UI):** Ensure all new feature slices inside `modules/[domain]/web/src/` are wrapped in error boundaries. Use Neo-Corporate Light theme by default.
4. **Sentry (Security/Auth):** Ensure RBAC scales gracefully from CEO → Director → Branch Manager → Team Lead → Sales levels.
5. **Nova (UI/Design):** Build Neo-Corporate Premium theme — Light mode DEFAULT, dark mode optional. No gaming/cyber aesthetics.
6. **Atlas & Quinn (Build/QA):** Verify container isolation compatibility by testing isolated packages.

*Strategy drafted on: 2026-04-08*
