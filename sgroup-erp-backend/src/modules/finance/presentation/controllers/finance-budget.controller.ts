import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FinanceBudgetRepository } from '../../infrastructure/repositories/finance-budget.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance/budgets')
export class FinanceBudgetController {
  constructor(private readonly budgetRepo: FinanceBudgetRepository) {}

  @Get()
  @Roles('admin', 'cfo', 'accountant')
  findAll() {
    return this.budgetRepo.findAll();
  }

  @Get('variance/:categoryId/:year/:month')
  @Roles('admin', 'cfo')
  checkVariance(
    @Param('categoryId') categoryId: string,
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.budgetRepo.checkBudgetVariance(categoryId, Number(year), Number(month));
  }
}
