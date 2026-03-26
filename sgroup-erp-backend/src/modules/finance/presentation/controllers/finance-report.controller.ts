import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinanceReportRepository } from '../../infrastructure/repositories/finance-report.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/reports')
export class FinanceReportController {
  constructor(private readonly reportRepo: FinanceReportRepository) {}

  @Get('pnl')
  @Roles('admin', 'cfo', 'ceo', 'accountant')
  getProfitAndLoss(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    return this.reportRepo.getProfitAndLoss(start, end);
  }

  @Get('cash-flow')
  @Roles('admin', 'cfo', 'ceo', 'accountant')
  getCashFlow(@Query('year') year: string) {
    const targetYear = year ? Number(year) : new Date().getFullYear();
    return this.reportRepo.getCashFlow(targetYear);
  }

  @Get('balance-sheet')
  @Roles('admin', 'cfo', 'ceo')
  getBalanceSheet() {
    return this.reportRepo.getBalanceSheet();
  }
}
