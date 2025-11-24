import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PaidSocialService } from '../paid-social.service';

@Injectable()
export class PerformanceSyncCron {
  private readonly logger = new Logger(PerformanceSyncCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paidSocialService: PaidSocialService,
  ) {}

  /**
   * Sync performance data for all active campaigns
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncAllCampaigns() {
    this.logger.log('Starting performance sync for all active campaigns');

    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        workspaceId: true,
        name: true,
      },
    });

    this.logger.log(`Found ${activeCampaigns.length} active campaigns to sync`);

    for (const campaign of activeCampaigns) {
      try {
        await this.paidSocialService.syncPerformanceData(
          campaign.id,
          campaign.workspaceId,
        );
        this.logger.log(`Successfully synced campaign ${campaign.name}`);
      } catch (error: any) {
        this.logger.error(
          `Failed to sync campaign ${campaign.name}: ${error.message}`,
        );
      }
    }

    this.logger.log('Performance sync completed');
  }

  /**
   * Sync performance data for campaigns that ended recently
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncCompletedCampaigns() {
    this.logger.log('Syncing recently completed campaigns');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const completedCampaigns = await this.prisma.adCampaign.findMany({
      where: {
        status: 'COMPLETED',
        endDate: {
          gte: yesterday,
        },
      },
      select: {
        id: true,
        workspaceId: true,
        name: true,
      },
    });

    this.logger.log(`Found ${completedCampaigns.length} recently completed campaigns`);

    for (const campaign of completedCampaigns) {
      try {
        await this.paidSocialService.syncPerformanceData(
          campaign.id,
          campaign.workspaceId,
        );
        this.logger.log(`Successfully synced completed campaign ${campaign.name}`);
      } catch (error: any) {
        this.logger.error(
          `Failed to sync completed campaign ${campaign.name}: ${error.message}`,
        );
      }
    }
  }
}
