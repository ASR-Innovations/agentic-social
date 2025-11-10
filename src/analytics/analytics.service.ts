import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async recordEvent(
    tenantId: string,
    eventType: string,
    value: number,
    metadata?: {
      postId?: string;
      socialAccountId?: string;
      platform?: string;
      [key: string]: any;
    },
  ): Promise<void> {
    const event = this.analyticsRepository.create({
      tenantId,
      postId: metadata?.postId,
      socialAccountId: metadata?.socialAccountId,
      platform: metadata?.platform || 'unknown',
      eventType,
      value,
      metadata: metadata || {},
    });

    await this.analyticsRepository.save(event);
  }

  async getPostAnalytics(
    tenantId: string,
    postId: string,
  ): Promise<{
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    engagement: number;
    byPlatform: Record<string, any>;
  }> {
    const events = await this.analyticsRepository.find({
      where: { tenantId, postId },
    });

    const metrics = {
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      engagement: 0,
      byPlatform: {} as Record<string, any>,
    };

    for (const event of events) {
      if (event.eventType === 'impressions') metrics.impressions += event.value;
      if (event.eventType === 'likes') metrics.likes += event.value;
      if (event.eventType === 'comments') metrics.comments += event.value;
      if (event.eventType === 'shares') metrics.shares += event.value;
      if (event.eventType === 'clicks') metrics.clicks += event.value;

      // Track by platform
      if (!metrics.byPlatform[event.platform]) {
        metrics.byPlatform[event.platform] = {
          impressions: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
        };
      }

      if (metrics.byPlatform[event.platform][event.eventType] !== undefined) {
        metrics.byPlatform[event.platform][event.eventType] += event.value;
      }
    }

    // Calculate engagement rate
    if (metrics.impressions > 0) {
      metrics.engagement = ((metrics.likes + metrics.comments + metrics.shares) / metrics.impressions) * 100;
    }

    return metrics;
  }

  async getTenantAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalImpressions: number;
    totalEngagement: number;
    totalPosts: number;
    averageEngagementRate: number;
    topPosts: any[];
    byPlatform: Record<string, any>;
    timeline: any[];
  }> {
    const events = await this.analyticsRepository.find({
      where: {
        tenantId,
        recordedAt: Between(startDate, endDate),
      },
      order: { recordedAt: 'ASC' },
    });

    const metrics = {
      totalImpressions: 0,
      totalEngagement: 0,
      totalPosts: new Set<string>(),
      averageEngagementRate: 0,
      topPosts: [] as any[],
      byPlatform: {} as Record<string, any>,
      timeline: [] as any[],
    };

    const postMetrics: Record<string, any> = {};

    for (const event of events) {
      if (event.postId) {
        metrics.totalPosts.add(event.postId);

        if (!postMetrics[event.postId]) {
          postMetrics[event.postId] = {
            postId: event.postId,
            impressions: 0,
            engagement: 0,
          };
        }

        if (event.eventType === 'impressions') {
          metrics.totalImpressions += event.value;
          postMetrics[event.postId].impressions += event.value;
        }

        if (['likes', 'comments', 'shares'].includes(event.eventType)) {
          metrics.totalEngagement += event.value;
          postMetrics[event.postId].engagement += event.value;
        }
      }

      // By platform
      if (!metrics.byPlatform[event.platform]) {
        metrics.byPlatform[event.platform] = {
          impressions: 0,
          engagement: 0,
          posts: new Set<string>(),
        };
      }

      if (event.eventType === 'impressions') {
        metrics.byPlatform[event.platform].impressions += event.value;
      }

      if (['likes', 'comments', 'shares'].includes(event.eventType)) {
        metrics.byPlatform[event.platform].engagement += event.value;
      }

      if (event.postId) {
        metrics.byPlatform[event.platform].posts.add(event.postId);
      }
    }

    // Calculate average engagement rate
    if (metrics.totalImpressions > 0) {
      metrics.averageEngagementRate = (metrics.totalEngagement / metrics.totalImpressions) * 100;
    }

    // Get top posts
    metrics.topPosts = Object.values(postMetrics)
      .sort((a: any, b: any) => b.engagement - a.engagement)
      .slice(0, 10);

    // Convert platform post sets to counts
    for (const platform in metrics.byPlatform) {
      metrics.byPlatform[platform].postCount = metrics.byPlatform[platform].posts.size;
      delete metrics.byPlatform[platform].posts;
    }

    return {
      ...metrics,
      totalPosts: metrics.totalPosts.size,
    } as any;
  }
}
