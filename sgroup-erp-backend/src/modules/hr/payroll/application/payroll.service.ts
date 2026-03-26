import { Injectable, BadRequestException } from '@nestjs/common';
import { PayrollRepository } from '../infrastructure/payroll.repository';
import { GeneratePayrollDto, ApprovePayrollDto } from '../domain/dtos/generate-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly payrollRepo: PayrollRepository) {}

  async generateMonthlyPayroll(dto: GeneratePayrollDto) {
    const start = Date.now();
    const count = await this.payrollRepo.generatePayrollForMonth(dto.year, dto.month);
    return {
      message: `Generated ${count} payroll records successfully.`,
      processingTimeMs: Date.now() - start,
    };
  }

  async getPayrollByPeriod(period: string, status?: string) {
    return this.payrollRepo.findByPeriod(period, status);
  }

  async approvePayroll(dto: ApprovePayrollDto) {
    const updatedCount = await this.payrollRepo.updateStatus(dto.period, 'APPROVED', dto.approvedBy);
    if (updatedCount === 0) {
      throw new BadRequestException('No DRAFT payroll records found for this period to approve.');
    }
    return { message: `Approved ${updatedCount} payroll records for period ${dto.period}` };
  }
}
