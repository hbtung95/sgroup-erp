import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PayrollService } from '../application/payroll.service';
import { GeneratePayrollDto, ApprovePayrollDto } from '../domain/dtos/generate-payroll.dto';

@Controller('hr/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  async getPayroll(
    @Query('period') period: string,
    @Query('status') status?: string,
  ) {
    if (!period) return [];
    return this.payrollService.getPayrollByPeriod(period, status);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generateMonthlyPayroll(dto);
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Body() dto: ApprovePayrollDto) {
    return this.payrollService.approvePayroll(dto);
  }
}
