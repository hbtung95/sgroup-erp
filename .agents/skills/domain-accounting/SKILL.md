---
name: Accounting & Finance
description: Quản lý Kế toán Tài chính cho SGROUP ERP — công nợ, phiếu thu/chi, sổ cái, báo cáo tài chính
---

# Accounting & Finance Skill — SGROUP ERP

## Role Overview
Quản lý nghiệp vụ kế toán tài chính — công nợ phải thu/phải trả, phiếu thu/chi, sổ cái, đối soát, và báo cáo tài chính.

## Domain Entities

### Invoice (Hóa đơn / Phiếu thu chi)
```prisma
model Invoice {
  id            String    @id @default(uuid(7))
  code          String    @unique // "PT-20260327-001"
  type          InvoiceType // RECEIPT, PAYMENT
  customerId    String?   @map("customer_id")
  dealId        String?   @map("deal_id")
  amount        Decimal   @db.Decimal(18, 4)
  paidAmount    Decimal   @default(0) @db.Decimal(18, 4) @map("paid_amount")
  status        InvoiceStatus // DRAFT, CONFIRMED, PAID, CANCELLED
  description   String?
  // Denormalized snapshots
  customerName  String    @map("customer_name")
  staffName     String    @map("staff_name")
  projectName   String?   @map("project_name")
  confirmedBy   String?   @map("confirmed_by")
  confirmedAt   DateTime? @map("confirmed_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("invoices")
}

enum InvoiceType { RECEIPT PAYMENT }
enum InvoiceStatus { DRAFT CONFIRMED PAID CANCELLED }
```

### AccountReceivable (Công nợ phải thu)
```prisma
model AccountReceivable {
  id            String    @id @default(uuid(7))
  customerId    String    @map("customer_id")
  dealId        String?   @map("deal_id")
  totalAmount   Decimal   @db.Decimal(18, 4) @map("total_amount")
  paidAmount    Decimal   @default(0) @db.Decimal(18, 4) @map("paid_amount")
  remainAmount  Decimal   @db.Decimal(18, 4) @map("remain_amount") // Computed
  dueDate       DateTime  @map("due_date")
  status        String    // OPEN, PARTIAL, PAID, OVERDUE
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  @@map("account_receivables")
}
```

## Business Rules

### 1. Ghi nhận thu tiền (Atomicity bắt buộc)
```typescript
async recordPayment(invoiceId: string, amount: Decimal) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Cập nhật invoice
    const invoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: { increment: amount },
        status: 'PAID',
      },
    });
    
    // 2. Cập nhật công nợ
    await tx.accountReceivable.update({
      where: { dealId: invoice.dealId },
      data: {
        paidAmount: { increment: amount },
        remainAmount: { decrement: amount },
      },
    });
    
    // 3. Ghi audit log
    await tx.auditLog.create({
      data: {
        action: 'PAYMENT_RECORDED',
        entityType: 'Invoice',
        entityId: invoiceId,
        changes: { amount: amount.toString() },
      },
    });
  });
}
```

### 2. Báo cáo công nợ
```sql
-- Tổng hợp công nợ theo khách hàng
SELECT 
  c.name AS customer_name,
  SUM(ar.total_amount) AS total_debt,
  SUM(ar.paid_amount) AS total_paid,
  SUM(ar.remain_amount) AS total_remain,
  COUNT(CASE WHEN ar.status = 'OVERDUE' THEN 1 END) AS overdue_count
FROM account_receivables ar
JOIN customers c ON ar.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY total_remain DESC;
```

## API Endpoints
```
GET    /api/invoices                     # DS phiếu thu/chi
POST   /api/invoices                     # Tạo phiếu
POST   /api/invoices/:id/confirm         # Duyệt phiếu
POST   /api/invoices/:id/record-payment  # Ghi nhận thanh toán
GET    /api/receivables                  # DS công nợ phải thu
GET    /api/receivables/report           # Báo cáo công nợ
GET    /api/finance/dashboard            # Dashboard tài chính
```

## 🚨 MANDATORY RULES
- **Decimal(18,4)** tuyệt đối cho MỌI số tiền
- **$transaction** cho MỌI thao tác ảnh hưởng > 1 bảng
- **Soft delete** — KHÔNG BAO GIỜ xóa cứng dữ liệu tài chính
- **Denormalize** tên NV, khách hàng vào phiếu thu/chi
- **Audit log** cho MỌI thay đổi dữ liệu tài chính
