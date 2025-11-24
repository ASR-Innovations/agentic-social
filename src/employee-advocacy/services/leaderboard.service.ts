import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from './gamification.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async generateLeaderboard(
    workspaceId: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL_TIME',
  ) {
    const { startDate, endDate } = this.getPeriodDates(period);

    // Get all employee profiles
    const profiles = await this.prisma.employeeProfile.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        shares: {
          where: {
            sharedAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'PUBLISHED',
          },
        },
      },
    });

    // Calculate rankings
    const rankings = profiles.map(profile => {
      const periodShares = profile.shares;
      const totalReach = periodShares.reduce((sum, share) => sum + share.reach, 0);
      const totalEngagement = periodShares.reduce(
        (sum, share) => sum + share.likes + share.comments + share.shares,
        0,
      );
      const totalPoints = periodShares.reduce((sum, share) => sum + share.pointsEarned, 0);

      return {
        employeeId: profile.id,
        employeeName: profile.displayName || profile.user.name,
        employeeAvatar: profile.user.avatar,
        rank: 0, // Will be set after sorting
        points: period === 'ALL_TIME' ? profile.totalPoints : totalPoints,
        shares: periodShares.length,
        reach: totalReach,
        engagement: totalEngagement,
        level: profile.level,
      };
    });

    // Sort by points and assign ranks
    rankings.sort((a, b) => b.points - a.points);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    // Save leaderboard
    const leaderboard = await this.prisma.advocacyLeaderboard.create({
      data: {
        workspaceId,
        period,
        startDate,
        endDate,
        rankings,
      },
    });

    // Award TOP_PERFORMER badge to #1
    if (rankings.length > 0 && rankings[0].employeeId) {
      await this.gamificationService.awardBadge(rankings[0].employeeId, 'TOP_PERFORMER');
    }

    return leaderboard;
  }

  async getLeaderboard(
    workspaceId: string,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ALL_TIME',
  ) {
    const { startDate, endDate } = this.getPeriodDates(period);

    // Try to find existing leaderboard for this period
    let leaderboard = await this.prisma.advocacyLeaderboard.findFirst({
      where: {
        workspaceId,
        period,
        startDate: {
          gte: startDate,
        },
        endDate: {
          lte: endDate,
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    // If not found or outdated, generate new one
    if (!leaderboard || this.isOutdated(leaderboard.generatedAt, period)) {
      leaderboard = await this.generateLeaderboard(workspaceId, period);
    }

    return leaderboard;
  }

  async getEmployeeRank(workspaceId: string, employeeId: string, period: string) {
    const leaderboard = await this.getLeaderboard(workspaceId, period as any);
    const rankings = leaderboard.rankings as any[];

    const employeeRanking = rankings.find(r => r.employeeId === employeeId);

    return {
      rank: employeeRanking?.rank || null,
      totalParticipants: rankings.length,
      ...employeeRanking,
    };
  }

  async getTopPerformers(workspaceId: string, period: string, limit: number = 10) {
    const leaderboard = await this.getLeaderboard(workspaceId, period as any);
    const rankings = leaderboard.rankings as any[];

    return rankings.slice(0, limit);
  }

  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (period) {
      case 'DAILY':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'WEEKLY':
        const dayOfWeek = now.getDay();
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'MONTHLY':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'QUARTERLY':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(quarter * 3, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(quarter * 3 + 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'YEARLY':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'ALL_TIME':
        startDate = new Date(0); // Beginning of time
        break;
    }

    return { startDate, endDate };
  }

  private isOutdated(generatedAt: Date, period: string): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - new Date(generatedAt).getTime()) / (1000 * 60);

    switch (period) {
      case 'DAILY':
        return diffMinutes > 60; // Refresh every hour
      case 'WEEKLY':
        return diffMinutes > 360; // Refresh every 6 hours
      case 'MONTHLY':
      case 'QUARTERLY':
      case 'YEARLY':
        return diffMinutes > 1440; // Refresh every 24 hours
      case 'ALL_TIME':
        return diffMinutes > 360; // Refresh every 6 hours
      default:
        return true;
    }
  }
}
