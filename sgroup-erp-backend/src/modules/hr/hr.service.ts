import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async createEmployee(data: any) {
    // Generate Employee Code
    const count = await this.prisma.hrEmployee.count();
    const seq = (count + 1).toString().padStart(4, '0');
    const employeeCode = `NV${seq}`;

    const employee = await this.prisma.hrEmployee.create({
      data: {
        ...data,
        employeeCode,
      },
      include: {
        department: true
      }
    });

    // If assigned to a department with "Sales" or "Kinh doanh" in the name, emit event to Sales Module
    if (employee.department && (employee.department.name.toLowerCase().includes('sale') || employee.department.name.toLowerCase().includes('kinh doanh'))) {
      this.eventEmitter.emit('hr.employee_created', employee);
      this.logger.log(`Emitted hr.employee_created for employee ${employee.employeeCode}`);
    }

    return employee;
  }

  async generateMonthlyPayroll(year: number, month: number) {
    const period = `${year}-${String(month).padStart(2, '0')}`;
    
    // Check if payroll already exists
    const existing = await this.prisma.hrSalaryRecord.findFirst({
      where: { period }
    });

    if (existing) {
      throw new BadRequestException(`Payroll for period ${period} already exists.`);
    }

    const employees = await this.prisma.hrEmployee.findMany({
      where: { status: 'ACTIVE' },
      include: { contracts: { where: { status: 'ACTIVE' } } }
    });

    const salaryRecords = [];

    // Aggregate commissions from Sales Module
    // Note: This directly queries CommissionRecord, assuming they are APPROVED
    const commissions = await this.prisma.commissionRecord.groupBy({
      by: ['staffId'],
      where: { year, month, status: 'APPROVED' },
      _sum: { commissionAmount: true }
    });

    const commissionMap = new Map();
    for (const c of commissions) {
      // Find hrEmployeeId matching this salesStaffId
      const salesStaff = await this.prisma.salesStaff.findUnique({
        where: { id: c.staffId },
        select: { hrEmployeeId: true }
      });
      if (salesStaff && salesStaff.hrEmployeeId) {
        commissionMap.set(salesStaff.hrEmployeeId, c._sum.commissionAmount || 0);
      }
    }

    for (const emp of employees) {
      const activeContract = emp.contracts[0];
      const baseSalary = activeContract ? activeContract.baseSalary : 0;
      const commission = commissionMap.get(emp.id) || 0;
      
      const record = await this.prisma.hrSalaryRecord.create({
        data: {
          employeeId: emp.id,
          period,
          year,
          month,
          baseSalaryValue: baseSalary,
          commission: commission,
          netPay: baseSalary + commission,
          status: 'DRAFT'
        }
      });
      salaryRecords.push(record);
    }

    this.logger.log(`Generated payroll for ${period} with ${salaryRecords.length} records.`);
    return salaryRecords;
  }

  async approvePayroll(period: string, approvedBy: string) {
    const records = await this.prisma.hrSalaryRecord.findMany({
      where: { period, status: 'DRAFT' } // Only draft records
    });

    if (records.length === 0) {
      throw new NotFoundException(`No draft payroll records found for period ${period}`);
    }

    const totalPayout = records.reduce((sum, r) => sum + r.netPay, 0);

    // 1. Update status to APPROVED
    await this.prisma.hrSalaryRecord.updateMany({
      where: { period, status: 'DRAFT' },
      data: { status: 'APPROVED' }
    });

    try {
      // 2. Automatically generate FinanceTransaction (EXPENSE) for the bulk payroll
      // Assuming a default Bank Account for salary payout (usually fixed, or we just use the first available BANK account)
      const bankAccount = await this.prisma.financeAccount.findFirst({
        where: { accountType: 'BANK', status: 'ACTIVE' }
      });

      let category = await this.prisma.financeCategory.findUnique({
        where: { categoryCode: 'SALARY' }
      });

      if (!category) {
        category = await this.prisma.financeCategory.create({
          data: { categoryCode: 'SALARY', categoryName: 'Lương nhân viên', type: 'EXPENSE' }
        });
      }

      if (bankAccount) {
        const financeEventPayload = {
          type: 'EXPENSE',
          amount: totalPayout,
          accountId: bankAccount.id,
          categoryId: category.id,
          note: `Thanh toán lương tháng ${period}`,
          status: 'DRAFT',
          receiverName: 'Tập thể Nhân viên',
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: new Date()
        };
        
        // Let's create the transaction directly since we have Prisma access to Finance tables
        const count = await this.prisma.financeTransaction.count({ where: { type: 'EXPENSE' } });
        const ptCode = `PC${(count + 1).toString().padStart(5, '0')}`;
        
        await this.prisma.financeTransaction.create({
          data: {
             ...financeEventPayload,
             transactionCode: ptCode
          }
        });
        this.logger.log(`Created FinanceTransaction Draft for Payroll ${period}`);
      }
    } catch (e) {
      this.logger.error(`Failed to auto-generate FinanceTransaction for Payroll`, e);
    }

    return { message: 'Payroll approved successfully' };
  }
}

