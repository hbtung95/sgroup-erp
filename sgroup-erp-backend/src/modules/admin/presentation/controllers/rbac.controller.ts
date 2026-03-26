import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RbacRepository } from '../../infrastructure/repositories/rbac.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly rbacRepo: RbacRepository) {}

  @Get('matrix')
  @Roles('admin', 'ceo')
  getPermissionsMatrix() {
    return this.rbacRepo.getAllPermissionsMatrix();
  }

  @Get(':role')
  @Roles('admin', 'ceo')
  getRolePermissions(@Param('role') role: string) {
    return this.rbacRepo.getRolePermissions(role);
  }

  @Post(':role/:module')
  @Roles('admin') // Strict CTO access only
  updatePermission(
    @Param('role') role: string,
    @Param('module') module: string,
    @Body('permission') permission: string,
    @Body('updatedBy') updatedBy: string
  ) {
    return this.rbacRepo.updateRolePermission(role, module, permission, updatedBy);
  }
}
