import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, HrEmployee } from '@prisma/client';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.HrEmployeeUncheckedCreateInput): Promise<HrEmployee> {
    return this.prisma.hrEmployee.create({ data });
  }

  async findById(id: string): Promise<HrEmployee | null> {
    return this.prisma.hrEmployee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        team: true,
        manager: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HrEmployeeWhereInput;
    orderBy?: Prisma.HrEmployeeOrderByWithRelationInput;
  }): Promise<{ items: HrEmployee[]; total: number }> {
    const { skip, take, where, orderBy } = params;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hrEmployee.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
           department: true,
           position: true,
        }
      }),
      this.prisma.hrEmployee.count({ where }),
    ]);
    return { items, total };
  }

  async update(id: string, data: Prisma.HrEmployeeUpdateInput): Promise<HrEmployee> {
    return this.prisma.hrEmployee.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<HrEmployee> {
    // Implementing architecture RED FLAG: No hard deletes.
    return this.prisma.hrEmployee.update({
      where: { id },
      data: { status: 'TERMINATED', leaveDate: new Date() },
    });
  }
}
