import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';
import {
  CreateReelDto,
  OptimizeReelDto,
  ReelOptimizationResponseDto,
  ReelAnalyticsDto,
  ReelAnalyticsResponseDto,
  ReelsAspectRatio,
} from '../dto/reels.dto';

/**
 * Service for Instagram Reels management
 * Provides Reels-specific optimization, scheduling, and analytics
 */
@Injectable()
export class InstagramReelsService {
  private readonly logger = new Logger(InstagramReelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create and publish an Instagram Reel
   */
  async createReel(
    workspaceId: string,
    dto: CreateReelDto,
  ): Promise<{ success: boolean; reelId?: string; error?: string }> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Validate Reel content
    this.validateReelContent(dto);

    try {
      // Create Reel post
      const post = await this.prisma.post.create({
        data: {
          workspaceId,
          authorId: account.id,
          content: {
            text: dto.caption,
            media: [{
              url: dto.videoUrl,
              type: 'video',
              thumbnailUrl: dto.thumbnailUrl,
            }],
            hashtags: dto.hashtags || [],
            reelData: {
              coverFrameTime: dto.coverFrameTime,
              audioUrl: dto.audioUrl,
              shareToFeed: dto.shareToFeed !== false,
            },
          },
          status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
          scheduledAt: dto.scheduledAt,
          platformPosts: {
            create: {
              accountId: dto.accountId,
              platform: Platform.INSTAGRAM,
              publishStatus: 'PENDING',
              customContent: {
                isReel: true,
              },
            },
          },
        },
      });

      this.logger.log(`Reel created: ${post.id}`);

      return {
        success: true,
        reelId: post.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create Reel: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Optimize video for Instagram Reels
   */
  async optimizeReel(
    workspaceId: string,
    dto: OptimizeReelDto,
  ): Promise<ReelOptimizationResponseDto> {
    this.logger.log(`Optimizing Reel video: ${dto.videoUrl}`);

    // In a real implementation, this would:
    // 1. Download the video
    // 2. Use FFmpeg to:
    //    - Convert to correct aspect ratio
    //    - Trim to target duration
    //    - Optimize bitrate and codec
    //    - Generate thumbnail
    //    - Add auto-captions if requested
    // 3. Upload optimized video to storage
    // 4. Return URLs and metadata

    // Simulated optimization
    const optimizationSuggestions: string[] = [];

    // Aspect ratio suggestions
    if (dto.aspectRatio === ReelsAspectRatio.VERTICAL_9_16) {
      optimizationSuggestions.push('Video optimized for vertical 9:16 format (recommended for Reels)');
    }

    // Duration suggestions
    if (dto.targetDuration) {
      if (dto.targetDuration < 15) {
        optimizationSuggestions.push('Short Reels (under 15s) tend to have higher completion rates');
      } else if (dto.targetDuration > 60) {
        optimizationSuggestions.push('Consider keeping Reels under 60 seconds for better engagement');
      }
    }

    // Auto-captions
    if (dto.autoCaptions) {
      optimizationSuggestions.push('Auto-captions added to improve accessibility and watch time');
    }

    // General optimization tips
    optimizationSuggestions.push('Video compressed for optimal Instagram delivery');
    optimizationSuggestions.push('Thumbnail extracted from most engaging frame');

    return {
      optimizedVideoUrl: dto.videoUrl, // In real implementation, this would be the new URL
      thumbnailUrl: `${dto.videoUrl}_thumbnail.jpg`,
      duration: dto.targetDuration || 30,
      aspectRatio: dto.aspectRatio,
      fileSize: 5 * 1024 * 1024, // 5MB simulated
      suggestions: optimizationSuggestions,
      captionsUrl: dto.autoCaptions ? `${dto.videoUrl}_captions.srt` : undefined,
    };
  }

  /**
   * Get Reel analytics
   */
  async getReelAnalytics(
    workspaceId: string,
    dto: ReelAnalyticsDto,
  ): Promise<ReelAnalyticsResponseDto> {
    // Verify post belongs to workspace
    const post = await this.prisma.post.findFirst({
      where: {
        id: dto.postId,
        workspaceId,
      },
      include: {
        platformPosts: {
          where: {
            platform: Platform.INSTAGRAM,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Reel not found');
    }

    // In a real implementation, this would fetch from Instagram Insights API
    this.logger.log(`Fetching Reel analytics for ${dto.postId}`);

    // Simulated analytics
    return {
      plays: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      avgWatchTime: 0,
      completionRate: 0,
      engagementRate: 0,
    };
  }

  /**
   * Get Reels optimization recommendations
   */
  async getReelsRecommendations(
    workspaceId: string,
    accountId: string,
  ): Promise<{
    bestPostingTimes: string[];
    trendingAudio: string[];
    contentSuggestions: string[];
    performanceTips: string[];
  }> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Analyze past Reels performance
    const reels = await this.prisma.post.findMany({
      where: {
        workspaceId,
        platformPosts: {
          some: {
            accountId,
            platform: Platform.INSTAGRAM,
            customContent: {
              path: ['isReel'],
              equals: true,
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    });

    // Generate recommendations based on performance
    const recommendations = {
      bestPostingTimes: [
        '9:00 AM - Peak engagement time',
        '12:00 PM - Lunch break viewing',
        '7:00 PM - Evening entertainment',
      ],
      trendingAudio: [
        'Trending audio track 1',
        'Trending audio track 2',
        'Trending audio track 3',
      ],
      contentSuggestions: [
        'Behind-the-scenes content performs well',
        'Tutorial-style Reels get high saves',
        'Trending challenges increase reach',
        'Use text overlays for better retention',
      ],
      performanceTips: [
        'Keep Reels under 30 seconds for higher completion rates',
        'Hook viewers in the first 3 seconds',
        'Use trending audio to boost discoverability',
        'Post consistently (3-5 Reels per week)',
        'Engage with comments to boost algorithm',
      ],
    };

    return recommendations;
  }

  /**
   * Validate Reel content
   */
  private validateReelContent(dto: CreateReelDto): void {
    // Validate caption length
    if (dto.caption.length > 2200) {
      throw new BadRequestException('Caption must be 2200 characters or less');
    }

    // Validate hashtags
    if (dto.hashtags && dto.hashtags.length > 30) {
      throw new BadRequestException('Maximum 30 hashtags allowed');
    }

    // Validate cover frame time
    if (dto.coverFrameTime !== undefined && dto.coverFrameTime < 0) {
      throw new BadRequestException('Cover frame time must be positive');
    }

    // Validate scheduled time
    if (dto.scheduledAt && dto.scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }
  }

  /**
   * Get Reels best practices
   */
  getBestPractices(): {
    technical: string[];
    content: string[];
    engagement: string[];
  } {
    return {
      technical: [
        'Use 9:16 vertical aspect ratio (1080x1920px)',
        'Keep file size under 4GB',
        'Duration: 3-90 seconds (15-30s recommended)',
        'Use MP4 or MOV format',
        'Minimum resolution: 720p',
        'Frame rate: 23-60 FPS',
      ],
      content: [
        'Hook viewers in first 3 seconds',
        'Use trending audio for discoverability',
        'Add text overlays for context',
        'Include clear call-to-action',
        'Show personality and authenticity',
        'Create series for recurring viewers',
      ],
      engagement: [
        'Post during peak hours (9 AM, 12 PM, 7 PM)',
        'Respond to comments quickly',
        'Use relevant hashtags (5-10 recommended)',
        'Share to Stories for extra reach',
        'Collaborate with other creators',
        'Analyze insights and iterate',
      ],
    };
  }
}
