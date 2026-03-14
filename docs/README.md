# 📚 SGROUP ERP — Tài Liệu Dự Án

> Thư mục tập trung toàn bộ tài liệu phân tích nghiệp vụ, kiến trúc, và hướng dẫn kỹ thuật.

---

## Kiến Trúc (Architecture)

| File | Mô tả |
|------|--------|
| [project-review.md](architecture/project-review.md) | Đánh giá & Đề xuất Nâng cấp Dự án SGROUP ERP — phân tích kiến trúc FE/BE, điểm yếu, lộ trình nâng cấp |
| [ui-flow-matrix.md](architecture/ui-flow-matrix.md) | Ma trận UI Flow — cấu trúc layout dùng chung cho tất cả module |
| [ADR-001-microservices-strategy.md](adr/ADR-001-microservices-strategy.md) | Architecture Decision Record — Chiến lược tách microservices |

---

## Phân Tích Nghiệp Vụ (Business Analysis)

### Module Kinh Doanh (Sales)

| File | Mô tả |
|------|--------|
| [phan-tich-nghiep-vu-kinh-doanh.md](business-analysis/sales/phan-tich-nghiep-vu-kinh-doanh.md) | **Phân tích tổng thể** — Planning, Dashboard, Data Sync, KPI, Data Model, Ma trận chức năng (403 dòng) |
| [sales-business-analysis.md](business-analysis/sales/sales-business-analysis.md) | Thiết kế hệ thống cho NVKD — hành trình nghiệp vụ, UI/UX, tích hợp cross-module, lộ trình triển khai |
| [sales-module-analysis.md](business-analysis/sales/sales-module-analysis.md) | Phân tích chi tiết 24 màn hình — RBAC 6 vai trò, luồng nghiệp vụ, Database Schema, API Architecture |
| [sales-audit-report.md](business-analysis/sales/sales-audit-report.md) | Rà soát hoàn thiện — ma trận 24 màn hình (12 API, 6 mock, 2 reuse, 2 stubs) |
| [sales-module-audit.md](business-analysis/sales/sales-module-audit.md) | Full-stack audit — Critical Issues, kiến trúc API client, Zustand store, Upgrade Roadmap 5 phase |
| [sales-operational-readiness.md](business-analysis/sales/sales-operational-readiness.md) | Báo cáo sẵn sàng vận hành — 3 vấn đề nghiêm trọng, 3 trung bình, danh sách fix ưu tiên |

### Module Dự Án (Project)

| File | Mô tả |
|------|--------|
| [project-module-analysis.md](business-analysis/project/project-module-analysis.md) | Phân tích chi tiết — Data Model, Luồng nghiệp vụ, Cross-module integration, 13 GAPs, Đề xuất cải tiến |
| [project-deep-analysis.md](business-analysis/project/project-deep-analysis.md) | Phân tích & Phản biện sâu — Race Condition, Data Integrity, Security, API Design, UX Issues |

### Module Tài Chính (Finance)

| File | Mô tả |
|------|--------|
| [brd-finance.md](business-analysis/finance/brd-finance.md) | BRD (Business Requirements Document) — Phân hệ Tài chính & Kế toán |

---

## Hướng Dẫn (Guides)

| File | Mô tả |
|------|--------|
| [clasp-guide.md](guides/clasp-guide.md) | Hướng dẫn sử dụng clasp để pull dự án Google Apps Script |

---

## Tham Khảo Khác

| File | Vị trí | Mô tả |
|------|--------|--------|
| [README.md](../README.md) | Root | Giới thiệu dự án, Quick Start, Demo Accounts |
| [sgroup-erp-business-description.html](sgroup-erp-business-description.html) | docs/ | Mô tả nghiệp vụ doanh nghiệp (HTML) |
