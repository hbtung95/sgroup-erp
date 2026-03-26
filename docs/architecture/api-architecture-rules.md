# Kiến Trúc và Tiêu Chuẩn Thiết Kế API (API Architecture & Design Rules)

Tài liệu này định nghĩa bộ quy chuẩn thiết kế, phát triển và duy trì RESTful API cho toàn bộ hệ sinh thái SGROUP ERP. Việc tuân thủ nghiêm ngặt các quy tắc này đảm bảo tính nhất quán, dễ mở rộng, bảo mật cao và tối ưu trải nghiệm cho các Client (Web/Mobile/Thiết bị bên thứ ba).

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

- **RESTful Orientated:** API phải xoay quanh khái niệm Tài nguyên (Resource). URL chỉ chứa danh từ, không chứa động từ chỉ hành động (ngoại trừ các Custom Actions đặc thù).
- **Stateless:** Mỗi Request từ Client phải chứa đầy đủ mọi thông tin cần thiết để Server xử lý. Server không lưu trữ trạng thái phiên (Session state). Sử dụng JWT cho xác thực.
- **Contract First:** Luôn định nghĩa và thống nhất API Contract (thông qua Swagger/OpenAPI) trước khi bắt đầu code logic.
- **Backward Compatibility:** Khi thay đổi API hiện tại, tuyệt đối không được phá vỡ (breaking changes) Client cũ đang hoạt động. Sử dụng Versioning hoặc thêm field mới thay vì sửa/xóa field cũ.

---

## 2. Quy Chuẩn Đặt Tên Điểm Đầu Cuối (Endpoint Naming)

Mọi URL endpoint phải tuân thủ nghiêm ngặt theo mô hình định danh số nhiều và phân tách bằng dấu gạch ngang (kebab-case):

**Tốt (Nên làm):**
- Danh sách tài nguyên: `GET /api/v1/customers`
- Chi tiết tài nguyên: `GET /api/v1/customers/:id`
- Mối quan hệ lồng nhau (tối đa 1 cấp): `GET /api/v1/customers/:id/sales-activities`
- Danh từ ghép (Kebab-case): `POST /api/v1/sales-reports`

**Tránh (Tuyệt đối không):**
- ❌ `GET /api/v1/getCustomers` (Chứa động từ)
- ❌ `POST /api/v1/customer` (Danh từ số ít)
- ❌ `GET /api/v1/sales_activities` (Dùng snake_case)
- ❌ `GET /api/v1/customers/:id/sales-activities/:activityId/details` (Quá sâu, nên dùng trực tiếp `/api/v1/sales-activities/:activityId`)

**Custom Actions (Hành động phi RESTful):**
Đối với các hành động nghiệp vụ phức tạp không map trực tiếp vào CRUD, sử dụng mô hình gốc tài nguyên + động từ:
- `POST /api/v1/projects/:id/approve`
- `POST /api/v1/users/:id/reset-password`

---

## 3. Cấu Trúc Giao Thức (Response Format Envelope)

Để Frontend dễ dàng chuẩn hóa việc parsing data và handle error, mọi API trả về bắt buộc phải được bọc trong một "Envelope" đồng nhất:

### Thành Công (Danh sách phân trang)
```json
{
  "data": [
    { "id": "uuid-v7-...", "name": "Nguyên Lê" }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "requestId": "uuid-v7-request..."
  }
}
```

### Thành Công (Chi tiết 1 bản ghi)
```json
{
  "data": {
    "id": "uuid-v7-...",
    "name": "Nguyên Lê",
    "updatedAt": "2026-03-26T10:00:00Z"
  }
}
```

