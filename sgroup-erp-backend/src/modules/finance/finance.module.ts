import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinanceAccountController } from './controllers/account.controller';
import { FinanceCategoryController } from './controllers/category.controller';
import { FinanceTransactionController } from './controllers/transaction.controller';
import { DebtRecordController } from './controllers/debt.controller';

import { FinanceAccountService } from './services/account.service';
import { FinanceCategoryService } from './services/category.service';
import { FinanceTransactionService } from './services/transaction.service';
import { DebtRecordService } from './services/debt.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    FinanceAccountController,
    FinanceCategoryController,
    FinanceTransactionController,
    DebtRecordController,
  ],
  providers: [
    FinanceAccountService,
    FinanceCategoryService,
    FinanceTransactionService,
    DebtRecordService,
  ],
  exports: [
    FinanceAccountService,
    FinanceCategoryService,
    FinanceTransactionService,
    DebtRecordService,
  ],
})
export class FinanceModule {}
