# Phân tích & Phản biện sâu — Module Dự Án

## 1. 🔴 Race Condition & Concurrency (Nghiêm trọng)

### 1.1 Lock Race Condition
Khi 2 sales cùng bấm "Lock Căn" trên cùng 1 sản phẩm AVAILABLE:
```
Sales A: findOne(id) → status = AVAILABLE ✓
Sales B: findOne(id) → status = AVAILABLE ✓  (chưa kịp update)
Sales A: update → LOCKED ✓
Sales B: update → LOCKED ✓ ← GHI ĐÈ bookedBy của A!
```
**Fix**: Dùng Prisma transaction + `WHERE status = 'AVAILABLE'` trong `.update()` để đảm bảo atomicity:
```typescript
const result = await this.prisma.propertyProduct.updateMany({
  where: { id, status: 'AVAILABLE' },
  data: { status: 'LOCKED', bookedBy: staffName, lockedUntil },
});
if (result.count === 0) throw new ConflictException('Căn đã bị lock bởi người khác');
```

### 1.2 syncSoldUnits Race
Nếu 2 deal cùng close đồng thời → 2 lần `COUNT(*)` + `UPDATE` chạy song song → cuối cùng soldUnits có thể đúng hoặc sai tùy timing.
**Fix**: Dùng `$executeRaw` với `UPDATE SET soldUnits = (SELECT COUNT...)` atomic SQL.

---

## 2. 🔴 Data Integrity (Nghiêm trọng)

### 2.1 Lock hết hạn không tự mở
`lockedUntil` được set 24h nhưng **không có cron job** nào kiểm tra. Nếu sales lock rồi quên → căn bị lock vĩnh viễn.
**Fix**: Thêm `@Cron('0 */1 * * *')` (mỗi giờ) chạy cleanup:
```typescript
await prisma.propertyProduct.updateMany({
  where: { status: 'LOCKED', lockedUntil: { lt: new Date() } },
  data: { status: 'AVAILABLE', bookedBy: null, lockedUntil: null },
});
```

### 2.2 Delete product không sync totalUnits & soldUnits
Khi xóa sản phẩm qua `DELETE /products/:productId`, `DimProject.totalUnits` và `soldUnits` **không cập nhật**.
**Fix**: Gọi `syncSoldUnits()` + update totalUnits trong hàm `remove()`:
```typescript
async remove(id: string) {
  const product = await this.findOne(id);
  await this.prisma.propertyProduct.delete({ where: { id } });
  await this.syncSoldUnits(product.projectId);
  await this.syncTotalUnits(product.projectId); // ← cần thêm helper
}
```

### 2.3 Delete project không cascade products
Controller `DELETE /projects/:id` gọi `projectService.remove(id)` nhưng không kiểm tra Prisma `onDelete` behavior. Nếu Prisma schema không có `onDelete: Cascade` trên `PropertyProduct.project`, sẽ throw FK error.

---

## 3. 🟡 Security Issues

### 3.1 Delete project/product không có authorization
Endpoint `DELETE /projects/:id` và `DELETE /products/:productId` chỉ cần `JwtAuthGuard`. Bất kỳ user nào đăng nhập đều **xóa được dự án**.
**Fix**: Thêm `@UseGuards(RolesGuard) @Roles('admin', 'sales_admin')`.

### 3.2 Batch import thiếu validation
`POST /:projectId/products/batch` nhận raw array → `createMany()` mà **KHÔNG validate** từng item. Malicious payload:
```json
[{ "code": "'; DROP TABLE--", "projectId": "different-project-id" }]
```
Prisma ORM an toàn với SQL injection, nhưng `projectId` trong body bị ghi đè trong `batchCreate()` → OK. Tuy nhiên **thiếu DTO validation** (class-validator) trên endpoints.

### 3.3 Không kiểm tra ownership khi lock/unlock
User A lock căn → User B có thể unlock. Nghiệp vụ BĐS thường chỉ cho phép **người lock** hoặc **admin** mới được unlock.
**Fix**: So sánh `product.bookedBy === currentUser.name || isAdmin`.

