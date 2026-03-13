import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async findAll(
    @Query('staffId') staffId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.findAll({
      staffId, customerId, status, type,
      dateFrom, dateTo, projectId,
    });
  }

  @Get('today')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async today(@Query('staffId') staffId: string) {
    return this.service.today(staffId);
  }

  @Get(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async create(@Body() body: {
    staffId: string; staffName?: string;
    customerId?: string; customerName?: string; customerPhone?: string;
    projectId?: string; projectName?: string;
    type?: string; scheduledAt: string; duration?: number;
    location?: string; note?: string;
  }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
