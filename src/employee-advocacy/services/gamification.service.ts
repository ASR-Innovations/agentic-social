import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  criteria: (profile: any, shares: any[]) => boolean;
}

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  private badgeDefinitions: BadgeDefinition[] = [
    {
      type: 'FIRST_SHARE',
      name: 'First Share',
      description: 'Shared your first piece of content',
      icon: '🎉',
      criteria: (profile, shares) => shares.length >= 1,
    },
    {
      type: 'SHARES_10',
      name: '10 Shares',
      description: 'Shared 10 pieces of content',
      icon: '🔟',
      criteria: (profile) => profile.totalShares >= 10,
    },
    {
      type: 'SHARES_50',
      name: '50 Shares',
      description: 'Shared 50 pieces of content',
      icon: '⭐',
      criteria: (profile) => profile.totalShares >= 50,
    },
    {
      type: 'SHARES_100',
      name: '100 Shares',
      description: 'Shared 100 pieces of content',
      icon: '💯',
      criteria: (profile) => profile.totalShares >= 100,
    },
    {
      type: 'REACH_1K',
      name: '1K Reach',
      description: 'Reached 1,000 people',
      icon: '📢',
      criteria: (profile) => profile.totalReach >= 1000,
    },
    {
      type: 'REACH_10K',
      name: '10K Reach',
      description: 'Reached 10,000 people',
      icon: '📣',
      criteria: (profile) => profile.totalReach >= 10000,
    },
    {
      type: 'REACH_100K',
      name: '100K Reach',
      description: 'Reached 100,000 people',
      icon: '🚀',
      criteria: (profile) => profile.totalReach >= 100000,
    },
    {
      type: 'ENGAGEMENT_MASTER',
      name: 'Engagement Master',
      description: 'Generated 1,000+ engagements',
      icon: '💪',
      criteria: (profile) => profile.totalEngagement >= 1000,
    },
    {
      type: 'CONSISTENT_SHARER',
      name: 'Consistent Sharer',
      description: 'Shared content for 7 consecutive days',
      icon: '📅',
      criteria: (profile, shares) => this.hasConsecutiveDays(shares, 7),
    },
    {
      type: 'TOP_PERFORMER',
      name: 'Top Performer',
      description: 'Ranked #1 on the leaderboard',
      icon: '🏆',
      criteria: () => false, // Awarded manually by leaderboard service
    },
    {
      type: 'INFLUENCER',
      name: 'Influencer',
      description: 'Average reach of 1,000+ per share',
      icon: '🌟',
      criteria: (profile) => {
        if (profile.totalShares === 0) return false;
        return profile.totalReach / profile.totalShares >= 1000;
      },
    },
    {
      type: 'BRAND_AMBASSADOR',
      name: 'Brand Ambassador',
      description: 'Reached level 10',
      icon: '👑',
      criteria: (profile) => profile.level >= 10,
    },
  ];

  async checkAndAwardBadges(employeeId: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        badges: true,
        shares: {
          orderBy: {
            sharedAt: 'desc',
          },
        },
      },
    });

    if (!profile) {
      return [];
    }

    const earnedBadgeTypes = new Set(profile.badges.map(b => b.badgeType));
    const newBadges = [];

    for (const badgeDef of this.badgeDefinitions) {
      // Skip if already earned
      if (earnedBadgeTypes.has(badgeDef.type as any)) {
        continue;
      }

      // Check if criteria is met
      if (badgeDef.criteria(profile, profile.shares)) {
        const badge = await this.prisma.employeeBadge.create({
          data: {
            employeeId,
            badgeType: badgeDef.type as any,
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            criteria: {
              totalShares: profile.totalShares,
              totalReach: profile.totalReach,
              totalEngagement: profile.totalEngagement,
              level: profile.level,
            },
          },
        });

        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  async awardBadge(employeeId: string, badgeType: string) {
    const badgeDef = this.badgeDefinitions.find(b => b.type === badgeType);
    if (!badgeDef) {
      throw new Error('Invalid badge type');
    }

    // Check if already earned
    const existing = await this.prisma.employeeBadge.findFirst({
      where: {
        employeeId,
        badgeType: badgeType as any,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.employeeBadge.create({
      data: {
        employeeId,
        badgeType: badgeType as any,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
      },
    });
  }

  async getEmployeeBadges(employeeId: string) {
    return this.prisma.employeeBadge.findMany({
      where: { employeeId },
      orderBy: {
        earnedAt: 'desc',
      },
    });
  }

  async getBadgeProgress(employeeId: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        badges: true,
        shares: true,
      },
    });

    if (!profile) {
      return [];
    }

    const earnedBadgeTypes = new Set(profile.badges.map(b => b.badgeType));

    return this.badgeDefinitions.map(badgeDef => {
      const earned = earnedBadgeTypes.has(badgeDef.type as any);
      let progress = 0;

      if (!earned) {
        // Calculate progress towards badge
        switch (badgeDef.type) {
          case 'SHARES_10':
            progress = Math.min(100, (profile.totalShares / 10) * 100);
            break;
          case 'SHARES_50':
            progress = Math.min(100, (profile.totalShares / 50) * 100);
            break;
          case 'SHARES_100':
            progress = Math.min(100, (profile.totalShares / 100) * 100);
            break;
          case 'REACH_1K':
            progress = Math.min(100, (profile.totalReach / 1000) * 100);
            break;
          case 'REACH_10K':
            progress = Math.min(100, (profile.totalReach / 10000) * 100);
            break;
          case 'REACH_100K':
            progress = Math.min(100, (profile.totalReach / 100000) * 100);
            break;
          case 'ENGAGEMENT_MASTER':
            progress = Math.min(100, (profile.totalEngagement / 1000) * 100);
            break;
          case 'BRAND_AMBASSADOR':
            progress = Math.min(100, (profile.level / 10) * 100);
            break;
          default:
            progress = 0;
        }
      }

      return {
        type: badgeDef.type,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        earned,
        progress: earned ? 100 : Math.floor(progress),
        earnedAt: earned ? profile.badges.find(b => b.badgeType === badgeDef.type)?.earnedAt : null,
      };
    });
  }

  private hasConsecutiveDays(shares: any[], days: number): boolean {
    if (shares.length < days) return false;

    const shareDates = shares
      .map(s => new Date(s.sharedAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort();

    let consecutiveCount = 1;
    for (let i = 1; i < shareDates.length; i++) {
      const prevDate = new Date(shareDates[i - 1]);
      const currDate = new Date(shareDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        consecutiveCount++;
        if (consecutiveCount >= days) return true;
      } else {
        consecutiveCount = 1;
      }
    }

    return false;
  }
}
