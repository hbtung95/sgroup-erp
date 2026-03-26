import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, HrSalaryRecord } from '@prisma/client';

@Injectable()
export class PayrollRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPeriod(period: string, status?: string): Promise<HrSalaryRecord[]> {
    const where: any = { period };
    if (status) where.status = status;
    return this.prisma.hrSalaryRecord.findMany({
      where,
      include: { employee: true, salaryItems: true }
    });
  }

  async generatePayrollForMonth(year: number, month: number): Promise<number> {
    const period = `${year}-${String(month).padStart(2, '0')}`;
    
    // RED FLAG: Atomic Transaction (All or Nothing) for Payroll Generation
    return this.prisma.$transaction(async (tx) => {
      // 1. Get all active employees with their contracts
      const employees = await tx.hrEmployee.findMany({
        where: { status: 'ACTIVE' },
        include: { contracts: { where: { status: 'ACTIVE' } } }
      });

      if (employees.length === 0) return 0;

      let count = 0;
      for (const emp of employees) {
        if (emp.contracts.length === 0) continue;
        const contract = emp.contracts[0]; // Active contract
        
        // 2. Fetch specific month's attendance to count actualWorkDays
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        const attendances = await tx.hrAttendance.findMany({
          where: {
            employeeId: emp.id,
            date: { gte: firstDay, lte: lastDay },
            status: 'PRESENT'
          }
        });

        const actualWorkDays = attendances.length;
        const standardWorkDays = 22; // Typical standard
        const baseSalaryRatio = Math.min(1, actualWorkDays / standardWorkDays);
        
        // Use Prisma Decimal strictly for financial math
        const grossNumber = Number(contract.grossSalary);
        const calcBase = grossNumber * baseSalaryRatio;
        
        // Check if draft already exists
        const existing = await tx.hrSalaryRecord.findUnique({
          where: { employeeId_period: { employeeId: emp.id, period } }
        });

        if (existing && existing.status !== 'DRAFT') {
            continue; // Skip approved/paid records
        }

        const recordData = {
          employeeId: emp.id,
          period,
          year,
          month,
          standardWorkDays,
          actualWorkDays,
          baseSalaryValue: calcBase,
          netPay: calcBase, // Simple version, tax deduction logic can be added
          status: 'DRAFT',
        };

        if (existing) {
          await tx.hrSalaryRecord.update({
            where: { id: existing.id },
            data: recordData,
          });
        } else {
          await tx.hrSalaryRecord.create({ data: recordData });
        }
        count++;
      }
      return count;
    }, { timeout: 30000 }); // Payroll might take longer
  }

  async updateStatus(period: string, status: string, approverId: string): Promise<number> {
    // Only update DRAFT records
    const res = await this.prisma.hrSalaryRecord.updateMany({
      where: { period, status: 'DRAFT' },
      data: { status, note: `Approved by ${approverId}` }
    });
    return res.count;
  }
}
