import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FinanceBudgetRepository {
  private readonly logger = new Logger(FinanceBudgetRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  // Calculate Variance natively mapping Budget against actual Expenses
  async checkBudgetVariance(categoryId: string, year: number, month: number) {
    const budget = await this.prisma.financeBudget.findUnique({
      where: { year_month_categoryId: { year, month, categoryId } }
    });

    if (!budget) return null;

    // Aggregate real expenses for this month/category
    const expenses = await this.prisma.financeTransaction.aggregate({
      where: {
        categoryId, type: 'EXPENSE', status: 'APPROVED',
        paymentDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      _sum: { amount: true }
    });

    const actual = expenses._sum.amount || 0;
    const variance = Number(budget.budgetAmount) - Number(actual);

    // Auto-update strictly tracking the CFO's Variance
    await this.prisma.financeBudget.update({
      where: { id: budget.id },
      data: { actualAmount: actual, variance }
    });

    this.logger.log(`Updated Budget Variance for Cat: ${categoryId}. Variance: ${variance}`);
    return { budgetAmount: budget.budgetAmount, actualAmount: actual, variance };
  }

  async findAll() {
    return this.prisma.financeBudget.findMany({
      include: { category: { select: { categoryName: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
  }
}
