import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales-crm/activities')
export class ActivitiesController {
  // Mock inject Service for this all-in architectural representation
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
