import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetTrackingService {
  private readonly logger = new Logger(BudgetTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check all active campaigns for budget alerts
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAllBudgetAlerts() {
    this.logger.log('Checking budget alerts for all active campaigns');

    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        budgetAlerts: {
          where: { triggered: false },
        },
        performance: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    });

    for (const campaign of activeCampaigns) {
      await this.checkCampaignBudget(campaign);
    }
  }

  /**
   * Check budget for a specific campaign
   */
  async checkCampaignBudget(campaign: any) {
    const totalSpend = campaign.performance.reduce((sum: number, p: any) => sum + p.spend, 0);

    for (const alert of campaign.budgetAlerts) {
      let shouldTrigger = false;
      let currentValue = 0;

      if (alert.alertType === 'budget_threshold' && campaign.totalBudget) {
        const percentageSpent = (totalSpend / campaign.totalBudget) * 100;
        currentValue = percentageSpent;
        shouldTrigger = percentageSpent >= alert.threshold;
      } else if (alert.alertType === 'daily_limit' && campaign.dailyBudget) {
        const todaySpend = campaign.performance
          .filter((p: any) => p.date.toDateString() === new Date().toDateString())
          .reduce((sum: number, p: any) => sum + p.spend, 0);
        currentValue = todaySpend;
        shouldTrigger = todaySpend >= campaign.dailyBudget * (alert.threshold / 100);
      } else if (alert.alertType === 'total_limit' && campaign.totalBudget) {
        currentValue = totalSpend;
        shouldTrigger = totalSpend >= campaign.totalBudget * (alert.threshold / 100);
      }

      if (shouldTrigger) {
        await this.triggerAlert(alert, campaign, currentValue);
      }
    }
  }

  /**
   * Trigger a budget alert
   */
  private async triggerAlert(alert: any, campaign: any, currentValue: number) {
    this.logger.warn(
      `Budget alert triggered for campaign ${campaign.id}: ${alert.alertType} - ${currentValue}`,
    );

    await this.prisma.budgetAlert.update({
      where: { id: alert.id },
      data: {
        triggered: true,
        triggeredAt: new Date(),
        currentValue,
      },
    });

    // TODO: Send email notifications to recipients
    // TODO: Send push notifications
    // TODO: Send Slack notifications if configured
  }

  /**
   * Get budget status for a campaign
   */
  async getCampaignBudgetStatus(campaignId: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        performance: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    });

    if (!campaign) {
      return null;
    }

    const totalSpend = campaign.performance.reduce((sum: number, p: any) => sum + p.spend, 0);
    const todaySpend = campaign.performance
      .filter((p) => p.date.toDateString() === new Date().toDateString())
      .reduce((sum: number, p: any) => sum + p.spend, 0);

    return {
      totalBudget: campaign.totalBudget,
      dailyBudget: campaign.dailyBudget,
      totalSpend,
      todaySpend,
      remainingBudget: campaign.totalBudget ? campaign.totalBudget - totalSpend : null,
      remainingDailyBudget: campaign.dailyBudget ? campaign.dailyBudget - todaySpend : null,
      percentageSpent: campaign.totalBudget ? (totalSpend / campaign.totalBudget) * 100 : null,
      dailyPercentageSpent: campaign.dailyBudget ? (todaySpend / campaign.dailyBudget) * 100 : null,
    };
  }
}
