/**
 * Prisma Adapter — Customer Repository
 * Wraps PrismaService to implement ICustomerRepository.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ICustomerRepository, CustomerEntity } from '../../entity-repositories';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<CustomerEntity[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.isVip !== undefined) where.isVip = filters.isVip;
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } }) as any;
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.prisma.customer.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    return this.prisma.customer.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    return this.prisma.customer.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<CustomerEntity> {
    return this.prisma.customer.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() } as any,
    }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.year) where.year = filters.year;
    return this.prisma.customer.count({ where });
  }

  async getStats(filters?: { assignedTo?: string; year?: number; month?: number }) {
    const where: any = {};
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;

    const customers = await this.prisma.customer.findMany({ where });
    const byStatus = customers.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: customers.length,
      byStatus,
      vipCount: customers.filter(c => c.isVip).length,
    };
  }
}
