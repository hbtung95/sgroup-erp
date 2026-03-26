import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';

// Next-Gen Clean Architecture Replacements
import { MktCampaignController } from './presentation/controllers/mkt-campaign.controller';
import { MktLeadController } from './presentation/controllers/mkt-lead.controller';
import { MktPlanningController } from './presentation/controllers/mkt-planning.controller';
import { MktContentController } from './presentation/controllers/mkt-content.controller';
import { MktAnalyticsController } from './presentation/controllers/mkt-analytics.controller';

import { MktCampaignRepository } from './infrastructure/repositories/mkt-campaign.repository';
import { MktLeadRepository } from './infrastructure/repositories/mkt-lead.repository';
import { MktPlanningRepository } from './infrastructure/repositories/mkt-planning.repository';
import { MktContentRepository } from './infrastructure/repositories/mkt-content.repository';
import { MktAnalyticsRepository } from './infrastructure/repositories/mkt-analytics.repository';

import { MarketingToSalesSyncService } from './application/services/marketing-to-sales-sync.service';

@Module({
  controllers: [
    MarketingController, // Legacy
    MktCampaignController,
    MktLeadController,
    MktPlanningController,
    MktContentController,
    MktAnalyticsController
  ],
  providers: [
    MarketingService, // Legacy
    MktCampaignRepository,
    MktLeadRepository,
    MktPlanningRepository,
    MktContentRepository,
    MktAnalyticsRepository,
    MarketingToSalesSyncService
  ],
  exports: [MarketingService, MarketingToSalesSyncService]
})
export class MarketingModule {}
