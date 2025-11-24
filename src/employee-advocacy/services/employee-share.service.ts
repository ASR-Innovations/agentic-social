import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShareContentDto } from '../dto';
import { EmployeeProfileService } from './employee-profile.service';
import { AdvocacyContentService } from './advocacy-content.service';
import { GamificationService } from './gamification.service';

@Injectable()
export class EmployeeShareService {
  constructor(
    private prisma: PrismaService,
    private employeeProfileService: EmployeeProfileService,
    private advocacyContentService: AdvocacyContentService,
    private gamificationService: GamificationService,
  ) {}

  async share(workspaceId: string, employeeId: string, dto: ShareContentDto) {
    // Get employee profile
    const employee = await this.prisma.employeeProfile.findFirst({
      where: { id: employeeId, workspaceId },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    if (!employee.isActive) {
      throw new ForbiddenException('Employee profile is not active');
    }

    // Get content
    const content = await this.advocacyContentService.findOne(workspaceId, dto.contentId);

    if (!content.isApproved) {
      throw new ForbiddenException('Content is not approved for sharing');
    }

    // Check if content has expired
    if (content.expiresAt && new Date(content.expiresAt) < new Date()) {
      throw new BadRequestException('Content has expired');
    }

    // Check if platform is allowed
    if (!content.targetPlatforms.includes(dto.platform)) {
      throw new BadRequestException(`Content is not approved for ${dto.platform}`);
    }

    // Check if modification is allowed
    if (dto.customMessage && !content.allowModification) {
      throw new ForbiddenException('Content modification is not allowed');
    }

    // Create share record
    const share = await this.prisma.employeeShare.create({
      data: {
        workspaceId,
        employeeId,
        contentId: dto.contentId,
        platform: dto.platform,
        status: 'PENDING',
        metadata: dto.metadata,
      },
      include: {
        content: true,
        employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update content share count
    await this.advocacyContentService.incrementShareCount(dto.contentId);

    // Update employee activity
    await this.employeeProfileService.updateActivity(employeeId);

    // Award initial points for sharing
    const settings = await this.getSettings(workspaceId);
    await this.employeeProfileService.addPoints(employeeId, settings.pointsPerShare);
    await this.employeeProfileService.updateStats(employeeId, { shares: 1 });

    // Update share with points earned
    await this.prisma.employeeShare.update({
      where: { id: share.id },
      data: {
        pointsEarned: settings.pointsPerShare,
      },
    });

    // Check for badges
    await this.gamificationService.checkAndAwardBadges(employeeId);

    return share;
  }

  async findAll(workspaceId: string, options?: {
    employeeId?: string;
    contentId?: string;
    platform?: string;
    status?: string;
  }) {
    return this.prisma.employeeShare.findMany({
      where: {
        workspaceId,
        ...(options?.employeeId && { employeeId: options.employeeId }),
        ...(options?.contentId && { contentId: options.contentId }),
        ...(options?.platform && { platform: options.platform }),
        ...(options?.status && { status: options.status as any }),
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            content: true,
            mediaUrls: true,
          },
        },
        employee: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        sharedAt: 'desc',
      },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const share = await this.prisma.employeeShare.findFirst({
      where: { id, workspaceId },
      include: {
        content: true,
        employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    return share;
  }

  async updateMetrics(shareId: string, metrics: {
    reach?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
  }) {
    const share = await this.prisma.employeeShare.findUnique({
      where: { id: shareId },
      include: {
        employee: true,
        content: true,
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Update share metrics
    const updatedShare = await this.prisma.employeeShare.update({
      where: { id: shareId },
      data: {
        reach: metrics.reach !== undefined ? metrics.reach : share.reach,
        likes: metrics.likes !== undefined ? metrics.likes : share.likes,
        comments: metrics.comments !== undefined ? metrics.comments : share.comments,
        shares: metrics.shares !== undefined ? metrics.shares : share.shares,
        clicks: metrics.clicks !== undefined ? metrics.clicks : share.clicks,
      },
    });

    // Calculate additional points based on engagement
    const settings = await this.getSettings(share.workspaceId);
    let additionalPoints = 0;

    if (metrics.reach) {
      additionalPoints += metrics.reach * settings.pointsPerReach;
    }

    const totalEngagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
    if (totalEngagement > 0) {
      additionalPoints += totalEngagement * settings.pointsPerEngagement;
    }

    if (additionalPoints > 0) {
      await this.employeeProfileService.addPoints(share.employeeId, Math.floor(additionalPoints));
      await this.prisma.employeeShare.update({
        where: { id: shareId },
        data: {
          pointsEarned: { increment: Math.floor(additionalPoints) },
        },
      });
    }

    // Update employee stats
    await this.employeeProfileService.updateStats(share.employeeId, {
      reach: metrics.reach,
      engagement: totalEngagement,
    });

    // Update content metrics
    await this.advocacyContentService.updateMetrics(share.contentId, {
      reach: metrics.reach,
      engagement: totalEngagement,
    });

    // Check for new badges
    await this.gamificationService.checkAndAwardBadges(share.employeeId);

    return updatedShare;
  }

  async updateStatus(shareId: string, status: 'PUBLISHED' | 'FAILED', error?: string) {
    return this.prisma.employeeShare.update({
      where: { id: shareId },
      data: {
        status,
        error,
      },
    });
  }

  async getEmployeeShares(workspaceId: string, employeeId: string) {
    return this.prisma.employeeShare.findMany({
      where: {
        workspaceId,
        employeeId,
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            content: true,
            mediaUrls: true,
          },
        },
      },
      orderBy: {
        sharedAt: 'desc',
      },
    });
  }

  async getContentShares(workspaceId: string, contentId: string) {
    return this.prisma.employeeShare.findMany({
      where: {
        workspaceId,
        contentId,
      },
      include: {
        employee: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        sharedAt: 'desc',
      },
    });
  }

  private async getSettings(workspaceId: string) {
    let settings = await this.prisma.advocacySettings.findUnique({
      where: { workspaceId },
    });

    if (!settings) {
      settings = await this.prisma.advocacySettings.create({
        data: { workspaceId },
      });
    }

    return settings;
  }
}
