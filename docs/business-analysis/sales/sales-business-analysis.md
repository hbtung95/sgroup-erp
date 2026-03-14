# Phân Tích Nghiệp Vụ & Thiết Kế Hệ Thống Nhân Viên Kinh Doanh (NVKD)

Tài liệu này phân tích chi tiết các nghiệp vụ của một Nhân viên Kinh doanh (NVKD) trong toàn bộ hệ sinh thái **SGROUP ERP** (bao gồm sự tương tác với các phân hệ khác như `marketing`, `shomes`, `project`, `finance`, `legal`, `hr`, `workspace`). Dựa trên phân tích đó, tài liệu đề xuất thiết kế Hệ thống dành riêng cho NVKD nhằm tối ưu hóa hiệu suất làm việc và trải nghiệm người dùng.

---

## 1. Hành Trình & Nghiệp Vụ Cốt Lõi Của NVKD

Hành trình của một NVKD bất động sản (BĐS) thường xoay quanh Vòng đời Khách hàng (Customer Journey) và Vòng đời Giao dịch (Deal Lifecycle).

### 1.1 Khách hàng, Hoạt động & Đồng bộ Dữ liệu (Data Syncing)
Mọi hoạt động tương tác sâu với khách hàng (Telesale, Zalo, Email) diễn ra trên CRM bên ngoài (Bizfly). Việc đưa dữ liệu hiệu suất về SGROUP ERP được thực hiện qua **2 phương án song song**:

**Phương án 1: NVKD tự nhập báo cáo thủ công (Cốt lõi của Phase 1)**
Nhân viên kinh doanh có màn hình chuyên biệt để chủ động báo cáo số liệu hoạt động mỗi ngày/tuần:
*   **Chỉ tiêu hoạt động thiết yếu:** Số lượng bài đăng (Social/Ads), Số cuộc gọi, Số khách hàng quan tâm (Lead), Số lượng hẹn gặp.
*   **Thông tin Booking (Giữ chỗ):** Tên dự án, Số lượng giữ chỗ, Tên khách hàng giữ chỗ, Số điện thoại.
*   **Thông tin Giao dịch (Giao dịch chốt):** Tên dự án, Mã căn (Mỗi lần nhập tương ứng với 1 mã căn), Tên khách hàng, Số điện thoại, Giá trị giao dịch (Làm cơ sở tính thưởng/hoa hồng). *Lưu ý: "Số lượng giao dịch" là chỉ số được hệ thống tự động tổng hợp đếm số lượng mã căn lên Dashboard, Sales không cần tự nhập tổng số giao dịch.*

**Phương án 2: Tự động qua API/Webhooks từ Bizfly (Giai đoạn mở rộng)**
Hệ thống kết nối API với Bizfly để tự động đồng bộ (Auto-sync) số liệu hoạt động, giảm thiểu thao tác nhập liệu thủ công và đảm bảo tính minh bạch đối chiếu của Ban lãnh đạo. ERP kéo các khối dữ liệu:
*   Số lượng Khách hàng mới/Lead Volume.
*   Tỷ lệ chuyển đổi Phễu.
*   Hoạt động tạo ra (Cuộc gọi, Task hoàn thành).

### 1.2 Báo Cáo Hiệu Suất & KPI (Performance Tracking)
*   **So sánh Mục tiêu vs Thực tế (Target vs Actual):** NVKD xem báo cáo mục tiêu cá nhân đã đặt ra trong tháng (Doanh số, số lượng giao dịch, số khách nét) so với dữ liệu thực tế kéo từ Bizfly và các giao dịch đã chốt trên ERP.
*   **Báo cáo tỷ lệ chuyển đổi (Funnel Metrics):** Phân tích tỷ lệ chốt Deal từ tổng số lượng Lead nhận được để NVKD tự đánh giá chất lượng chăm sóc. Mở rộng cho cấp Quản lý so sánh hiệu suất giữa các NVKD.

### 1.3 Xem Giỏ Hàng & Tư Vấn Sản Phẩm (Inventory & Project)
*   **Check Availability (Shomes/Project Module):** Tra cứu real-time sơ đồ phân lô, bảng hàng, tầng/căn trống hay đã bán.
*   **Phân tích Tài chính (Finance Module):** Tính toán dòng tiền vay ngân hàng, chiết khấu, tiến độ thanh toán dự kiến để gửi bảng tính cho khách hàng.
*   **Chia sẻ thông tin tài liệu:** Truy cập kho tài liệu dự án (Brochure, Chính sách bán hàng, Pháp lý dự án mới nhất) để trình chiếu hoặc gửi trực tiếp cho khách.

