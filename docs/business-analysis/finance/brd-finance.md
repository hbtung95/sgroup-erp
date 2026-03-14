# Business Requirements Document (BRD) - Phân hệ Tài chính & Kế toán

## 1. Executive Summary
Phân hệ Tài chính & Kế toán trong SGROUP ERP được thiết kế để quản lý toàn diện dòng tiền, công nợ, và đối soát tài chính của doanh nghiệp bất động sản. Module này kết nối trực tiếp với phân hệ Kinh doanh (Sales) và Nhân sự (HR) để tự động hóa việc ghi nhận doanh thu, tính toán hoa hồng, và quản lý chi phí hoạt động.

## 2. Business Objectives
| Objective | Metric | Target |
|-----------|--------|--------|
| Kiểm soát dòng tiền chặt chẽ | Sai sót sổ quỹ | Giảm xuống 0% |
| Tự động hóa tính hoa hồng/công nợ | Thời gian đối soát | Giảm 70% |
| Cập nhật báo cáo P&L theo thời gian thực | Thời gian lên báo cáo | Tức thì (Real-time) |

## 3. Scope
### In Scope
- **Quản lý Dòng tiền (Cashflow):** Lập và duyệt Phiếu thu, Phiếu chi; Quản lý Sổ quỹ (Tiền mặt & Ngân hàng).
- **Quản lý Công nợ (Debt):**
  - Công nợ Khách hàng (Phải thu từ giao dịch/hợp đồng bán nhà).
  - Công nợ Chủ đầu tư (Phải thu phí môi giới từ CĐT).
  - Công nợ Nhân viên (Phải trả hoa hồng cho Sales).
- **Đối soát (Reconciliation):** Đối soát các khoản thanh toán, duyệt chiết khấu.
- **Báo cáo (Reports):** Báo cáo Dòng tiền, Báo cáo Công nợ, Báo cáo Doanh thu - Chi phí - Lợi nhuận (Mini P&L).

### Out of Scope (Phase 2)
- Tích hợp trực tiếp với phần mềm kế toán chuyên dụng (MISA, FAST) API.
- Tích hợp cổng thanh toán trực tuyến (VNPay, Momo) cho khách hàng tự đóng tiền trên App.

## 4. Business Rules
| ID | Rule | Example |
|----|------|---------|
| BR-FIN-01 | Phiếu chi > 50 triệu cần sự phê duyệt của Trưởng ban Tài chính hoặc CEO. | Phiếu chi 60tr → Trạng thái Pending Approval. |
| BR-FIN-02 | Hoa hồng nhân viên chỉ được đưa vào danh sách trả (Payable) khi CĐT đã thanh toán phí môi giới. | Giao dịch A hoàn thành nhưng CĐT chưa trả tiền → Hoa hồng Sales trạng thái "Chờ CĐT". |
| BR-FIN-03 | Không cho phép xóa chứng từ tài chính đã duyệt, chỉ được lập phiếu điều chỉnh/hủy. | Phiếu thu đã Approved bị sai → Lập phiếu chi hoàn trả. |

## 5. Functional Requirements
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| FR-FIN-01 | Dashboard | Must | Tổng quan Số dư quỹ, Tổng Thu/Chi trong tháng, Top công nợ. |
| FR-FIN-02 | Phiếu Thu | Must | Tạo, Sửa, Duyệt, In phiếu thu. Link với Hợp đồng/Deal. |
| FR-FIN-03 | Phiếu Chi | Must | Tạo, Phân loại khoản chi, Trình duyệt, Phê duyệt, In phiếu chi. |
| FR-FIN-04 | Sổ quỹ | Must | Hiển thị biến động số dư theo tài khoản (Tiền mặt, SCB, VCB,...). |
| FR-FIN-05 | Công nợ KH | Must | Bảng theo dõi phải thu từ khách hàng theo từng Deal/Project. |
| FR-FIN-06 | Công nợ CĐT | Must | Bảng theo dõi tiến độ thanh toán phí môi giới của Chủ đầu tư. |
| FR-FIN-07 | Hoa hồng/Lương | Must | Dashboard tổng hợp công nợ phải trả cho nhân sự (lấy từ HR/Sales). |
| FR-FIN-08 | Báo cáo | Should | Export Excel/PDF cho các báo cáo doanh thu, chi phí, dòng tiền. |

## 6. System Architecture & Integration Dependencies
- **Sales Module:** (FactDeal, CommissionRecord) - Lấy data giao dịch để tạo yêu cầu thu tiền và tính công nợ.
- **HR Module:** (HrEmployee, HrSalaryRecord) - Lấy danh sách nhân sự để làm đối tượng tạm ứng/thanh toán.
- **Database:** Prisma Models mới (`FinanceAccount`, `FinanceTransaction`, `FinanceCategory`, `DebtRecord`).
