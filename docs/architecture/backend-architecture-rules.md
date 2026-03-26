# Kiến Trúc Backend và Bộ Quy Tắc (Backend Architecture & Rules)

Tài liệu này định nghĩa kiến trúc lõi và bộ quy tắc lập trình bắt buộc cho toàn bộ dự án Backend SGROUP ERP (NestJS / Prisma ORM). Hệ thống Backend đóng vai trò là "Trái tim Kế toán & Vận hành", do đó yêu cầu tính toàn vẹn dữ liệu tài chính tuyệt đối, khả năng mở rộng (scale) và không dung túng cho các sai sót logic thiết kế cơ sở dữ liệu.

---

## 1. Công Nghệ Lõi (Tech Stack)

Backend SGROUP ERP vận hành trên hệ sinh thái Node.js hạng nặng Enterprise:
- **Framework:** NestJS v11 (Inversion of Control & Dependency Injection).
- **Database & ORM:** PostgreSQL kết hợp Prisma v6.
- **Authentication:** Passport.js + JWT.
- **Validation Pipeline:** `class-validator` + `class-transformer`.
- **Security:** Helmet, `bcrypt` (Mã hóa mật khẩu một chiều).
- **Core Language:** TypeScript 5.7+ Strict Mode.

---

## 2. Kiến Trúc Lõi: Clean Architecture & Nguyên Lý Mũi Tên Đảo Ngược

Toàn bộ các phân hệ lớn (Project, Sales, Finance) phải tuân thủ nghiêm ngặt mô hình **Clean Architecture 4 Lớp**.

**Nguyên lý tối thượng (Dependency Rule):** 
Mũi tên phụ thuộc mã nguồn (imports) **chỉ được phép trỏ vào tâm (Domain)**. Lớp Domain và Application TUYỆT ĐỐI KHÔNG import bất kỳ thư viện framework nào (`@nestjs/common`, `prisma`, `express`).
`Domain` ⬅️ `Application` ⬅️ `Infrastructure` & `Presentation`.

```
src/modules/project/
├── domain/       # Tâm hệ thống: Entites nghiệp vụ, Interface Repositories. Chứa pure-logic.
├── application/  # Cầu nối: Các Use Cases, Service orchestration thực thi quy trình.
├── infrastructure/# Hạ tầng: Dùng Prisma truy xuất DB, hoặc gọi 3rd-party API.
└── presentation/ # Giao thức: Controllers nhận HTTP Request, định nghĩa DTOs.
```

---

## 3. Design Pattern: Adapter / Kho Chứa (Repository Pattern)

Để ứng phó với việc thay đổi DB hoặc đọc dữ liệu từ nguồn chéo (VD: Google Sheets vs PostgreSQL), hệ thống cấm ngặt việc Controller hay UseCase gọi thẳng `this.prisma`.

* **Abstract Interface:** Khai báo `IProjectRepository` ở lớp `domain/`.
* **Adapter Implementation:** Khai báo class `PrismaProjectRepository implements IProjectRepository` ở lớp `infrastructure/` tiêm (inject) PrismaService.
* **Injection Token:** Service ở lớp `application/` chỉ nhận Dependency thông qua token dạng `@Inject('PROJECT_REPO') private repo: IProjectRepository`. Nó không hề biết Prisma là cái gì.

---

## 4. Giao Thức Đầu Ra API (API Response Convention)

Tất cả các API Restful trả về cho Frontend BẮT BUỘC tuân thủ vỏ bọc (Response Wrapper) đồng nhất, tránh phân mảnh cấu trúc:

```json
// Lệnh GET List (hỗ trợ phân trang)
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "pageSize": 20 }
}

// Lệnh GET Detail / POST
{
  "data": { "id": "uuid-v7...", "name": "..." }
}

// Trả Lỗi (Do Exception Filter tự động bắt)
{
  "error": { "code": 403, "message": "Access denied" }
}
```

---

## 5. Quy Chuẩn Lập Trình Module Theo Component

1. **Controller (`presentation/`):** Chỉ làm nhiệm vụ Đón lõng Request, Gắn Auth Guards (`@UseGuards`), Parse params (`@Param`, `@Body`), và đẩy ngay Data sạch cho Service. Controller là lớp "Mù" logic.
2. **DTO (Data Transfer Object):** Phải là Class TypeScript (không dùng interface), gắn chặt các Decorators xác thực `@IsString()`, `@IsNumber()`, `@Min()`, `@IsOptional()` từ `class-validator` để cản rác từ Client ngay tại cổng.
3. **Exceptions:** Không dùng `throw new Error()`. Bắt buộc throw các lỗi chuẩn HTTP của NestJS: `NotFoundException`, `BadRequestException`, `ForbiddenException`... Hệ thống có Global Filter sẽ lo việc gọt lỗi ném ra Json.

