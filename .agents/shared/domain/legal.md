---
name: Legal & Contract Management (Pháp lý)
description: Quản lý hợp đồng mua bán BĐS, pháp lý dự án, công chứng, bàn giao
---

# Legal & Contract Management — SGROUP ERP

## Role Overview
Quản lý vòng đời pháp lý: HĐMB (Hợp đồng mua bán), phụ lục, biên bản giao nhận, công chứng, chứng nhận quyền sử dụng đất/sở hữu.

## Domain Entities

### Contract (Hợp đồng mua bán)
```prisma
model Contract {
  id              String    @id @default(uuid(7))
  code            String    @unique // "HD-SGT-20260408-001"
  transactionId   String    @unique @map("transaction_id")
  templateId      String?   @map("template_id") // Contract template
  // Parties
  buyerName       String    @map("buyer_name")
  buyerIdNumber   String    @map("buyer_id_number")
  buyerAddress    String    @map("buyer_address")
  buyerPhone      String    @map("buyer_phone")
  // Property
  projectName     String    @map("project_name")
  productCode     String    @map("product_code")
  area            Decimal   @db.Decimal(10, 2)
  // Financial
  contractValue   Decimal   @db.Decimal(18, 4) @map("contract_value")
  depositAmount   Decimal   @db.Decimal(18, 4) @map("deposit_amount")
  paymentTerms    Json      @map("payment_terms") // Payment schedule array
  // Status
  status          ContractStatus
  signedDate      DateTime? @map("signed_date")
  notarizedDate   DateTime? @map("notarized_date")
  notaryOffice    String?   @map("notary_office")
  handoverDate    DateTime? @map("handover_date")
  // Metadata
  createdBy       String    @map("created_by")
  approvedBy      String?   @map("approved_by")
  approvedAt      DateTime? @map("approved_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  @@map("contracts")
}

enum ContractStatus {
  DRAFT          // Soạn thảo
  PENDING_REVIEW // Chờ duyệt pháp lý
  APPROVED       // Đã duyệt
  SIGNED         // Đã ký
  NOTARIZED      // Đã công chứng
  HANDOVER       // Đã bàn giao
  COMPLETED      // Hoàn tất (chứng nhận quyền SD)
  CANCELLED      // Hủy
}
```

## State Machine
```
DRAFT → PENDING_REVIEW → APPROVED → SIGNED → NOTARIZED → HANDOVER → COMPLETED
                                       ↓
                                   CANCELLED
```

## API Endpoints
```
GET    /api/contracts                      # DS hợp đồng
POST   /api/contracts                      # Tạo HĐ từ transaction
GET    /api/contracts/:id                  # Chi tiết
POST   /api/contracts/:id/submit-review   # Gửi duyệt pháp lý
POST   /api/contracts/:id/approve         # Duyệt
POST   /api/contracts/:id/sign            # Ký
POST   /api/contracts/:id/notarize        # Công chứng
POST   /api/contracts/:id/handover        # Bàn giao
GET    /api/contracts/:id/pdf             # Export PDF
```

## 🚨 MANDATORY RULES
- Contract tạo từ Transaction (1:1 relationship)
- **Decimal(18,4)** cho mọi giá trị tài chính
- **$transaction** cho mọi thay đổi status
- Approval từ DIRECTOR+ required trước khi ký
- All contract data denormalized (không thay đổi khi source thay đổi)
- Keep PDF version history
