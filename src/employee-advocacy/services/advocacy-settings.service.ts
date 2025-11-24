import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAdvocacySettingsDto } from '../dto';

@Injectable()
export class AdvocacySettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(workspaceId: string) {
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

  async updateSettings(workspaceId: string, dto: UpdateAdvocacySettingsDto) {
    const settings = await this.getSettings(workspaceId);

    return this.prisma.advocacySettings.update({
      where: { id: settings.id },
      data: {
        pointsPerShare: dto.pointsPerShare,
        pointsPerReach: dto.pointsPerReach,
        pointsPerEngagement: dto.pointsPerEngagement,
        enableLeaderboard: dto.enableLeaderboard,
        leaderboardPeriods: dto.leaderboardPeriods,
        notifyOnNewContent: dto.notifyOnNewContent,
        notifyOnBadgeEarned: dto.notifyOnBadgeEarned,
        notifyOnLeaderboard: dto.notifyOnLeaderboard,
        requireApproval: dto.requireApproval,
        allowContentModification: dto.allowContentModification,
        mandatoryDisclaimer: dto.mandatoryDisclaimer,
        enableAISuggestions: dto.enableAISuggestions,
        suggestionFrequency: dto.suggestionFrequency,
      },
    });
  }
}
