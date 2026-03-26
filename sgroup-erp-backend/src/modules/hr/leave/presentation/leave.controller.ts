import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LeaveService } from '../application/leave.service';
import { CreateLeaveDto } from '../domain/dtos/create-leave.dto';
import { ReviewLeaveDto } from '../domain/dtos/review-leave.dto';

@Controller('hr/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRequest(@Body() createDto: CreateLeaveDto) {
    return this.leaveService.requestLeave(createDto);
  }

  @Get()
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    
    return this.leaveService.getAllLeaves(employeeId, status, pageNumber, limitNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leaveService.getLeaveById(id);
  }

  @Put(':id/review')
  async reviewLeave(@Param('id') id: string, @Body() reviewDto: ReviewLeaveDto) {
    return this.leaveService.reviewLeaveRequest(id, reviewDto);
  }
}
