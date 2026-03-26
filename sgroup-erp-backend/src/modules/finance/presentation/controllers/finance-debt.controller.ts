import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DebtRecordRepository } from '../../infrastructure/repositories/debt-record.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/debts')
export class FinanceDebtController {
  constructor(private readonly debtRepo: DebtRecordRepository) {}

  @Get()
  @Roles('admin', 'cfo', 'accountant', 'sales_manager')
  findAll() {
    return this.debtRepo.findAll();
  }

  @Post(':id/pay')
  @Roles('admin', 'cfo', 'accountant')
  payDebt(@Param('id') id: string, @Body() data: { transactionId: string; amount: number }) {
    return this.debtRepo.payDebtAtomic(id, data.transactionId, data.amount);
  }
}
