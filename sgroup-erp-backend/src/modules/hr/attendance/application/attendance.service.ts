import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceRepository } from '../infrastructure/attendance.repository';
import { CreateAttendanceDto } from '../domain/dtos/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepo: AttendanceRepository) {}

  async checkIn(dto: CreateAttendanceDto) {
    const dateObj = new Date(dto.date);
    const existing = await this.attendanceRepo.findByEmployeeAndDate(dto.employeeId, dateObj);
    if (existing) {
      throw new BadRequestException('Bản ghi chấm công cho ngày này đã tồn tại.');
    }

    return this.attendanceRepo.create({
      employeeId: dto.employeeId,
      date: dateObj,
      checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : null,
      checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
      workingHours: dto.workingHours || 0,
      note: dto.note,
    });
  }

  async getAllAttendance(employeeId?: string, month?: number, year?: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = { gte: startDate, lte: endDate };
    }

    return this.attendanceRepo.findAll({
      skip, take: limit, where, orderBy: { date: 'desc' }
    });
  }
}
