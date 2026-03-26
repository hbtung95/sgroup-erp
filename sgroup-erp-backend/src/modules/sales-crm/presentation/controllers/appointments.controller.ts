import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales-crm/appointments')
export class AppointmentsController {
  constructor() {}

  @Get()
  findAll() {
    return [];
  }

  @Post()
  create(@Body() data: any) {
    return { success: true };
  }
}
