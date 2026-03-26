# Kiến Trúc Bảo Mật và Tuân Thủ (Security & Compliance Architecture)

Tài liệu này là Tấm Khiên Chống Đạn cuối cùng (The Sixth Pillar) bảo vệ sinh mạng pháp lý và dòng tiền của SGROUP ERP. Các quy tắc dưới đây không chỉ cản hacker từ bên ngoài (External Threats) mà còn chống lại các rủi ro gian lận mờ ám từ chính nhân sự nội bộ (Internal Fraud). Đồng thời đảm bảo dự án tuân thủ tuyệt đối Luật Bảo vệ Dữ liệu Cá nhân (PDPA).

---

## 1. Kiến Trúc Phân Quyền Hạt Nhân (RBAC & ABAC)

ERP Bất Động Sản không thể phân quyền theo kiểu `isAdmin: true/false` hời hợt:
* **Role-Based Access Control (RBAC):** Mọi nhân sự đều mọc ra từ 1 cái Khuôn Quyền (Sales, Manager, Director). Tuyệt đối cấm viết code dạng `if (user.role === 'Sales')`. Backend Controller bắt buộc chặn cửa bằng thẻ `@Roles('SALES_MANAGER')` cấp cao.
* **Attribute-Based Access Control (ABAC):** Nhân sự Sales A có quyền xóa dự án không? -> "Chỉ được xóa Dự án do chính Nhân sự A tạo ra trong vòng 24 giờ". Logic kiểm quyền chặn sâu ở lớp Domain: Phải check ID người tạo (Owner), check Giới hạn thời gian (TTL), check Cấp bậc (Level) giữa nhân sự A và B. CẤM BỎ QUA kiểm tra dữ liệu chủ sở hữu.

---

## 2. Mã Hóa Dữ Liệu Lõi (Encryption In-Transit & At-Rest)

Dữ liệu kế toán tỷ đồng lộ ra ngoài là bị đối thủ cướp:
* **In-Transit (Giao thông Mạng):** Mọi nhánh Call API Nội/Ngoại từ Frontend lên Backend BẤT KHẢ KHÁNG phải bọc áo giáp TLS 1.3 (HTTPS mã hóa). Không một dòng Payload Json rò rỉ nào được đi bằng đường HTTP trần trụi.
* **At-Rest (Nằm Ngủ Trong DB):** 
  1. Mật khẩu nhân sự phải bị băm nhỏ nát (Hashing) bằng `bcrypt` qua 10-12 vòng (Salts), tuyệt đối cấm chế độ giải mã ngược để soi pass.
  2. Dữ liệu Thẻ Tín Dụng, CCCD Khách VVIP KHÔNG được nằm lộ chữ cái tiếng Việt trong Cột CSDL. Prisma trước khi lưu (Middleware) bắt buộc mã hóa vòng khóa đối xứng bằng thuật toán `AES-256-GCM` bọc chung với mã khóa Master Key `KMS` tàng hình được bảo vệ ở két sắt Cloud (AWS KMS).

---

## 3. Lưới Nhện Chống Gian Lận (Anti-Fraud Audit Trails)

Chống Cấp Lãnh Đạo hay Admin lén sửa Số Hoa Hồng nửa đêm:
* **Vết Phân Bất Khả Xóa (Immutable Audit Log):** Bất cứ ai thực thi hành động Ghi Sửa Tiền (Mutation `POST/PUT/DELETE`), Hệ thống sẽ spawn lệnh ngầm rải Rắc "Bánh Mì" vào con Table `admin_audit_logs`.
* Cấu trúc Bản Rắc Bánh Mì phải lưu chiết xuất 5 Điểm Tối Cao: Cả Thân Xác Payload cũ kẹp chung Payload mới bị ép (Before & After), User Id thằng Sửa, Endpoint bị Sửa, Kênh thiết bị Sửa và Giờ Phút Sửa. Đóng Băng bảng Logs này (Chỉ Nạp Lệnh Insert), Cấm Lệnh Update/Delete lên bảng Audit bằng Logic cấp DB Mức độ Hardcore Trigger.

