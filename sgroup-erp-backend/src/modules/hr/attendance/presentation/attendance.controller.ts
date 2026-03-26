import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AttendanceService } from '../application/attendance.service';
import { CreateAttendanceDto } from '../domain/dtos/create-attendance.dto';

@Controller('hr/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRecord(@Body() createDto: CreateAttendanceDto) {
    return this.attendanceService.checkIn(createDto);
  }

  @Get()
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    const monthNumber = month ? parseInt(month, 10) : undefined;
    const yearNumber = year ? parseInt(year, 10) : undefined;
    
    return this.attendanceService.getAllAttendance(employeeId, monthNumber, yearNumber, pageNumber, limitNumber);
  }
}
