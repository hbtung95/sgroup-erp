# Kiến Trúc Triển Khai và Hạ Tầng (DevOps & Infrastructure Architecture)

Tài liệu này là mảnh ghép cuối cùng (The Final Pillar) của SGROUP ERP. Nó định nghĩa quy chuẩn Vận hành Đám mây (Cloud), Luồng Tích hợp/Triển khai liên tục (CI/CD), Giám sát (APM) và Chiến lược Cứu hộ Rủi ro (Disaster Recovery). Hệ thống Code dù xịn đến mấy nhưng nằm nhầm trên một Hạ tầng mỏng manh thì cũng vô nghĩa.

---

## 1. Trục Nhánh Mã Nguồn (Git Flow Strategy)

Kho chứa Git không phải là bãi rác. Tuyệt đối không Push trực tiếp lên nhánh Chính:
* **`main` (Production):** Chứa mã nguồn đang chạy thực tế cho hàng nghìn Users. Nơi đây là Bất Khả Xâm Phạm. Chỉ được Merge từ `staging` qua khi đã Release thành công, có Tag phiên bản (VD: `v1.2.0`).
* **`staging` (UAT/QC):** Nhánh gộp chung (Integration) của toàn Team. Mọi code từ nhánh tính năng (`feature/` hoặc `bugfix/`) đẩy lên sẽ bị cản lại bằng Pull Request (PR). Phải thỏa mãn 2 điều kiện mới được Merge: 
  1. Máy CI báo Test Xanh (Passed).
  2. TechLead Review chốt `Approve`.
* **Luật Commits:** Tuân thủ Conventional Commits chuẩn quốc tế: `feat: add booking button`, `fix: crash on login`, `chore: update packages`. Không viết commit lan man kiểu "Sửa tí code", "Done".

---

## 2. Đường Ống Lắp Ráp Tự Động (CI/CD Pipeline)

Không mướn lập trình viên ngồi gõ lệnh `npm run build` bằng cơm rồi kéo ném file lên Server. Mọi thứ phải Tự động Hóa 100%:
* **CI (Tích hợp Liên tục):** Khi Push Code lên PR, GitHub Actions / GitLab Runner sẽ tự động dựng máy ảo, chạy `Lint`, `Unit Test`, `E2E Test`, Đo `Coverage`. Thất bại 1 khâu là khóa Nút Merge chặn đứng cổng vào.
* **CD (Triển khai Liên tục):**
  - **Backend:** Khi code merge vào `staging`, CD tự Build Docker Image ném lên Registry, và bắn lệnh Restart Server cập nhật gián đoạn bằng 0 giây (Rolling Update).
  - **Frontend (Mobile App):** Bắt buộc chạy qua EAS Build (Expo Application Services). Server EAS bên Mỹ sẽ tự đóng gói tệp `.apk`/`.ipa` và bắn bản cập nhật OTA (Over-The-Air) phủ sóng Update âm thầm xuống thẳng điện thoại 1,000 nhân viên Sales chỉ trong 5 phút mà không cần chờ App Store/Google Play xét duyệt 3 ngày.

---

## 3. Kiến Trúc Bộ Giáp Đóng Gói (Containerization)

Máy tính Developer chạy được thì Server Đám Mây cũng chạy được 100%:
* **Docker Multi-Stage:** Backend NestJS BẮT BUỘC phải build Dockerfile chia theo Stage tĩnh. Stage 1 dùng cài đồ nặng (devDependencies), Stage 2 đem xào Gọt nén bỏ hết mã nguồn gốc, chỉ giữ lại Thư mục `dist/` (JavaScript ròng) cắm vào base Node Alpine siêu nhẹ. Lập tức giảm dung lượng Image Server từ 2GB xuống cạn còn 150MB.
* **Môi trường Cách Ly (Immutable Env):** Cấm vứt file `.env` kèm cùng Docker Image. Bắt buộc bơm thả Tham số Môi trường (Environment Variables) từ Quản trị viên Kubernetes/AWS EC2 đập thẳng vào Docker Container lúc Run để rào bảo mật.

---

## 4. Quỹ Đạo Vận Hành Kép (Cloud Infrastructure)

