import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FinanceAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.financeAccount.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { accountName: 'asc' }
    });
  }

  async findById(id: string) {
    return this.prisma.financeAccount.findUnique({
      where: { id },
      include: {
        transactions: { take: 10, orderBy: { paymentDate: 'desc' } }
      }
    });
  }
}
