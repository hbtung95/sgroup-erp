import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Models that support soft delete via deletedAt
const SOFT_DELETE_MODELS = [
  'FactDeal', 'SalesBooking', 'SalesDeposit', 'Customer',
  'PlanScenarioLog', 'PlanBundleLog',
  'SalesTeam', 'SalesStaff', 'DimProject', 'PropertyProduct',
] as const;

/**
 * Extended PrismaClient with soft-delete middleware.
 * Prisma 6.x uses $extends (not $use which was removed).
 *
 * For soft-delete models, findMany/findFirst/count auto-filter deletedAt: null
 * unless the caller explicitly sets a deletedAt filter.
 *
 * Usage note: soft-delete auto-filter works at Prisma query level.
 * To query deleted records, explicitly pass `{ deletedAt: { not: null } }`.
 */
function createExtendedPrisma() {
  const base = new PrismaClient();

  return base.$extends({
    query: {
      // Apply soft-delete filter for each soft-delete model
      $allModels: {
        async findMany({ model, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            args.where = { ...args.where };
            if ((args.where as any).deletedAt === undefined) {
              (args.where as any).deletedAt = null;
            }
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            args.where = { ...args.where };
            if ((args.where as any).deletedAt === undefined) {
              (args.where as any).deletedAt = null;
            }
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (SOFT_DELETE_MODELS.includes(model as any)) {
            args.where = { ...args.where };
            if ((args.where as any).deletedAt === undefined) {
              (args.where as any).deletedAt = null;
            }
          }
          return query(args);
        },
      },
    },
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private _extended: ReturnType<typeof createExtendedPrisma> | null = null;

  /** Get extended client with soft-delete middleware */
  get extended() {
    if (!this._extended) {
      this._extended = createExtendedPrisma();
    }
    return this._extended;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected & soft-delete middleware available via .extended');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
