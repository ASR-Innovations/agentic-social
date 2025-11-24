import { Module } from '@nestjs/common';
import { PaidSocialController } from './paid-social.controller';
import { PaidSocialService } from './paid-social.service';
import { FacebookAdsAdapter } from './adapters/facebook-ads.adapter';
import { LinkedInAdsAdapter } from './adapters/linkedin-ads.adapter';
import { BudgetTrackingService } from './services/budget-tracking.service';
import { PerformanceSyncCron } from './cron/performance-sync.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaidSocialController],
  providers: [
    PaidSocialService,
    FacebookAdsAdapter,
    LinkedInAdsAdapter,
    BudgetTrackingService,
    PerformanceSyncCron,
  ],
  exports: [PaidSocialService],
})
export class PaidSocialModule {}
