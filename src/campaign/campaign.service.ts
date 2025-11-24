import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignsDto,
  CampaignPerformanceDto,
  CampaignMetricsDto,
  CampaignGoalProgressDto,
} from './dto';
import { Campaign, CampaignStatus, Prisma } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new campaign
   */
  async create(
    workspaceId: string,
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    const { startDate, endDate, goals, utmParams, ...rest } = createCampaignDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Auto-generate UTM parameters if not provided
    const finalUtmParams = utmParams || this.generateUTMParams(rest.name);

    return this.prisma.campaign.create({
      data: {
        ...rest,
        workspaceId,
        startDate: start,
        endDate: end,
        goals: goals ? (goals as any) : undefined,
        utmParams: finalUtmParams as any,
        status: CampaignStatus.DRAFT,
      },
      include: {
        posts: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            publishedAt: true,
          },
        },
      },
    });
  }

  /**
   * Find all campaigns for a workspace with filtering
   */
  async findAll(
    workspaceId: string,
    query: QueryCampaignsDto,
  ): Promise<{ campaigns: Campaign[]; total: number; page: number; limit: number }> {
    const {
      status,
      tag,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: Prisma.CampaignWhereInput = {
      workspaceId,
    };

    if (status) {
      where.status = status;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    if (endDateFrom || endDateTo) {
      where.endDate = {};
      if (endDateFrom) {
        where.endDate.gte = new Date(endDateFrom);
      }
      if (endDateTo) {
        where.endDate.lte = new Date(endDateTo);
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          posts: {
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              publishedAt: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      campaigns,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single campaign by ID
   */
  async findOne(workspaceId: string, id: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, workspaceId },
      include: {
        posts: {
          include: {
            platformPosts: {
              include: {
                account: true,
              },
            },
            mediaAssets: {
              include: {
                media: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign
   */
  async update(
    workspaceId: string,
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    // Verify campaign exists and belongs to workspace
    await this.findOne(workspaceId, id);

    const { startDate, endDate, goals, utmParams, ...rest } = updateCampaignDto;

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updateData: Prisma.CampaignUpdateInput = {
      ...rest,
    };

    if (startDate) {
      updateData.startDate = new Date(startDate);
    }

    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    if (goals) {
      updateData.goals = goals as any;
    }

    if (utmParams) {
      updateData.utmParams = utmParams as any;
    }

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        posts: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            publishedAt: true,
          },
        },
      },
    });
  }

  /**
   * Delete a campaign
   */
  async remove(workspaceId: string, id: string): Promise<void> {
    // Verify campaign exists and belongs to workspace
    await this.findOne(workspaceId, id);

    // Check if campaign has posts
    const postsCount = await this.prisma.post.count({
      where: { campaignId: id },
    });

    if (postsCount > 0) {
      throw new BadRequestException(
        `Cannot delete campaign with ${postsCount} associated posts. Please remove posts first or set campaignId to null.`,
      );
    }

    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  /**
   * Associate a post with a campaign
   */
  async addPost(
    workspaceId: string,
    campaignId: string,
    postId: string,
  ): Promise<void> {
    // Verify campaign exists and belongs to workspace
    await this.findOne(workspaceId, campaignId);

    // Verify post exists and belongs to workspace
    const post = await this.prisma.post.findFirst({
      where: { id: postId, workspaceId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Update post to associate with campaign
    await this.prisma.post.update({
      where: { id: postId },
      data: { campaignId },
    });
  }

  /**
   * Remove a post from a campaign
   */
  async removePost(
    workspaceId: string,
    campaignId: string,
    postId: string,
  ): Promise<void> {
    // Verify campaign exists and belongs to workspace
    await this.findOne(workspaceId, campaignId);

    // Verify post exists and belongs to campaign
    const post = await this.prisma.post.findFirst({
      where: { id: postId, workspaceId, campaignId },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${postId} not found in campaign ${campaignId}`,
      );
    }

    // Remove campaign association
    await this.prisma.post.update({
      where: { id: postId },
      data: { campaignId: null },
    });
  }

  /**
   * Get campaign performance analytics
   */
  async getPerformance(
    workspaceId: string,
    campaignId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CampaignPerformanceDto> {
    const campaign = await this.findOne(workspaceId, campaignId);

    // Use campaign dates if not provided
    const analyticsStartDate = startDate
      ? new Date(startDate)
      : campaign.startDate;
    const analyticsEndDate = endDate ? new Date(endDate) : campaign.endDate;

    // Get all posts in the campaign
    const posts = await this.prisma.post.findMany({
      where: {
        campaignId,
        workspaceId,
        publishedAt: {
          gte: analyticsStartDate,
          lte: analyticsEndDate,
        },
      },
      include: {
        platformPosts: {
          include: {
            account: true,
          },
        },
      },
    });

    // Calculate metrics
    const metrics = await this.calculateCampaignMetrics(posts);

    // Calculate goal progress
    const goals = await this.calculateGoalProgress(campaign, metrics);

    // Get top performing posts
    const topPerformingPosts = await this.getTopPerformingPosts(
      campaignId,
      workspaceId,
      5,
    );

    // Get platform breakdown
    const platformBreakdown = await this.getPlatformBreakdown(posts);

    // Get timeline data
    const timeline = await this.getTimelineData(
      campaignId,
      workspaceId,
      analyticsStartDate,
      analyticsEndDate,
    );

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      metrics,
      goals,
      topPerformingPosts,
      platformBreakdown,
      timeline,
    };
  }

  /**
   * Generate UTM parameters automatically
   */
  private generateUTMParams(campaignName: string): {
    source?: string;
    medium?: string;
    campaign?: string;
  } {
    const slug = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      source: 'social',
      medium: 'organic',
      campaign: slug,
    };
  }

  /**
   * Calculate campaign metrics from posts
   */
  private async calculateCampaignMetrics(
    posts: any[],
  ): Promise<CampaignMetricsDto> {
    // Note: In a real implementation, you would fetch actual metrics from MongoDB
    // For now, we'll return placeholder values
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p) => p.publishedAt).length;
    const scheduledPosts = posts.filter(
      (p) => p.scheduledAt && !p.publishedAt,
    ).length;

    return {
      totalPosts,
      publishedPosts,
      scheduledPosts,
      totalReach: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalClicks: 0,
      engagementRate: 0,
      averageEngagementPerPost: 0,
    };
  }

  /**
   * Calculate goal progress
   */
  private async calculateGoalProgress(
    campaign: any,
    metrics: CampaignMetricsDto,
  ): Promise<CampaignGoalProgressDto[]> {
    if (!campaign.goals || !Array.isArray(campaign.goals)) {
      return [];
    }

    return campaign.goals.map((goal: any) => {
      const current = this.getMetricValue(metrics, goal.metric);
      const progress = goal.target > 0 ? (current / goal.target) * 100 : 0;

      let status: 'on-track' | 'at-risk' | 'achieved' | 'missed' = 'on-track';
      if (progress >= 100) {
        status = 'achieved';
      } else if (progress >= 75) {
        status = 'on-track';
      } else if (progress >= 50) {
        status = 'at-risk';
      } else {
        status = 'missed';
      }

      return {
        metric: goal.metric,
        target: goal.target,
        current,
        progress: Math.round(progress * 100) / 100,
        status,
      };
    });
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(metrics: CampaignMetricsDto, metricName: string): number {
    const metricMap: Record<string, keyof CampaignMetricsDto> = {
      reach: 'totalReach',
      impressions: 'totalImpressions',
      engagement: 'totalEngagement',
      likes: 'totalLikes',
      comments: 'totalComments',
      shares: 'totalShares',
      clicks: 'totalClicks',
      posts: 'totalPosts',
    };

    const key = metricMap[metricName.toLowerCase()];
    return key ? (metrics[key] as number) : 0;
  }

  /**
   * Get top performing posts
   */
  private async getTopPerformingPosts(
    campaignId: string,
    workspaceId: string,
    limit: number,
  ): Promise<
    Array<{
      postId: string;
      content: string;
      engagement: number;
      reach: number;
      publishedAt: Date;
    }>
  > {
    const posts = await this.prisma.post.findMany({
      where: {
        campaignId,
        workspaceId,
        publishedAt: { not: null },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return posts.map((post) => ({
      postId: post.id,
      content: (post.content as any)?.text || '',
      engagement: 0, // Would come from analytics
      reach: 0, // Would come from analytics
      publishedAt: post.publishedAt!,
    }));
  }

  /**
   * Get platform breakdown
   */
  private async getPlatformBreakdown(
    posts: any[],
  ): Promise<
    Array<{
      platform: string;
      posts: number;
      engagement: number;
      reach: number;
    }>
  > {
    const platformMap = new Map<string, { posts: number; engagement: number; reach: number }>();

    posts.forEach((post) => {
      post.platformPosts?.forEach((pp: any) => {
        const platform = pp.platform;
        const current = platformMap.get(platform) || {
          posts: 0,
          engagement: 0,
          reach: 0,
        };
        current.posts += 1;
        platformMap.set(platform, current);
      });
    });

    return Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      ...data,
    }));
  }

  /**
   * Get timeline data
   */
  private async getTimelineData(
    campaignId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      date: Date;
      engagement: number;
      reach: number;
      posts: number;
    }>
  > {
    // This would typically aggregate data by day from MongoDB
    // For now, return empty array
    return [];
  }
}
