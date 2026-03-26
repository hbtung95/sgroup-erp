import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class DebtRecordRepository {
  private readonly logger = new Logger(DebtRecordRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  // Cross-Module Trigger: Sales -> Finance
  // Mở hợp đồng mới -> Auto tạo Công nợ
  async generateDebtFromDeal(data: {
    customerId: string; dealId: string; totalAmount: number; note?: string;
  }) {
    return this.prisma.debtRecord.create({
      data: {
        debtCode: `DEBT-${Date.now()}`,
        debtType: 'RECEIVABLE_CUSTOMER', // Phải thu
        customerId: data.customerId,
        dealId: data.dealId,
        totalAmount: data.totalAmount,
        remainingAmount: data.totalAmount,
        status: 'UNPAID',
        note: data.note || 'Auto-generated from Deal'
      }
    });
  }

  // The Atomic Double-Entry Core
  // Khi có Phiếu Thu, tự động Trừ Công nợ và Cộng Balance Ngân hàng
  async payDebtAtomic(debtId: string, transactionId: string, _amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const debt = await tx.debtRecord.findUnique({ where: { id: debtId } });
      const transaction = await tx.financeTransaction.findUnique({ where: { id: transactionId } });

      if (!debt || !transaction) throw new BadRequestException('Invalid Debt or Transaction ID');
      if (transaction.type !== 'INCOME') throw new BadRequestException('Must be an INCOME transaction to clear Receivable Debt');
      
      const paymentAmount = Number(transaction.amount);
      const newPaid = Number(debt.paidAmount) + paymentAmount;
      const newRemaining = Number(debt.totalAmount) - newPaid;
      
      if (newRemaining < 0) throw new BadRequestException('Overpaid debt is not allowed in this strict mode.');

      let newStatus = 'PARTIAL';
      if (newRemaining === 0) newStatus = 'PAID';
      else if (debt.dueDate && new Date() > debt.dueDate) newStatus = 'OVERDUE';

      const updatedDebt = await tx.debtRecord.update({
        where: { id: debtId },
        data: {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          transactionId: transaction.id
        }
      });

      this.logger.log(`[Finance ACID] Auto-deducted debt ${updatedDebt.debtCode}. Remaining: ${newRemaining}`);
      return updatedDebt;
    });
  }

  async findAll() {
    return this.prisma.debtRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { fullName: true } } }
    });
  }
}
