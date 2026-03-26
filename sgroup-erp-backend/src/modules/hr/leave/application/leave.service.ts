import { Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRepository } from '../infrastructure/leave.repository';
import { CreateLeaveDto } from '../domain/dtos/create-leave.dto';
import { ReviewLeaveDto } from '../domain/dtos/review-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly leaveRepo: LeaveRepository) {}

  async requestLeave(dto: CreateLeaveDto) {
    return this.leaveRepo.createRequest({
      employeeId: dto.employeeId,
      leaveType: dto.leaveType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      totalDays: dto.totalDays,
      reason: dto.reason,
      status: 'PENDING',
    });
  }

  async getLeaveById(id: string) {
    const leave = await this.leaveRepo.findById(id);
    if (!leave) {
      throw new NotFoundException(`Leave Request ${id} not found.`);
    }
    return leave;
  }

  async getAllLeaves(employeeId?: string, status?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    return this.leaveRepo.findAll({
      skip, take: limit, where, orderBy: { createdAt: 'desc' },
    });
  }

  async reviewLeaveRequest(id: string, dto: ReviewLeaveDto) {
    return this.leaveRepo.updateRequestStatus(id, dto.approverId, dto.status, dto.note);
  }
}
