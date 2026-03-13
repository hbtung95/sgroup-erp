import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FinanceCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.financeCategory.create({ data });
  }

  async findAll() {
    return this.prisma.financeCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.financeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.financeCategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.financeCategory.delete({
      where: { id },
    });
  }
}
