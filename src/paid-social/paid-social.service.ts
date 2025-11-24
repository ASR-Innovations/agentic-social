import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacebookAdsAdapter } from './adapters/facebook-ads.adapter';
import { LinkedInAdsAdapter } from './adapters/linkedin-ads.adapter';
import {
  CreateAdCampaignDto,
  UpdateAdCampaignDto,
  CreateAdSetDto,
  CreateAdDto,
  BoostPostDto,
  AdPerformanceQueryDto,
  CreateBudgetAlertDto,
  AdPlatform,
  AdCampaignObjective,
  BidStrategy,
} from './dto';

@Injectable()
export class PaidSocialService {
  private readonly logger = new Logger(PaidSocialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookAdsAdapter: FacebookAdsAdapter,
    private readonly linkedInAdsAdapter: LinkedInAdsAdapter,
  ) {}

  /**
   * Create a new ad campaign
   */
  async createCampaign(
    workspaceId: string,
    userId: string,
    dto: CreateAdCampaignDto,
  ) {
    this.logger.log(`Creating ad campaign: ${dto.name} for workspace ${workspaceId}`);

    const campaign = await this.prisma.adCampaign.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        objective: dto.objective,
        platforms: dto.platforms,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        totalBudget: dto.totalBudget,
        dailyBudget: dto.dailyBudget,
        bidStrategy: dto.bidStrategy,
        targetAudience: dto.targetAudience || {},
        creativeAssets: dto.creativeAssets || {},
        tags: dto.tags || [],
        createdBy: userId,
      },
      include: {
        adSets: true,
      },
    });

    return campaign;
  }

  /**
   * Get all campaigns for a workspace
   */
  async getCampaigns(workspaceId: string) {
    return this.prisma.adCampaign.findMany({
      where: { workspaceId },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
        _count: {
          select: {
            adSets: true,
            performance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId: string, workspaceId: string) {
    const campaign = await this.prisma.adCampaign.findFirst({
      where: {
        id: campaignId,
        workspaceId,
      },
      include: {
        adSets: {
          include: {
            ads: true,
            performance: true,
          },
        },
        performance: true,
        budgetAlerts: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    campaignId: string,
    workspaceId: string,
    dto: UpdateAdCampaignDto,
  ) {
    const campaign = await this.getCampaign(campaignId, workspaceId);

    // If status is changing to ACTIVE, sync with platforms
    if (dto.status === 'ACTIVE' && campaign.status !== 'ACTIVE') {
      await this.activateCampaignOnPlatforms(campaign);
    }

    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        adSets: true,
      },
    });
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string, workspaceId: string) {
    await this.getCampaign(campaignId, workspaceId);

    return this.prisma.adCampaign.delete({
      where: { id: campaignId },
    });
  }

  /**
   * Create an ad set within a campaign
   */
  async createAdSet(
    campaignId: string,
    workspaceId: string,
    dto: CreateAdSetDto,
  ) {
    const campaign = await this.getCampaign(campaignId, workspaceId);

    const adSet = await this.prisma.adSet.create({
      data: {
        campaignId,
        name: dto.name,
        platform: dto.platform,
        budget: dto.budget,
        bidAmount: dto.bidAmount,
        targeting: dto.targeting,
        schedule: dto.schedule || {},
        optimization: dto.optimization || {},
      },
      include: {
        ads: true,
      },
    });

    return adSet;
  }

  /**
   * Create an ad within an ad set
   */
  async createAd(
    adSetId: string,
    workspaceId: string,
    dto: CreateAdDto,
  ) {
    const adSet = await this.prisma.adSet.findFirst({
      where: {
        id: adSetId,
        campaign: {
          workspaceId,
        },
      },
      include: {
        campaign: true,
      },
    });

    if (!adSet) {
      throw new NotFoundException(`Ad set ${adSetId} not found`);
    }

    const ad = await this.prisma.ad.create({
      data: {
        adSetId,
        name: dto.name,
        platform: dto.platform,
        postId: dto.postId,
        creative: dto.creative,
        callToAction: dto.callToAction,
        destinationUrl: dto.destinationUrl,
      },
    });

    return ad;
  }

  /**
   * Boost an organic post
   */
  async boostPost(workspaceId: string, userId: string, dto: BoostPostDto) {
    this.logger.log(`Boosting post ${dto.postId} for workspace ${workspaceId}`);

    // Verify post exists
    const post = await this.prisma.post.findFirst({
      where: {
        id: dto.postId,
        workspaceId,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post ${dto.postId} not found`);
    }

    // Create campaign for boosted post
    const campaign = await this.createCampaign(workspaceId, userId, {
      name: `Boosted Post - ${post.id.substring(0, 8)}`,
      objective: AdCampaignObjective.ENGAGEMENT,
      platforms: dto.platforms,
      totalBudget: dto.budget,
      bidStrategy: BidStrategy.LOWEST_COST,
      targetAudience: dto.targetAudience,
      tags: ['boosted-post'],
    });

    // Create ad sets for each platform
    const adSets = await Promise.all(
      dto.platforms.map(async (platform) => {
        const adSet = await this.createAdSet(campaign.id, workspaceId, {
          name: `Boosted Post Ad Set - ${platform}`,
          platform,
          budget: dto.budget / dto.platforms.length,
          targeting: dto.targetAudience || {},
        });

        // Create ad from post
        await this.createAd(adSet.id, workspaceId, {
          name: `Boosted Post Ad - ${platform}`,
          platform,
          postId: dto.postId,
          creative: {
            type: 'boosted_post',
            postId: dto.postId,
          },
        });

        return adSet;
      }),
    );

    return {
      campaign,
      adSets,
    };
  }

  /**
   * Get ad performance metrics
   */
  async getPerformance(workspaceId: string, query: AdPerformanceQueryDto) {
    const where: any = {};

    if (query.campaignId) {
      // Verify campaign belongs to workspace
      await this.getCampaign(query.campaignId, workspaceId);
      where.campaignId = query.campaignId;
    } else {
      // Filter by workspace through campaign
      where.campaign = { workspaceId };
    }

    if (query.adSetId) where.adSetId = query.adSetId;
    if (query.adId) where.adId = query.adId;
    if (query.platform) where.platform = query.platform;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const performance = await this.prisma.adPerformance.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        adSet: {
          select: {
            id: true,
            name: true,
          },
        },
        ad: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate aggregated metrics
    const aggregated = this.aggregatePerformance(performance);

    return {
      performance,
      aggregated,
    };
  }

  /**
   * Aggregate performance metrics
   */
  private aggregatePerformance(performance: any[]) {
    const totals = performance.reduce(
      (acc, p) => ({
        impressions: acc.impressions + p.impressions,
        clicks: acc.clicks + p.clicks,
        spend: acc.spend + p.spend,
        reach: acc.reach + p.reach,
        conversions: acc.conversions + p.conversions,
        revenue: acc.revenue + p.revenue,
      }),
      {
        impressions: 0,
        clicks: 0,
        spend: 0,
        reach: 0,
        conversions: 0,
        revenue: 0,
      },
    );

    return {
      ...totals,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
    };
  }

  /**
   * Create a budget alert
   */
  async createBudgetAlert(
    campaignId: string,
    workspaceId: string,
    dto: CreateBudgetAlertDto,
  ) {
    await this.getCampaign(campaignId, workspaceId);

    return this.prisma.budgetAlert.create({
      data: {
        campaignId,
        alertType: dto.alertType,
        threshold: dto.threshold,
        currentValue: 0,
        recipients: dto.recipients,
      },
    });
  }

  /**
   * Check budget alerts and trigger if needed
   */
  async checkBudgetAlerts(campaignId: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        budgetAlerts: {
          where: { triggered: false },
        },
        performance: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 1)),
            },
          },
        },
      },
    });

    if (!campaign) return;

    const totalSpend = campaign.performance.reduce((sum, p) => sum + p.spend, 0);

    for (const alert of campaign.budgetAlerts) {
      let shouldTrigger = false;

      if (alert.alertType === 'budget_threshold' && campaign.totalBudget) {
        const percentageSpent = (totalSpend / campaign.totalBudget) * 100;
        shouldTrigger = percentageSpent >= alert.threshold;
      } else if (alert.alertType === 'daily_limit' && campaign.dailyBudget) {
        const todaySpend = campaign.performance
          .filter((p) => p.date.toDateString() === new Date().toDateString())
          .reduce((sum, p) => sum + p.spend, 0);
        shouldTrigger = todaySpend >= campaign.dailyBudget * (alert.threshold / 100);
      }

      if (shouldTrigger) {
        await this.prisma.budgetAlert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            triggeredAt: new Date(),
            currentValue: totalSpend,
          },
        });

        // TODO: Send notifications to recipients
        this.logger.warn(
          `Budget alert triggered for campaign ${campaignId}: ${alert.alertType}`,
        );
      }
    }
  }

  /**
   * Sync performance data from platforms
   */
  async syncPerformanceData(campaignId: string, workspaceId: string) {
    const campaign = await this.getCampaign(campaignId, workspaceId);

    this.logger.log(`Syncing performance data for campaign ${campaignId}`);

    const results = [];

    for (const platform of campaign.platforms) {
      try {
        if (platform === AdPlatform.FACEBOOK || platform === AdPlatform.INSTAGRAM) {
          // Sync Facebook/Instagram data
          const insights = await this.syncFacebookPerformance(campaign);
          results.push({ platform, success: true, data: insights });
        } else if (platform === AdPlatform.LINKEDIN) {
          // Sync LinkedIn data
          const insights = await this.syncLinkedInPerformance(campaign);
          results.push({ platform, success: true, data: insights });
        }
      } catch (error: any) {
        this.logger.error(`Failed to sync ${platform} performance: ${error.message}`);
        results.push({ platform, success: false, error: error.message });
      }
    }

    // Check budget alerts after syncing
    await this.checkBudgetAlerts(campaignId);

    return results;
  }

  /**
   * Sync Facebook/Instagram performance data
   */
  private async syncFacebookPerformance(campaign: any) {
    // Get social account for Facebook
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        workspaceId: campaign.workspaceId,
        platform: 'FACEBOOK',
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException('No active Facebook account found');
    }

    // Fetch insights from Facebook
    const insights = await this.facebookAdsAdapter.getCampaignInsights(
      campaign.id,
      account.accessToken,
      'last_7d',
    );

    // Store performance data
    await this.prisma.adPerformance.create({
      data: {
        campaignId: campaign.id,
        platform: 'FACEBOOK',
        date: new Date(),
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spend: parseFloat(insights.spend || '0'),
        reach: parseInt(insights.reach || '0'),
        conversions: this.extractConversions(insights.actions),
        revenue: this.extractRevenue(insights.action_values),
        cpc: parseFloat(insights.cpc || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        metadata: insights,
      },
    });

    return insights;
  }

  /**
   * Sync LinkedIn performance data
   */
  private async syncLinkedInPerformance(campaign: any) {
    // Get social account for LinkedIn
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        workspaceId: campaign.workspaceId,
        platform: 'LINKEDIN',
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException('No active LinkedIn account found');
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch analytics from LinkedIn
    const analytics = await this.linkedInAdsAdapter.getCampaignAnalytics(
      campaign.id,
      account.accessToken,
      startDate.toISOString(),
      endDate.toISOString(),
    );

    // Store performance data
    await this.prisma.adPerformance.create({
      data: {
        campaignId: campaign.id,
        platform: 'LINKEDIN',
        date: new Date(),
        impressions: analytics.impressions || 0,
        clicks: analytics.clicks || 0,
        spend: analytics.costInLocalCurrency || 0,
        reach: analytics.impressions || 0, // LinkedIn doesn't provide separate reach
        conversions: analytics.externalWebsitePostClickConversions || 0,
        revenue: 0, // LinkedIn doesn't provide revenue directly
        cpc: analytics.clicks > 0 ? analytics.costInLocalCurrency / analytics.clicks : 0,
        cpm: analytics.impressions > 0 ? (analytics.costInLocalCurrency / analytics.impressions) * 1000 : 0,
        ctr: analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0,
        metadata: analytics,
      },
    });

    return analytics;
  }

  /**
   * Extract conversions from Facebook actions
   */
  private extractConversions(actions: any[]): number {
    if (!actions) return 0;

    const conversionActions = actions.filter(
      (a) => a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
             a.action_type === 'purchase',
    );

    return conversionActions.reduce((sum, a) => sum + parseInt(a.value || '0'), 0);
  }

  /**
   * Extract revenue from Facebook action values
   */
  private extractRevenue(actionValues: any[]): number {
    if (!actionValues) return 0;

    const revenueActions = actionValues.filter(
      (a) => a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
             a.action_type === 'purchase',
    );

    return revenueActions.reduce((sum, a) => sum + parseFloat(a.value || '0'), 0);
  }

  /**
   * Activate campaign on all platforms
   */
  private async activateCampaignOnPlatforms(campaign: any) {
    this.logger.log(`Activating campaign ${campaign.id} on platforms`);

    for (const platform of campaign.platforms) {
      try {
        if (platform === AdPlatform.FACEBOOK || platform === AdPlatform.INSTAGRAM) {
          await this.activateFacebookCampaign(campaign);
        } else if (platform === AdPlatform.LINKEDIN) {
          await this.activateLinkedInCampaign(campaign);
        }
      } catch (error: any) {
        this.logger.error(`Failed to activate ${platform} campaign: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Activate Facebook campaign
   */
  private async activateFacebookCampaign(campaign: any) {
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        workspaceId: campaign.workspaceId,
        platform: 'FACEBOOK',
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException('No active Facebook account found');
    }

    // Update campaign status on Facebook
    await this.facebookAdsAdapter.updateCampaignStatus(
      campaign.id,
      account.accessToken,
      'ACTIVE',
    );
  }

  /**
   * Activate LinkedIn campaign
   */
  private async activateLinkedInCampaign(campaign: any) {
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        workspaceId: campaign.workspaceId,
        platform: 'LINKEDIN',
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException('No active LinkedIn account found');
    }

    // Update campaign status on LinkedIn
    await this.linkedInAdsAdapter.updateCampaignStatus(
      campaign.id,
      account.accessToken,
      'ACTIVE',
    );
  }

  /**
   * Get unified organic + paid reporting
   */
  async getUnifiedReport(workspaceId: string, startDate: string, endDate: string) {
    // Get organic post performance
    const organicPosts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        publishedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Get paid campaign performance
    const paidPerformance = await this.getPerformance(workspaceId, {
      startDate,
      endDate,
    });

    return {
      organic: {
        posts: organicPosts.length,
        // TODO: Add organic metrics from analytics service
      },
      paid: paidPerformance.aggregated,
      combined: {
        totalReach: paidPerformance.aggregated.reach,
        totalEngagement: paidPerformance.aggregated.clicks,
        totalSpend: paidPerformance.aggregated.spend,
        totalRevenue: paidPerformance.aggregated.revenue,
        roas: paidPerformance.aggregated.roas,
      },
    };
  }
}
