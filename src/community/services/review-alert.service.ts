import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum ReviewAlertType {
  NEGATIVE_REVIEW = 'NEGATIVE_REVIEW',
  RATING_DROP = 'RATING_DROP',
  REVIEW_SPIKE = 'REVIEW_SPIKE',
  SENTIMENT_SHIFT = 'SENTIMENT_SHIFT',
  COMPETITOR_MENTION = 'COMPETITOR_MENTION',
  URGENT_ISSUE = 'URGENT_ISSUE',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Injectable()
export class ReviewAlertService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check for negative review and create alert
   */
  async checkNegativeReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) return null;

    // Create alert for reviews with rating <= 2
    if (review.rating <= 2) {
      const severity = review.rating === 1 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;

      return this.createAlert({
        workspaceId: review.workspaceId,
        reviewId: review.id,
        type: ReviewAlertType.NEGATIVE_REVIEW,
        severity,
        title: `Negative ${review.rating}-star review received`,
        description: `A ${review.rating}-star review was posted on ${review.platform}: "${review.content.substring(0, 100)}..."`,
        metadata: {
          platform: review.platform,
          rating: review.rating,
          reviewerName: review.reviewerName,
        },
      });
    }

    return null;
  }

  /**
   * Check for rating drop
   */
  async checkRatingDrop(workspaceId: string, platform?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const where: any = { workspaceId };
    if (platform) where.platform = platform;

    // Get average rating for last 30 days
    const recentReviews = await this.prisma.review.aggregate({
      where: {
        ...where,
        publishedAt: { gte: thirtyDaysAgo },
      },
      _avg: { rating: true },
      _count: true,
    });

    // Get average rating for previous 30 days
    const previousReviews = await this.prisma.review.aggregate({
      where: {
        ...where,
        publishedAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      _avg: { rating: true },
      _count: true,
    });

    if (!recentReviews._avg.rating || !previousReviews._avg.rating) {
      return null;
    }

    const ratingDrop = previousReviews._avg.rating - recentReviews._avg.rating;

    // Alert if rating dropped by more than 0.5 stars
    if (ratingDrop >= 0.5) {
      const severity = ratingDrop >= 1.0 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;

      return this.createAlert({
        workspaceId,
        type: ReviewAlertType.RATING_DROP,
        severity,
        title: 'Significant rating drop detected',
        description: `Average rating dropped by ${ratingDrop.toFixed(2)} stars in the last 30 days (from ${previousReviews._avg.rating.toFixed(2)} to ${recentReviews._avg.rating.toFixed(2)})`,
        ratingDrop,
        affectedReviews: recentReviews._count,
        metadata: {
          platform,
          previousRating: previousReviews._avg.rating,
          currentRating: recentReviews._avg.rating,
        },
      });
    }

    return null;
  }

  /**
   * Check for review spike (unusual volume)
   */
  async checkReviewSpike(workspaceId: string, platform?: string) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const previousWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const where: any = { workspaceId };
    if (platform) where.platform = platform;

    // Count reviews in last 24 hours
    const recentCount = await this.prisma.review.count({
      where: {
        ...where,
        publishedAt: { gte: last24Hours },
      },
    });

    // Get average daily count for previous week
    const weekCount = await this.prisma.review.count({
      where: {
        ...where,
        publishedAt: {
          gte: previousWeek,
          lt: last24Hours,
        },
      },
    });

    const avgDailyCount = weekCount / 7;

    // Alert if today's count is 3x the average
    if (recentCount >= avgDailyCount * 3 && recentCount >= 5) {
      const severity = recentCount >= avgDailyCount * 5
        ? AlertSeverity.CRITICAL
        : AlertSeverity.HIGH;

      return this.createAlert({
        workspaceId,
        type: ReviewAlertType.REVIEW_SPIKE,
        severity,
        title: 'Unusual review volume detected',
        description: `Received ${recentCount} reviews in the last 24 hours (${Math.round((recentCount / avgDailyCount) * 100)}% above average)`,
        affectedReviews: recentCount,
        metadata: {
          platform,
          recentCount,
          avgDailyCount: Math.round(avgDailyCount),
        },
      });
    }

    return null;
  }

  /**
   * Check for sentiment shift
   */
  async checkSentimentShift(workspaceId: string, platform?: string) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const where: any = { workspaceId };
    if (platform) where.platform = platform;

    // Get sentiment breakdown for last 7 days
    const recentSentiment = await this.prisma.review.groupBy({
      by: ['sentiment'],
      where: {
        ...where,
        publishedAt: { gte: last7Days },
      },
      _count: true,
    });

    // Get sentiment breakdown for previous 7 days
    const previousSentiment = await this.prisma.review.groupBy({
      by: ['sentiment'],
      where: {
        ...where,
        publishedAt: {
          gte: previous7Days,
          lt: last7Days,
        },
      },
      _count: true,
    });

    const recentTotal = recentSentiment.reduce((sum, s) => sum + s._count, 0);
    const previousTotal = previousSentiment.reduce((sum, s) => sum + s._count, 0);

    if (recentTotal === 0 || previousTotal === 0) return null;

    const recentNegative = recentSentiment.find(s => s.sentiment === 'NEGATIVE')?._count || 0;
    const previousNegative = previousSentiment.find(s => s.sentiment === 'NEGATIVE')?._count || 0;

    const recentNegativePercent = (recentNegative / recentTotal) * 100;
    const previousNegativePercent = (previousNegative / previousTotal) * 100;

    const sentimentShift = recentNegativePercent - previousNegativePercent;

    // Alert if negative sentiment increased by more than 20%
    if (sentimentShift >= 20) {
      const severity = sentimentShift >= 40 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;

      return this.createAlert({
        workspaceId,
        type: ReviewAlertType.SENTIMENT_SHIFT,
        severity,
        title: 'Negative sentiment increase detected',
        description: `Negative reviews increased by ${sentimentShift.toFixed(1)}% in the last 7 days`,
        affectedReviews: recentNegative,
        metadata: {
          platform,
          recentNegativePercent: recentNegativePercent.toFixed(1),
          previousNegativePercent: previousNegativePercent.toFixed(1),
        },
      });
    }

    return null;
  }

  /**
   * Create an alert
   */
  async createAlert(data: {
    workspaceId: string;
    reviewId?: string;
    type: ReviewAlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    affectedReviews?: number;
    ratingDrop?: number;
    metadata?: any;
  }) {
    // Check if similar alert already exists and is active
    const existingAlert = await this.prisma.reviewAlert.findFirst({
      where: {
        workspaceId: data.workspaceId,
        type: data.type,
        status: 'ACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (existingAlert) {
      return existingAlert; // Don't create duplicate alerts
    }

    return this.prisma.reviewAlert.create({
      data: {
        workspaceId: data.workspaceId,
        reviewId: data.reviewId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        affectedReviews: data.affectedReviews,
        ratingDrop: data.ratingDrop,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Get active alerts for workspace
   */
  async getActiveAlerts(workspaceId: string) {
    return this.prisma.reviewAlert.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        review: {
          select: {
            id: true,
            platform: true,
            rating: true,
            content: true,
            reviewerName: true,
          },
        },
      },
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    return this.prisma.reviewAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string) {
    return this.prisma.reviewAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Run all alert checks for a workspace
   */
  async runAlertChecks(workspaceId: string) {
    const alerts = [];

    // Check for rating drops
    const ratingDropAlert = await this.checkRatingDrop(workspaceId);
    if (ratingDropAlert) alerts.push(ratingDropAlert);

    // Check for review spikes
    const reviewSpikeAlert = await this.checkReviewSpike(workspaceId);
    if (reviewSpikeAlert) alerts.push(reviewSpikeAlert);

    // Check for sentiment shifts
    const sentimentShiftAlert = await this.checkSentimentShift(workspaceId);
    if (sentimentShiftAlert) alerts.push(sentimentShiftAlert);

    return alerts;
  }
}