Hạ tầng phải chia gánh nặng (Load Balancing), cấm chạy dồn 1 Server All-in-one vỡ trận:
* **Tách Biệt Lõi:** 
  1. App Server (Node.js): Nơi xử lý CPU Logic, có thể nhân bản vỡ ra làm 5 máy khi kẹt xe tải trọng tải.
  2. Database Server (Postgres): Phải nằm trên Rãnh Mạng Private siêu kín không có đường Line IP vọt ra khỏi Internet (nhằm chống dòm ngó). Chạy Managed Cloud Database (RDS/Neon) dạn dĩ tự Backup giùm.
  3. Redis Cluster: Gánh luồng Cache và hàng rào Rate Limit đệm dữ dằn. Nằm chung rãnh Private VLAN với App Server chống trễ Ping độ rớt (Zero Latency).

---

## 5. Ra Đa Giám Sát Giác Quan Y Khoa (APM & Observability)

Phát hiện App của công ty giật lag yếu phổi TRƯỚC mặt khách hàng 15 tiếng đồng hồ:
* **Lưới Đánh Bắt Log (Log Aggregation):** Toàn bộ vệt nhơ `Error/Exception` từ Frontend Mobile và Backend NestJS không được trôi dạt bay màu. Bắt nối hết về tổng đài DataDog / Sentry / Grafana Loki.
* **Báo Động Sinh Tồn (Alerting):** Các ngưỡng tử thần: Tỷ lệ Exception nẹt quá `2%`, Dung lượng Rác ổ cứng mấp mé `85%`, Khối DB thắt cổ chai bị CPU nhảy nhọt hơn `90%` -> Tổng đài phải hú Còi Ầm Ĩ gửi Tin báo Đỏ Tự động giật ngược Kênh Slack/Telegram của DevOps & BO/CEO lúc 2h Sáng.

---

## 6. Kế Hoạch Đóng Tàu Thoát Hiểm Tối Hậu (Disaster Recovery & Backup)

Bị thiên tai rớt mảng Datacenter (Cháy Server) hay Hacker xóa sạch sành sanh Database lúc 12h đêm:
* **Quy Chế RPO (Recovery Point Objective):** Dữ liệu công sức mồ hôi không được phép mất trắng quá xa. Database Postgres PHẢI CẤU HÌNH vứt bản Backup lên Kho lưu lạnh AWS S3 Amazon Định Kỳ Đổ khuôn sau mỗi **2 giờ đồng hồ**. Nếu Server nổ, ta kéo lại bản 2 tiếng trước trôi không lậm sâu tổn thất Kế Toán.
* **Thời Khắc Phục Hồi (RTO - Recovery Time Objective):** Nếu kho Server của Google/AWS tại Singapore (ví dụ) ngưng hoạt động, hệ Sinh Thái Backup (IaC - Infrastructure as Code - nôm na là Terraform) sẽ tái rọi phục dựng hệ thống Cứu Trợ nguyên vẹn sang Băng Đảo Nhật Bản (Region khác) **trong dưới 15 phút đồng hồ**, không để công ty đình trệ một tiếng.

---

## 7. Các Quy Tắc "ĐÈN ĐỎ" DevOps Kỷ Luật Thép (Red Flags 🛑)

Mọi DevOps/TechLead cài đặt Hạ Tầng vi phạm khuyết điểm sinh tử sau lập tức bị Phế Quyền:
1. **🔴 KHÔNG** gắn IP Nhận diện Công Khai (Public IP) Cởi Truồng cho Máy Rễ Database. Cửa Database kết nối chỉ được hé cửa (Whitelist) duy nhất cho đúng App Server nội bộ mới thò ống dẫn vào được (VPC Peering).
2. **🔴 KHÔNG** truy cập trực tiếp (SSH) thẳng tay vào Server Production để Fix Code (Sửa Bug Cơm) ngay trên ổ đĩa. Mọi cú chèn vá code ép 100% phải đi theo đường băng CI/CD đặng lồng Dấu Ấn (Audit Trail).
3. **🔴 KHÔNG** phơi Mảng Mật Khẩu Database (DB URI) lên ngách Lộ thiên của Công Cụ Quản Lý Version Code (GitHub/GitLab). Rớt là ăn đòn.
4. **🔴 KHÔNG** lưu File Tải Ảnh Dữ Liệu Tĩnh bám rễ ở Bộ Nhớ Ổ Cứng Server Cục Bộ Node.js. Cháy Server là Lạc Trôi Căn Tịch. Tất cả vứt sang Object Storage S3 (có phiên bản tự phình chống tràn dung lượng). Cấm kỵ triệt để.
5. **🔴 KHÔNG** Bypass bỏ qua Cửa Sinh Trắc Review Code (Pull Request). Không một ai kể cả CTO có đặc tính Tự nhồi Push code cợt đùa đứt thẳng lên Cành `main` đang Live. Phải bật cấu hình "Branch Protection" đè chết không tha.
