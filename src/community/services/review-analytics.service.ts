import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive review analytics dashboard
   */
  async getDashboard(workspaceId: string, filters?: {
    platform?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { workspaceId };

    if (filters?.platform) where.platform = filters.platform;
    if (filters?.locationId) where.locationId = filters.locationId;

    if (filters?.startDate || filters?.endDate) {
      where.publishedAt = {};
      if (filters.startDate) where.publishedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.publishedAt.lte = new Date(filters.endDate);
    }

    const [
      overview,
      ratingDistribution,
      sentimentTrends,
      topTopics,
      platformBreakdown,
      responseMetrics,
    ] = await Promise.all([
      this.getOverview(where),
      this.getRatingDistribution(where),
      this.getSentimentTrends(where),
      this.getTopTopics(where),
      this.getPlatformBreakdown(workspaceId, filters),
      this.getResponseMetrics(where),
    ]);

    return {
      overview,
      ratingDistribution,
      sentimentTrends,
      topTopics,
      platformBreakdown,
      responseMetrics,
    };
  }

  /**
   * Get overview metrics
   */
  private async getOverview(where: any) {
    const [total, avgRating, sentimentCounts] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['sentiment'],
        where,
        _count: true,
      }),
    ]);

    const sentimentBreakdown = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    sentimentCounts.forEach(item => {
      sentimentBreakdown[item.sentiment.toLowerCase()] = item._count;
    });

    return {
      totalReviews: total,
      averageRating: avgRating._avg.rating || 0,
      sentimentBreakdown,
    };
  }

  /**
   * Get rating distribution
   */
  private async getRatingDistribution(where: any) {
    const distribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: true,
    });

    // Initialize all ratings 1-5
    const result = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach(item => {
      const rating = Math.floor(item.rating);
      if (rating >= 1 && rating <= 5) {
        result[rating] = item._count;
      }
    });

    return result;
  }

  /**
   * Get sentiment trends over time
   */
  private async getSentimentTrends(where: any) {
    const reviews = await this.prisma.review.findMany({
      where,
      select: {
        publishedAt: true,
        sentiment: true,
      },
      orderBy: { publishedAt: 'asc' },
    });

    // Group by week
    const weeklyTrends = new Map<string, {
      week: string;
      positive: number;
      neutral: number;
      negative: number;
    }>();

    reviews.forEach(review => {
      const weekStart = this.getWeekStart(review.publishedAt);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyTrends.has(weekKey)) {
        weeklyTrends.set(weekKey, {
          week: weekKey,
          positive: 0,
          neutral: 0,
          negative: 0,
        });
      }

      const trend = weeklyTrends.get(weekKey)!;
      trend[review.sentiment.toLowerCase()]++;
    });

    return Array.from(weeklyTrends.values());
  }

  /**
   * Get top topics mentioned in reviews
   */
  private async getTopTopics(where: any) {
    const reviews = await this.prisma.review.findMany({
      where,
      select: {
        topics: true,
        sentiment: true,
      },
    });

    const topicCounts = new Map<string, {
      topic: string;
      total: number;
      positive: number;
      negative: number;
    }>();

    reviews.forEach(review => {
      review.topics.forEach(topic => {
        if (!topicCounts.has(topic)) {
          topicCounts.set(topic, {
            topic,
            total: 0,
            positive: 0,
            negative: 0,
          });
        }

        const counts = topicCounts.get(topic)!;
        counts.total++;
        if (review.sentiment === 'POSITIVE') counts.positive++;
        if (review.sentiment === 'NEGATIVE') counts.negative++;
      });
    });

    return Array.from(topicCounts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }

  /**
   * Get platform breakdown
   */
  private async getPlatformBreakdown(workspaceId: string, filters?: any) {
    const where: any = { workspaceId };

    if (filters?.startDate || filters?.endDate) {
      where.publishedAt = {};
      if (filters.startDate) where.publishedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.publishedAt.lte = new Date(filters.endDate);
    }

    const platformStats = await this.prisma.review.groupBy({
      by: ['platform'],
      where,
      _count: true,
      _avg: { rating: true },
    });

    return platformStats.map(stat => ({
      platform: stat.platform,
      count: stat._count,
      averageRating: stat._avg.rating || 0,
    }));
  }

  /**
   * Get response metrics
   */
  private async getResponseMetrics(where: any) {
    const [total, responded] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where: { ...where, hasResponse: true },
        select: {
          publishedAt: true,
          responseDate: true,
        },
      }),
    ]);

    const responseRate = total > 0 ? (responded.length / total) * 100 : 0;

    // Calculate average response time
    const responseTimes = responded
      .filter(r => r.responseDate)
      .map(r => {
        const publishTime = r.publishedAt.getTime();
        const responseTime = r.responseDate!.getTime();
        return (responseTime - publishTime) / (1000 * 60 * 60); // Hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      responseRate,
      avgResponseTime,
      totalResponded: responded.length,
      totalReviews: total,
    };
  }

  /**
   * Get week start date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  /**
   * Get review volume trends
   */
  async getVolumeTrends(workspaceId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reviews = await this.prisma.review.findMany({
      where: {
        workspaceId,
        publishedAt: { gte: startDate },
      },
      select: {
        publishedAt: true,
      },
      orderBy: { publishedAt: 'asc' },
    });

    // Group by day
    const dailyVolume = new Map<string, number>();

    reviews.forEach(review => {
      const dateKey = review.publishedAt.toISOString().split('T')[0];
      dailyVolume.set(dateKey, (dailyVolume.get(dateKey) || 0) + 1);
    });

    return Array.from(dailyVolume.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /**
   * Get comparison with previous period
   */
  async getComparison(workspaceId: string, days: number = 30) {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    const [currentPeriod, previousPeriod] = await Promise.all([
      this.getOverview({
        workspaceId,
        publishedAt: { gte: currentPeriodStart },
      }),
      this.getOverview({
        workspaceId,
        publishedAt: {
          gte: previousPeriodStart,
          lt: currentPeriodStart,
        },
      }),
    ]);

    return {
      current: currentPeriod,
      previous: previousPeriod,
      changes: {
        totalReviews: currentPeriod.totalReviews - previousPeriod.totalReviews,
        averageRating: currentPeriod.averageRating - previousPeriod.averageRating,
        positiveChange: currentPeriod.sentimentBreakdown.positive - previousPeriod.sentimentBreakdown.positive,
        negativeChange: currentPeriod.sentimentBreakdown.negative - previousPeriod.sentimentBreakdown.negative,
      },
    };
  }
}
