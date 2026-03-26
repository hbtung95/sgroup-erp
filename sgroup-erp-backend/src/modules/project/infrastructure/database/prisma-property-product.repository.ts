import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IPropertyProductRepository } from '../../domain/repositories/property-product.repository.interface';

@Injectable()
export class PrismaPropertyProductRepository implements IPropertyProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.propertyProduct.create({ data });
  }

  async findAllByProject(projectId: string, skip?: number, take?: number, status?: string): Promise<{ data: any[]; total: number }> {
    const where: any = { projectId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.propertyProduct.findMany({
        where,
        orderBy: { code: 'asc' },
        skip,
        take,
      }),
      this.prisma.propertyProduct.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.propertyProduct.findUnique({ where: { id } });
  }

  async findByCode(code: string): Promise<any[]> {
    return this.prisma.propertyProduct.findMany({ where: { code } });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.propertyProduct.update({ where: { id }, data });
  }

  async delete(id: string): Promise<any> {
    return this.prisma.propertyProduct.delete({ where: { id } });
  }

  async lockProduct(id: string, staffName: string | null, lockedUntil: Date): Promise<any> {
    const result = await this.prisma.propertyProduct.updateMany({
      where: { id, status: 'AVAILABLE' },
      data: { status: 'LOCKED', bookedBy: staffName, lockedUntil },
    });
    return result;
  }

  async unlockProduct(id: string): Promise<any> {
    return this.prisma.propertyProduct.updateMany({
      where: { id, status: 'LOCKED' },
      data: { status: 'AVAILABLE', bookedBy: null, lockedUntil: null },
    });
  }

  async unlockExpiredLocks(): Promise<number> {
    const result = await this.prisma.propertyProduct.updateMany({
      where: {
        status: 'LOCKED',
        lockedUntil: { lt: new Date() },
      },
      data: {
        status: 'AVAILABLE',
        bookedBy: null,
        lockedUntil: null,
      },
    });
    return result.count;
  }

  async countSold(projectId: string): Promise<number> {
    return this.prisma.propertyProduct.count({
      where: { projectId, status: 'SOLD' },
    });
  }

  async countTotal(projectId: string): Promise<number> {
    return this.prisma.propertyProduct.count({ where: { projectId } });
  }

  async updateProjectUnits(projectId: string, soldUnits?: number, totalUnits?: number): Promise<void> {
    const data: any = {};
    if (soldUnits !== undefined) data.soldUnits = soldUnits;
    if (totalUnits !== undefined) data.totalUnits = totalUnits;
    if (Object.keys(data).length > 0) {
      await this.prisma.dimProject.update({
        where: { id: projectId },
        data,
      });
    }
  }

  async batchCreate(data: any[]): Promise<any> {
    return this.prisma.propertyProduct.createMany({ data });
  }

  async findExistingCodes(projectId: string, codes: string[]): Promise<string[]> {
    const existingCodes = await this.prisma.propertyProduct.findMany({
      where: { projectId, code: { in: codes } },
      select: { code: true },
    });
    return existingCodes.map((e: any) => e.code);
  }

  async logStatusChange(productId: string, oldStatus: string, newStatus: string, changedBy?: string, reason?: string): Promise<void> {
    await this.prisma.productStatusLog.create({
      data: { productId, oldStatus, newStatus, changedBy, reason },
    });
  }
}
