---
name: Project Documentation Knowledge
description: Complete reference to all SGROUP ERP business analysis, architecture, and technical documentation files in the docs/ directory.
---

# Project Documentation Knowledge

This skill provides the AI agent with knowledge about all project documentation files and their contents. Use this skill whenever you need to reference business requirements, architecture decisions, module analysis, or technical guides.

## Documentation Directory

All project documentation is centralized in `d:\SGROUP ERP FULL\docs\`.

## Quick Reference

### Architecture

| File | Path | Content |
|------|------|---------|
| **Project Review** | `docs/architecture/project-review.md` | Đánh giá kiến trúc tổng thể FE (React Native/Expo) + BE (NestJS/Prisma), 4 điểm yếu chính (SQLite, State Fetching, RBAC, Docker), lộ trình nâng cấp 6 bước |
| **UI Flow Matrix** | `docs/architecture/ui-flow-matrix.md` | Cấu trúc layout dùng chung 8 modules (5 tầng: topbar, KPI, flow switcher, summary, work area), 5 business flows chuẩn (overview, operations, approval, reporting, settings) |
| **ADR-001** | `docs/adr/ADR-001-microservices-strategy.md` | Chiến lược microservices 3 phase: Monolith → Extract high-load → Full microservices |

### Sales Module (6 files)

| File | Path | Key Content |
|------|------|-------------|
| **Phân tích nghiệp vụ tổng thể** | `docs/business-analysis/sales/phan-tich-nghiep-vu-kinh-doanh.md` | 403 dòng — Planning engine (P&L, Funnel, Break-even, 3 kịch bản), Data Model (SalePlanLatest/Header/Month/Team/Staff), Ma trận 17 chức năng, KPI tài chính & vận hành, Bizfly CRM integration roadmap |
| **Thiết kế hệ thống NVKD** | `docs/business-analysis/sales/sales-business-analysis.md` | Hành trình NVKD 6 giai đoạn, Navigation Structure 5 tab, 4 Screen Definitions chi tiết, Cross-Module Integration Map, Execution Roadmap 3 phase |
| **Phân tích chi tiết** | `docs/business-analysis/sales/sales-module-analysis.md` | 447 dòng — 24 màn hình, 7 sections, RBAC 6 vai trò (sales/team_lead/sales_manager/sales_director/ceo/sales_admin), Pipeline CRM 7 giai đoạn, Database Schema (Customer/FactDeal/Appointment/SalesStaff/SalesTeam/DimProject/PropertyProduct), API Architecture 8 nhóm, State Management (Zustand + TanStack Query) |
| **Rà soát hoàn thiện** | `docs/business-analysis/sales/sales-audit-report.md` | Ma trận 24 màn hình: 12 Real API ✅, 6 Mock/Hardcoded 🔴, 2 thiếu riêng, 2 file không route — Danh sách 10 fix ưu tiên |
| **Full-stack audit** | `docs/business-analysis/sales/sales-module-audit.md` | Kiến trúc tổng thể (20 screens, 15 hooks, 2 API clients), 4 Critical Issues (10 empty screens, Dual API pattern, Zustand hardcoded, Inconsistent hooks), Upgrade Roadmap 5 phase |
| **Sẵn sàng vận hành** | `docs/business-analysis/sales/sales-operational-readiness.md` | 3 vấn đề nghiêm trọng (apiClient response, missing endpoints, deprecated stubs), 3 trung bình, 6 fix ưu tiên |

### Project Module (2 files)

| File | Path | Key Content |
|------|------|-------------|
| **Phân tích chi tiết** | `docs/business-analysis/project/project-module-analysis.md` | 375 dòng — DimProject + PropertyProduct schema, Property Lifecycle 7 trạng thái, 4 màn hình (Dashboard/List/Inventory/Detail), Cross-module integration (Sales/Legal/Finance/Marketing), 13 GAPs phân loại, RACI Matrix, Đề xuất cải tiến 3 giai đoạn |
| **Phản biện sâu** | `docs/business-analysis/project/project-deep-analysis.md` | 7 nhóm vấn đề: Race Condition (Lock, syncSoldUnits), Data Integrity (Lock hết hạn, Delete cascade), Security (Authorization, Batch validation, Ownership), API Design (Route conflict, Response format, Pagination), Frontend Architecture (Type definitions, CSV export, CSV import), UX (Optimistic update, Skeleton, Responsive), 9 đề xuất ưu tiên |

### Finance Module (1 file)

| File | Path | Key Content |
|------|------|-------------|
| **BRD Tài chính** | `docs/business-analysis/finance/brd-finance.md` | Executive Summary, 3 Business Objectives, Scope (Cashflow, Debt, Reconciliation, Reports), 3 Business Rules, 8 Functional Requirements, System Integration Dependencies (Sales FactDeal, HR Employee, 4 Prisma Models mới) |

### Guides

| File | Path | Key Content |
|------|------|-------------|
| **Clasp Guide** | `docs/guides/clasp-guide.md` | Hướng dẫn clasp pull Google Apps Script qua command line |

## When to Use

- **Khi cần hiểu nghiệp vụ module nào đó** → Đọc file phân tích trong `business-analysis/`
- **Khi cần kiểm tra trạng thái hoàn thiện** → Đọc audit/readiness reports
- **Khi cần quyết định kiến trúc** → Đọc `architecture/` và `adr/`
- **Khi cần biết gaps và ưu tiên** → Đọc các file audit có bảng GAPs
- **Khi implement tính năng mới** → Đọc file phân tích module tương ứng để hiểu data model, API, và business rules
