---
name: Commission Management
description: Tính hoa hồng sales cho SGROUP ERP — chính sách, công thức, phân chia, đối soát, chi trả
---

# Commission Management Skill — SGROUP ERP

## Role Overview
Skill chuyên biệt cho nghiệp vụ tính hoa hồng bán hàng — từ chính sách thưởng, công thức tính, phân chia giữa các cấp, đến đối soát và chi trả.

## Domain Entities

### CommissionPolicy (Chính sách hoa hồng)
```prisma
model CommissionPolicy {
  id            String    @id @default(uuid(7))
  name          String    // "CS Hoa hồng Q1-2026"
  projectId     String?   @map("project_id") // Áp dụng riêng dự án
  productType   String?   @map("product_type") // Loại sản phẩm
  baseRate      Decimal   @db.Decimal(5, 4) @map("base_rate") // 0.0200 = 2%
  bonusRate     Decimal?  @db.Decimal(5, 4) @map("bonus_rate")
  effectiveFrom DateTime  @map("effective_from")
  effectiveTo   DateTime? @map("effective_to")
  isActive      Boolean   @default(true) @map("is_active")
  tiers         CommissionTier[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  @@map("commission_policies")
}
```

### CommissionRecord (Bản ghi hoa hồng)
```prisma
model CommissionRecord {
  id            String    @id @default(uuid(7))
  dealId        String    @map("deal_id") // Liên kết giao dịch
  salesStaffId  String    @map("sales_staff_id")
  salesStaffName String   @map("sales_staff_name") // Denormalized snapshot
  productCode   String    @map("product_code") // Denormalized
  dealValue     Decimal   @db.Decimal(18, 4) @map("deal_value") // Giá trị giao dịch
  commissionRate Decimal  @db.Decimal(5, 4) @map("commission_rate") // Tỷ lệ %
  commissionAmount Decimal @db.Decimal(18, 4) @map("commission_amount") // Số tiền
  status        CommissionStatus // PENDING, APPROVED, PAID, CANCELLED
  approvedBy    String?   @map("approved_by")
  approvedAt    DateTime? @map("approved_at")
  paidAt        DateTime? @map("paid_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  @@map("commission_records")
}

enum CommissionStatus { PENDING APPROVED PAID CANCELLED }
```

## Commission Calculation Rules

### 1. Công thức cơ bản
```typescript
commissionAmount = dealValue * commissionRate
// VD: 3,000,000,000 * 0.02 = 60,000,000 VND
```

### 2. Phân chia hoa hồng (Multi-level Split)
```typescript
interface CommissionSplit {
  directSales: number;  // 60% cho NV trực tiếp
  teamLead: number;     // 20% cho trưởng nhóm
  branchManager: number; // 15% cho GĐ chi nhánh
  company: number;      // 5% phí quản lý
}

// ⚠️ CRITICAL: Tổng split LUÔN LUÔN = 100%
// Validate trước khi lưu DB
const totalSplit = Object.values(split).reduce((a, b) => a + b, 0);
if (Math.abs(totalSplit - 1.0) > 0.0001) {
  throw new BadRequestException('Commission split must total 100%');
}
```

### 3. Tiered Commission (Hoa hồng bậc thang)
```
Doanh số 0 - 5 tỷ:    2.0%
Doanh số 5 - 10 tỷ:   2.5%
Doanh số > 10 tỷ:     3.0%
```

### 4. Atomic Transaction
```typescript
// Tạo commission PHẢI dùng $transaction
async createCommission(dealId: string) {
  return this.prisma.$transaction(async (tx) => {
    const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });
    const policy = await tx.commissionPolicy.findFirst({ where: { isActive: true } });
    const amount = deal.value.mul(policy.baseRate);
    
    // Tạo record + cập nhật deal status cùng lúc
    const record = await tx.commissionRecord.create({ data: { ... } });
    await tx.deal.update({ where: { id: dealId }, data: { commissionRecordId: record.id } });
    
    // Ghi audit log
    await tx.auditLog.create({ data: { action: 'COMMISSION_CREATED', ... } });
    
    return record;
  });
}
```

## API Endpoints
```
GET    /api/commissions                  # DS hoa hồng (lọc theo nhân viên, trạng thái)
GET    /api/commissions/:id              # Chi tiết
POST   /api/commissions/calculate        # Tính hoa hồng cho deal
POST   /api/commissions/:id/approve      # Duyệt
POST   /api/commissions/:id/pay          # Chi trả
GET    /api/commissions/report           # Báo cáo hoa hồng theo kỳ
```

## 🚨 MANDATORY RULES
- **Decimal(18,4)** cho mọi số tiền — KHÔNG DÙNG FLOAT
- **$transaction** cho mọi thao tác tạo/duyệt/chi trả
- **Audit log** cho mọi thay đổi trạng thái hoa hồng
- **Denormalize** tên NV, mã sản phẩm vào bản ghi (chống sai khi NV nghỉ việc)
