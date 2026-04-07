---
name: Real Estate Management
description: Quản lý Bất Động Sản cho SGROUP ERP — dự án, căn hộ, mở bán, giữ chỗ, booking, hợp đồng mua bán
---

# Real Estate Management Skill — SGROUP ERP

## Role Overview
Skill chuyên biệt cho nghiệp vụ Bất Động Sản (BĐS) — quản lý dự án, sản phẩm (căn hộ/nhà phố/đất nền), quy trình mở bán, giữ chỗ, và chốt hợp đồng mua bán.

## Domain Entities

### Project (Dự án BĐS)
```prisma
model Project {
  id            String    @id @default(uuid(7))
  name          String    // "SGroup Tower", "SGroup Garden"
  code          String    @unique // "SGT-01"
  type          ProjectType // APARTMENT, TOWNHOUSE, LAND
  status        ProjectStatus // PLANNING, OPEN_SALE, SOLD_OUT, COMPLETED
  location      String
  totalUnits    Int       @map("total_units")
  soldUnits     Int       @default(0) @map("sold_units")
  openSaleDate  DateTime? @map("open_sale_date")
  products      PropertyProduct[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("projects")
}
```

### PropertyProduct (Sản phẩm BĐS — Căn hộ/Lô đất)
```prisma
model PropertyProduct {
  id            String    @id @default(uuid(7))
  projectId     String    @map("project_id")
  project       Project   @relation(fields: [projectId], references: [id])
  code          String    // "A-1201" (Tòa A, tầng 12, căn 01)
  floor         Int?
  area          Decimal   @db.Decimal(10, 2) // m2
  basePrice     Decimal   @db.Decimal(18, 4) @map("base_price") // VND
  status        ProductStatus // AVAILABLE, BOOKED, DEPOSITED, CONTRACTED, SOLD
  lockedUntil   DateTime? @map("locked_until") // Pessimistic lock
  bookedBy      String?   @map("booked_by") // Sales staff ID
  statusLogs    ProductStatusLog[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("property_products")
}
```

## Business Rules (Quy tắc nghiệp vụ)

### 1. Trạng thái sản phẩm (State Machine)
```
AVAILABLE → BOOKED → DEPOSITED → CONTRACTED → SOLD
    ↓          ↓         ↓
  LOCKED    RELEASED   CANCELLED
```
- **AVAILABLE → BOOKED**: Sales giữ chỗ, lock 30 phút (`lockedUntil`)
- **BOOKED → DEPOSITED**: Khách đặt cọc, tạo phiếu thu
- **DEPOSITED → CONTRACTED**: Ký hợp đồng mua bán
- **CANCELLED**: Hủy → trả về AVAILABLE, hoàn cọc

### 2. Race Condition Prevention
```typescript
// ❌ SAI — 2 sales có thể book cùng 1 căn
const product = await prisma.propertyProduct.findUnique({ where: { id } });
if (product.status === 'AVAILABLE') {
  await prisma.propertyProduct.update({ where: { id }, data: { status: 'BOOKED' } });
}

// ✅ ĐÚNG — Atomic check + lock
const updated = await prisma.propertyProduct.updateMany({
  where: {
    id,
    status: 'AVAILABLE',
    OR: [
      { lockedUntil: null },
      { lockedUntil: { lt: new Date() } }
    ]
  },
  data: {
    status: 'BOOKED',
    bookedBy: userId,
    lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 min lock
  }
});
if (updated.count === 0) throw new ConflictException('Căn hộ đã được giữ chỗ');
```

### 3. Giá sản phẩm
- Luôn dùng `Decimal(18, 4)` — KHÔNG BAO GIỜ dùng Float
- Giá = basePrice + premium (tầng cao, view đẹp)
- Chiết khấu áp dụng theo chính sách

### 4. Denormalization (Chụp ảnh lịch sử)
Khi tạo hợp đồng, lưu snapshot:
- `staffName`, `staffCode` — Tên NV sales tại thời điểm chốt
- `projectName` — Tên dự án tại thời điểm chốt
- `unitPrice` — Giá bán tại thời điểm chốt

## API Endpoints
```
GET    /api/projects                    # Danh sách dự án
GET    /api/projects/:id                # Chi tiết dự án
POST   /api/projects                    # Tạo dự án mới
PATCH  /api/projects/:id                # Cập nhật dự án

GET    /api/projects/:id/products       # DS căn hộ trong dự án
POST   /api/products/:id/book           # Giữ chỗ
POST   /api/products/:id/deposit        # Đặt cọc
POST   /api/products/:id/release        # Hủy giữ chỗ
```

## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to `docs/architecture/backend-architecture-rules.md` and `docs/architecture/api-architecture-rules.md`. Đặc biệt:
- ADR-002: UUID v7, Soft Delete, Decimal(18,4), Optimistic Lock
- Mọi thay đổi status phải ghi `ProductStatusLog`
- Mọi giao dịch tiền phải wrap trong `$transaction`
