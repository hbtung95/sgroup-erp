# 🔍 Rà Soát Hoàn Thiện Nghiệp Vụ — Module Kinh Doanh (Sales)

> Ngày kiểm tra: 13/03/2026 | Dựa trên `sales_module_analysis.md`

---

## Tổng Kết Nhanh

| Hạng mục | Số lượng | Hoàn thành |
|---|:---:|:---:|
| Tổng màn hình (file .tsx) | 24 | ✅ 24/24 tồn tại |
| Màn hình đã đăng ký route (SalesShell) | 24 keys | ✅ 24/24 |
| Màn hình dùng **Real API** | 12 | 🟡 50% |
| Màn hình dùng **Mock/Hardcoded** | 6 | 🔴 25% |
| Màn hình **thiếu riêng** (dùng chung component) | 2 | 🟡 |
| File tồn tại nhưng **không có route** | 2 | ⚠️ |

---

## Chi Tiết Từng Màn Hình

### ✅ Hoàn Thiện — Kết Nối API Thực

| # | Sidebar Key | Màn hình | Data Source | Đánh giá |
|---|---|---|---|---|
| 1 | `SALES_DASHBOARD` | SalesDashboard | `useSalesData`, `useDeals`, `useGetKpiCards`, `useGetActualFunnel` | ✅ Full API, role-aware |
| 2 | `SALES_CRM` | CustomerLeads | `useCustomers` → `/customers` | ✅ CRUD + 7-stage pipeline |
| 3 | `SALES_DEALS` | DealTracker | `useDeals` → `/sales-ops/deals` | ✅ Kanban + filter |
| 4 | `SALES_APPOINTMENTS` | Appointments | `useAppointments` → `/appointments` | ✅ CRUD + timeline |
| 5 | `SALES_ACTIVITY_LOG` | ActivityLog | `useActivities` → `/activities` | ✅ CRUD + chart |
| 6 | `SALES_KPI` | KpiDashboard | `useGetKpiCards`, `useGetTeamPerformance`, `useGetStaffPerformance` | ✅ Role-aware + leaderboard |
| 7 | `SALES_COMMISSION` | CommissionCalc | `useGetCommissionReport` → `/sales-report/commission` | ✅ Read-only |
| 8 | `SALES_PLAN_ACTUAL` | PlanVsActual | `useGetPlanVsActual` → `/sales-report/plan-vs-actual` | ✅ Role-aware, sales read-only |
| 9 | `SALES_TEAMS` | TeamManagement | `useTeams` → `/sales-ops/teams` | ✅ Role-filtered |
| 10 | `SALES_STAFF` | StaffManagement | `useGetStaff`, `useGetTeams` | ✅ Search + filter + cards |
| 11 | `SALES_PROJECTS` | ProjectCatalog | `useGetProjects` → `/sales-ops/projects` | ✅ Real data + progress |
| 12 | `SALES_MY_PROFILE` | EmployeeProfile | `useAuthStore` + `/auth/change-password` | ✅ Profile + change password |

---

### 🟡 Tồn Tại Nhưng Dùng Dữ Liệu Mock/Static

| # | Sidebar Key | Màn hình | Vấn đề | Mức độ |
|---|---|---|---|---|
| 13 | `SALES_TIMEKEEPING` | Timekeeping | **Static + random** — generate ngẫu nhiên từ JS, không gọi API HrAttendance | 🔴 Nghiêm trọng |
| 14 | `SALES_PAYROLL` | Payroll | **100% hardcoded** — lương 12M, hoa hồng 25M, tên "Nguyễn Văn A" — Cần kết nối HR payroll API | 🔴 Nghiêm trọng |
| 15 | `SALES_TRAINING` | Training | **Hardcoded 6 khóa học** — UI hoàn chỉnh nhưng dữ liệu tĩnh | 🟡 Trung bình |
| 16 | `SALES_POLICIES` | Policies | **Hardcoded 5 mục** — Nội dung chính sách đúng nghiệp vụ nhưng tĩnh | 🟡 Thấp (có thể chấp nhận) |
| 17 | `SALES_PROJECT_DOCS` | ProjectDocs | **Hardcoded 10 tài liệu mẫu** — Chưa kết nối hệ thống file/S3 | 🟡 Trung bình |
| 18 | `SALES_CRM_VIEWER` | CrmViewer | **100% mock** — nút "Đồng Bộ" chỉ setTimeout, dữ liệu hardcoded | 🟡 Thấp (tính năng niche) |

