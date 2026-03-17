import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinanceTransactionService {
  private readonly logger = new Logger(FinanceTransactionService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async create(data: any) {
    // Generate transactionCode automatically
    const prefix = data.type === 'INCOME' ? 'PT' : 'PC';
    const count = await this.prisma.financeTransaction.count({
      where: {
        type: data.type,
      },
    });
    const seq = (count + 1).toString().padStart(5, '0');
    const transactionCode = `${prefix}${seq}`;

    // Auto update account balance if DRAFT -> APPROVED immediately? No, we will keep logic simple:
    // Balance updates ONLY happen upon Approval.

    return this.prisma.financeTransaction.create({
      data: {
        ...data,
        transactionCode,
      },
      include: {
        account: true,
        category: true,
      },
    });
  }

  async findAll(query: any) {
    const { type, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FinanceTransactionWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      this.prisma.financeTransaction.findMany({
        where,
        include: {
          account: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.financeTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.financeTransaction.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, data: any) {
    const transaction = await this.findOne(id);
    if (transaction.status === 'APPROVED' || transaction.status === 'CANCELLED') {
       throw new BadRequestException('Cannot modify approved or cancelled transactions.');
    }

    return this.prisma.financeTransaction.update({
      where: { id },
      data,
      include: {
        account: true,
        category: true,
      },
    });
  }

  async approve(id: string, approvedBy: string) {
    const transaction = await this.findOne(id);
    
    if (transaction.status !== 'DRAFT' && transaction.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Transaction is not in a payable state');
    }

    // Run in a transaction to ensure both account balance and transaction status are updated atomically
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTx = await tx.financeTransaction.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // Update account balance
      const balanceChange =
        transaction.type === 'INCOME' ? transaction.amount : -transaction.amount;

      await tx.financeAccount.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });

      return updatedTx;
    });
    
    // Emit event after transaction is successfully committed
    this.eventEmitter.emit('transaction.approved', result);
    this.logger.log(`Transaction ${id} approved and event emitted`);
    
    return result;
  }

  async remove(id: string) {
    const transaction = await this.findOne(id);
    if (transaction.status === 'APPROVED') {
       throw new BadRequestException('Cannot delete an approved transaction. Cancel it instead.');
    }
    return this.prisma.financeTransaction.delete({
      where: { id },
    });
  }

  async getDashboardStats() {
    // A simple aggregated stats function for the frontend dashboard
    const [totalIncome, totalExpense, accountBalances] = await Promise.all([
      this.prisma.financeTransaction.aggregate({
        where: { type: 'INCOME', status: 'APPROVED' },
        _sum: { amount: true },
      }),
      this.prisma.financeTransaction.aggregate({
        where: { type: 'EXPENSE', status: 'APPROVED' },
        _sum: { amount: true },
      }),
      this.prisma.financeAccount.findMany({
        select: {
          id: true,
          accountName: true,
          currentBalance: true,
          currency: true,
        }
      })
    ]);

    const totalCash = accountBalances.reduce((acc, account) => acc + Number(account.currentBalance), 0);

    return {
      stats: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        totalBalance: totalCash,
      },
      accounts: accountBalances,
    };
  }
}
