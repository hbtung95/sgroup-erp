import { Injectable, Logger } from '@nestjs/common';
import { FinanceAccountRepository } from '../../infrastructure/repositories/finance-account.repository';
import { FinanceTransactionRepository } from '../../infrastructure/repositories/finance-transaction.repository';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  
  constructor(
    private readonly accountRepo: FinanceAccountRepository,
    private readonly transactionRepo: FinanceTransactionRepository
  ) {}

  async getAllAccounts() {
    return this.accountRepo.findAll();
  }

  async getAccountById(id: string) {
    return this.accountRepo.findById(id);
  }

  async getAllTransactions(skip?: number, take?: number, type?: string) {
    return this.transactionRepo.findAll(skip, take, type);
  }

  // CORE LOGIC: Record a new income or expense transaction
  async recordTransaction(data: any, staffId: string) {
    this.logger.log(`Attempting to record Finance Transaction by ${staffId}: ${data.amount} VND`);
    return this.transactionRepo.createTransaction({
      ...data,
      createdBy: staffId
    });
  }
}
