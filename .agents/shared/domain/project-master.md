---
name: Project Master Data (Dự án BĐS Master)
description: Quản lý master data dự án BĐS — bảng hàng, layout, pricing, progress tracking
---

# Project Master Data — SGROUP ERP

## Role Overview
Master data dự án BĐS — quản lý thông tin tổng thể dự án, layout mặt bằng, bảng hàng (inventory), pricing policy, tiến độ xây dựng.

## Domain Entities

### ProjectMaster (extends Real Estate Project)
```prisma
model ProjectMaster {
  id              String    @id @default(uuid(7))
  code            String    @unique
  name            String
  investor        String    // Chủ đầu tư
  developer       String?   // Nhà phát triển
  type            ProjectType
  location        String
  district        String
  city            String
  totalArea       Decimal   @db.Decimal(10, 2) @map("total_area") // m2
  totalBlocks     Int?      @map("total_blocks") // Số tòa/block
  totalFloors     Int?      @map("total_floors") // Số tầng
  totalUnits      Int       @map("total_units")
  priceRange      Json      @map("price_range") // { min: 2000000000, max: 5000000000 }
  facilities      String[]  // ["Pool", "Gym", "Park", "School"]
  legalStatus     String    @map("legal_status") // "Sổ hồng riêng", "Sổ chung"
  status          ProjectStatus
  openSaleDate    DateTime? @map("open_sale_date")
  completionDate  DateTime? @map("completion_date")
  coverImage      String?   @map("cover_image")
  gallery         String[]  // Image URLs
  brochureUrl     String?   @map("brochure_url")
  description     String?
  commissionPolicy Json?    @map("commission_policy") // { baseRate: 0.02, bonusRate: 0.005 }
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  @@map("project_masters")
}

enum ProjectType { APARTMENT TOWNHOUSE LAND VILLA COMMERCIAL }
enum ProjectStatus { PLANNING CONSTRUCTION OPEN_SALE SOLD_OUT COMPLETED }
```

## Inventory View (Bảng hàng)
```typescript
// Real-time inventory grid showing unit status
interface InventoryCell {
  unitCode: string;     // "A-1201"
  floor: number;
  area: number;         // m2
  price: Decimal;       // VND
  status: 'AVAILABLE' | 'BOOKED' | 'DEPOSITED' | 'CONTRACTED' | 'SOLD';
  bookedBy?: string;    // Sales staff name
  color: string;        // Status-based color coding
}
```

## API Endpoints
```
GET    /api/projects                       # DS dự án (lọc status, city)
POST   /api/projects                       # Tạo dự án
GET    /api/projects/:id                   # Chi tiết
PATCH  /api/projects/:id                   # Cập nhật
GET    /api/projects/:id/inventory        # Bảng hàng (real-time)
GET    /api/projects/:id/stats            # Thống kê (sold/available/revenue)
POST   /api/projects/:id/import-units     # Import units từ Excel
```

## 🚨 MANDATORY RULES
- **Decimal(18,4)** cho giá và diện tích
- Import units phải validate uniqueness (code per project)
- Inventory endpoint PHẢI real-time (no cache hoặc cache <30s)
- Gallery images lưu trên MinIO
