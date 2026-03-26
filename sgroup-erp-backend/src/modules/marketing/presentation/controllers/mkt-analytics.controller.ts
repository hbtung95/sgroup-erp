import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MktAnalyticsRepository } from '../../infrastructure/repositories/mkt-analytics.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketing/analytics')
export class MktAnalyticsController {
  constructor(private readonly analyticsRepo: MktAnalyticsRepository) {}

  @Get('channel-performance')
  @Roles('admin', 'cmo', 'ceo')
  getChannelPerformance(
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    const targetYear = year ? Number(year) : new Date().getFullYear();
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    return this.analyticsRepo.getChannelPerformanceSummary(targetYear, targetMonth);
  }
}
