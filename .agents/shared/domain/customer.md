---
name: Customer 360
description: Quản lý khách hàng tổng hợp cho SGROUP ERP — hồ sơ, lịch sử, scoring, timeline
---

# Customer 360 — SGROUP ERP

## Role Overview
Hồ sơ khách hàng tổng hợp — gom tất cả touchpoint từ CRM lead đến giao dịch, thanh toán, feedback thành 1 view duy nhất.

## Domain Entities

### Customer
```prisma
model Customer {
  id            String    @id @default(uuid(7))
  code          String    @unique // "KH-20260408-001"
  fullName      String    @map("full_name")
  phone         String    @unique
  email         String?
  idNumber      String?   @map("id_number") // CCCD/CMND
  idIssuedDate  DateTime? @map("id_issued_date")
  idIssuedPlace String?   @map("id_issued_place")
  dateOfBirth   DateTime? @map("date_of_birth")
  gender        String?   // MALE, FEMALE, OTHER
  address       String?
  occupation    String?
  income        String?   // Khoảng thu nhập: "<20M", "20-50M", ">50M"
  source        String    // WALK_IN, REFERRAL, BIZFLY, FACEBOOK, ZALO, AGENCY
  sourceDetail  String?   @map("source_detail") // Campaign name, referrer
  assignedTo    String?   @map("assigned_to") // Sales staff ID
  score         Int       @default(0) // Lead scoring 0-100
  tags          String[]  // ["VIP", "Investor", "First-time buyer"]
  notes         String?
  externalId    String?   @map("external_id") // BizFly CRM ID
  status        CustomerStatus // LEAD, PROSPECT, CUSTOMER, INACTIVE
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("customers")
}

enum CustomerStatus { LEAD PROSPECT CUSTOMER INACTIVE }
```

### CustomerTimeline (Lịch sử tương tác)
```prisma
model CustomerTimeline {
  id          String   @id @default(uuid(7))
  customerId  String   @map("customer_id")
  type        String   // CALL, VISIT, EMAIL, SMS, BOOKING, DEPOSIT, CONTRACT
  title       String
  description String?
  staffId     String   @map("staff_id")
  staffName   String   @map("staff_name")
  metadata    Json?    // Extra data (call duration, deal ID, etc.)
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("customer_timelines")
}
```

## Lead Scoring Rules
```typescript
const scoringRules = {
  hasPhone: +10,
  hasEmail: +5,
  hasIDNumber: +15,
  visitedShowroom: +20,
  requestedPricing: +15,
  bookedUnit: +30,
  depositPaid: +40,
  incomeAbove50M: +10,
  referredByExisting: +15,
  inactiveOver30Days: -20,
};
```

## API Endpoints
```
GET    /api/customers                      # DS KH (lọc status, source, score, assigned)
POST   /api/customers                      # Tạo KH mới
GET    /api/customers/:id                  # Chi tiết KH 360
PATCH  /api/customers/:id                  # Cập nhật
POST   /api/customers/:id/assign          # Phân KH cho sales
GET    /api/customers/:id/timeline        # Lịch sử tương tác
POST   /api/customers/:id/timeline        # Ghi nhận tương tác
GET    /api/customers/:id/transactions    # DS giao dịch
GET    /api/customers/duplicates          # Phát hiện trùng (phone/email)
```

## 🚨 MANDATORY RULES
- Phone number UNIQUE — prevent duplicate customers
- Lead scoring tự động cập nhật khi có event mới
- Timeline APPEND-ONLY — KHÔNG sửa/xóa lịch sử
- Sync 2 chiều với BizFly CRM qua Iris agent
