import { Module } from '@nestjs/common';
import { FinanceController } from './presentation/controllers/finance.controller';
import { FinanceDebtController } from './presentation/controllers/finance-debt.controller';
import { FinanceBudgetController } from './presentation/controllers/finance-budget.controller';
import { FinanceReportController } from './presentation/controllers/finance-report.controller';
import { FinanceService } from './application/services/finance.service';
import { SalesToFinanceSyncService } from './application/services/sales-to-finance-sync.service';
import { FinanceAccountRepository } from './infrastructure/repositories/finance-account.repository';
import { FinanceTransactionRepository } from './infrastructure/repositories/finance-transaction.repository';
import { DebtRecordRepository } from './infrastructure/repositories/debt-record.repository';
import { FinanceBudgetRepository } from './infrastructure/repositories/finance-budget.repository';
import { FinanceReportRepository } from './infrastructure/repositories/finance-report.repository';

@Module({
  controllers: [
    FinanceController, 
    FinanceDebtController, 
    FinanceBudgetController,
    FinanceReportController
  ],
  providers: [
    FinanceService,
    SalesToFinanceSyncService,
    FinanceAccountRepository,
    FinanceTransactionRepository,
    DebtRecordRepository,
    FinanceBudgetRepository,
    FinanceReportRepository
  ],
  exports: [FinanceService, SalesToFinanceSyncService]
})
export class FinanceModule {}