---

### 🟡 Chức Năng Thiếu Màn Hình Riêng

| # | Sidebar Key | Hiện tại | Vấn đề |
|---|---|---|---|
| 19 | `SALES_TARGETS` | → `SalesDashboard` | Không có màn hình **Phân bổ Target** riêng — chỉ reuse Dashboard |
| 20 | `SALES_TEAM_REPORT` | → `TeamManagement` | Không có màn hình **Báo cáo Team** riêng — reuse quản lý team |

---

### 🟡 Nghiệp Vụ Có Stubs/Deprecated

| # | Sidebar Key | Màn hình | Vấn đề |
|---|---|---|---|
| 21 | `SALES_BOOKING` | BookingScreen | **Zustand local** — booking lưu store, phê duyệt `console.warn`. Giữ chỗ **mất khi reload** |
| 22 | `SALES_DEPOSIT` | DepositManagement | **Zustand local** — deposit lưu store. UnitMatrix gọi deprecated stubs |
| 23 | `SALES_INVENTORY` | InventoryScreen | `lockUnit()` và `requestDeposit()` từ Zustand → **chỉ console.warn** |
| 24 | `SALES_LOAN_CALC` | LoanCalculator | ✅ Hoạt động tốt (tính toán thuần client, không cần API) |

---

### ⚠️ File Tồn Tại Nhưng Không Có Route

| File | Nội dung | Trạng thái |
|---|---|---|
| `DealRecording.tsx` | Bảng giao dịch chi tiết (SGTable) — dùng `useGetDeals` API | ❌ Không map trong `KEY_TO_COMPONENT` |
| `SalesScreen.tsx` | Có vẻ là layout cũ / legacy | ❌ Không map, có thể xóa |

---

## Ma Trận Hoàn Thiện Theo Section

```
SECTION              SCREENS    API    MOCK   GAPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Dashboard            1       ✅      —      —
👥 CRM                  2       ✅✅    —      —
👥 Team                 3       ✅✅    —      1 (reuse)
💼 Bán hàng             6       ✅✅✅   —     2 (stubs)
💰 Tài chính            3       ✅      🔴🔴   —
📚 Tài nguyên           4       ✅      🟡🟡   —
⚙️ Quản trị             4       ✅✅    🟡     1 (reuse)
```

---

## Danh Sách Ưu Tiên Cần Fix

### 🔥 Ưu tiên 1 — Nghiêm trọng (dữ liệu mất / sai)

| # | Hạng mục | Nỗ lực |
|---|---|---|
| 1 | **Booking → API**: Migrate khỏi Zustand sang backend CRUD | 2-3 ngày |
| 2 | **Deposit → API**: Migrate khỏi Zustand sang backend CRUD | 2-3 ngày |
| 3 | **Inventory lockUnit/requestDeposit → API**: Thay stubs bằng real API calls | 1-2 ngày |
| 4 | **Timekeeping → API**: Kết nối HrAttendance hoặc tạo attendance endpoint | 1-2 ngày |
| 5 | **Payroll → API**: Kết nối với HR payroll data thay vì hardcode | 1-2 ngày |

### 🟡 Ưu tiên 2 — Nâng cấp

| # | Hạng mục | Nỗ lực |
|---|---|---|
| 6 | Tạo màn hình **SALES_TARGETS** riêng (phân bổ target theo team/cá nhân) | 1-2 ngày |
| 7 | Tạo màn hình **SALES_TEAM_REPORT** riêng (báo cáo, so sánh team) | 1-2 ngày |
| 8 | DealRecording — đăng ký route hoặc merge vào DealTracker | 0.5 ngày |
| 9 | Training, ProjectDocs → API khi backend hỗ trợ | 1-2 ngày |
| 10 | CrmViewer → Tích hợp Bizfly CRM thực | Phụ thuộc CRM API |

---

## Kết Luận

> **12/24 màn hình (50%)** đã kết nối API thực tế và hoạt động tốt.
> **6 màn hình** dùng mock/hardcoded data (Timekeeping, Payroll, Training, Policies, ProjectDocs, CrmViewer).
> **3 nghiệp vụ** quan trọng nhất (Booking, Deposit, Inventory) dùng Zustand stubs — **dữ liệu mất khi reload**.
> **2 sidebar items** (Targets, Team Report) tái sử dụng component khác thay vì có màn hình riêng.
> **1 file** (`DealRecording.tsx`) đã code xong nhưng chưa đăng ký route.
