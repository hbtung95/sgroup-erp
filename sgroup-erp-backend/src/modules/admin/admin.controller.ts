import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'ceo')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ═══════════════════════════════════════════
  // DASHBOARD & HEALTH
  // ═══════════════════════════════════════════
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('health')
  getHealth() {
    return this.adminService.getHealthCheck();
  }

  // ═══════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════
  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.findAllUsers({
      search,
      role,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() data: any) {
    return this.adminService.createUser(data);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @Post('users/:id/reset-password')
  @Roles('admin') // Only admin, not CEO
  resetPassword(@Param('id') id: string, @Body() data: { newPassword: string }) {
    return this.adminService.resetPassword(id, data.newPassword);
  }

  // ═══════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════
  @Get('audit-logs')
  getAuditLogs(
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userName') userName?: string,
    @Query('method') method?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      action,
      resource,
      userName,
      method,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ═══════════════════════════════════════════
  // SYSTEM SETTINGS
  // ═══════════════════════════════════════════
  @Get('settings')
  getSettings(@Query('group') group?: string) {
    return this.adminService.getSettings(group);
  }

  @Patch('settings/:key')
  updateSetting(@Param('key') key: string, @Body() data: { value: string }) {
    return this.adminService.updateSetting(key, data.value);
  }

  @Post('settings')
  @Roles('admin')
  upsertSetting(@Body() data: { key: string; value: string; group?: string; label?: string; description?: string; valueType?: string }) {
    return this.adminService.upsertSetting(data.key, data);
  }

  @Post('settings/seed')
  @Roles('admin')
  seedSettings() {
    return this.adminService.seedDefaultSettings();
  }

  // ═══════════════════════════════════════════
  // ROLE PERMISSIONS
  // ═══════════════════════════════════════════
  @Get('permissions')
  getPermissions() {
    return this.adminService.getPermissions();
  }

  @Patch('permissions')
  @Roles('admin')
  updatePermission(@Body() data: { role: string; module: string; permission: string }) {
    return this.adminService.updatePermission(data.role, data.module, data.permission);
  }

  @Post('permissions/bulk')
  @Roles('admin')
  bulkUpdatePermissions(@Body() data: { updates: { role: string; module: string; permission: string }[] }) {
    return this.adminService.bulkUpdatePermissions(data.updates);
  }

  @Post('permissions/reset')
  @Roles('admin')
  resetPermissions() {
    return this.adminService.resetPermissionsToDefault();
  }
}
