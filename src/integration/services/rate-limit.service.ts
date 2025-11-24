import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RateLimitService {
  constructor(private prisma: PrismaService) {}

  async checkRateLimit(
    resourceType: string,
    resourceId: string,
    identifier: string,
    hourlyLimit: number,
    dailyLimit: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check hourly rate limit
    const hourlyTracking = await this.prisma.rateLimitTracking.findMany({
      where: {
        resourceType,
        resourceId,
        identifier,
        windowStart: { gte: hourAgo },
      },
    });

    const hourlyCount = hourlyTracking.reduce((sum, t) => sum + t.count, 0);

    if (hourlyCount >= hourlyLimit) {
      const oldestWindow = hourlyTracking.sort((a, b) => 
        a.windowStart.getTime() - b.windowStart.getTime()
      )[0];
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(oldestWindow.windowStart.getTime() + 60 * 60 * 1000),
      };
    }

    // Check daily rate limit
    const dailyTracking = await this.prisma.rateLimitTracking.findMany({
      where: {
        resourceType,
        resourceId,
        identifier,
        windowStart: { gte: dayAgo },
      },
    });

    const dailyCount = dailyTracking.reduce((sum, t) => sum + t.count, 0);

    if (dailyCount >= dailyLimit) {
      const oldestWindow = dailyTracking.sort((a, b) => 
        a.windowStart.getTime() - b.windowStart.getTime()
      )[0];
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(oldestWindow.windowStart.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    // Record this request
    await this.recordRequest(resourceType, resourceId, identifier);

    return {
      allowed: true,
      remaining: Math.min(hourlyLimit - hourlyCount - 1, dailyLimit - dailyCount - 1),
      resetAt: new Date(now.getTime() + 60 * 60 * 1000),
    };
  }

  private async recordRequest(resourceType: string, resourceId: string, identifier: string) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (now.getTime() % (60 * 60 * 1000))); // Round to hour
    const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);

    // Try to update existing tracking record
    const existing = await this.prisma.rateLimitTracking.findFirst({
      where: {
        resourceType,
        resourceId,
        identifier,
        windowStart,
      },
    });

    if (existing) {
      await this.prisma.rateLimitTracking.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await this.prisma.rateLimitTracking.create({
        data: {
          resourceType,
          resourceId,
          identifier,
          count: 1,
          windowStart,
          windowEnd,
        },
      });
    }
  }

  async cleanupOldRecords() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    await this.prisma.rateLimitTracking.deleteMany({
      where: {
        windowEnd: { lt: twoDaysAgo },
      },
    });
  }
}
