import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FinanceReportRepository {
  private readonly logger = new Logger(FinanceReportRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  // 1. Profit & Loss (P&L) Statement
  async getProfitAndLoss(startDate: Date, endDate: Date) {
    const revenue = await this.prisma.financeTransaction.aggregate({
      where: { type: 'INCOME', status: 'APPROVED', paymentDate: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    });
    
    const expenses = await this.prisma.financeTransaction.aggregate({
      where: { type: 'EXPENSE', status: 'APPROVED', paymentDate: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    });

    const totalRevenue = Number(revenue._sum.amount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const netIncome = totalRevenue - totalExpenses;
    
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, netIncome, profitMargin: Number(profitMargin.toFixed(2)) };
  }

  // 2. Cash Flow Statement (Monthly grouping)
  async getCashFlow(year: number) {
    // Note: A true DB-agnostic monthly aggregation would pull and group in-memory or use raw SQL 
    // Here we pull boundaries to simplify
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const txs = await this.prisma.financeTransaction.findMany({
      where: { status: 'APPROVED', paymentDate: { gte: startDate, lte: endDate } },
      select: { amount: true, type: true, paymentDate: true }
    });

    const monthlyFlow = Array.from({ length: 12 }, () => ({ inflow: 0, outflow: 0, net: 0 }));

    txs.forEach(tx => {
      const month = tx.paymentDate.getMonth();
      const amt = Number(tx.amount);
      if (tx.type === 'INCOME') monthlyFlow[month].inflow += amt;
      else monthlyFlow[month].outflow += amt;
      monthlyFlow[month].net = monthlyFlow[month].inflow - monthlyFlow[month].outflow;
    });

    return monthlyFlow;
  }

  // 3. The Holy Grail: Balance Sheet (Bảng Cân Đối Kế Toán)
  async getBalanceSheet() {
    // Assets (Tài sản) = Bank Balances + Receivables (Phải thu)
    const accounts = await this.prisma.financeAccount.aggregate({ _sum: { currentBalance: true } });
    const cashAssets = Number(accounts._sum.currentBalance || 0);

    const receivables = await this.prisma.debtRecord.aggregate({
      where: { debtType: { in: ['RECEIVABLE_CUSTOMER', 'RECEIVABLE_DEVELOPER'] }, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
      _sum: { remainingAmount: true }
    });
    const totalReceivables = Number(receivables._sum.remainingAmount || 0);

    const totalAssets = cashAssets + totalReceivables;

    // Liabilities (Nợ phải trả) = Payables (Phải trả)
    const payables = await this.prisma.debtRecord.aggregate({
      where: { debtType: 'PAYABLE_STAFF', status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
      _sum: { remainingAmount: true }
    });
    const totalLiabilities = Number(payables._sum.remainingAmount || 0);

    // Equity (Vốn CSH) = Assets - Liabilities
    const equity = totalAssets - totalLiabilities;

    return {
      assets: {
        cashAndEquivalents: cashAssets,
        accountsReceivable: totalReceivables,
        totalAssets
      },
      liabilities: {
        accountsPayable: totalLiabilities,
        totalLiabilities
      },
      equity: {
        totalEquity: equity
      },
      isBalanced: totalAssets === (totalLiabilities + equity) // The Golden Rule
    };
  }
}
