import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from '../../application/services/finance.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('accounts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'cfo', 'accountant')
  findAllAccounts() {
    return this.financeService.getAllAccounts();
  }

  @Get('accounts/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'cfo', 'accountant')
  findAccountDetails(@Param('id') id: string) {
    return this.financeService.getAccountById(id);
  }

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'cfo', 'accountant', 'sales_manager')
  findAllTransactions(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string
  ) {
    return this.financeService.getAllTransactions(skip ? +skip : undefined, take ? +take : undefined, type);
  }

  @Post('transactions/record')
  @UseGuards(RolesGuard)
  @Roles('admin', 'cfo', 'accountant') // Only strict financial staff can touch the ledger directly
  recordTransaction(@Body() data: any, @Req() req: any) {
    const staffId = req.user?.id || 'SYSTEM_MOCK_USER';
    return this.financeService.recordTransaction(data, staffId);
  }
}