---

## 4. Luật Tuân Thủ Dữ Liệu Cá nhân (PDPA / GDPR Privacy)

Bộ tiêu chuẩn dành riêng để tiếp đón Thanh Tra Nhà Nước:
* **Luật Cho Đi / Bắt Quên (Right to Erasure):** 
  - Khách hàng không cấp quyền, Cấm Sales xem số SĐT của họ (Phải Che 4 số cuối dạng `091***5678`). Phải gọi xuyên qua Tổng Đài Masked Voice.
  - Khi Khách yêu cầu xóa hẳn họ ra khỏi Công ty SGROUP, Data cá nhân họ phải bị xóa đè bẹp (Scrubbing). Biến Tên 'Nguyễn Văn A' thành Rác 'Deleted_Guest_123', biến Email thành Rác Mã Hóa. Không ảnh hưởng bảng Số Hóa hóa đơn cũ.
* **Đồng Thuận Tích Gian Cự (Consent Form):** Cấu thành UI/UX lúc Nhập Khách mới bắt buộc gắp bằng được Tickbox Check Cực Cứng: "Khách hàng đồng ý cho lưu hồ sơ BĐS theo nghị định PDPA". Lưu luôn cái Click đó vào Base cản án Dân Sự ngày sau.

---

## 5. Phòng Thống Bạo Lực Không Băn Khoăn (DDoS & Brute Force Protection)

Thủ tiêu ngay mọi Request Tàn Phá nhắm vào cửa ngõ:
* **Đập Nhịp Nhanh Mạng (Rate Limiting Core):** Bọc Kẽm Gai tầng màng bọc NGINX / Cloudflare bên ngoài chống DDOS Lớp 7. Dùng Throttler chặn các luồng đạn tấn công IP rác. 
* **Khoá Rung Máy (Smart Lockout):** User Gõ sai Mật Khẩu liên kết Login 5 lần, Khoá Chết Tài khoản Account ngâm Đá 15 phút. Nếu vẫn cố rà gõ, ngâm tiếp tăng thành 2 tiếng. Chỉ Có Lãnh đạo HR Cấp Max Level mới đủ Mở ra ngay. Bơm Cảnh cáo báo đỏ Nhắn SMS tới SĐT Chính Chủ của Chủ Acc Cảnh Báo Có Hacker Xâm Nhập.

---

## 6. Các Quy Tắc "ĐÈN ĐỎ" Không Khoan Nhượng (Security Red Flags 🛑)

Nhóm Kỹ sư Dev & QC vi phạm những ranh giới Sống Còn này sẽ chịu trách nhiệm kỷ luật rất nặng:
1. **🔴 KHÔNG** Lưu Mật khẩu Master Key, JWT Key Secret kẹt khảm ở Code. Đóng gói bảo mật cất ở rương `AWS Secrets Manager`.
2. **🔴 KHÔNG** Code Cứng rỗng (Bypass) vòng check Phân Quyền Giờ Hệ thống Lõi. Cấm chừa Lỗ Hổng Bể Chứa ID (`Insecure Direct Object Reference`).
3. **🔴 KHÔNG** Log vãi ra màn Console Console bất kỳ dòng Token Giao Dịch Nào (Bất kể Là Log Nào, cấm Bơm String Dữ liệu Bảo Mật của Khách (SĐT, Email)).
4. **🔴 KHÔNG** Phân Luồng Import API có gắn thông số Nhạy cảm của khách vào URL GET Param (VD: `GET /users?phone=091234567$). Nó Sẽ bị lưu Lén vĩnh viễn Vào Lịch Sử Nginx Log Của Rễ Hạ Tầng Máy Chủ (Gõ Chạy Body POST Khỏa Vào Dữ Liệu Ẩn).
5. **🔴 KHÔNG** Viết Hàng Loạt Code có Đòn Truy Vân Câu SQL Không có Rào Param (Dụ Dỗ Injection). Prisma tự giải quyết nhược điểm này nhưng Vẫn Không Bỏ Cảnh Giác Với các Trường Search Thô.
