import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminUserRepository } from '../../infrastructure/repositories/admin-user.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userRepo: AdminUserRepository) {}

  @Get()
  @Roles('admin', 'hr') // HR can also view employee grid
  findAll() {
    return this.userRepo.findAllUsers();
  }

  @Post(':id/status')
  @Roles('admin', 'hr')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.userRepo.toggleUserStatus(id, isActive);
  }

  @Post(':id/role')
  @Roles('admin') // ONLY ADMIN CAN CHANGE ROLES
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.userRepo.updateUserRole(id, role);
  }
}
