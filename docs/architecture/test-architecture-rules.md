# Kiến Trúc Kiểm Thử và Bộ Quy Tắc (Test Architecture & Rules)

Tài liệu này xác định chiến lược, tiêu chuẩn và các quy định ép buộc về Kiểm thử (QA & Automated Testing) cho toàn bộ dự án SGROUP ERP (Frontend & Backend). Mục tiêu là đảm bảo chất lượng phần mềm hạng Enterprise, triệt tiêu lỗi logic tài chính nhưng không lãng phí thời gian viết Test vô bổ.

---

## 1. Triết Lý Kiểm Thử (Testing Philosophy)

* **AAA Pattern (Arrange - Act - Assert):** Mọi test case phải viết rõ ràng theo 3 bước: Chuẩn bị dữ liệu mồi -> Thực thi hàm cần test -> Kiểm tra kết quả. Không gộp chung code lộn xộn.
* **Test Behavior, Not Implementation:** Kiểm thử hành vi (Đầu vào / Đầu ra), tuyệt đối KHÔNG viết test bám theo cấu trúc code nội bộ (vì khi refactor code sẽ làm chết Test một cách vô lý).
* **Quy Tắc Một Điểm Nhấn (One Assertion):** Mỗi khối `it()` chỉ nên test đúng một kịch bản kỳ vọng. Đặt tên Test cực kỳ rõ nghĩa (VD: `it('should return empty array when no sales exist')`).

---

## 2. Tháp Kiểm Thử Phân Lớp (Testing Pyramid)

Dự án ERP SGROUP chia nguồn lực test theo tháp định chuẩn:
1. **Khối Đế - Unit Tests (Trọng tâm 70%):** Kiểm thử cấp độ Hàm/Class. Siêu nhanh, chạy dưới 5 giây. Focus 100% vào các logic tính toán tiền/chia hoa hồng (Thư mục `domain/` và `utils/`).
2. **Khối Giữa - Integration / E2E API (20%):** Kiểm thử luồng dữ liệu Backend từ Controller đến Fake Database. Giúp bảo vệ luồng Request HTTP không bị đứt gãy.
3. **Khối Đỉnh - Manual QA / UI Testing (10%):** Mắt người. Tester Manul sẽ bấm và tương tác vuốt chạm trên màn hình App thật để phát hiện các lỗi UX, lệch màu, vỡ chữ. Dev không cần viết Automation E2E Frontend lãng phí thời gian.

---

## 3. Kiến Trúc Kiểm Thử Backend (NestJS / Prisma)

Backend là nơi KHÔNG CÓ ĐƯỜNG LÙI. Mã nguồn lỗi sẽ gây thảm họa tài chính.
* **Hệ Tẩy Rửa Dữ Liệu Gọi (Mocking):** Unit Test của Service bắt buộc phải dùng `jest.mock()` / xịt giả lập (Dummy) toàn bộ `PrismaService`. Không bao giờ để Unit Test chọc thẳng vào Database vật lý (Gây chậm và dơ DB).
* **E2E Testing (Supertest):** Mỗi Module tính năng lớn phải có thư mục `test/` riêng biệt chứa file `.e2e-spec.ts`. Bắn thẳng Request như `request(app.getHttpServer()).post('/sales')` để test qua đủ 5 lớp: Filter -> Guard -> Pipe -> Controller -> Service. Môi trường E2E phải thao tác trên một `Test Database` đã được xóa sạch sau mỗi lượt chạy.

---

## 4. Kiến Trúc Kiểm Thử Frontend (React Native / Universal)

* **Ưu tiên Test Trạng Thái (Hooks / Zustand Store):** Logic khó nhất của Frontend nằm ở State. Bắt buộc dùng `renderHook` để test các custom Hook và Zustand Store. Đảm bảo hàm `addItem`, `removeItem` đổi State chuẩn xác mà không cần dựng hình UI.
* **Quy Nhẹ Component Testing:** Chỉ dùng `@testing-library/react-native` để test "Hành vi người dùng bấm" (Ví dụ: `fireEvent.press`). Cấm viết Screenshot/Snapshot test dò sai lệch Pixel màu, vì UI dời một viền nút sẽ làm sập CI/CD tốn công sửa.

---

## 5. Định Mức Độ Phủ Mã (Coverage Targets)

