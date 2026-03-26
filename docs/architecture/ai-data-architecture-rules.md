# Kiến Trúc Tích Hợp Trí Tuệ Nhân Tạo & Dữ Liệu Lớn (AI & Data Analytics Architecture)

Tài liệu này là Mảnh Ghép Cuối Cùng (The 7th Pillar) định hình tương lai của SGROUP ERP. Nó biến phần mềm từ một công cụ nhập liệu thụ động thành một **Trợ Lý Thông Minh Tiên Đoán (Predictive Smart ERP)**. Quy định cách áp dụng mô hình AI (LLMs), RAG, và Xử lý Khối Dữ liệu Lớn (Big Data / BI) mà không làm rò rỉ cơ sở dữ liệu cốt lõi ra GPT public.

---

## 1. Mạng Lưới RAG Chuyên Dụng (Retrieval-Augmented Generation)

Cho phép Nhân sự Sales chat trực tiếp với hàng ngàn trang Tài liệu Pháp lý Dự án:
* **Vector Database (Kho Trí Nhớ AI):** Toàn bộ file PDF Hợp đồng, Chính sách Chiết Khấu hoa hồng phải được tự động nhổ chữ (OCR) và nén thành dải Vector nhúng (Embeddings) lưu vào hệ quản trị đặc thù như `pgvector` (trên Postgres) hoặc `Pinecone`.
* **Ranh Giới Bối Cảnh (Context Isolation):** Cự tuyệt tuyệt đối việc ném Data thô của Khách hàng A sang cho câu hỏi tìm kiếm của Sales B. Quá trình tra cứu RAG (Vector Search) phải chèn Metadata Màng Lọc bằng `projectId` và `@Roles` trước khi Query.
* **Quy Chế Local AI / Privacy:** Đối với các dữ liệu Tối Mật Kế Toán, Cấm gửi Request Prompt thẳng ra `OpenAI ChatGPT` công cộng. Bắt buộc dẫn luồng qua API Cấp Doanh Nghiệp (Azure OpenAI) đã kí cam kết Không dùng data train model, hoặc chạy Model Llama-3-8b dựng cục bộ tại Server ảo của Công ty.

---

## 2. Kiến Trúc Kỹ Thuật Đúc Lời Gọi (Prompt Engineering Architecture)

Lập trình viên không viết Prompt bằng "văn xuôi" tùy hứng bừa bãi:
* **Chuẩn Hóa Khuôn (System Prompts):** Toàn bộ bộ não tính cách của Agent (Ví dụ Persona: "Trợ lý Phân tích BĐS SGROUP") phải được lưu trữ dưới dạng File Template Tĩnh (như Handlebars/Liquid). Không nhét Hardcode String vào lõi Service.
* **Format Đóng Khung Giao Tiếp:** AI chỉ được phép nhả dữ liệu về Backend dưới định dạng `JSON Structured Output` tuân theo chuẩn TypeScript DTO. Backend NestJS bắt đầu xác thực Zod/class-validator cú JSON đó trước khi hiển thị cho Browser. CẤM CỬA hiển thị thẳng câu chữ AI nhả ra chưa kinh qua xác thực vì có thể dính "Hallucination" (ảo giác bịa số liệu ảo).

---

## 3. Kiến Trúc Hồ Lọc Dữ Liệu (Data Warehouse & ETL Pipelines)

Khi Data của hệ sinh thái Bất Động Sản phình lên hàng Chục Triệu Record, truy vấn báo cáo trên DB Thực tế (Operational DB) sẽ làm sập Server:
* **Luật Cô Lập Phân Tích (CQRS / BI Isolation):** Database Kế Toán (Postgres) chỉ phục vụ Transaction Ghi/Đọc App. Mọi nhu cầu "Lấy Báo Cáo Thống Kê Tổng Lợi Nhuận 3 Năm Xuất Ra Biểu Đồ" bắt buộc thực hiện trên một Máy Chảo Data Warehouse tách biệt (Ví dụ Google BigQuery / AWS Redshift).
* **Bơm Dữ Liệu Đọc Lệnh (ETL/ELT):** Hệ thống Cron Job / Apache Kafka chạy lúc 12h đêm sẽ tự động Rút (Extract), Biến đổi dạng gọt Rác (Transform), và Nạp (Load) hàng triệu Data từ App vào Bể Chứa Kho. Bảng Data Kho được tái cấu trúc thành Tinh Không (Star Schema) phi chuẩn hóa để BI tự do Query bằng SQL khốc liệt nhất lấy Dashboard Dashboard cực nhanh.

---

## 4. Chỉ Đoán Thông Minh & Điểm Nóng Tương Lai (Predictive Analytics)

Ứng dụng AI/ML mỏng nhẹ nhưng quyền lực cao:
* **Khả Năng Chấm Điểm Nóng (Lead Scoring ML):** Triển khai Module Python vi mô ăn theo API ngầm nhằm gán nhãn điểm Nóng Lạnh (Score từ 0-100) cho Khách Hàng (Dựa trên lịch sử Click màn hình, lịch sử bỏ cọc). Hỗ trợ Nhân viên chú ý giật dây người Mua Tiềm Năng Nhất.
* **Cơ Khí Cảnh Báo Thuật Toán (Anomaly Detection):** Một hàm tính Thuật Toán học Máy (Isolation Forest) chạy Background soi xem Có Giao Dịch Chuyển Hoa Hồng nào vượt quá độ lệch chuẩn So với Cả Hệ Thống không. Đèn báo Vàng Ting Ting gửi ngay Telegram thẳng mâm Giám Đốc.

---

## 5. Các Quy Tắc "ĐÈN ĐỎ" Không Gian AI (Red Flags 🛑)

Nhóm Kỹ Sư AI/Data Engineer khi chạm vào Tài nguyên Cty tuyệt đối cấm Phạm Lỗi Đỏ:
1. **🔴 KHÔNG** tiêm thẳng Dữ liệu Nhạy Cảm Thuần (PII - SĐT, Email, Tên Vợ Chồng Khách VVIP) vào khung Prompts ném sang API OpenAI nước ngoài (Nước đi Cấm Kỵ 100%). Phải bọc ẩn danh (Anonymization) thành User_1, User_2.
2. **🔴 KHÔNG** trao Độc Quyền cho AI ra Lệnh Update Cột Database. Mọi quyết định AI sinh ra (Ví dụ AI Gợi ý Sửa Hợp đồng) phải có sự bấm mặt Click Nút "Approve" (Human-In-The-Loop) của Người Thật chốt chặn cuối cùng.
3. **🔴 KHÔNG** Quên đánh Index Cột Bảng Kho Phân Tích Data Warehouse. Khách bắt tìm Thống kê từ năm 2022 mà Table 5 triệu dòng quét Chậm tới Đứt Nền Tảng Tool Metabase. Trách Nhiệm Tối Cao của Data Analyst.
4. **🔴 KHÔNG** Dính Toxic/Bias (Định Kiến Ác Ý). AI Prompt tuyệt đối không được gõ "Lấy cho tao khách nam miền Trung" mang tính kỳ thị vùng miền/chiến thuật sale đen tối. Bộ Lọc Toxicity Filter phải hoạt động trước khi Prompt bay đi.
