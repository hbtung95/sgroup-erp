import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FinanceTransactionRepository {
  private readonly logger = new Logger(FinanceTransactionRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: {
    transactionCode: string;
    type: string; // INCOME, EXPENSE
    amount: number;
    accountId: string;
    categoryId: string;
    paymentMethod: string;
    paymentDate: Date;
    note?: string;
    createdBy?: string;
  }) {
    // Stage 1 Fix: The core of Accounting - ACID Database Transactions
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.financeAccount.findUnique({
        where: { id: data.accountId }
      });

      if (!account) {
        throw new BadRequestException('Tài khoản ngân hàng/Tiền mặt không tồn tại.');
      }
      if (account.status !== 'ACTIVE') {
        throw new BadRequestException('Tài khoản đã bị vô hiệu hóa.');
      }

      // Safe decimal math simulation (Prisma handles Decimal properly, but validation is needed)
      if (data.amount <= 0) {
        throw new BadRequestException('Số tiền giao dịch phải lớn hơn 0.');
      }

      // Check balance for EXPENSE
      if (data.type === 'EXPENSE' && Number(account.currentBalance) < data.amount) {
        throw new BadRequestException(`Tài khoản ${account.accountName} không đủ số dư để thực hiện lệnh Chi.`);
      }

      // 1. Create the Transaction history ledger
      const transaction = await tx.financeTransaction.create({
        data: {
          transactionCode: data.transactionCode,
          type: data.type,
          amount: data.amount,
          accountId: data.accountId,
          categoryId: data.categoryId,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          status: 'APPROVED', // Assuming direct execution for now
          note: data.note,
          createdBy: data.createdBy,
        }
      });

      // 2. Atomically Update the Current Balance
      const balanceOperator = data.type === 'INCOME' ? 'increment' : 'decrement';
      await tx.financeAccount.update({
        where: { id: data.accountId },
        data: {
          currentBalance: {
            [balanceOperator]: data.amount
          }
        }
      });

      this.logger.log(`Created Finance Ledger ${data.transactionCode}. Atomically updated ${data.accountId} ${balanceOperator} ${data.amount}.`);
      return transaction;
    });
  }

  async findAll(skip?: number, take?: number, type?: string) {
    const where: any = {};
    if (type) where.type = type;
    
    return this.prisma.financeTransaction.findMany({
      skip, take, where,
      orderBy: { paymentDate: 'desc' },
      include: {
        account: { select: { accountName: true, accountType: true } },
        category: { select: { categoryName: true } }
      }
    });
  }
}
