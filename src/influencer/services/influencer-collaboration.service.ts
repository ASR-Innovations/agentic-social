import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollaborationDto } from '../dto/create-collaboration.dto';
import { UpdateCollaborationDto } from '../dto/update-collaboration.dto';
import { QueryCollaborationsDto } from '../dto/query-collaborations.dto';

@Injectable()
export class InfluencerCollaborationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new collaboration
   */
  async createCollaboration(workspaceId: string, dto: CreateCollaborationDto) {
    // Verify influencer exists and belongs to workspace
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: dto.influencerId,
        workspaceId,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    // If campaign is specified, verify it exists and belongs to workspace
    if (dto.campaignId) {
      const campaign = await this.prisma.influencerCampaign.findFirst({
        where: {
          id: dto.campaignId,
          workspaceId,
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }
    }

    // Validate dates if provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const collaboration = await this.prisma.influencerCollaboration.create({
      data: {
        influencerId: dto.influencerId,
        workspaceId,
        campaignId: dto.campaignId,
        type: dto.type,
        status: dto.status || 'PROPOSED',
        deliverables: dto.deliverables,
        compensation: dto.compensation,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        contractUrl: dto.contractUrl,
        contractSigned: dto.contractSigned || false,
        notes: dto.notes,
      },
      include: {
        influencer: {
          include: {
            accounts: true,
          },
        },
        campaign: true,
      },
    });

    // Update influencer status if needed
    if (influencer.status === 'DISCOVERED') {
      await this.prisma.influencer.update({
        where: { id: dto.influencerId },
        data: { status: 'CONTACTED' },
      });
    }

    return collaboration;
  }

  /**
   * Get collaboration by ID
   */
  async getCollaborationById(workspaceId: string, collaborationId: string) {
    const collaboration = await this.prisma.influencerCollaboration.findFirst({
      where: {
        id: collaborationId,
        workspaceId,
      },
      include: {
        influencer: {
          include: {
            accounts: true,
          },
        },
        campaign: true,
      },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return collaboration;
  }

  /**
   * List collaborations with filtering and pagination
   */
  async listCollaborations(workspaceId: string, query: QueryCollaborationsDto) {
    const {
      influencerId,
      campaignId,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {
      workspaceId,
    };

    if (influencerId) {
      where.influencerId = influencerId;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (status) {
      where.status = status;
    }

    const [collaborations, total] = await Promise.all([
      this.prisma.influencerCollaboration.findMany({
        where,
        include: {
          influencer: {
            include: {
              accounts: true,
            },
          },
          campaign: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.influencerCollaboration.count({ where }),
    ]);

    return {
      collaborations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update collaboration
   */
  async updateCollaboration(
    workspaceId: string,
    collaborationId: string,
    dto: UpdateCollaborationDto,
  ) {
    // Verify collaboration exists and belongs to workspace
    const existing = await this.getCollaborationById(workspaceId, collaborationId);

    // Validate dates if provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updateData: any = {};

    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.deliverables !== undefined) updateData.deliverables = dto.deliverables;
    if (dto.compensation !== undefined) updateData.compensation = dto.compensation;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.contractUrl !== undefined) updateData.contractUrl = dto.contractUrl;
    if (dto.contractSigned !== undefined) updateData.contractSigned = dto.contractSigned;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.actualDeliverables !== undefined) updateData.actualDeliverables = dto.actualDeliverables;
    if (dto.performanceMetrics !== undefined) updateData.performanceMetrics = dto.performanceMetrics;

    const collaboration = await this.prisma.influencerCollaboration.update({
      where: { id: collaborationId },
      data: updateData,
      include: {
        influencer: {
          include: {
            accounts: true,
          },
        },
        campaign: true,
      },
    });

    // Update influencer status based on collaboration status
    if (dto.status) {
      await this.updateInfluencerStatus(existing.influencerId, dto.status);
    }

    return collaboration;
  }

  /**
   * Delete collaboration
   */
  async deleteCollaboration(workspaceId: string, collaborationId: string) {
    // Verify collaboration exists and belongs to workspace
    await this.getCollaborationById(workspaceId, collaborationId);

    await this.prisma.influencerCollaboration.delete({
      where: { id: collaborationId },
    });

    return { success: true };
  }

  /**
   * Track deliverable completion
   */
  async trackDeliverable(
    workspaceId: string,
    collaborationId: string,
    deliverable: string,
  ) {
    const collaboration = await this.getCollaborationById(workspaceId, collaborationId);

    const actualDeliverables = collaboration.actualDeliverables || [];
    
    if (!actualDeliverables.includes(deliverable)) {
      actualDeliverables.push(deliverable);
    }

    const updated = await this.prisma.influencerCollaboration.update({
      where: { id: collaborationId },
      data: {
        actualDeliverables,
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    // Check if all deliverables are completed
    const allCompleted = collaboration.deliverables.every((d) =>
      actualDeliverables.includes(d),
    );

    if (allCompleted && collaboration.status === 'IN_PROGRESS') {
      await this.updateCollaboration(workspaceId, collaborationId, {
        status: 'COMPLETED',
      });
    }

    return updated;
  }

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(
    workspaceId: string,
    collaborationId: string,
    metrics: {
      reach?: number;
      engagement?: number;
      conversions?: number;
      impressions?: number;
      clicks?: number;
      roi?: number;
    },
  ) {
    const collaboration = await this.getCollaborationById(workspaceId, collaborationId);

    const existingMetrics = (collaboration.performanceMetrics as any) || {};
    const updatedMetrics = {
      ...existingMetrics,
      ...metrics,
    };

    const updated = await this.prisma.influencerCollaboration.update({
      where: { id: collaborationId },
      data: {
        performanceMetrics: updatedMetrics,
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    return updated;
  }

  /**
   * Get collaboration performance summary
   */
  async getCollaborationPerformance(workspaceId: string, collaborationId: string) {
    const collaboration = await this.getCollaborationById(workspaceId, collaborationId);

    const metrics = (collaboration.performanceMetrics as any) || {};

    const deliverableProgress = {
      total: collaboration.deliverables.length,
      completed: (collaboration.actualDeliverables || []).length,
      percentage:
        collaboration.deliverables.length > 0
          ? ((collaboration.actualDeliverables || []).length / collaboration.deliverables.length) * 100
          : 0,
    };

    let roi = null;
    if (collaboration.compensation && metrics.conversions) {
      const avgConversionValue = 50; // Should be configurable
      const revenue = metrics.conversions * avgConversionValue;
      roi = ((revenue - collaboration.compensation) / collaboration.compensation) * 100;
    }

    return {
      collaboration: {
        id: collaboration.id,
        type: collaboration.type,
        status: collaboration.status,
        compensation: collaboration.compensation,
      },
      influencer: {
        id: collaboration.influencer.id,
        name: collaboration.influencer.name,
        avatar: collaboration.influencer.avatar,
      },
      campaign: collaboration.campaign
        ? {
            id: collaboration.campaign.id,
            name: collaboration.campaign.name,
          }
        : null,
      deliverables: deliverableProgress,
      metrics: {
        reach: metrics.reach || 0,
        engagement: metrics.engagement || 0,
        conversions: metrics.conversions || 0,
        impressions: metrics.impressions || 0,
        clicks: metrics.clicks || 0,
        engagementRate: metrics.reach > 0 ? (metrics.engagement / metrics.reach) * 100 : 0,
        roi,
      },
    };
  }

  /**
   * Helper: Update influencer status based on collaboration status
   */
  private async updateInfluencerStatus(influencerId: string, collaborationStatus: string) {
    const influencer = await this.prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    if (!influencer) return;

    let newStatus = influencer.status;

    switch (collaborationStatus) {
      case 'PROPOSED':
      case 'NEGOTIATING':
        if (influencer.status === 'DISCOVERED') {
          newStatus = 'CONTACTED';
        }
        break;
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        newStatus = 'ACTIVE';
        break;
      case 'COMPLETED':
      case 'CANCELLED':
        // Check if there are other active collaborations
        const activeCollabs = await this.prisma.influencerCollaboration.count({
          where: {
            influencerId,
            status: {
              in: ['ACCEPTED', 'IN_PROGRESS'],
            },
          },
        });

        if (activeCollabs === 0) {
          newStatus = 'INACTIVE';
        }
        break;
    }

    if (newStatus !== influencer.status) {
      await this.prisma.influencer.update({
        where: { id: influencerId },
        data: { status: newStatus },
      });
    }
  }
}
