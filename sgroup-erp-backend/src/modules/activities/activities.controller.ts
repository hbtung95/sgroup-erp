import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('activities')
@UseGuards(RolesGuard)
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get()
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async findAll(
    @Query('staffId') staffId?: string,
    @Query('teamId') teamId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.findAll({
      staffId,
      teamId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      dateFrom, dateTo,
    });
  }

  @Get('summary')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getSummary(
    @Query('staffId') staffId?: string,
    @Query('teamId') teamId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('period') period?: string,
  ) {
    return this.service.getSummary({
      staffId,
      teamId,
      year: Number(year || new Date().getFullYear()),
      month: month ? Number(month) : undefined,
      period: (period as any) || 'month',
    });
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
    teamId?: string; teamName?: string;
    postsCount?: number; callsCount?: number;
    newLeads?: number; meetingsMade?: number;
    note?: string; year: number; month: number; date?: string;
  }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
