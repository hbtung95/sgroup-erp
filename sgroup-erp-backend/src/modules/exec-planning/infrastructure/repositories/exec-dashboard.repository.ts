import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ExecDashboardRepository {
  private readonly logger = new Logger(ExecDashboardRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalOverview() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalEmployees, activeProjects, activeDeals, 
      openLeads, totalRevenue, totalExpenses
    ] = await Promise.all([
      // 1. HR Stats
      this.prisma.hrEmployee.count({ where: { status: 'ACTIVE' } }),
      
      // 2. Project Stats
      this.prisma.projectPolicy.count({ where: { status: 'ACTIVE' } }),
      
      // 3. Sales Stats
      this.prisma.salesBooking.count({ where: { status: { in: ['PENDING', 'DEPOSIT_PAID'] } } }),
      
      // 4. Marketing Leads
      this.prisma.mktLead.count({ where: { status: 'NEW' } }),

      // 5. Finance Revenue (Sum of COMPLETED receipts)
      this.prisma.financeTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'RECEIPT', status: 'COMPLETED', paymentDate: { gte: startOfMonth } }
      }),

      // 6. Finance Expenses (Sum of COMPLETED payments)
      this.prisma.financeTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'PAYMENT', status: 'COMPLETED', paymentDate: { gte: startOfMonth } }
      })
    ]);

    return {
      overview: {
        totalEmployees,
        activeProjects,
        activeDeals,
        openLeads,
        mtdRevenue: totalRevenue._sum.amount || 0,
        mtdExpenses: totalExpenses._sum.amount || 0,
      },
      lastUpdated: new Date()
    };
  }

  async getDepartmentPulse(dept: 'SALES' | 'MK' | 'HR' | 'FINANCE') {
    // Stub for detailed breakdown per department if needed for specific Overview panels
    return { status: 'OK', dept, liveMetrics: [] };
  }
}
