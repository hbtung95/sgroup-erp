---
name: HR & Payroll
description: Quản lý nhân sự, chấm công, tính lương cho SGROUP ERP
---

# HR & Payroll Skill — SGROUP ERP

## Role Overview
Skill quản lý nhân sự — hồ sơ nhân viên, chấm công, tính lương, KPI, và quản lý phòng ban.

## Domain Entities

### Staff (Nhân viên)
```prisma
model Staff {
  id            String    @id @default(uuid(7))
  code          String    @unique // "NV-001"
  fullName      String    @map("full_name")
  email         String    @unique
  phone         String
  departmentId  String    @map("department_id")
  position      String    // "Sales Executive", "Sales Manager"
  role          Role      // ADMIN, SALES, SALES_MANAGER, DIRECTOR, CEO
  baseSalary    Decimal   @db.Decimal(18, 4) @map("base_salary")
  joinDate      DateTime  @map("join_date")
  status        StaffStatus // ACTIVE, ON_LEAVE, RESIGNED
  managerId     String?   @map("manager_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("staff")
}
```

### Attendance (Chấm công)
```prisma
model Attendance {
  id        String   @id @default(uuid(7))
  staffId   String   @map("staff_id")
  date      DateTime @db.Date
  checkIn   DateTime? @map("check_in")
  checkOut  DateTime? @map("check_out")
  status    AttendanceStatus // PRESENT, ABSENT, LATE, HALF_DAY, LEAVE
  note      String?
  @@unique([staffId, date])
  @@map("attendances")
}
```

### Payroll (Bảng lương)
```prisma
model Payroll {
  id            String    @id @default(uuid(7))
  staffId       String    @map("staff_id")
  staffName     String    @map("staff_name") // Denormalized
  period        String    // "2026-03"
  baseSalary    Decimal   @db.Decimal(18, 4) @map("base_salary")
  workDays      Int       @map("work_days")
  actualDays    Decimal   @db.Decimal(5, 1) @map("actual_days")
  commission    Decimal   @default(0) @db.Decimal(18, 4)
  bonus         Decimal   @default(0) @db.Decimal(18, 4)
  deductions    Decimal   @default(0) @db.Decimal(18, 4)
  insurance     Decimal   @default(0) @db.Decimal(18, 4)
  tax           Decimal   @default(0) @db.Decimal(18, 4)
  netSalary     Decimal   @db.Decimal(18, 4) @map("net_salary")
  status        PayrollStatus // DRAFT, CALCULATED, APPROVED, PAID
  createdAt     DateTime  @default(now()) @map("created_at")
  @@unique([staffId, period])
  @@map("payrolls")
}
```

## Salary Calculation
```typescript
async calculatePayroll(staffId: string, period: string) {
  return this.prisma.$transaction(async (tx) => {
    const staff = await tx.staff.findUniqueOrThrow({ where: { id: staffId } });
    const attendance = await tx.attendance.findMany({
      where: { staffId, date: { gte: startOfMonth, lte: endOfMonth } }
    });
    const commissions = await tx.commissionRecord.findMany({
      where: { salesStaffId: staffId, status: 'APPROVED', period }
    });

    const workDays = 22; // Config
    const actualDays = attendance.filter(a => a.status === 'PRESENT').length;
    const dailyRate = staff.baseSalary.div(workDays);
    const basePay = dailyRate.mul(actualDays);
    const totalCommission = commissions.reduce((sum, c) => sum.add(c.commissionAmount), new Decimal(0));
    const gross = basePay.add(totalCommission);
    const insurance = gross.mul(0.105); // BHXH 10.5%
    const taxable = gross.sub(insurance).sub(11000000); // Giảm trừ 11tr
    const tax = taxable.gt(0) ? this.calculatePIT(taxable) : new Decimal(0);
    const netSalary = gross.sub(insurance).sub(tax);

    return tx.payroll.upsert({
      where: { staffId_period: { staffId, period } },
      create: { staffId, staffName: staff.fullName, period, baseSalary: staff.baseSalary, workDays, actualDays, commission: totalCommission, insurance, tax, netSalary, status: 'CALCULATED' },
      update: { actualDays, commission: totalCommission, insurance, tax, netSalary, status: 'CALCULATED' },
    });
  });
}
```

## API Endpoints
```
GET    /api/staff                        # DS nhân viên
POST   /api/staff                        # Thêm nhân viên
GET    /api/attendance                   # Bảng chấm công
POST   /api/attendance/check-in          # Check in
POST   /api/attendance/check-out         # Check out
POST   /api/payroll/calculate            # Tính lương tháng
GET    /api/payroll?period=2026-03       # Bảng lương
POST   /api/payroll/:id/approve          # Duyệt lương
```

## 🚨 MANDATORY RULES
- **Decimal(18,4)** cho mọi số tiền lương, thưởng, thuế
- **$transaction** cho tính lương (đọc chấm công + tính hoa hồng + ghi payroll)
- **Denormalize** tên NV vào bảng lương (chống NV đổi tên/nghỉ làm sai bảng lương cũ)
- **Audit log** cho duyệt/chi trả lương
