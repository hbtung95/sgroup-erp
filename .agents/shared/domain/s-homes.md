---
name: S-Homes Property Management
description: Quản lý BĐS cho thuê — tài sản, hợp đồng thuê, bảo trì, thu tiền thuê
---

# S-Homes Property Management — SGROUP ERP

## Role Overview
Quản lý tài sản cho thuê — danh mục BĐS, hợp đồng thuê, lịch thu tiền, bảo trì, và báo cáo hiệu suất cho thuê.

## Domain Entities

### RentalProperty
```prisma
model RentalProperty {
  id            String    @id @default(uuid(7))
  code          String    @unique
  name          String
  type          String    // APARTMENT, OFFICE, SHOPHOUSE, WAREHOUSE
  address       String
  area          Decimal   @db.Decimal(10, 2)
  ownerId       String    @map("owner_id") // Chủ sở hữu
  ownerName     String    @map("owner_name")
  monthlyRent   Decimal   @db.Decimal(18, 4) @map("monthly_rent")
  status        String    // AVAILABLE, RENTED, MAINTENANCE
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("rental_properties")
}
```

### RentalContract
```prisma
model RentalContract {
  id            String    @id @default(uuid(7))
  propertyId    String    @map("property_id")
  tenantName    String    @map("tenant_name")
  tenantPhone   String    @map("tenant_phone")
  monthlyRent   Decimal   @db.Decimal(18, 4) @map("monthly_rent")
  deposit       Decimal   @db.Decimal(18, 4)
  startDate     DateTime  @map("start_date")
  endDate       DateTime  @map("end_date")
  status        String    // ACTIVE, EXPIRED, TERMINATED
  createdAt     DateTime  @default(now()) @map("created_at")
  @@map("rental_contracts")
}
```

## API Endpoints
```
GET    /api/rental-properties              # DS tài sản cho thuê
POST   /api/rental-properties              # Thêm tài sản
GET    /api/rental-contracts               # DS hợp đồng thuê
POST   /api/rental-contracts               # Tạo HĐ thuê
GET    /api/rental/dashboard               # Tổng hợp hiệu suất
```

## 🚨 MANDATORY RULES
- Decimal(18,4) cho tiền thuê
- 1 property chỉ có 1 ACTIVE contract tại 1 thời điểm
- Auto alert khi HĐ sắp hết hạn (30 ngày trước)