### 1.4 Giao Dịch & Chốt Sale (Booking / Deposit Lifecycle)
*   **Giữ chỗ (Booking):** NVKD thao tác khóa căn/giữ chỗ ngay trên hệ thống. Cần đếm ngược thời gian giữ chỗ (ví dụ: 30 phút).
*   **Chuyển cọc (Deposit):** Khi khách đồng ý mua, NVKD chuyển trạng thái từ Giữ chỗ -> Nhận cọc. Tải ủy nhiệm chi (UNC) lên hệ thống.
*   **Xác nhận Dòng tiền (Finance Module):** Hệ thống tự sinh yêu cầu xác nhận tới Kế toán. Khi Kế toán duyệt (đã nhận tiền), NVKD nhận thông báo "Đã vào cọc thành công".

### 1.5 Ký Hợp Đồng & Chăm Sóc Hậu Mãi (Legal & After-Sales)
*   **Hồ sơ Pháp lý (Legal Module):** NVKD chụp ảnh CMND/CCCD/Hộ khẩu của khách chụp lên app để bộ phận Admin/Pháp lý soạn Hợp đồng (VBTT, HĐMB).
*   **Theo dõi Hợp đồng:** Xem tình trạng hợp đồng (Đang soạn thảo -> Chờ khách ký -> Đã hoàn tất).
*   **Nhắc nợ Thanh toán đợt:** NVKD nhận cảnh báo khi khách đến hạn đóng tiền đợt tiếp theo để gọi điện nhắc nhở.
*   **Bàn giao (Handover):** Phối hợp cùng CSKH/Ban quản lý dự án để hẹn lịch bàn giao nhà cho khách.

### 1.6 Quản Lý Mục Tiêu & Hoa Hồng (Performance & HR/Finance)
*   **KPI & Lương Thưởng (HR Module):** Theo dõi tiến độ hoàn thành KPI tháng/quý (Số cuộc gọi, số lịch hẹn, số giao dịch).
*   **Tính toán Hoa hồng (Finance Module):** Tự động tính toán hoa hồng dự kiến ngay khi phát sinh giao dịch và hiển thị tình trạng giải ngân hoa hồng (Chờ nhận, Đã nhận) theo chính sách dự án.

---

## 2. Thiết Kế Kiến Trúc & UI/UX Module Sales (Hệ Thống Cho NVKD)

Hệ thống cho NVKD cần đặt tính **Di động (Mobile-first cho đi thị trường)** và **Tốc độ (Thao tác nhanh)** lên hàng đầu, thiết kế theo hướng **Cockpit (Khoang lái chi huy)**.

### 2.1. Cấu Trúc Tổng Quan (Navigation Structure)

**Bottom Tab Navigation (Mobile) / Sidebar Navigation (Web/Tablet):**
1.  **Dashboard (Tổng quan):** Bức tranh toàn cảnh về hiệu suất cá nhân và To-do list hôm nay.
2.  **Khách hàng (CRM):** Nơi quản lý danh bạ, Phễu khách hàng (Kanban UI).
3.  **Giỏ Hàng (Shomes/Projects):** Xem dự án, lock căn, đặt cọc.
4.  **Giao Dịch (Deals):** Quản lý các booking/hợp đồng đang chạy, check tiến độ pháp lý/kế toán.
5.  **Cá nhân (Profile/Wallet):** Xem lương, hoa hồng, đào tạo, lịch làm việc.

### 2.2. Chi Tiết Các Màn Hình Chức Năng (Screen Definitions)

#### Màn hình 1: Sales Dashboard (Báo Cáo Hiệu Suất Góc Nhìn 360 Độ)
*   **KPI Cards (Real-time từ ERP + Bizfly):** Doanh số (GMV), Doanh thu (Hoa hồng dự kiến), Giao dịch đã chốt.
*   **Hoạt động CRM (Từ Bizfly):** Số lượng Lead Volume nhận được, Số cuộc gọi thực hiện, Số lịch hẹn (So sánh với Mục tiêu Target của Cá nhân).
*   **Funnel Chart (Tỷ lệ chuyển đổi):** Thống kê số lượng theo Phễu Bán Hàng (Lead -> Đã liên hệ -> Hẹn gặp -> Giữ chỗ -> Nhận cọc -> Ký HĐMB), tính toán Conversion Rate ở từng bước.
*   **My Deals (Việc Cần Xử Lý - Focus Area):**
    *   *Ưu tiên #1:* Khách hàng nợ cọc bù, khách đến hạn thanh toán đợt 2, 3...
    *   *Ưu tiên #2:* Giao dịch đang chờ Kế toán duyệt nhận tiền/Chờ Admin soạn Hợp đồng.

#### Màn hình 2: Báo Cáo Phân Tích & KPI (Performance Analytics)
*   **Biểu đồ Mức độ hoàn thành mục tiêu:** (Gauge chart/Bar chart) đo lường Target vs Actual.
*   **Ranking/Leaderboard:** (Chỉ áp dụng nếu có thi đua bán hàng) So sánh hiệu suất giữa các đội nhóm/cá nhân trong sàn dựa trên GMV.