---

## 6. Tiêu Chuẩn Thiết Kế Cơ Sở Dữ Liệu (Chuẩn ADR-002 Enterprise)

Đây là xương sống của SGROUP ERP. Khi thiết kế Table Prisma hoặc thao tác dữ liệu, bắt buộc tuân thủ 8 Lời Thề Kế Toán:

1. **Khóa Chính UUID v7:** 100% Bảng cấm xài ID tự tăng (`Int`). Phải dùng UUIDv7 (`@id @default(uuid(7))`) để mang timestamp ngầm phục vụ Index B-Tree hiệu năng cao.
2. **Không Xóa Cứng (Soft Delete):** Mọi giao dịch Tiền, Dự án, Định danh nhân sự BẮT BUỘC dùng cờ `deletedAt DateTime?`. Không bao giờ lệnh `DELETE FROM` để bảo toàn lịch sử truy vết 10 năm.
3. **Chống Tranh Chấp (Pessimistic/Optimistic Lock):** Kho hàng, Bảng rổ hàng `PropertyProduct` phải cài mốc `lockedUntil DateTime?` và `bookedBy` để triệt tiêu tuyệt đối việc "Bán 1 căn nhà cho 10 khách cùng lúc" (Race condition).
4. **Tiền Tệ Chính Xác Tuyệt Đối:** Mọi con số Tiền, Hoa hồng, Lương LUÔN LUÔN khai báo biến `@db.Decimal(18, 4)`. **Cấm dùng Float** gây sai số chuẩn số học máy tính.
5. **Cascade vs SetNull (Bảo vệ tham chiếu):** 
   - Xóa rác phụ thuộc: `onDelete: Cascade` (VD: Xóa User bay luôn Phiên RefreshToken).
   - Dữ liệu rễ nghiệp vụ: Bắt buộc `onDelete: SetNull` (VD: SalesStaff nghỉ việc xóa tên, nhưng Phiếu Giao dịch FactDeal vẫn giữ nguyên id trống để kế toán bảo lưu tính hoa hồng cho công ty).
6. **Chụp Ảnh Lịch Sử (Denormalization):** Bảng Hóa đơn chốt sổ phải lưu chết thêm file Text tĩnh các biến `staffName`, `projectName`. Tránh việc nhân viên đổi tên tương lai làm Hóa đơn quá khứ bị hỏng chữ ký.
7. **Đôi Mắt "Big Brother" (Audit Log):** Mọi hành vi Sửa/Xóa (POST/PUT/PATCH/DELETE) quan trọng phải bị Middleware gắp ném vô bảng truy vết `audit_logs` (Bao gồm User, Data đổi, IP) chống gian lận hoa hồng 100%.
8. **Log Trạng Thái Nguyên Tử (Atomic Status Logs):** Sản phẩm (Căn hộ, Lead) thay vì cập nhật đè trạng thái `status` vô tri, phải đẻ thêm 1 dòng vào bảng `ProductStatusLog` để tính được Timeline chu kỳ sống (Time-series) giải quyết các vụ tranh chấp nội bộ.

---

## 7. Giao Dịch Nguyên Tử (Database Transactions)

Hệ thống ERP liên quan mật thiết đến tính đúng đắn của một chuỗi dữ liệu (ví dụ: Tạo Hợp đồng + Trừ Tồn kho căn hộ + Ghi Công nợ). Không được phép ghi đứt đoạn:
* **Quy Tắc Atomicity (Bất Khả Phân Nhiệm):** Mọi Use Case thực thi thao tác Ghi/Xóa từ 2 Nhóm dữ liệu (Tables) trở lên **BẮT BUỘC** phải được bọc khối trong phương thức giao dịch Prisma `$transaction`. 
* **Rollback An Toàn:** Nếu bước 1 thành công nhưng bước 2 thất bại do lỗi Logic/Validation, hệ thống Database phải kích hoạt tự động Rollback (rút lệnh) hủy luôn bước 1. Cấm tuyệt đối để lại rác dữ liệu "mồ côi" (orphan data bị lệch) trong DB.

---

## 8. Tác Vụ Nền & Hàng Đợi (Background Jobs & Queues)

