/**
 * Prisma Adapter — Product Repository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IProductRepository, ProductEntity } from '../../entity-repositories';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<ProductEntity[]> {
    const where: any = {};
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    if (filters?.block) where.block = filters.block;
    if (filters?.bedrooms) where.bedrooms = filters.bedrooms;
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters?.minPrice) where.price.gte = filters.minPrice;
      if (filters?.maxPrice) where.price.lte = filters.maxPrice;
    }
    return this.prisma.propertyProduct.findMany({
      where,
      orderBy: [{ block: 'asc' }, { floor: 'asc' }, { code: 'asc' }],
    }) as any;
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.prisma.propertyProduct.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    return this.prisma.propertyProduct.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity> {
    return this.prisma.propertyProduct.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<ProductEntity> {
    return this.prisma.propertyProduct.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date() } as any,
    }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    return this.prisma.propertyProduct.count({ where });
  }

  async getStats(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const products = await this.prisma.propertyProduct.findMany({ where });
    const byStatus = products.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: products.length,
      byStatus,
      totalValue: products.reduce((s, p) => s + Number(p.price), 0),
      availableValue: products.filter(p => p.status === 'AVAILABLE').reduce((s, p) => s + Number(p.price), 0),
    };
  }

  async atomicLock(id: string, bookedBy: string, lockedUntil: Date): Promise<boolean> {
    const result = await this.prisma.propertyProduct.updateMany({
      where: { id, status: 'AVAILABLE' },
      data: { status: 'LOCKED', bookedBy, lockedUntil },
    });
    return result.count > 0;
  }

  async atomicUnlock(id: string): Promise<boolean> {
    const result = await this.prisma.propertyProduct.updateMany({
      where: { id, status: 'LOCKED' },
      data: { status: 'AVAILABLE', bookedBy: null, lockedUntil: null },
    });
    return result.count > 0;
  }
}