#### Màn hình 3: Giỏ Hàng & Transaction (Inventory & Fast-Action)
*   **Smart Filter:** Lọc căn theo hướng, tầng, giá, diện tích, trạng thái (Xanh = Trống, Đỏ = Đã bán, Vàng = Đang hold).
*   **Giỏ Hàng Tương Tác (Interactive Floorplan):** Nhấn vào sơ đồ mặt bằng/Block để hiện số căn.
*   **Action Flow (Quy trình chốt Deals nóng):**
    *   *Bước 1:* Bấm vào căn trạng thái "Trống" -> Nhấn "Giữ chỗ".
    *   *Bước 2:* Nhập nhanh SĐT khách (Nếu SĐT có trong CRM tự điền tên).
    *   *Bước 3:* Chụp ủy nhiệm chi 50 triệu ngay bằng Camera -> Bấm Gửi.
    *   *Giao diện chuyển màu Cam (Đang chờ Kế toán duyệt) kèm Countdown 60 phút*.

#### Màn hình 4: Quản lý Giao Dịch & Hoa Hồng (Deals & Wallet)
*   **Giao dịch của tôi:** Danh sách HĐMB đã ký. Tình trạng tiến độ đóng tiền.
*   **Hoa hồng (Sales Wallet):** Giao diện ví điện tử.
    *   *Tổng hoa hồng dự kiến:* Số tiền hiển thị mờ.
    *   *Hoa hồng thực nhận:* Số tiền khả dụng (Kế toán đã duyệt). Dòng tiền thực tế.

### 2.3. Tích hợp Xuyên Biến (Cross-Module Integration Mapping)

| Module của NVKD | Tương tác module khác phía Backend | Chi tiết tương tác |
| :--- | :--- | :--- |
| **Sales Performance** | `Bizfly API` | Lấy dữ liệu hoạt động sales (Lead volume, Gọi điện, Task, Phễu) theo thời gian thực hoặc batch (hourly) để trộn dữ liệu lập báo cáo tỷ lệ chuyển đổi. |
| **Báo Giá** | `finance` + `project` | Kéo policies (chiết khấu, lãi vay) từ `project`, dùng engine `finance` để xuất file PDF tiến độ thanh toán. |
| **Booking/Cọc** | `shomes` + `finance` | `shomes` đổi trạng thái căn sang khóa. `finance` tạo Ticket chờ Kế toán duyệt. |
| **Hồ sơ KH** | `legal` | Chuyển luồng từ Sales -> Admin check KYC -> Legal ra Hợp Đồng -> Trả file PDF về lại app Sales cho KH xem. |
| **KPI/Cá nhân** | `hr` + `bdh` | Ghi nhận doanh thu lên Leader/CEO Board. Ghi nhận tính lương tháng vào `hr`. |

---

## 3. Lộ Trình Triển Khai Chức Năng (Execution Roadmap cho dev)

Để hệ thống hoàn thiện trơn tru, chúng ta chia theo 3 Giai đoạn:

*   **Phase 1: Bảng điều khiển Báo Cáo Hiệu Suất & Nhập Liệu Thủ Công**
    *   Xây dựng màn hình/Form (Input Form) cho phép NVKD nhập nhanh: Báo cáo công việc ngày (Số post, call, hẹn gặp), Ghi nhận Booking, Ghi nhận Giao dịch.
    *   Thiết kế lại `SalesDashboard.tsx`: Tập trung trực quan hóa Performance Analytics (Phễu bán hàng, Activity Metrics, So sánh Mục tiêu) từ nguồn dữ liệu nhập thủ công.
*   **Phase 2: Bán hàng số hóa (Tích hợp Auto-Sync Bizfly & Shomes)**
    *   Tích hợp Bizfly qua API: Luồng đồng bộ dữ liệu tự động thay thế nhập thủ công.
    *   Màn hình Giỏ hàng (`InventoryScreen.tsx`) & Luồng tạo Giao dịch (Giữ chỗ/Đặt cọc) kết nối real-time.
*   **Phase 3: Ví Hoa hồng & Pháp lý (Hậu mãi & Động lực)**
    *   Tracking tiến độ Hợp đồng với Legal.
    *   Ví tiền hoa hồng `SalesWallet.tsx` để NVKD có động lực chạy số. Màn hình thi đua Khen thưởng.

## Kết luận
Nhân viên Kinh doanh là trung tâm tạo ra doanh thu. Việc thiết kế hệ thống phải hướng tới **giảm thao tác giấy tờ**, **tự động hóa nhắc nhở** và **hiển thị thu nhập real-time** nhằm tạo động lực tối đa. Hệ thống SGROUP ERP sẽ đóng vai trò như một "Trợ lý ảo" chuyên nghiệp cho từng NVKD.
