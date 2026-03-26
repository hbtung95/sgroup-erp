import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma, HrLeaveRequest } from '@prisma/client';

@Injectable()
export class LeaveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(data: Prisma.HrLeaveRequestUncheckedCreateInput): Promise<HrLeaveRequest> {
    return this.prisma.$transaction(async (tx) => {
      // RED FLAG: Atomic Transaction required for Leave Balances
      const year = new Date(data.startDate).getFullYear();
      
      const balance = await tx.hrLeaveBalance.findUnique({
        where: { employeeId_year: { employeeId: data.employeeId, year } },
      });

      if (!balance) {
        throw new BadRequestException('Bản ghi số dư phép năm cho nhân viên không tồn tại.');
      }

      if (balance.remaining < (data.totalDays as number)) {
        throw new BadRequestException('Số ngày phép còn lại không đủ để xin nghỉ.');
      }

      // 1. Log request
      const leaveRequest = await tx.hrLeaveRequest.create({ data });

      // 2. Lock balance update
      await tx.hrLeaveBalance.update({
        where: { id: balance.id },
        data: {
          pending: balance.pending + (data.totalDays as number),
          remaining: balance.remaining - (data.totalDays as number),
        },
      });

      return leaveRequest;
    });
  }

  async findById(id: string): Promise<HrLeaveRequest | null> {
    return this.prisma.hrLeaveRequest.findUnique({
      where: { id },
      include: { employee: true, approver: true },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HrLeaveRequestWhereInput;
    orderBy?: Prisma.HrLeaveRequestOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hrLeaveRequest.findMany({ skip, take, where, orderBy, include: { employee: true } }),
      this.prisma.hrLeaveRequest.count({ where }),
    ]);
    return { items, total };
  }

  async updateRequestStatus(id: string, approverId: string, status: 'APPROVED' | 'REJECTED', note?: string): Promise<HrLeaveRequest> {
    return this.prisma.$transaction(async (tx) => {
      const leave = await tx.hrLeaveRequest.findUnique({ where: { id } });
      if (!leave || leave.status !== 'PENDING') {
        throw new BadRequestException('Đơn xin nghỉ phép không tồn tại hoặc đã được xử lý.');
      }

      const year = leave.startDate.getFullYear();
      const balance = await tx.hrLeaveBalance.findUnique({
        where: { employeeId_year: { employeeId: leave.employeeId, year } },
      });

      if (!balance) {
        throw new BadRequestException('Không tìm thấy quỹ phép năm của nhân viên để tất toán.');
      }

      // Update Leave status
      const updatedLeave = await tx.hrLeaveRequest.update({
        where: { id },
        data: { status, approverId, approvedAt: new Date(), note },
      });

      // Update balances based on decision
      if (status === 'APPROVED') {
        await tx.hrLeaveBalance.update({
          where: { id: balance.id },
          data: {
            pending: balance.pending - leave.totalDays,
            used: balance.used + leave.totalDays,
          },
        });
      } else if (status === 'REJECTED') {
        // Rollback pending to remaining
        await tx.hrLeaveBalance.update({
          where: { id: balance.id },
          data: {
            pending: balance.pending - leave.totalDays,
            remaining: balance.remaining + leave.totalDays,
          },
        });
      }

      return updatedLeave;
    });
  }
}