Hệ thống CI/CD thu thập Code Coverage bằng lệnh `npm run test:cov`. Nếu không đạt Mức Sàn, Pull Request sẽ bị dán nhãn Thất Bại (Fail):

| Khu vực (Area) | Mức Phủ Tối Thiểu (Target) | Ghi Chú Yêu Cầu |
|---|---|---|
| **Utility Functions** (`utils/`) | **≥ 90%** | Các hàm Regex, Tính tổng, Format Date, Chuyển tỷ giá |
| **Business Logic / Services** | **≥ 80%** | Tâm điểm của Ứng dụng Backend API |
| **Controllers / Routes API** | **≥ 70%** | Bắt đủ Validation DTO và Error HTTP Response |
| **UI Components (Frontend)** | **≥ 40-60%** | Chỉ test các Component lõi chia sẻ (Shared / SGDS) |

---

## 6. Môi Trường & CI/CD Pipeline

* Bất cứ lập trình viên nào mở Pull Request vào nhánh `staging` hoặc `main`. GitHub Actions / GitLab CI sẽ đánh thức Bot tự động chạy song song:
  - `npm run lint` (Kiểm tra luật Code)
  - `npm run test` (Kiểm tra Logic)
  - Môi trường Backend CI sẽ build một Docker Container chứa Postgres Test rỗng để chạy Supertest E2E.
* Nếu chữ `X màu đỏ` xuất hiện, Dev bị bắt buộc phải tự Fix tại máy Local trước khi Reviewer nhảy vào đọc Code. QA không nhận build nếu CI đang xanh rớt.

---

## 8. Chiến Lược Kiểm Thử Chịu Tải (Performance & Stress Testing)

Hệ thống ERP BĐS định đoạt sinh mạng công ty qua các Sự kiện "Mở Bán Rổ Hàng", kéo theo hàng nghìn nhân sự tranh cướp truy cập đồng thời. Vượt qua Unit Test Logic là chưa đủ, phải sống sót qua bạo bệnh luồng truy cập:
* **Load Testing Cường Độ Cao (k6 / Artillery):** Bắt buộc định kỳ chạy kịch bản giả lập đạn pháo 1,000 CCU (Concurrent Users) bắn liên tục tàn nhẫn vào Endpoint sinh tử `POST /bookings` hoặc `GET /sales-board` trong 5 phút để đo sức chịu đựng tắc nghẽn của Database và Redis.
* **Ngưỡng Tử Thần (Performance Thresholds):** Ứng dụng chỉ được dán nhãn Pass QA nếu chỉ số Phản hồi P95 (95% request) phải trả về dứt điểm dưới ngưỡng `200ms` và Tỷ lệ tử vong (Error Rate) phải bằng `0%`. Nếu rớt ngưỡng, TechLead phải quay lại đục lại Index Database.

---

## 9. Cương Lĩnh Kiểm Thử Bảo Mật (Security & Vulnerability Tests)

Bảo vệ hàng tỷ đồng dữ liệu giao dịch khỏi bàn tay con người:
* **Dò Quét Hệ Phụ Thuộc (Dependency Scanning):** Pipeline trên CI/CD bắt buộc cắm mắt lệnh `npm audit` / `Snyk`. Nếu Tool phát hiện Lập trình viên lỡ tay import 1 cái Thư viện (Package) NPM cũ bị dính lỗ hổng công khai (Zero-day/XSS/Prototype Pollution), Hệ thống chặn đứng cấm thẻ PR Merge ngay lập tức dù Code chạy cực ngon.
* **Kiểm Định OWASP Top 10:** QA Automation phải sở hữu bộ xịt Test "Nọc Độc" ngầm rà tự động (Bơm mã SQL Injection dạng `' OR 1=1`, chèn Script `alert()` vào mọi trường Input Text) trong kịch bản E2E Test để xem NestJS Backend có bật Shield cản lại gọt sạch không.

---

## 10. Chiến Lược Cô Lập Kho Dữ Liệu Test (Testcontainers & Transactional Reset)

