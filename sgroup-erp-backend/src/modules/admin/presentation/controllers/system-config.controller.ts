import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SystemConfigRepository } from '../../infrastructure/repositories/system-config.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/config')
export class SystemConfigController {
  constructor(private readonly configRepo: SystemConfigRepository) {}

  @Get('settings')
  @Roles('admin', 'ceo')
  getAllSettings() {
    return this.configRepo.getAllSettings();
  }

  @Post('settings/:key')
  @Roles('admin')
  updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.configRepo.updateSetting(key, value);
  }

  @Get('feature-flags')
  @Roles('admin', 'ceo', 'hr', 'marketing_manager', 'sales_manager', 'finance_manager') // Managers can view flags affecting their modules
  getFeatureFlags() {
    return this.configRepo.getAllFeatureFlags();
  }

  @Post('feature-flags/:key/toggle')
  @Roles('admin', 'ceo')
  toggleFeatureFlag(
    @Param('key') key: string,
    @Body('enabled') enabled: boolean,
    @Body('updatedBy') updatedBy: string
  ) {
    return this.configRepo.toggleFeatureFlag(key, enabled, updatedBy);
  }
}
