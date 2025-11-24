import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInfluencerCampaignDto } from '../dto/create-influencer-campaign.dto';
import { UpdateInfluencerCampaignDto } from '../dto/update-influencer-campaign.dto';
import { QueryCampaignsDto } from '../dto/query-campaigns.dto';

@Injectable()
export class InfluencerCampaignService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new influencer campaign
   */
  async createCampaign(workspaceId: string, dto: CreateInfluencerCampaignDto) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const campaign = await this.prisma.influencerCampaign.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        objectives: dto.objectives,
        budget: dto.budget,
        startDate,
        endDate,
        targetNiches: dto.targetNiches,
        targetPlatforms: dto.targetPlatforms,
        minFollowers: dto.minFollowers,
        maxFollowers: dto.maxFollowers,
        minEngagementRate: dto.minEngagementRate,
        status: 'DRAFT',
      },
      include: {
        collaborations: {
          include: {
            influencer: {
              include: {
                accounts: true,
              },
            },
          },
        },
      },
    });

    return campaign;
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(workspaceId: string, campaignId: string) {
    const campaign = await this.prisma.influencerCampaign.findFirst({
      where: {
        id: campaignId,
        workspaceId,
      },
      include: {
        collaborations: {
          include: {
            influencer: {
              include: {
                accounts: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * List campaigns with filtering and pagination
   */
  async listCampaigns(workspaceId: string, query: QueryCampaignsDto) {
    const { status, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
      workspaceId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.influencerCampaign.findMany({
        where,
        include: {
          collaborations: {
            include: {
              influencer: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.influencerCampaign.count({ where }),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update campaign
   */
  async updateCampaign(workspaceId: string, campaignId: string, dto: UpdateInfluencerCampaignDto) {
    // Verify campaign exists and belongs to workspace
    await this.getCampaignById(workspaceId, campaignId);

    // Validate dates if provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.objectives !== undefined) updateData.objectives = dto.objectives;
    if (dto.budget !== undefined) updateData.budget = dto.budget;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.targetNiches !== undefined) updateData.targetNiches = dto.targetNiches;
    if (dto.targetPlatforms !== undefined) updateData.targetPlatforms = dto.targetPlatforms;
    if (dto.minFollowers !== undefined) updateData.minFollowers = dto.minFollowers;
    if (dto.maxFollowers !== undefined) updateData.maxFollowers = dto.maxFollowers;
    if (dto.minEngagementRate !== undefined) updateData.minEngagementRate = dto.minEngagementRate;
    if (dto.status !== undefined) updateData.status = dto.status;

    const campaign = await this.prisma.influencerCampaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        collaborations: {
          include: {
            influencer: {
              include: {
                accounts: true,
              },
            },
          },
        },
      },
    });

    return campaign;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(workspaceId: string, campaignId: string) {
    // Verify campaign exists and belongs to workspace
    await this.getCampaignById(workspaceId, campaignId);

    await this.prisma.influencerCampaign.delete({
      where: { id: campaignId },
    });

    return { success: true };
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(workspaceId: string, campaignId: string) {
    const campaign = await this.getCampaignById(workspaceId, campaignId);

    // Get all collaborations for this campaign
    const collaborations = await this.prisma.influencerCollaboration.findMany({
      where: {
        campaignId,
      },
      include: {
        influencer: {
          include: {
            accounts: true,
          },
        },
      },
    });

    // Calculate aggregate metrics
    let totalReach = 0;
    let totalEngagement = 0;
    let totalConversions = 0;
    let totalSpent = 0;

    const influencerPerformance = collaborations.map((collab) => {
      const metrics = collab.performanceMetrics as any || {};
      
      totalReach += metrics.reach || 0;
      totalEngagement += metrics.engagement || 0;
      totalConversions += metrics.conversions || 0;
      totalSpent += collab.compensation || 0;

      return {
        influencerId: collab.influencerId,
        influencerName: collab.influencer.name,
        status: collab.status,
        compensation: collab.compensation,
        deliverables: collab.deliverables,
        actualDeliverables: collab.actualDeliverables,
        metrics: metrics,
      };
    });

    // Calculate ROI if we have conversions and budget
    let roi = null;
    if (totalSpent > 0 && totalConversions > 0) {
      // Assuming average conversion value - this should be configurable
      const avgConversionValue = 50; // $50 per conversion
      const revenue = totalConversions * avgConversionValue;
      roi = ((revenue - totalSpent) / totalSpent) * 100;
    }

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budget: campaign.budget,
      },
      metrics: {
        totalReach,
        totalEngagement,
        totalConversions,
        totalSpent,
        roi,
        engagementRate: totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0,
      },
      collaborations: {
        total: collaborations.length,
        byStatus: {
          proposed: collaborations.filter((c) => c.status === 'PROPOSED').length,
          negotiating: collaborations.filter((c) => c.status === 'NEGOTIATING').length,
          accepted: collaborations.filter((c) => c.status === 'ACCEPTED').length,
          inProgress: collaborations.filter((c) => c.status === 'IN_PROGRESS').length,
          completed: collaborations.filter((c) => c.status === 'COMPLETED').length,
          cancelled: collaborations.filter((c) => c.status === 'CANCELLED').length,
        },
      },
      influencerPerformance,
    };
  }

  /**
   * Find matching influencers for campaign
   */
  async findMatchingInfluencers(workspaceId: string, campaignId: string) {
    const campaign = await this.getCampaignById(workspaceId, campaignId);

    const where: any = {
      workspaceId,
      status: {
        in: ['DISCOVERED', 'CONTACTED', 'INACTIVE'],
      },
    };

    // Filter by niche
    if (campaign.targetNiches && campaign.targetNiches.length > 0) {
      where.niche = {
        hasSome: campaign.targetNiches,
      };
    }

    // Filter by follower count
    if (campaign.minFollowers !== null || campaign.maxFollowers !== null) {
      where.totalFollowers = {};
      if (campaign.minFollowers !== null) {
        where.totalFollowers.gte = campaign.minFollowers;
      }
      if (campaign.maxFollowers !== null) {
        where.totalFollowers.lte = campaign.maxFollowers;
      }
    }

    // Filter by engagement rate
    if (campaign.minEngagementRate !== null) {
      where.avgEngagementRate = {
        gte: campaign.minEngagementRate,
      };
    }

    const influencers = await this.prisma.influencer.findMany({
      where,
      include: {
        accounts: {
          where: {
            platform: {
              in: campaign.targetPlatforms,
            },
            isActive: true,
          },
        },
        collaborations: {
          where: {
            workspaceId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        overallScore: 'desc',
      },
      take: 50, // Limit to top 50 matches
    });

    // Filter out influencers that don't have accounts on target platforms
    const matchingInfluencers = influencers.filter(
      (influencer) => influencer.accounts.length > 0,
    );

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        targetNiches: campaign.targetNiches,
        targetPlatforms: campaign.targetPlatforms,
      },
      matches: matchingInfluencers.map((influencer) => ({
        id: influencer.id,
        name: influencer.name,
        avatar: influencer.avatar,
        niche: influencer.niche,
        overallScore: influencer.overallScore,
        totalFollowers: influencer.totalFollowers,
        avgEngagementRate: influencer.avgEngagementRate,
        status: influencer.status,
        accounts: influencer.accounts,
        recentCollaborations: influencer.collaborations,
      })),
      total: matchingInfluencers.length,
    };
  }
}
