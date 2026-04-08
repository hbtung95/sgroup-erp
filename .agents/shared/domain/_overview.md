TL;DR: SGROUP ERP — Hệ thống quản trị doanh nghiệp cho Công ty Môi giới Bất Động Sản. 15 modules.

---
# SGROUP ERP — Domain Overview

> Source of truth cho toàn bộ nghiệp vụ ERP. Agents PHẢI đọc domain file trước khi code module tương ứng.

## Platform Mission
Hệ thống quản trị doanh nghiệp toàn diện cho SGROUP — Công ty Môi giới Bất Động Sản.
Core flow: Dự án → Sản phẩm → Booking → Cọc → HĐMB → Bàn giao → Hoa hồng.

## Domain Map
| Module | Domain File | Phase | Status |
|--------|-------------|-------|--------|
| core | `core.md` | Foundation | 🔴 Pending |
| real-estate | `real-estate.md` | Phase 1 | ⭐ Ready |
| crm | `crm.md` | Phase 1 | ⭐ Ready |
| customer | `customer.md` | Phase 1 | 🟡 New |
| transaction | `transaction.md` | Phase 1 | 🟡 New |
| hr | `hr.md` | Phase 2 | ⭐ Ready |
| commission | `commission.md` | Phase 2 | ⭐ Ready |
| accounting | `accounting.md` | Phase 2 | ⭐ Ready |
| legal | `legal.md` | Phase 3 | 🟡 New |
| agency | `agency.md` | Phase 4 | 🟡 New |
| bdh-dashboard | `bdh-dashboard.md` | Phase 5 | 🟡 New |
| marketing | `marketing.md` | Phase 6 | 🟡 New |
| s-homes | `s-homes.md` | Phase 6 | 🟡 New |
| subscription | `subscription.md` | Phase 6 | ⭐ Ready |
| project-master | `project-master.md` | Phase 1 | 🟡 New |

## Persona Map
| Persona | Role | Key Actions |
|---------|------|-------------|
| CEO | Giám đốc | Dashboard tổng hợp, phê duyệt deals lớn, target setting |
| Director | Phó GĐ | Quản lý vùng, phê duyệt hoa hồng, báo cáo zone |
| Branch Manager | GĐ Chi nhánh | KPI chi nhánh, phê duyệt booking, quản lý team |
| Team Lead | Trưởng nhóm | Phân lead, tracking team, hỗ trợ sales |
| Sales Executive | NV Kinh doanh | Booking, khách hàng, deal pipeline, mobile field work |
| Accountant | Kế toán | Phiếu thu/chi, invoice, công nợ, báo cáo tài chính |
| HR Manager | Quản lý nhân sự | Chấm công, lương, tuyển dụng, KPI |
| System Admin | Quản trị hệ thống | User management, system config, integrations |

## Cross-Module Dependencies
```
real-estate ──→ transaction ──→ commission ──→ accounting
     │               │               │
     └──→ customer ──┘               └──→ hr (payroll)
           │
           └──→ crm (BizFly sync)
                 │
agency ──────────┘

bdh-dashboard ←── ALL modules (read-only aggregation)
```