Nhiệm vụ tối cao là bảo vệ Vòng Lặp Chính (Main Event Loop) của Node.js Thread khỏi sự nghẽn cổ chai:
* **Không Block Thread Lõi:** Tuyệt đối cấm thực hiện các tác vụ siêu nặng (như Xuất báo cáo PDF 100 trang, Import 100,000 dòng Excel, Gửi Bắn hàng loạt 10,000 Email) trực tiếp chèn ép trong chu trình Request-Response thông thường của API.
* **Sử dụng Message Queue (BullMQ/Redis):** Phải ném các tác vụ tốn quá 1-2 giây xử lý vào Hàng đợi (Queue) để chạy ngầm (Background Worker Process độc lập). Controller API ngay lập tức chỉ trích xuất và trả về `202 Accepted` kèm theo một phiên hiệu `jobId`, để Frontend tự chạy vòng lặp Polling check trạng thái sau (hoặc báo qua WebSockets).

---

## 9. Chiến Lược Caching & Tối Ưu Luồng Đọc (Redis / In-memory)

Để bảo vệ Database Postgres không bị CPU quá tải (Throttled) khi 500 nhân sự sales cùng F5 xem Bảng Mở Bán:
* **Tầng Phục Hồi Lớp 2 (Cache Layer):** Các dạng dữ liệu Metadata tham chiếu siêu ít biến động (Ví dụ: Danh sách Tỉnh Thành, Category Phân loại, Bảng mã Ngân hàng) hoặc Báo Cáo Tính Tổng Quan Nặng phải được hứng bởi `CacheInterceptor` của NestJS (cấu hình trỏ ra Redis hoặc In-Memory RAM). 
* **Invalidation Khắt Khe:** Mọi hành vi làm thay đổi cấu trúc Data (POST/PUT/DELETE) trên mảng gốc, ở đầu kia của Service bắt buộc phải kích hoạt xóa (Invalidate) chính xác cái Cache Key tương ứng đó. Không được để Sếp xem báo cáo Doanh Thu bị sai lệch tàn dư quá 5 phút.

---

## 10. Giám Sát Mã Ngầm & Nhận Diện Truy Vết (Logging & Tracing)

Vứt bỏ lệnh `console.log()` nguyên thủy cồng kềnh - Tác nhân gây ngập Rác RAM máy chủ và không tra ra manh mối:
* **Structured Logging (Ghi log có Cấu trúc):** Bắt buộc sử dụng Logger chuẩn Enterprise (như `Pino` hoặc `Winston`) với module tự động xuất định dạng JSON cực nhẹ.
* **Request ID (Traceability):** Mọi HTTP Request chui vào cửa ngõ hệ thống phải được Middleware gán ép 1 bộ mã chuyên biệt `X-Request-Id`. Ký hiệu này sẽ đeo bám vào mọi Hàm Service nội, bay vào mọi ngách Câu Query DB. Cấp thiết lúc có Bug Exception ném ra ở Lớp Lõi thứ 4, DevOps lập tức lọc File Log, truy ngược 100% Request Id dó đến từ ông NV Sales nào và quăng Body Data gì.

---

## 11. Bảo Mật Kép & Giới Hạn Tần Suất (Security & Throttling)

* **Giới hạn Rate Limiting:** Các rễ Endpoint public công cộng (như `POST /auth/login`, `POST /auth/forgot-password`) BẮT BUỘC dùng thẻ khiên `@UseGuards(ThrottlerGuard)` để khóa cường lực (Ví dụ khóa chết: max 5 requests / 1 phút / 1 cái IP mạng). Trấn áp tuyệt đối Hacker cắm thuật toán Brute-force rà dò mật khẩu Ban GĐ.
* **Tẩy Độc Tham Số Tiêm (Sanitization):** Không chỉ xác thực định dạng Typo DTO, mà tại mốc Tầng Pipeline, buộc phải Bật cứng biến `whitelist: true` và `transform: true` trong Global ValidationPipe. NestJS sẽ tự động gọt ném (strip away), gạt sạch đi mọi key "Rác" hacker cố lén tiêm (SQL Inject) nhét thêm vào Payload JSON (nhằm dụ thao túng các cột cấm).

---

## 12. Cương Lĩnh Kiểm Thử Cốt Server (Testing Framework)

