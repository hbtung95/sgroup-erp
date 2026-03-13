import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DebtRecordService {
  private readonly logger = new Logger(DebtRecordService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const count = await this.prisma.debtRecord.count();
    const seq = (count + 1).toString().padStart(5, '0');
    const debtCode = `CN${seq}`;

    return this.prisma.debtRecord.create({
      data: {
        ...data,
        debtCode,
        remainingAmount: data.totalAmount, // Initially remaining is total
      },
    });
  }

  async findAll(query: any) {
    const { debtType, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DebtRecordWhereInput = {};
    if (debtType) where.debtType = debtType;
    if (status) where.status = status;

    const [debts, total] = await Promise.all([
      this.prisma.debtRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.debtRecord.count({ where }),
    ]);

    return {
      data: debts,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  async findOne(id: string) {
    const debt = await this.prisma.debtRecord.findUnique({
      where: { id },
      include: {
        transaction: true,
      },
    });
    if (!debt) {
      throw new NotFoundException(`Debt with ID ${id} not found`);
    }
    return debt;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.debtRecord.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.debtRecord.delete({
      where: { id },
    });
  }

  // ──────────────────────────── EVENT LISTENERS ────────────────────────────

  @OnEvent('deal.status_changed')
  async handleDealStatusChanged(payload: { oldDeal: any, newDeal: any }) {
    const { oldDeal, newDeal } = payload;
    
    if (newDeal.stage !== oldDeal.stage && ['DEPOSIT', 'CONTRACT'].includes(newDeal.stage)) {
      try {
        const existingDebt = await this.prisma.debtRecord.findFirst({
          where: { dealId: newDeal.id, debtType: 'RECEIVABLE_CUSTOMER' }
        });
        
        if (!existingDebt) {
          await this.create({
            debtType: 'RECEIVABLE_CUSTOMER',
            projectId: newDeal.projectId,
            staffId: newDeal.staffId,
            dealId: newDeal.id,
            totalAmount: newDeal.dealValue * 1000000000, // Assuming dealValue is in Billions, converting to VND. If already VND, remove *1B. (Schema says "Tỷ")
            note: `Công nợ tự cập nhật từ Deal ${newDeal.dealCode || 'ID: ' + newDeal.id}`
          });
          this.logger.log(`Created DebtRecord for Deal ${newDeal.id}`);
        }
      } catch (error) {
        this.logger.error(`Failed to create DebtRecord for Deal ${newDeal.id}`, error);
      }
    }
  }
}