### Thất bại (Lỗi Business Logic hoặc Validation)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": [
      { "field": "email", "message": "Định dạng email không đúng" }
    ]
  },
  "meta": {
    "timestamp": "2026-03-26T10:00:00Z",
    "requestId": "uuid-v7-request..."
  }
}
```

---

## 4. Các Phương Thức HTTP (HTTP Methods)

Quy định cứng về việc sử dụng HTTP Method:
- **`GET`**: Lấy dữ liệu. KHÔNG được làm thay đổi state của server. Có thể được cache.
- **`POST`**: Tạo mới tài nguyên.
- **`PUT`**: Cập nhật toàn bộ tài nguyên (Full update).
- **`PATCH`**: Cập nhật một phần tài nguyên (Partial update). Rất quan trọng khi tối ưu băng thông di động.
- **`DELETE`**: Xóa tài nguyên. Trong SGROUP ERP, 100% DELETE operations thực chất là Soft-Delete (cập nhật `deletedAt`). Cấm xóa cứng.

---

## 5. Danh Mục Mã Trạng Thái HTTP (Status Codes)

Hệ thống SGROUP ERP sử dụng bộ mã HTTP chuẩn mực để Frontend phân luồng xử lý:

- **200 OK:** Cho GET, PUT, PATCH thành công.
- **201 Created:** Cho POST tạo mới tài nguyên thành công.
- **202 Accepted:** Cho các tác vụ ném vào Background Queue (Ví dụ: Export file Excel 10.000 dòng).
- **204 No Content:** Cho tác vụ DELETE thành công nhưng API quy ước không trả về body.
- **400 Bad Request:** Lỗi Validation, thiếu params, hoặc sai Business Logic từ client.
- **401 Unauthorized:** Token (JWT) hết hạn, sai hoặc không cung cấp.
- **403 Forbidden:** Token hợp lệ nhưng Role/Permissions không đủ để sử dụng endpoint này.
- **404 Not Found:** Tài nguyên không tồn tại. Mặc định NestJS có global pipe ném lỗi này.
- **409 Conflict:** Lỗi tranh chấp tài nguyên (Ví dụ: Trùng email đăng ký, record bị khóa - Optimistic Lock).
- **429 Too Many Requests:** Bị chặn bởi Rate Limiter/Throttler.
- **500 Internal Server Error:** Lỗi Crash không mong muốn từ Lớp Lõi. (Lưu ý: System sẽ hide chi tiết lỗi ở môi trường Production).

---

## 6. Lọc, Sắp Xếp & Phân Trang (Filter, Sort, Pagination)

Bộ Restful API đối với tập dữ liệu lớn bắt buộc phải hỗ trợ truyền tham số qua URL Query.

- **Pagination:** Luôn dùng `page` và `limit` (hoặc `skip`/`take` ngầm định ở Backend).
  - Tốt: `?page=2&limit=50`
- **Sorting:** Sử dụng `sort` hoặc `orderBy`, dấu `-` đại diện cho Descending.
  - Tốt: `?sort=-createdAt,name` (Sắp xếp mới nhất trước, trùng thì xếp tên theo A-Z).
- **Filtering:** Khai báo trực tiếp key-value vào query string.
  - Tốt: `?status=ACTIVE&source=FACEBOOK`
- **Search (Full-text):** 
  - Tốt: `?q=SGroup+Housing`

---

## 7. Rào Chắn & Xác Thực (Validation & Security Gates)

### 7.1. Chốt chặn DTO
Ngay tại ngưỡng cửa Controller (Lớp Presentation), toàn bộ Payload (Body/QueryParams) MẶC ĐỊNH PHẢI ĐI QUA `class-validator` và `class-transformer`.
- Bật `whitelist: true` (Gạt bỏ mọi property rác).
- Bật `transform: true` (Tự động ép kiểu).
- Controller KHÔNG nhận tham số thả rông dạng mảng/map mà phải có DTO Class đại diện.

### 7.2. Bảo Mật Xác Thực & Phân Quyền
- Mọi endpoint (trừ `auth/login`, `auth/register`) BẮT BUỘC gắn cờ `@UseGuards(JwtAuthGuard)`.
- Các hành động thay đổi dữ liệu (POST, PUT, DELETE) phải được phân mảng Role chặt chẽ `@Roles(Role.ADMIN, Role.MANAGER)`. API phải tuân thủ triệt để tính năng xác thực chéo (Không cho nhân viên A sửa hợp đồng nhân viên B).

### 7.3. Rate Limiting (Giới Hạn Tần Suất)
Các public endpoint (VD: Đăng nhập, Quên mật khẩu, Bắn OTP) phải cài cắm module `@nestjs/throttler` để triệt tiêu Brute-force Attack.
- `limit`: 5 requests / 60s cho mỗi IP.

---

## 8. Tài Liệu Hóa Tự Động (Swagger OpenAPI Documentation)

Backend Sinh ra không phải hộp đen. Mọi cấu trúc API phải tự minh bạch thông qua Swagger UI.
- Gắn thẻ `@ApiTags()` cho phân nhóm.
- Viết rõ mục đích với `@ApiOperation({ summary: 'Mô tả ngắn gọn' })`.
- Định nghĩa rõ chuẩn đầu ra qua `@ApiResponse({ type: VDTODescription })`.
- Không sử dụng `any`. Bất kỳ object hay array nào trả về trong Swagger phải được mapping đầy đủ sang một schema Type/Class.

---

## 9. Versioning (Phiên Bản Hóa API)
Khi cần nâng cấp thay đổi lõi (Breaking Changes) không thể tiếp tục tương thích ngược.
- Router Prefix phải tăng cấp quản lý. Mặc định là `/api/v1/...`.
- Lên cấp: Tạo controller và namespace DTO riêng `v2` (`/api/v2/...`). Không sửa trực tiếp file `v1` đảm bảo Mobile App của người dùng chưa update vẫn có phiên truy cập cũ. 

---

_API tốt là API không cần người giải thích, chỉ cần đọc tên Endpoint và Response Envelope là Developer tích hợp có thể nhắm mắt code._
