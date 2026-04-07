---
name: Database Management
description: Database design, Prisma migration workflows, query optimization for SGROUP ERP
---

# Database Management Skill — SGROUP ERP

## Tech Stack
- **ORM**: Prisma v6
- **Database**: PostgreSQL
- **Migration**: Prisma Migrate

## Core Design Principles (ADR-002: Tiêu Chuẩn Database Toàn Dự Án)
Tất cả các agent thao tác với Database BẮT BUỘC tuân thủ 8 nguyên tắc sau ngầm định:
1. **UUIDv7 Primary Key:** Toàn bộ bảng dùng `uuid(7)`. Không dùng Int hay Cuid.
2. **Soft Delete Policy:** Dữ liệu lõi tài chính/nhân sự/giao dịch không bao giờ xóa cứng. Dùng `deletedAt DateTime?`.
3. **Pessimistic/Optimistic Locking:** Các tài nguyên độc quyền (VD: Booking Căn hộ) phải có khóa thời gian `lockedUntil` để tránh Race Condition.
4. **High-Precision Decimal:** Mọi trường tài chính bắt buộc dùng `Decimal(18, 4)`. KHÔNG dùng Float.
5. **Cascade vs SetNull:** Dùng `SetNull` cho dữ liệu thao tác nghiệp vụ để tránh mất tham chiếu khi nhân sự nghỉ việc. Bỏ rác mới dùng `Cascade`.
6. **Denormalization Snapshot:** Cố tình lưu dư thừa text (Tên NV, Tên KH) vào bảng Giao Dịch (`FactDeal`) để giữ nguyên biến động lịch sử.
7. **The "Big Brother" Audit:** Mọi API thay đổi Database phải log lại (IP, Body, Dữ liệu cũ/mới) vào bảng `audit_logs`.
8. **Atomic Status Logs:** Chuyển đổi trạng thái phức tạp phải log lại thành file lịch sử vòng đời tách biệt.

*👉 Chi tiết đọc thêm ở `docs/adr/ADR-002-database-design-standards.md`.*

## Schema Design Conventions

### Model Template
```prisma
model User {
  id        String   @id @default(uuid()) // UUID v7 preferred
  email     String   @unique
  name      String
  role      Role     @default(EMPLOYEE)
  isActive  Boolean  @default(true)
  
  // Relations
  sales     Sale[]
  activities Activity[]
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at") // Soft delete
  
  @@map("users")
}

enum Role {
  ADMIN
  MANAGER
  EMPLOYEE
  SALES_REP
}
```

### Naming Conventions
| Context | Convention | Example |
|---|---|---|
| Model name | PascalCase singular | `User`, `SaleOrder` |
| Field name | camelCase | `firstName`, `createdAt` |
| Table name (@map) | snake_case plural | `users`, `sale_orders` |
| Column name (@map) | snake_case | `first_name`, `created_at` |
| Enum | PascalCase | `Role`, `OrderStatus` |
| Enum value | UPPER_SNAKE_CASE | `SALES_REP`, `IN_PROGRESS` |

### Index Strategy
```prisma
model Sale {
  id         String   @id @default(uuid())
  customerId String   @map("customer_id")
  status     Status
  amount     Decimal
  saleDate   DateTime @map("sale_date")
  
  @@index([customerId])           // Foreign key lookup
  @@index([status])               // Filter queries
  @@index([saleDate(sort: Desc)]) // Chronological queries
  @@index([customerId, status])   // Composite for common filters
  @@map("sales")
}
```

## Migration Workflow

### Creating Migrations
```bash
# Step 1: Edit schema.prisma
# Step 2: Create migration
npx prisma migrate dev --name add_sales_table

# Step 3: Review generated SQL in prisma/migrations/
# Step 4: Verify with Prisma Studio
npx prisma studio
```

### Migration Commands Reference
```bash
npx prisma migrate dev           # Dev: create + apply + generate
npx prisma migrate dev --name X  # Dev: with named migration
npx prisma migrate deploy        # Production: apply pending
npx prisma migrate reset         # Dev: reset + re-apply all
npx prisma migrate status        # Check migration status
npx prisma db push               # Prototype: push without migration
npx prisma generate              # Regenerate Prisma Client
```

### Dangerous Operations Checklist
Before running destructive migrations:
- [ ] Backup the database
- [ ] Test migration on staging first
- [ ] Check for data dependencies
- [ ] Ensure rollback plan exists

## Query Optimization

### Efficient Queries
```typescript
// ✅ Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// ✅ Use include for related data (avoid N+1)
const sales = await prisma.sale.findMany({
  include: { customer: true, items: true },
});

// ✅ Pagination
const page = await prisma.sale.findMany({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// ✅ Batch operations
const created = await prisma.sale.createMany({
  data: salesArray,
  skipDuplicates: true,
});

// ✅ Transaction for related writes
const [order, payment] = await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.payment.create({ data: paymentData }),
]);
```

### Query Anti-Patterns
```typescript
// ❌ N+1 query
const users = await prisma.user.findMany();
for (const user of users) {
  user.sales = await prisma.sale.findMany({ where: { userId: user.id } });
}

// ✅ Fixed: Use include
const users = await prisma.user.findMany({ include: { sales: true } });
```

## Seeding
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Upsert to be idempotent
  await prisma.user.upsert({
    where: { email: 'admin@sgroup.vn' },
    update: {},
    create: {
      email: 'admin@sgroup.vn',
      name: 'Admin',
      role: 'ADMIN',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Backup Strategy
```bash
# PostgreSQL backup
pg_dump -U postgres -h localhost -d sgroup_erp > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -h localhost -d sgroup_erp < backup_20260312.sql
```


## ?? MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/backend-architecture-rules.md` and `docs/architecture/api-architecture-rules.md`. Follow Clean Architecture, DTO validation, UUID v7, Soft Delete, and Decimal precision rules.