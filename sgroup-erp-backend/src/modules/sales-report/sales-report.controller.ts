import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SalesReportService } from './sales-report.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('sales-report')
@UseGuards(RolesGuard)
export class SalesReportController {
  constructor(private readonly service: SalesReportService) {}

  @Get('kpi-cards')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getKpiCards(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
    @Query('staffId') staffId?: string,
  ) {
    return this.service.getKpiCards({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId, staffId,
    });
  }

  @Get('plan-vs-actual')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getPlanVsActual(
    @Query('year') year: string,
    @Query('scenarioKey') scenarioKey?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.service.getPlanVsActual({
      year: Number(year), scenarioKey, teamId,
    });
  }

  @Get('team-performance')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getTeamPerformance(
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.service.getTeamPerformance({
      year: Number(year),
      month: month ? Number(month) : undefined,
    });
  }

  @Get('staff-performance')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getStaffPerformance(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.service.getStaffPerformance({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId,
    });
  }

  @Get('funnel')
  @Roles('admin', 'employee', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getActualFunnel(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.service.getActualFunnel({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId,
    });
  }

  @Get('commission')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getCommissionReport(
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('teamId') teamId?: string,
    @Query('staffId') staffId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getCommissionReport({
      year: Number(year),
      month: month ? Number(month) : undefined,
      teamId, staffId, status,
    });
  }

  @Get('project-performance')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'ceo', 'sales_admin')
  async getProjectPerformance(@Query('year') year: string) {
    return this.service.getProjectPerformance({ year: Number(year) });
  }
}
