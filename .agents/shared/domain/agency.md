---
name: Agency Network Management (Đại lý F1/F2)
description: Quản lý mạng lưới đại lý phân phối BĐS cho SGROUP ERP — onboarding, territory, commission F1/F2
---

# Agency Network — SGROUP ERP

## Role Overview
Quản lý mạng lưới đại lý bán hàng (F1: đại lý cấp 1, F2: đại lý cấp 2). SGROUP hợp tác với các đối tác bên ngoài để mở rộng kênh phân phối BĐS.

## Domain Entities

### Agency (Đại lý)
```prisma
model Agency {
  id            String    @id @default(uuid(7))
  code          String    @unique // "DL-HCM-001"
  name          String
  type          AgencyType // F1, F2
  parentId      String?   @map("parent_id") // F2 thuộc F1 nào
  contactPerson String    @map("contact_person")
  phone         String
  email         String
  address       String
  taxCode       String?   @map("tax_code")
  bankAccount   String?   @map("bank_account")
  bankName      String?   @map("bank_name")
  commissionRate Decimal  @db.Decimal(5, 4) @map("commission_rate") // Override rate
  territory     String[]  // Vùng phụ trách ["HCM", "Bình Dương"]
  status        AgencyStatus // ACTIVE, SUSPENDED, TERMINATED
  contractStart DateTime  @map("contract_start")
  contractEnd   DateTime? @map("contract_end")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("agencies")
}

enum AgencyType { F1 F2 }
enum AgencyStatus { ACTIVE SUSPENDED TERMINATED }
```

## Commission Split (F1/F2)
```
Tổng hoa hồng deal 3 tỷ = 2% = 60,000,000 VND

Nếu bán qua F1:
  F1: 70% = 42,000,000
  SGROUP: 30% = 18,000,000

Nếu bán qua F2 (thuộc F1):
  F2: 50% = 30,000,000
  F1: 20% = 12,000,000
  SGROUP: 30% = 18,000,000
```

## Business Rules
1. F2 chỉ được tạo dưới 1 F1 (parentId bắt buộc)
2. Commission split phải luôn = 100%
3. Territory không được overlap giữa 2 đại lý cùng cấp
4. Đại lý SUSPENDED không được tạo booking mới

## API Endpoints
```
GET    /api/agencies                     # DS đại lý
POST   /api/agencies                     # Tạo đại lý
GET    /api/agencies/:id                 # Chi tiết
PATCH  /api/agencies/:id                 # Cập nhật
POST   /api/agencies/:id/suspend        # Tạm ngưng
POST   /api/agencies/:id/activate       # Kích hoạt lại
GET    /api/agencies/:id/performance    # Báo cáo hiệu quả
```

## 🚨 MANDATORY RULES
- **Decimal(18,4)** cho commission rate và amount
- **$transaction** cho tạo/phân chia commission qua đại lý
- **Audit log** cho mọi thay đổi status và commission
- F2 PHẢI có parentId (F1)
