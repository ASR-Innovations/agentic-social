import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VideoAnalytics,
  VideoAnalyticsDocument,
} from './schemas/video-analytics.schema';

export interface VideoPerformanceMetrics {
  videoId: string;
  views: number;
  uniqueViews: number;
  averageWatchTime: number;
  averageWatchPercentage: number;
  completionRate: number;
  engagementRate: number;
  totalEngagements: number;
  clickThroughRate: number;
  retentionCurve: number[];
  dropOffPoints: { [timestamp: string]: number };
  topTrafficSources: Array<{ source: string; views: number }>;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  topCountries: Array<{ country: string; views: number }>;
}

export interface VideoComparisonMetrics {
  videoId: string;
  postId: string;
  platform: string;
  views: number;
  completionRate: number;
  engagementRate: number;
  averageWatchPercentage: number;
}

@Injectable()
export class VideoAnalyticsService {
  private readonly logger = new Logger(VideoAnalyticsService.name);

  constructor(
    @InjectModel(VideoAnalytics.name)
    private videoAnalyticsModel: Model<VideoAnalyticsDocument>,
  ) {}

  /**
   * Create or update video analytics
   */
  async upsertAnalytics(
    videoId: string,
    workspaceId: string,
    postId: string,
    platform: string,
    metrics: Partial<VideoAnalytics>,
  ): Promise<VideoAnalytics> {
    const analytics = await this.videoAnalyticsModel.findOneAndUpdate(
      { videoId, workspaceId, postId, platform },
      {
        $set: {
          ...metrics,
          lastFetchedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    return analytics.toObject();
  }

  /**
   * Get video performance metrics
   */
  async getVideoPerformance(
    videoId: string,
    workspaceId: string,
  ): Promise<VideoPerformanceMetrics | null> {
    const analytics = await this.videoAnalyticsModel.findOne({
      videoId,
      workspaceId,
    });

    if (!analytics) {
      return null;
    }

    const totalEngagements =
      analytics.likes + analytics.comments + analytics.shares + analytics.saves;
    const engagementRate =
      analytics.views > 0 ? (totalEngagements / analytics.views) * 100 : 0;

    // Get top traffic sources
    const topTrafficSources = Object.entries(analytics.trafficSources || {})
      .map(([source, views]) => ({ source, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Get top countries
    const topCountries = Object.entries(analytics.geographicData || {})
      .map(([country, views]) => ({ country, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      videoId: analytics.videoId,
      views: analytics.views,
      uniqueViews: analytics.uniqueViews,
      averageWatchTime: analytics.averageWatchTime,
      averageWatchPercentage: analytics.averageWatchPercentage,
      completionRate: analytics.completionRate,
      engagementRate,
      totalEngagements,
      clickThroughRate: analytics.clickThroughRate,
      retentionCurve: analytics.retentionCurve,
      dropOffPoints: analytics.dropOffPoints,
      topTrafficSources,
      deviceBreakdown: {
        mobile: analytics.deviceBreakdown?.mobile || 0,
        desktop: analytics.deviceBreakdown?.desktop || 0,
        tablet: analytics.deviceBreakdown?.tablet || 0,
      },
      topCountries,
    };
  }

  /**
   * Get video analytics for a workspace
   */
  async getWorkspaceVideoAnalytics(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<VideoAnalytics[]> {
    const query: any = { workspaceId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    return await this.videoAnalyticsModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Compare video performance
   */
  async compareVideos(
    videoIds: string[],
    workspaceId: string,
  ): Promise<VideoComparisonMetrics[]> {
    const analytics = await this.videoAnalyticsModel.find({
      videoId: { $in: videoIds },
      workspaceId,
    });

    return analytics.map((a) => {
      const totalEngagements = a.likes + a.comments + a.shares + a.saves;
      const engagementRate =
        a.views > 0 ? (totalEngagements / a.views) * 100 : 0;

      return {
        videoId: a.videoId,
        postId: a.postId,
        platform: a.platform,
        views: a.views,
        completionRate: a.completionRate,
        engagementRate,
        averageWatchPercentage: a.averageWatchPercentage,
      };
    });
  }

  /**
   * Get top performing videos
   */
  async getTopPerformingVideos(
    workspaceId: string,
    limit: number = 10,
    sortBy: 'views' | 'completionRate' | 'engagementRate' = 'views',
  ): Promise<VideoAnalytics[]> {
    let sortField = 'views';
    if (sortBy === 'completionRate') sortField = 'completionRate';
    if (sortBy === 'engagementRate') {
      // For engagement rate, we need to calculate it
      const videos = await this.videoAnalyticsModel
        .find({ workspaceId })
        .lean();

      return videos
        .map((v) => {
          const totalEngagements = v.likes + v.comments + v.shares + v.saves;
          const engagementRate = v.views > 0 ? totalEngagements / v.views : 0;
          return { ...v, calculatedEngagementRate: engagementRate };
        })
        .sort((a, b) => b.calculatedEngagementRate - a.calculatedEngagementRate)
        .slice(0, limit);
    }

    return await this.videoAnalyticsModel
      .find({ workspaceId })
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get average video metrics for workspace
   */
  async getAverageMetrics(workspaceId: string): Promise<{
    averageViews: number;
    averageCompletionRate: number;
    averageWatchPercentage: number;
    averageEngagementRate: number;
  }> {
    const result = await this.videoAnalyticsModel.aggregate([
      { $match: { workspaceId } },
      {
        $group: {
          _id: null,
          averageViews: { $avg: '$views' },
          averageCompletionRate: { $avg: '$completionRate' },
          averageWatchPercentage: { $avg: '$averageWatchPercentage' },
          totalViews: { $sum: '$views' },
          totalEngagements: {
            $sum: {
              $add: ['$likes', '$comments', '$shares', '$saves'],
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        averageViews: 0,
        averageCompletionRate: 0,
        averageWatchPercentage: 0,
        averageEngagementRate: 0,
      };
    }

    const data = result[0];
    const averageEngagementRate =
      data.totalViews > 0 ? (data.totalEngagements / data.totalViews) * 100 : 0;

    return {
      averageViews: Math.round(data.averageViews || 0),
      averageCompletionRate: Math.round(data.averageCompletionRate || 0),
      averageWatchPercentage: Math.round(data.averageWatchPercentage || 0),
      averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
    };
  }

  /**
   * Track video view event
   */
  async trackView(
    videoId: string,
    workspaceId: string,
    postId: string,
    platform: string,
    watchTime: number,
    isUnique: boolean = false,
  ): Promise<void> {
    const update: any = {
      $inc: {
        views: 1,
        totalWatchTime: watchTime,
      },
    };

    if (isUnique) {
      update.$inc.uniqueViews = 1;
    }

    await this.videoAnalyticsModel.updateOne(
      { videoId, workspaceId, postId, platform },
      update,
      { upsert: true },
    );

    // Recalculate average watch time
    const analytics = await this.videoAnalyticsModel.findOne({
      videoId,
      workspaceId,
      postId,
      platform,
    });

    if (analytics && analytics.views > 0) {
      const averageWatchTime = analytics.totalWatchTime / analytics.views;
      await this.videoAnalyticsModel.updateOne(
        { videoId, workspaceId, postId, platform },
        { $set: { averageWatchTime } },
      );
    }
  }

  /**
   * Track video completion
   */
  async trackCompletion(
    videoId: string,
    workspaceId: string,
    postId: string,
    platform: string,
  ): Promise<void> {
    await this.videoAnalyticsModel.updateOne(
      { videoId, workspaceId, postId, platform },
      { $inc: { completions: 1 } },
      { upsert: true },
    );

    // Recalculate completion rate
    const analytics = await this.videoAnalyticsModel.findOne({
      videoId,
      workspaceId,
      postId,
      platform,
    });

    if (analytics && analytics.views > 0) {
      const completionRate = (analytics.completions / analytics.views) * 100;
      await this.videoAnalyticsModel.updateOne(
        { videoId, workspaceId, postId, platform },
        { $set: { completionRate } },
      );
    }
  }
}
