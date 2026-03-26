# ADR-002: Tiêu Chuẩn Thiết Kế Cơ Sở Dữ Liệu (Database Design Standards)

**Status:** Accepted
**Date:** 2026-03-26
**Context:** SGROUP ERP yêu cầu tính toàn vẹn dữ liệu tài chính tuyệt đối, khả năng mở rộng hàng triệu bản ghi và truy vết gian lận 100%. Quy mô từ 100 users (2026) lên 200-500 users (2027+).

## 1. Quyết Định Kiến Trúc (Architectural Decisions)

Để đảm bảo hiệu suất và an toàn cho SGROUP ERP, toàn bộ lập trình viên và AI Agents khi tương tác/thêm mới Database bằng Prisma phải tuân thủ nghiêm ngặt 8 tiêu chuẩn sau:

### Quy tắc 1: Khóa chính (Primary Key) phải là UUID v7
*   **Mô tả:** Mọi bảng (100%) cấm dùng `Int` tự tăng. Bắt buộc dùng `@id @default(uuid(7))`
*   **Mục đích:** `uuid(7)` mang theo timestamp giúp phân tán (sharding) dễ dàng và tối ưu b-tree index của Postgres khi scale up.

### Quy tắc 2: Không Xóa Cứng Dữ Liệu Lõi (Soft Delete Policy)
*   **Mô tả:** Các bảng liên quan đến Tiền, Định danh (Dự án, Nhân sự, Giao dịch) phải dùng `deletedAt DateTime?`.
*   **Mục đích:** Bảo vệ hệ thống tài chính không bị lỗi tham chiếu khi tra cứu lịch sử từ 5-10 năm trước.

### Quy tắc 3: Khóa Lạc Quan & Tranh Chấp (Pessimistic/Optimistic Locking)
*   **Mô tả:** Các tài nguyên độc quyền (như Booking Rổ hàng `PropertyProduct`) phải có cơ chế Time-based Lock (`lockedUntil DateTime?` và `bookedBy`).
*   **Mục đích:** Chống Race Condition. Loại trừ triệt để tình trạng "Bán 1 căn nhà cho 10 người cùng lúc" (Concurrency issues).

### Quy tắc 4: Độ Chính Xác Tiền Tệ Tối Đa (High-Precision Decimal)
*   **Mô tả:** Mọi trường tài chính (giá nhà, hoa hồng, lương) bắt buộc lưu định dạng `@db.Decimal(18, 4)`. KHÔNG dùng `Float`.
*   **Mục đích:** Tránh sai số thập phân (IEEE 754 float rounding) qua hàng nghìn vòng tính toán.

### Quy tắc 5: Định Tuyến Xóa Dữ Liệu (Cascade vs SetNull)
*   **Mô tả:** 
    *   Chỉ dùng `onDelete: Cascade` cho dữ liệu lệ thuộc nhảm (Ví dụ: Xóa `User` thì xóa phiên `RefreshToken`).
    *   Bắt buộc dùng `onDelete: SetNull` cho dữ liệu tham chiếu nghiệp vụ (Ví dụ: `FactDeal` tham chiếu tới `SalesStaff` - Staff nghỉ việc thì staffId = Null, nhưng FactDeal giữ nguyên để tính hoa hồng cho công ty).

### Quy tắc 6: Chụp Ảnh Lịch Sử Bằng Khử Chuẩn Hóa (Denormalization Snapshot)
*   **Mô tả:** Các bảng Hóa đơn, Giao dịch (`FactDeal`) nên lưu thêm trường Text rác (như `staffName`, `projectName`).
*   **Mục đích:** Khi nhân viên đổi tên hoặc dự án thay đổi tên pháp lý trong tương lai, các hóa đơn kế toán quá khứ vẫn giữ được ảnh chụp tĩnh (snapshot state).

### Quy tắc 7: Giám Sát Sâu Hệ Thống (The "Big Brother" Audit Pattern)
*   **Mô tả:** Mọi mutation API (POST/PUT/PATCH/DELETE) phải được Middleware ghi vào bảng `audit_logs` (Bao gồm User, Route, Response, Body, IP).
*   **Mục đích:** Anti-fraud & Dispute resolution. Trace 100% người phá hoại hoặc thao tác gian lận hoa hồng.

### Quy tắc 8: Log Trạng Thái Nguyên Tử (Atomic Status Logs)
*   **Mô tả:** Các vật phẩm vòng đời dài (Căn hộ, Hợp đồng, Lead) thay vì chỉ Update cột `status`, phải append một dòng vào bộ bảng log (như `ProductStatusLog`).
*   **Mục đích:** Vẽ được Time-series timeline biến động trạng thái để phân xử (VD: Ai book trước ai mở sau).

## 2. Hậu Quả Áp Dụng (Consequences)
*   **Dung lượng tăng:** Database sẽ phình to nhanh do không bao giờ Xóa cứng và phải lưu Audit Log. Cần lên lịch định kỳ archive `audit_logs` sang Cloud Storage sau 6 tháng.
*   **Code Boilerplate:** Middleware và Service layer sẽ mất nhiều dòng code hơn để viết log và bắt lỗi concurrency thay vì chỉ CRUD thông thường. Bộ NestJS Repositories cần bọc Transactions cẩn thận.
*   **Đổi lại:** Đây là tiêu chuẩn Enterprise-class, mang lại sự tin cậy tài chính 100% cho C-Level (Ban Giám Đốc).
