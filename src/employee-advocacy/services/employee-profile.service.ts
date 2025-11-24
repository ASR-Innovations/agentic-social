import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeProfileDto, UpdateEmployeeProfileDto } from '../dto';

@Injectable()
export class EmployeeProfileService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateEmployeeProfileDto) {
    // Check if profile already exists
    const existing = await this.prisma.employeeProfile.findFirst({
      where: { userId: dto.userId, workspaceId },
    });

    if (existing) {
      throw new ConflictException('Employee profile already exists for this user');
    }

    return this.prisma.employeeProfile.create({
      data: {
        workspaceId,
        userId: dto.userId,
        displayName: dto.displayName,
        bio: dto.bio,
        interests: dto.interests || [],
        preferredPlatforms: dto.preferredPlatforms || [],
        personalAccounts: dto.personalAccounts,
        notificationSettings: dto.notificationSettings,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        badges: true,
      },
    });
  }

  async findAll(workspaceId: string, options?: { isActive?: boolean }) {
    return this.prisma.employeeProfile.findMany({
      where: {
        workspaceId,
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        badges: true,
        _count: {
          select: {
            shares: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const profile = await this.prisma.employeeProfile.findFirst({
      where: { id, workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        badges: {
          orderBy: {
            earnedAt: 'desc',
          },
        },
        shares: {
          take: 10,
          orderBy: {
            sharedAt: 'desc',
          },
          include: {
            content: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return profile;
  }

  async findByUserId(workspaceId: string, userId: string) {
    return this.prisma.employeeProfile.findFirst({
      where: { userId, workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        badges: true,
      },
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateEmployeeProfileDto) {
    const profile = await this.findOne(workspaceId, id);

    return this.prisma.employeeProfile.update({
      where: { id: profile.id },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        interests: dto.interests,
        preferredPlatforms: dto.preferredPlatforms,
        personalAccounts: dto.personalAccounts,
        notificationSettings: dto.notificationSettings,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        badges: true,
      },
    });
  }

  async updateActivity(employeeId: string) {
    return this.prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  async addPoints(employeeId: string, points: number) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: employeeId },
    });

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const newTotalPoints = profile.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // Level up every 1000 points

    return this.prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
      },
    });
  }

  async updateStats(employeeId: string, stats: {
    shares?: number;
    reach?: number;
    engagement?: number;
  }) {
    return this.prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        ...(stats.shares !== undefined && {
          totalShares: { increment: stats.shares },
        }),
        ...(stats.reach !== undefined && {
          totalReach: { increment: stats.reach },
        }),
        ...(stats.engagement !== undefined && {
          totalEngagement: { increment: stats.engagement },
        }),
      },
    });
  }

  async deactivate(workspaceId: string, id: string) {
    const profile = await this.findOne(workspaceId, id);

    return this.prisma.employeeProfile.update({
      where: { id: profile.id },
      data: {
        isActive: false,
      },
    });
  }

  async activate(workspaceId: string, id: string) {
    const profile = await this.findOne(workspaceId, id);

    return this.prisma.employeeProfile.update({
      where: { id: profile.id },
      data: {
        isActive: true,
      },
    });
  }
}