Backend là thành trì bảo vệ túi tiền cuối cùng. Code Logic Nòng Cốt không viết Test Tự Động được coi là Đoạn Code Chờ Chết:
* **Unit Testing Lõi Application/Domain (Hạng S+):** Mọi logic tính toán sâu xa (Chốt số hoa hồng, hàm nhả check quyền sở hữu, logic bù/trừ kho nhà) phải đẻ ra file Unit Test (`.spec.ts` mồi Jest). Nguyên lý ở đây là dùng Mocking xịt (Giả lập) cái Lớp Repository DB Interface kia đi, biến hàm chạy thuần siêu tốc trong bộ nhớ mà chả màng đến cắm cổng kết nối DB vật lý thật. Dùng để Cản trở bug ngáo tính chia tỷ lệ hoa hồng %.
* **E2E Testing Lớp API Bọc:** Mỗi Module Feature Cỡ Khủng (VD Sales/Legal/Finance) cần 1 Vài bản mô phỏng E2E Test (Supertest) bắn viên đạn giả trực tiếp xuyên qua Controller Route HTTP để test xem rào chắn chốt chặn DTO Validator của NestJS có bị hở sườn và cơ chế Auth Guard Token có trôi tuột không.

---

## 13. Tối Ưu Mạng Lưới Truy Vấn (Prisma N+1 Query & Indexing)

Máy ORM (Prisma) rất mạnh nhưng là lỗ hổng phình luồng Memory nếu Code tay ngang:
* **Trảm Vấn Đề N+1 Query:** Nghiêm cấm hành vi dùng vòng lặp `for` hay `.map()` để cấu tạo lệnh `.findUnique()` liên tục đục cục bộ vào Database. Tất cả lệnh kéo dữ liệu liên kết phải gộp thành cục (Batching) dùng từ khóa `include` (Join) hoặc kéo bảng 2 lồng bằng mệnh đề danh sách `in: arrayId` trong *một câu lệnh Database* duy nhất.
* **Đánh Chỉ Mục (B-Tree/GIN Indexing):** Mọi nhánh tìm kiếm Text thường xuyên quét qua (như `email`, `phone`, `taxCode`, `ID người nhận`) BẮT BUỘC phải cắm cờ mốc `@unique` hoặc bộ cài `@@index()` trong `schema.prisma`. Cấm ép CSDL Postgres phải cày cuốc thô sơ (Full table scan) lật tìm hàng triệu bản ghi chỉ để tra 1 cái tên Hợp đồng.

---

## 14. Chiến Lược Lưu Trữ Khối Trọng Lượng (File Uploads & S3)

Máy chủ Backend API (Node.js) sinh ra để giải Ráp Logic và Request siêu nhẹ, nó không phải là cái Kho Nhựa chứa rác:
* **Ngăn Cấm Tuyệt Kỹ Local File:** Không bao giờ được phép code hàm upload file (Ảnh chân dung/PDF hợp đồng) tống thẳng vào thư mục Disk cứng của bản thân máy API ảo (kiểu như `public/uploads/`).
* **Chuyển Giao Trực Tiếp (Presigned URLs):** Toàn bộ Quá trình bơm luồng rác nặng (File Upload) buộc phải nổ thẳng từ Nhánh Frontend (Browser/Native App) lên kho chứa thứ 3 (AWS S3 / Cloudflare R2). Cái Backend API của Developer chỉ làm đúng 1 nhiệm vụ: Cấp 1 cái Thẻ Vào Cổng (Presigned URL tạm) và lưu String Link đường dẫn CDN vào trong Database. Chống ứ đọng, đứt nghẹt Băng thông (Bandwidth) sợi cáp API.

---

## 15. Giao Tiếp Thời Gian Thực (WebSockets & Xung Lực Pub/Sub)

Với hệ thống ERP Chóp bu, khi Admin thay đổi Trạng thái Duyệt Dự Án ở Web, 500 nếp màn hình máy Sales dưới App Mobile phải tự động rung Cập nhật số liệu mà đố cần nhân sự bấm F5:
* **Event-Driven Pattern:** Bắt buộc áp dụng `Socket.IO` / WebSockets Gateway của NestJS vào tầng Event. Kết hợp đệm dồn Adapter Redis Pub/Sub nếu máy chủ bị tẽ ra thành chế độ Đa Nhân (Cluster). Bắn 1 tia xuống Redis, 10 ổ kiến Socket cùng sáng.
* **Luật Phân Cấp Khán Phòng (Rooms):** Cấm ném tia Broadcast bừa bãi hú hét toàn Trục Server. Mọi socket connection phải bị cách ly và tống vào Subscribe các Room chuyên quyền nhỏ tách biệt (Theo mã `userId`, mã `companyId`, mã `projectId`) để tiết kiệm nhịp đập tài nguyên Network.

---

## 16. Môi Trường Triển Khai Không Chớp Mắt (Zero-Downtime Migration)

