import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { SecuritySessionRepository } from '../../infrastructure/repositories/security-session.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sessions')
export class SecuritySessionController {
  constructor(private readonly sessionRepo: SecuritySessionRepository) {}

  @Get('user/:id')
  @Roles('admin')
  getUserSessions(@Param('id') id: string) {
    return this.sessionRepo.getUserActiveSessions(id);
  }

  @Post(':sessionId/revoke')
  @Roles('admin')
  revokeSession(@Param('sessionId') sessionId: string) {
    return this.sessionRepo.revokeSession(sessionId);
  }

  @Post('user/:id/revoke-all')
  @Roles('admin')
  revokeAllUserSessions(@Param('id') id: string) {
    return this.sessionRepo.revokeAllUserSessions(id);
  }
}
