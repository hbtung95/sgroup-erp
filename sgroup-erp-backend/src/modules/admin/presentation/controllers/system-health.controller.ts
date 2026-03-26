import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemHealthRepository } from '../../infrastructure/repositories/system-health.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/health')
export class SystemHealthController {
  constructor(private readonly healthRepo: SystemHealthRepository) {}

  @Get('stats')
  @Roles('admin', 'ceo')
  getGlobalStats() {
    return this.healthRepo.getGlobalStats();
  }

  @Get('ping')
  @Roles('admin', 'ceo')
  getHealthCheck() {
    return this.healthRepo.getHealthCheck();
  }
}
