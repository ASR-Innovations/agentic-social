import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReputationScoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate and store reputation score for a given date
   */
  async calculateReputationScore(
    workspaceId: string,
    date: Date,
    platform?: string,
    locationId?: string,
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      workspaceId,
      publishedAt: {
        lte: endOfDay,
      },
    };

    if (platform) where.platform = platform;
    if (locationId) where.locationId = locationId;

    // Get all reviews up to this date
    const reviews = await this.prisma.review.findMany({
      where,
      select: {
        rating: true,
        sentiment: true,
        hasResponse: true,
        responseDate: true,
        publishedAt: true,
        topics: true,
        keywords: true,
      },
    });

    if (reviews.length === 0) {
      return null;
    }

    // Calculate metrics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment === 'POSITIVE').length,
      neutral: reviews.filter(r => r.sentiment === 'NEUTRAL').length,
      negative: reviews.filter(r => r.sentiment === 'NEGATIVE').length,
    };

    const positivePercentage = (sentimentCounts.positive / totalReviews) * 100;

    // Calculate response metrics
    const reviewsWithResponse = reviews.filter(r => r.hasResponse);
    const responseRate = (reviewsWithResponse.length / totalReviews) * 100;

    // Calculate average response time (in hours)
    const responseTimes = reviewsWithResponse
      .filter(r => r.responseDate)
      .map(r => {
        const publishTime = r.publishedAt.getTime();
        const responseTime = r.responseDate!.getTime();
        return (responseTime - publishTime) / (1000 * 60 * 60); // Convert to hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate overall reputation score (0-100)
    const overallScore = this.calculateOverallScore(
      averageRating,
      positivePercentage,
      responseRate,
      avgResponseTime,
    );

    // Extract top topics
    const topicCounts = new Map<string, { positive: number; negative: number }>();
    reviews.forEach(review => {
      review.topics.forEach(topic => {
        if (!topicCounts.has(topic)) {
          topicCounts.set(topic, { positive: 0, negative: 0 });
        }
        const counts = topicCounts.get(topic)!;
        if (review.sentiment === 'POSITIVE') counts.positive++;
        if (review.sentiment === 'NEGATIVE') counts.negative++;
      });
    });

    const topPositiveTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1].positive - a[1].positive)
      .slice(0, 5)
      .map(([topic]) => topic);

    const topNegativeTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1].negative - a[1].negative)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Extract common keywords
    const keywordCounts = new Map<string, number>();
    reviews.forEach(review => {
      review.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    const commonKeywords = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);

    // Calculate trends (compare with previous period)
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 30); // 30 days ago

    const previousScore = await this.prisma.reputationScore.findFirst({
      where: {
        workspaceId,
        date: previousDate,
        platform: (platform as any) || null,
        locationId: locationId || null,
      },
    });

    const ratingTrend = previousScore
      ? averageRating - previousScore.averageRating
      : 0;

    const reviewVolumeTrend = previousScore
      ? ((totalReviews - previousScore.totalReviews) / previousScore.totalReviews) * 100
      : 0;

    const sentimentTrend = previousScore
      ? positivePercentage - previousScore.positivePercentage
      : 0;

    // Upsert reputation score
    return this.prisma.reputationScore.upsert({
      where: {
        workspaceId_date_platform_locationId: {
          workspaceId,
          date: startOfDay,
          platform: (platform as any) || null,
          locationId: locationId || null,
        },
      },
      create: {
        workspaceId,
        date: startOfDay,
        platform: (platform as any) || null,
        locationId: locationId || null,
        overallScore,
        averageRating,
        totalReviews,
        positiveCount: sentimentCounts.positive,
        neutralCount: sentimentCounts.neutral,
        negativeCount: sentimentCounts.negative,
        positivePercentage,
        responseRate,
        avgResponseTime,
        ratingTrend,
        reviewVolumeTrend,
        sentimentTrend,
        topPositiveTopics,
        topNegativeTopics,
        commonKeywords,
      },
      update: {
        overallScore,
        averageRating,
        totalReviews,
        positiveCount: sentimentCounts.positive,
        neutralCount: sentimentCounts.neutral,
        negativeCount: sentimentCounts.negative,
        positivePercentage,
        responseRate,
        avgResponseTime,
        ratingTrend,
        reviewVolumeTrend,
        sentimentTrend,
        topPositiveTopics,
        topNegativeTopics,
        commonKeywords,
      },
    });
  }

  /**
   * Calculate overall reputation score (0-100)
   */
  private calculateOverallScore(
    averageRating: number,
    positivePercentage: number,
    responseRate: number,
    avgResponseTime: number,
  ): number {
    // Weighted scoring algorithm
    const ratingScore = (averageRating / 5) * 40; // 40% weight
    const sentimentScore = (positivePercentage / 100) * 30; // 30% weight
    const responseRateScore = (responseRate / 100) * 20; // 20% weight
    
    // Response time score (faster is better, diminishing returns after 24 hours)
    let responseTimeScore = 10; // 10% weight
    if (avgResponseTime > 0) {
      if (avgResponseTime <= 1) responseTimeScore = 10;
      else if (avgResponseTime <= 4) responseTimeScore = 8;
      else if (avgResponseTime <= 12) responseTimeScore = 6;
      else if (avgResponseTime <= 24) responseTimeScore = 4;
      else if (avgResponseTime <= 48) responseTimeScore = 2;
      else responseTimeScore = 0;
    }

    return Math.round(ratingScore + sentimentScore + responseRateScore + responseTimeScore);
  }

  /**
   * Get reputation score for a specific date
   */
  async getReputationScore(
    workspaceId: string,
    date: Date,
    platform?: string,
    locationId?: string,
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.reputationScore.findFirst({
      where: {
        workspaceId,
        date: startOfDay,
        platform: (platform as any) || null,
        locationId: locationId || null,
      },
    });
  }

  /**
   * Get reputation score trends over time
   */
  async getReputationTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    platform?: string,
    locationId?: string,
  ) {
    const where: any = {
      workspaceId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (platform) where.platform = platform;
    if (locationId) where.locationId = locationId;

    return this.prisma.reputationScore.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Get current reputation summary
   */
  async getCurrentReputation(workspaceId: string, platform?: string, locationId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to get today's score, if not available calculate it
    let score = await this.getReputationScore(workspaceId, today, platform, locationId);

    if (!score) {
      score = await this.calculateReputationScore(workspaceId, today, platform, locationId);
    }

    return score;
  }
}