Database Data Cốt lõi Kế toán là cỗ xe Đang chạy cao tốc 120km/h, cấm "Bảo Khách dừng cỗ xe 15 phút để đổi bánh lốp":
* **Quy Tắc Lược Đồ (Schema Safe-changes):** Mọi thao tác Đổi Tên Cột Mảng Database từ Prisma (kiểu như `customerName` sang `fullName`) phải chịu khó gõ tay đi 3 Bước Tuần Tự: 
   - Bước 1: Tạo thân cột mới. 
   - Bước 2: Viết ngầm code chuyển dời Data cũ sang. 
   - Bước 3: Đợi sang đợt Triển khai code cuối tuần sau hẵng nhổ cái Cột gốc rễ cũ đi. CẤM đổi bẹp một nhát bằng Prisma Migration gãy ngang làm Down-time Ứng dụng.
* **Gieo Mầm Chữ Số (Seeding):** Mọi Hằng số hệ thống vĩnh viễn (kiểu Quyền Base Admin, Loại Tiền Tệ Tỷ Giá, Nhóm Phân Loại Bất Động Sản mẫu) thì dập chặt nó vào lõi file khởi tạo `seed.ts`. Database mọc ra ở Laptop máy nội bộ Developer bất kỳ là được gieo mầm sống bật API hoạt động ngay lập tức.

---

## 17. Các Quy Tắc "ĐÈN ĐỎ" Backend Kỷ Luật Thép (Red Flags 🛑)

Mọi Pull Request Code Push của Backend Dev mắc kẹt một trong 6 Lỗi Đỏ (Red Flags) sẽ bị Hệ Thống và TechLead đá hạ gục dứt khoát:
1. **🔴 KHÔNG** viết truy vấn thuần Raw SQL (`$queryRaw`) vào chuỗi hàm Logic, trừ lúc tối ưu Reporting siêu phức tạp (và phải giải trình). Bắt buộc tương tác mọi ngóc ngách qua ORM `Prisma Client` để bảo an Type-Safety.
2. **🔴 KHÔNG** bỏ sót vỏ Validation. Bất kỳ rễ nhánh Endpoint POST/PUT/PATCH nào thiếu Cục DTO nhúng Decorator `class-validator` là sự sỉ nhục hệ thống phòng thủ, mở cửa mời rác dơ (Garbage data) vào Database.
3. **🔴 KHÔNG** gõ ngáo (hardcode) mã Secret Keys, URL hay Mật khẩu siêu đặc quyền thô ráp vào File Controller/Service. Phải kéo từ Config Service / File môi trường `.env`. Git cấm Push file `.env`.
4. **🔴 KHÔNG** bỏ vứt rơi quăng thẻ cấm `@UseGuards(JwtAuthGuard)` trên các khe Endpoint móc lệnh Dữ liệu nhạy cảm. Quên móc khóa là dọn đường xịn cho tin tặc càn quét hệ thống.
5. **🔴 KHÔNG** phá đứt kết nối Luật Dependency Inward (Vào Tâm Điểm). Cấm thò tay import bất kể File gì từ Lớp Hạ tầng cơ giới (Prisma/Axios) chĩa ngược thẳng cắm vào trong buồng tim Lớp Domain Entity. Mọi cái phải nạp bằng Thẻ Dependency thông qua Interface định hướng.
6. **🔴 KHÔNG** bỏ qua ngó lơ khối thao tác `$transaction` đa bảng (Prisma) đối với ngách tạo dựng Data có độ lệ thuộc chéo, để ngỏ lỗ hổng rò rỉ rác DB khi bị lỗi ngắt quãng nửa chừng.

---

## 18. Triết Lý Niềm Tin Công Nghệ (Core Philosophy)
"Hacker giỏi và siêu bot có thể len lõi đè gẫy sập Giao diện Frontend, chỉnh sửa gói Local của Browser, nhưng CHÚNG KHÔNG THỂ VÀ CHƯA BAO GIỜ chạm được vào móng tường thành sự Toàn Vẹn Của Dữ Liệu Kế Toán Đầu Cuối". Mã nguồn Backend không sinh ra chỉ để lấy Data cho Web hiện ra dễ nhìn, Gốc rễ nó sinh ra để làm Bức Màn Thép, Bức Tường Lửa (Firewall) bảo vệ Logic Tài Chính sinh tồn Tuyệt Mật Của Doanh Nghiệp. Code Backend như thể sáng sớm mai sẽ xuất hiện một triệu lệnh Request Data Sai bẩn của Tin Tặc dồn đập lên Cổng HTTP Server của bạn cố nhồi sập nó! Cố bảo tồn nó và bạn sẽ là Lõi Kỹ Sư Trường Tồn.
