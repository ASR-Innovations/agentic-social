import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoAnalyticsDocument = VideoAnalytics & Document;

@Schema({ timestamps: true, collection: 'video_analytics' })
export class VideoAnalytics {
  @Prop({ required: true, index: true })
  videoId: string;

  @Prop({ required: true, index: true })
  workspaceId: string;

  @Prop({ required: true, index: true })
  postId: string;

  @Prop({ required: true })
  platform: string;

  // View metrics
  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  uniqueViews: number;

  @Prop({ default: 0 })
  impressions: number;

  // Engagement metrics
  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop({ default: 0 })
  saves: number;

  // Watch time metrics
  @Prop({ default: 0 })
  totalWatchTime: number; // in seconds

  @Prop({ default: 0 })
  averageWatchTime: number; // in seconds

  @Prop({ default: 0 })
  averageWatchPercentage: number; // 0-100

  // Completion metrics
  @Prop({ default: 0 })
  completionRate: number; // 0-100

  @Prop({ default: 0 })
  completions: number;

  // Drop-off analysis
  @Prop({ type: Object, default: {} })
  dropOffPoints: {
    [timestamp: string]: number; // timestamp -> percentage of viewers who dropped off
  };

  // Audience retention curve
  @Prop({ type: [Number], default: [] })
  retentionCurve: number[]; // Array of percentages at each second/interval

  // Traffic sources
  @Prop({ type: Object, default: {} })
  trafficSources: {
    [source: string]: number; // source -> view count
  };

  // Device breakdown
  @Prop({ type: Object, default: {} })
  deviceBreakdown: {
    mobile?: number;
    desktop?: number;
    tablet?: number;
  };

  // Geographic data
  @Prop({ type: Object, default: {} })
  geographicData: {
    [country: string]: number; // country -> view count
  };

  // Click-through metrics (for videos with CTAs)
  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: 0 })
  clickThroughRate: number; // 0-100

  // Replay metrics
  @Prop({ default: 0 })
  replays: number;

  // Last updated timestamp
  @Prop({ type: Date, default: Date.now })
  lastFetchedAt: Date;
}

export const VideoAnalyticsSchema = SchemaFactory.createForClass(VideoAnalytics);

// Create indexes for efficient querying
VideoAnalyticsSchema.index({ videoId: 1, workspaceId: 1 });
VideoAnalyticsSchema.index({ postId: 1 });
VideoAnalyticsSchema.index({ workspaceId: 1, createdAt: -1 });
VideoAnalyticsSchema.index({ platform: 1, workspaceId: 1 });
