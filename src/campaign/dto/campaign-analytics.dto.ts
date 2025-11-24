import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignAnalyticsQueryDto {
  @ApiProperty({ description: 'Campaign ID' })
  @IsString()
  campaignId: string;

  @ApiPropertyOptional({ description: 'Start date for analytics (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class CampaignMetricsDto {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  engagementRate: number;
  averageEngagementPerPost: number;
}

export class CampaignGoalProgressDto {
  metric: string;
  target: number;
  current: number;
  progress: number; // Percentage
  status: 'on-track' | 'at-risk' | 'achieved' | 'missed';
}

export class CampaignPerformanceDto {
  campaignId: string;
  campaignName: string;
  status: string;
  startDate: Date;
  endDate: Date;
  metrics: CampaignMetricsDto;
  goals: CampaignGoalProgressDto[];
  topPerformingPosts: Array<{
    postId: string;
    content: string;
    engagement: number;
    reach: number;
    publishedAt: Date;
  }>;
  platformBreakdown: Array<{
    platform: string;
    posts: number;
    engagement: number;
    reach: number;
  }>;
  timeline: Array<{
    date: Date;
    engagement: number;
    reach: number;
    posts: number;
  }>;
}
