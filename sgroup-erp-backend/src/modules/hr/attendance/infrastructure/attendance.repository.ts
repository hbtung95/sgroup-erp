import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, HrAttendance } from '@prisma/client';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.HrAttendanceUncheckedCreateInput): Promise<HrAttendance> {
    return this.prisma.hrAttendance.create({ data });
  }

  async findByEmployeeAndDate(employeeId: string, date: Date): Promise<HrAttendance | null> {
    return this.prisma.hrAttendance.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HrAttendanceWhereInput;
    orderBy?: Prisma.HrAttendanceOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hrAttendance.findMany({ skip, take, where, orderBy, include: { employee: true } }),
      this.prisma.hrAttendance.count({ where }),
    ]);
    return { items, total };
  }

  async update(id: string, data: Prisma.HrAttendanceUpdateInput): Promise<HrAttendance> {
    return this.prisma.hrAttendance.update({
      where: { id },
      data,
    });
  }
}
