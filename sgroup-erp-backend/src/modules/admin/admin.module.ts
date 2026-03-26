import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Next-Gen Clean Architecture (All-in Reborn)
import { RbacController } from './presentation/controllers/rbac.controller';
import { SystemConfigController } from './presentation/controllers/system-config.controller';
import { AdminUserController } from './presentation/controllers/admin-user.controller';
import { SystemHealthController } from './presentation/controllers/system-health.controller';
import { AuditLogController } from './presentation/controllers/audit-log.controller';
import { SecuritySessionController } from './presentation/controllers/security-session.controller';

import { RbacRepository } from './infrastructure/repositories/rbac.repository';
import { SystemConfigRepository } from './infrastructure/repositories/system-config.repository';
import { AdminUserRepository } from './infrastructure/repositories/admin-user.repository';
import { SystemHealthRepository } from './infrastructure/repositories/system-health.repository';
import { AuditLogRepository } from './infrastructure/repositories/audit-log.repository';
import { SecuritySessionRepository } from './infrastructure/repositories/security-session.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    RbacController,
    SystemConfigController,
    AdminUserController,
    SystemHealthController,
    AuditLogController,
    SecuritySessionController
  ],
  providers: [
    RbacRepository,
    SystemConfigRepository,
    AdminUserRepository,
    SystemHealthRepository,
    AuditLogRepository,
    SecuritySessionRepository
  ],
  exports: []
})
export class AdminModule {}
