import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(private readonly auditRepo: AuditLogRepository) {}

  @Get()
  @Roles('admin', 'ceo')
  getLogs(@Query('limit') limit: string, @Query('page') page: string) {
    return this.auditRepo.fetchLogs(limit ? Number(limit) : 50, page ? Number(page) : 1);
  }

  @Get('analytics')
  @Roles('admin', 'ceo')
  getAnalytics(@Query('days') days: string) {
    return this.auditRepo.getAggregatedAnalytics(days ? Number(days) : 30);
  }
}
