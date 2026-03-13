import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FinanceAccountService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.financeAccount.create({ data });
  }

  async findAll() {
    return this.prisma.financeAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.financeAccount.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.financeAccount.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.financeAccount.delete({
      where: { id },
    });
  }
}