---

## 4. 🟡 API Design Issues

### 4.1 Route order conflict tiềm ẩn
```
GET  products/:productId    ← "lock" có thể match ở đây
PATCH products/:productId/lock
```
NestJS xử lý đúng vì `/lock` suffix, nhưng nếu thêm `GET products/summary` sau này sẽ conflict với `:productId`.
**Fix**: Nest product routes dưới `/projects/:projectId/products/` thống nhất thay vì mix.

### 4.2 API response chưa chuẩn hóa
- `getProjects()` trả về `array` trực tiếp
- `batchCreate()` trả về `{ count: N }`
- `generateInventory()` trả về `{ created, skipped, total }`

Không có wrapper response chuẩn → frontend phải xử lý exception cho mỗi kiểu.
**Fix**: Chuẩn hóa thành `{ success: true, data: ..., meta?: { total, page } }`.

### 4.3 Thiếu pagination cho getProducts
Dự án 500+ căn → `findMany()` trả hết về frontend. Với 1000 căn, response size ~500KB.
**Fix**: Thêm `?page=1&limit=50&status=AVAILABLE` query params.

---

## 5. 🟡 Frontend Architecture

### 5.1 Duplicate type definitions
`types.ts` định nghĩa `DimProject` + `PropertyProduct`, nhưng `projectApi.ts` lại định nghĩa `ProjectData` + `PropertyProductData` — 2 interface gần giống nhau.
**Fix**: Export từ 1 chỗ, dùng consistent naming.

### 5.2 CSV export dùng `document.createElement` — không cross-platform
`handleExportCSV()` gọi `document.createElement('a')` — sẽ crash trên React Native mobile.
**Fix**: Wrap trong `Platform.OS === 'web'` check (đã có nhưng chỉ show toast, vẫn chạy code DOM bên dưới).

### 5.3 Batch import parse CSV quá đơn giản
Split bằng `,` không handle CSV escaped values — nếu tên căn có dấu phẩy sẽ lệch cột.
**Fix**: Dùng thư viện `papaparse` hoặc ít nhất handle quoted fields.

---

## 6. 🟢 UX Improvements

### 6.1 Không có optimistic update cho Lock/Unlock
Bấm "Lock Căn" → chờ API 200-500ms → UI mới cập nhật. Trong thời gian này nút vẫn có thể bấm lại.
**Fix**: `useMutation({ onMutate: optimisticUpdate })` hoặc ít nhất disable button cho cả grid.

### 6.2 Dashboard không có skeleton loading
Khi loading, hiện 1 spinner ở giữa. Chuẩn hơn là skeleton placeholders cho KPI cards.

### 6.3 Inventory grid không responsive
`numColumns={4}` hardcode — trên tablet/nhỏ hơn sẽ bị bể layout. Cần tính `numColumns` theo `windowWidth`.

---

## 7. 🟢 Đề xuất Nâng cấp Tiếp theo

| # | Đề xuất | Impact | Effort |
|---|---|---|---|
| **P1** | Atomic lock với `WHERE status` | Ngăn race condition | 🟢 Thấp |
| **P2** | Cron auto-unlock hết hạn | Giải phóng căn bị stuck | 🟢 Thấp |
| **P3** | Sync totalUnits khi delete | Data integrity | 🟢 Thấp |
| **P4** | RolesGuard trên delete endpoints | Security | 🟢 Thấp |
| **P5** | Kiểm tra ownership unlock | Business logic đúng | 🟡 TB |
| **P6** | Pagination cho products | Performance | 🟡 TB |
| **P7** | Responsive numColumns | UX mobile | 🟡 TB |
| **P8** | Chuẩn hóa API response | DX consistency | 🟡 TB |
| **P9** | Optimistic lock/unlock UI | UX snappier | 🟡 TB |
