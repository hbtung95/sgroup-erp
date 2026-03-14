# BRD — Project Module (Module Dự Án)

## 1. Executive Summary

Module **Dự Án** được định vị là **Master Data Hub** kiểm soát nguồn cung sản phẩm (bảng hàng) của toàn bộ hệ thống SGROUP ERP. Nó tích hợp chặt chẽ với Sales (để chốt deal), Legal (xuất hợp đồng) và Finance (thu thập dòng tiền). Việc nâng cấp module này nhằm mục đích loại bỏ các rủi ro hệ thống (race conditions), gia cố tính bảo mật (Access Control), tăng cường khả năng tích hợp linh hoạt (Batch actions) và duy trì tính toàn vẹn của vòng đời sản phẩm một cách tự động.

## 2. Business Objectives

| Objective                                | Metric                           | Target             | Hạn Hoàn Thành |
| ---------------------------------------- | -------------------------------- | ------------------ | -------------- |
| 1. Chống thất thoát dữ liệu và trùng lặp | Hủy bỏ trạng thái Lock Căn trùng | 100%               | Sprint 1       |
| 2. Tự động hóa quá trình xử lý tồn kho   | Khóa lock tự động mở sau 24h     | 100% cases         | Sprint 1       |
| 3. Tăng tính khả dụng khi thao tác       | Batch Import bảng hàng bằng CSV  | Hỗ trợ CSV Escaped | Sprint 2       |

## 3. Scope

### In Scope

- Thêm bảo mật RBA (Role-Based Access) cho việc xóa hoặc sửa dự án/sản phẩm.
- Sửa lỗi Race Condition ở Backend khi Lock/Unlock.
- Thêm Background Cron Job để Auto-Unlock căn không còn hiệu lực.
- Áp dụng chuẩn Primas Relation từ `PropertyProduct` đến `DimProject` và Finance.
- Triển khai CRUD Form cho Frontend để tạo mới, chỉnh sửa dự án từ Admin.
- Nâng cấp `BatchImportModal` mạnh mẽ hơn với `papaparse`.
- Mapping Data thật từ BookingScreen với API thực.

### Out of Scope (Sẽ thực hiện ở phase tiếp theo)

- Mobile-first redesign và Map Visualization.
- Auto-pricing suggestion AI.
- Dashboard tích hợp biểu đồ line-chart dòng tiền (finance).

## 4. Stakeholders

| Name          | Role               | Interest                                                                  |
| ------------- | ------------------ | ------------------------------------------------------------------------- |
| Admin         | Quản trị dự án     | Quản lý master data, import hàng trăm căn mà không bị crash hay sai data. |
| Sales         | Nhân viên bán hàng | Thấy dữ liệu realtime chính xác, lock căn không bị giựt, lỗi.             |
| Sales Manager | Trưởng phòng KD    | Quản lý lock căn bị tồn, hủy lock khi cần.                                |

## 5. Business Rules

| ID     | Rule                    | Constraint / Example                                                                                                                 |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| BR-001 | Nguyên tắc Lock Căn     | Căn đã Lock không cho phép Lock đè. Giới hạn hiệu lực (lockedUntil).                                                                 |
| BR-002 | Auto-Unlock             | Sau khi thời gian hiệu lực `lockedUntil` trôi qua, trạng thái lập tức về `AVAILABLE` để không làm "chết" giỏ hàng.                   |
| BR-003 | Authorization on Delete | Chỉ user mang vai trò Admin hoặc Project Manager mới có quyền xóa (`DELETE`) một Project / Product.                                  |
| BR-004 | Sync Aggregate          | Số dư các đơn vị (`soldUnits`, `totalUnits`) ở `DimProject` phải đồng bộ nghiêm ngặt với số lượng bản ghi thật từ `PropertyProduct`. |
| BR-005 | Unlock Priority         | Nhân sự Sales chỉ được Unlock các product **do chính mình đã lock** (bookedBy MATCH). Admin/Manager miễn trừ rule này.               |

## 6. Functional Requirements

| ID     | Requirement (Use Case)                                                                     | Priority |
| ------ | ------------------------------------------------------------------------------------------ | -------- |
| FR-001 | Hệ thống tự động Un-lock căn sau thời gian quy định bằng Cron Job.                         | MUST     |
| FR-002 | Hệ thống xử lý Atomic Update Transaction để chặn 2 lệnh đánh Lock tại cùng 1 micro-second. | MUST     |
| FR-003 | REST API Endpoint nhận CSV, parse chuẩn format chứa escape commas và lưu trữ Data batch.   | MUST     |
| FR-004 | API Endpoint trả về list Projects với đầy đủ Pagination & Metadata.                        | MUST     |
| FR-005 | Form CRUD UI hiển thị cho Admin tạo, chỉnh sửa DimProject từ Dashboard.                    | MUST     |

## 7. Assumptions & Constraints

### Constraints

- Database PostgreSQL.
- Sử dụng Prisma Client để execute SQL, buộc tuân thủ constraint FK khi có quan hệ. Thao tác cascade delete phải được định nghĩa rõ.

## 8. Data Dictionary (Schema Updates Required)

| Field      | Model           | Type                  | Logic / Validation                                                    |
| ---------- | --------------- | --------------------- | --------------------------------------------------------------------- |
| project    | PropertyProduct | Relation (DimProject) | `@relation(fields: [projectId], references: [id], onDelete: Cascade)` |
| soldUnits  | DimProject      | Int                   | Cần auto-update on Product status change                              |
| totalUnits | DimProject      | Int                   | Cần auto-update on Product Create/Delete                              |
