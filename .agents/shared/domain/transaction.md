---
name: Transaction Management (Giao dịch BĐS)
description: Quản lý giao dịch bất động sản end-to-end — booking → cọc → HĐMB → bàn giao → hoa hồng
---

# Transaction Management — SGROUP ERP

## Role Overview
Quản lý toàn bộ vòng đời giao dịch BĐS: từ giữ chỗ → đặt cọc → ký HĐMB → thanh toán theo đợt → bàn giao → trigger tính hoa hồng.

## Domain Entities

### Transaction (Giao dịch)
```prisma
model Transaction {
  id              String    @id @default(uuid(7))
  code            String    @unique // "GD-20260408-001"
  productId       String    @map("product_id")
  projectId       String    @map("project_id")
  customerId      String    @map("customer_id")
  salesStaffId    String    @map("sales_staff_id")
  agencyId        String?   @map("agency_id") // Nếu bán qua đại lý
  status          TransactionStatus
  // Denormalized snapshots
  productCode     String    @map("product_code")
  projectName     String    @map("project_name")
  customerName    String    @map("customer_name")
  salesStaffName  String    @map("sales_staff_name")
  // Pricing
  unitPrice       Decimal   @db.Decimal(18, 4) @map("unit_price")
  discount        Decimal   @default(0) @db.Decimal(18, 4)
  finalPrice      Decimal   @db.Decimal(18, 4) @map("final_price")
  // Dates
  bookingDate     DateTime? @map("booking_date")
  depositDate     DateTime? @map("deposit_date")
  contractDate    DateTime? @map("contract_date")
  handoverDate    DateTime? @map("handover_date")
  cancelledDate   DateTime? @map("cancelled_date")
  cancelReason    String?   @map("cancel_reason")
  // Financial
  depositAmount   Decimal?  @db.Decimal(18, 4) @map("deposit_amount")
  paidAmount      Decimal   @default(0) @db.Decimal(18, 4) @map("paid_amount")
  remainAmount    Decimal   @db.Decimal(18, 4) @map("remain_amount")
  // Metadata
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  @@map("transactions")
}

enum TransactionStatus {
  BOOKED       // Giữ chỗ (30 min lock)
  DEPOSITED    // Đã đặt cọc
  CONTRACTED   // Đã ký HĐMB
  PAYING       // Đang thanh toán theo đợt
  COMPLETED    // Đã bàn giao
  CANCELLED    // Đã hủy
}
```

## State Machine
```
BOOKED → DEPOSITED → CONTRACTED → PAYING → COMPLETED
  ↓         ↓            ↓          ↓
CANCELLED CANCELLED   CANCELLED  CANCELLED (refund required)
```

### Transition Rules
| From | To | Required | Side Effects |
|------|-----|----------|-------------|
| BOOKED | DEPOSITED | deposit receipt | Create invoice, update product status |
| DEPOSITED | CONTRACTED | HĐMB signed | Create contract record, trigger commission calc |
| CONTRACTED | PAYING | First payment | Create payment schedule |
| PAYING | COMPLETED | Full payment + handover | Mark product SOLD, close AR |
| Any | CANCELLED | Cancel reason | Refund calc, release product, reverse commission |

## Payment Schedule
```prisma
model PaymentSchedule {
  id              String    @id @default(uuid(7))
  transactionId   String    @map("transaction_id")
  installment     Int       // 1, 2, 3...
  dueDate         DateTime  @map("due_date")
  amount          Decimal   @db.Decimal(18, 4)
  paidAmount      Decimal   @default(0) @db.Decimal(18, 4) @map("paid_amount")
  status          String    // PENDING, PAID, OVERDUE
  @@map("payment_schedules")
}
```

## API Endpoints
```
GET    /api/transactions                    # DS giao dịch (lọc theo status, sales, project)
POST   /api/transactions                    # Tạo giao dịch (booking)
GET    /api/transactions/:id                # Chi tiết
POST   /api/transactions/:id/deposit       # Ghi nhận cọc
POST   /api/transactions/:id/contract      # Ký HĐMB
POST   /api/transactions/:id/payment       # Ghi nhận thanh toán đợt
POST   /api/transactions/:id/handover      # Bàn giao
POST   /api/transactions/:id/cancel        # Hủy giao dịch
GET    /api/transactions/:id/payments      # Lịch thanh toán
```

## 🚨 MANDATORY RULES
- **Atomic booking**: Use pessimistic lock (SELECT FOR UPDATE) — 2 sales KHÔNG được book cùng 1 căn
- **Decimal(18,4)** cho MỌI số tiền
- **$transaction** cho MỌI thay đổi status
- **Denormalize** tên NV, KH, dự án vào giao dịch
- **Audit log** cho MỌI transition
- Cancel CONTRACTED+ requires Director approval