Luật sinh tồn Độc Lập nguyên tử: Tuyệt đối CẤM ĐỂ LẠI Dấu vết Sinh mạng (State Mutation) chéo nhau đè bẹp lên nhau giữa các bài Test liên tiếp:
* **Công Nghệ Testcontainers (Docker):** Áp dụng thư viện C++ khởi Tạp Nhanh một nhánh Database Postgres Container đóng hộp "Dùng Một Lần" mọc lên vỏn vẹn trong 2 giây khi gõ lệnh `npm run test:e2e`. Code Test Cấu xé xong là đập mồi lửa đốt hủy Container DB đó luôn.
* **Xả Giao Dịch Ảo (Transactional Test Cleanup):** Mọi lệnh nhét data mồi (Seed Data) ở hàm `beforeEach()` phải được bọc trong bộ kẹp Prisma Global Transaction. Chạy kiểm Assert kết quả xong xuôi cúp máy hàm `it()`, NestJS tự động bật cò Rollback để kéo xả sạch kho dữ liệu về mo rỗng tuếch. Giúp hàng trăm luồng Tests cày song song mà không dẫm đạp ID ID dội ngược nhau.

---

## 11. Hồi Quy Đôi Mắt Thị Giác (Visual Regression Testing)

Màn hình Điện thoại của React Native nếu lỡ tuột 1 thẻ Thẻ Flex làm Che lấp mẹ cái Nút "Nhân Đôi Hoa Hồng", thì hệ Unit Test bằng máy kia sẽ mù lòa không bao giờ phát hiện ra:
* **Bắt Lỗi Sai Pixel AI (Loki / Percy):** Các khối Component Bọc Tiền trọng điểm của lõi Giao diện SGDS (VD Khối Bảng Giá, Nút Chốt Deal) bợ đỡ lên Storybook. Cuối ngày, Cỗ máy CI sẽ đi rảo Chụp hình (Screenshot) giao diện Mới và đem đặt đè gắt gao lê giao diện Mẫu Gốc (Design Baseline). Lêch quá 1% cấp độ Pixel màu (Kể cả bị lọt sáng bên Dark Mode) là máy rít còi đánh rớt thảm bản Build Frontend.

---

## 12. Các Quy Tắc "ĐÈN ĐỎ" Kiểm Thử Kỷ Luật Thép (Red Flags 🛑)

Nhóm Kỹ sư Trí tuệ (Dev & Phân tích QC) cần tránh né 6 bãi mìn rác Testing sau để giữ sạch Môi Trường:
1. **🔴 KHÔNG** viết Test Case có móc nối ngầm gọi tới CSDL Product/Dev thật của con người. Dữ liệu Test (Mocks/Fixtures) phải bị reset tự dọn sạch sẽ ở hàm cản `beforeEach()` / `afterAll()`. Khai man sẽ băm rác nghẹt DB Lõi.
2. **🔴 KHÔNG** gộp dồn nén 10 cú `expect()` phán xét vào chung một chùm rễ hàm Test `it()`. Khi Test báo gãy (Fails), Dev sẽ mù mờ không đoán ra nó gãy ở chốt nào. Rành mạch tuân thủ Bộ Test Nguyên Tử (Atomic Test Focus).
3. **🔴 KHÔNG** cố tìm cách bypass vặt vãnh viết Test vô thưởng vô phạt (kiểu khai khống: `expect(true).toBe(true)`) chỉ để lách luật qua mặt cỗ máy đo Quét Phủ Coverage đạt chỉ tiêu 80%. TechLead Review phát giác sẽ coi đó là Vi Phạm Phẩm Chất đặc biệt nghiêm trọng.
4. **🔴 KHÔNG** gieo Giống Test "Hên Xui Phập Phù" (Flaky Tests) - Nghĩa là Code chạy 10 vòng rớt 2 vòng báo `Timeout/Await Fail` do Dev xài Delay/Sleep bừa bãi. Test phải mang tính Tôn Giáo Đơn Định (Tuyệt Đối Deterministic).
5. **🔴 KHÔNG** chày cối đẩy Code trần lên nhánh Chính của Dự án khi mình chưa rào trước lệnh ngầm `npm test` ở rễ Máy tính Code cá nhân. Đừng ném Rác lên Nhánh chung bắt máy chủ gánh.
6. **🔴 KHÔNG** bắt bẻ ngược rễ cành ép QA/Tester tự dọn dẹp Fix Code. QA sinh ra chỉ thả Lưới túm Bug thả Report. Công việc gọt Cấy Patch Vá Lỗi và Lấp Mới Dòng Unit Test trám lại ngay vào Cực Sườn Bug Vừa Xảy Ra là Trách Nhiệm Chuyên Quyền Sinh Tử của Lập Trình Viên! Cấm Đùn Đẩy!
