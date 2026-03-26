import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './common/database/database.module';
import { SyncModule } from './common/database/sync/sync.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExecPlanningModule } from './modules/exec-planning/exec-planning.module';
import { SalesPlanningModule } from './modules/sales-planning/sales-planning.module';
import { MarketingPlanningModule } from './modules/marketing-planning/marketing-planning.module';
import { SalesOpsModule } from './modules/sales-ops/sales-ops.module';
import { SalesReportModule } from './modules/sales-report/sales-report.module';
import { BizflySyncModule } from './modules/bizfly-sync/bizfly-sync.module';
import { AiModule } from './modules/ai/ai.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProductsModule } from './modules/products/products.module';
import { LegalModule } from './modules/legal/legal.module';
import { ProjectModule } from './modules/project/project.module';
import { FinanceModule } from './modules/finance/finance.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HrModule } from './modules/hr/hr.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule as SysAdminModule } from './modules/admin/admin.module';
import { AgencyModule } from './modules/agency/agency.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRoot(),
    PrismaModule,
    SyncModule,
    AuthModule,
    ExecPlanningModule,
    SalesPlanningModule,
    MarketingPlanningModule,
    SalesOpsModule,
    SalesReportModule,
    BizflySyncModule,
    AiModule,
    CustomersModule,
    ActivitiesModule,
    AppointmentsModule,
    ProductsModule,
    LegalModule,
    ProjectModule,
    FinanceModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    HrModule,
    MarketingModule,
    NotificationsModule,
    SysAdminModule,
    AgencyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
