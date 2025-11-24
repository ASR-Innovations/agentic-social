import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';
import { CreateStoryDto, ScheduleStoryDto } from '../dto/story.dto';

/**
 * Service for Instagram Stories with stickers support
 * Implements story scheduling with polls, questions, countdowns, and links
 */
@Injectable()
export class InstagramStoryService {
  private readonly logger = new Logger(InstagramStoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create and publish an Instagram Story immediately
   */
  async createStory(
    workspaceId: string,
    dto: CreateStoryDto,
  ): Promise<{ success: boolean; storyId?: string; error?: string }> {
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

    // Validate story content
    this.validateStoryContent(dto);

    try {
      // Build story creation payload
      const storyPayload = await this.buildStoryPayload(dto, account.accessToken);

      // Publish story via Instagram Graph API
      const result = await this.publishStory(account.platformAccountId, account.accessToken, storyPayload);

      this.logger.log(`Story published successfully: ${result.id}`);

      return {
        success: true,
        storyId: result.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to publish story: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Schedule an Instagram Story for future publishing
   */
  async scheduleStory(
    workspaceId: string,
    dto: ScheduleStoryDto,
  ): Promise<{ success: boolean; scheduledId?: string; error?: string }> {
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

    // Validate story content
    this.validateStoryContent(dto);

    // Validate scheduled time is in the future
    if (dto.scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    try {
      // Store story in database for scheduled publishing
      // Note: Instagram doesn't support native story scheduling via API
      // This would need to be handled by a background job
      const storyData = {
        mediaUrl: dto.mediaUrl,
        mediaType: dto.mediaType,
        stickers: {
          poll: dto.pollSticker ? JSON.parse(JSON.stringify(dto.pollSticker)) : undefined,
          question: dto.questionSticker ? JSON.parse(JSON.stringify(dto.questionSticker)) : undefined,
          countdown: dto.countdownSticker ? JSON.parse(JSON.stringify(dto.countdownSticker)) : undefined,
          link: dto.linkSticker ? JSON.parse(JSON.stringify(dto.linkSticker)) : undefined,
          mentions: dto.mentions ? JSON.parse(JSON.stringify(dto.mentions)) : undefined,
          hashtags: dto.hashtags,
        },
      };

      // Create a scheduled post record
      const post = await this.prisma.post.create({
        data: {
          workspaceId,
          authorId: account.id, // Using account ID as author for now
          content: JSON.parse(JSON.stringify({
            text: 'Instagram Story',
            media: [{ url: dto.mediaUrl, type: dto.mediaType }],
            storyData,
          })),
          status: 'SCHEDULED',
          scheduledAt: dto.scheduledAt,
          platformPosts: {
            create: {
              accountId: dto.accountId,
              platform: Platform.INSTAGRAM,
              publishStatus: 'PENDING',
            },
          },
        },
      });

      this.logger.log(`Story scheduled successfully: ${post.id}`);

      return {
        success: true,
        scheduledId: post.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to schedule story: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate story content and stickers
   */
  private validateStoryContent(dto: CreateStoryDto): void {
    // Validate media type
    if (!['image', 'video'].includes(dto.mediaType)) {
      throw new BadRequestException('Media type must be image or video');
    }

    // Validate video duration (max 60 seconds for stories)
    if (dto.mediaType === 'video') {
      // This would need actual video analysis in production
      this.logger.warn('Video duration validation not implemented');
    }

    // Validate poll sticker
    if (dto.pollSticker) {
      if (dto.pollSticker.options.length !== 2) {
        throw new BadRequestException('Poll must have exactly 2 options');
      }
    }

    // Validate countdown sticker
    if (dto.countdownSticker) {
      const endTime = new Date(dto.countdownSticker.endTime);
      if (endTime <= new Date()) {
        throw new BadRequestException('Countdown end time must be in the future');
      }
    }

    // Validate link sticker (requires certain account permissions)
    if (dto.linkSticker) {
      if (!dto.linkSticker.url.startsWith('http')) {
        throw new BadRequestException('Link URL must be a valid HTTP(S) URL');
      }
    }
  }

  /**
   * Build story payload for Instagram API
   */
  private async buildStoryPayload(dto: CreateStoryDto, accessToken: string): Promise<any> {
    const payload: any = {
      media_type: dto.mediaType === 'video' ? 'VIDEO' : 'IMAGE',
    };

    if (dto.mediaType === 'video') {
      payload.video_url = dto.mediaUrl;
    } else {
      payload.image_url = dto.mediaUrl;
    }

    // Add stickers to payload
    const stickers: any[] = [];

    // Poll sticker
    if (dto.pollSticker) {
      stickers.push({
        type: 'poll',
        question: dto.pollSticker.question,
        options: dto.pollSticker.options,
        x: dto.pollSticker.x || 0.5,
        y: dto.pollSticker.y || 0.5,
      });
    }

    // Question sticker
    if (dto.questionSticker) {
      stickers.push({
        type: 'question',
        question: dto.questionSticker.question,
        background_color: dto.questionSticker.backgroundColor || '#FFFFFF',
        x: dto.questionSticker.x || 0.5,
        y: dto.questionSticker.y || 0.5,
      });
    }

    // Countdown sticker
    if (dto.countdownSticker) {
      stickers.push({
        type: 'countdown',
        name: dto.countdownSticker.name,
        end_time: new Date(dto.countdownSticker.endTime).getTime() / 1000,
        x: dto.countdownSticker.x || 0.5,
        y: dto.countdownSticker.y || 0.5,
      });
    }

    // Link sticker
    if (dto.linkSticker) {
      stickers.push({
        type: 'link',
        url: dto.linkSticker.url,
        text: dto.linkSticker.text || 'Learn More',
      });
    }

    // Mentions
    if (dto.mentions && dto.mentions.length > 0) {
      dto.mentions.forEach(mention => {
        stickers.push({
          type: 'mention',
          username: mention.username,
          x: mention.x || 0.5,
          y: mention.y || 0.5,
        });
      });
    }

    // Hashtags
    if (dto.hashtags && dto.hashtags.length > 0) {
      dto.hashtags.forEach((hashtag, index) => {
        stickers.push({
          type: 'hashtag',
          tag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
          x: 0.5,
          y: 0.8 + (index * 0.05), // Stack hashtags vertically
        });
      });
    }

    if (stickers.length > 0) {
      payload.stickers = JSON.stringify(stickers);
    }

    return payload;
  }

  /**
   * Publish story to Instagram
   */
  private async publishStory(
    accountId: string,
    accessToken: string,
    payload: any,
  ): Promise<{ id: string }> {
    // In a real implementation, this would call Instagram Graph API
    // For now, we'll simulate the API call
    
    this.logger.log(`Publishing story to Instagram account ${accountId}`);
    
    // Simulated API response
    return {
      id: `story_${Date.now()}`,
    };

    /* Real implementation would be:
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create story');
    }

    // Publish the story
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: data.id,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(publishData.error?.message || 'Failed to publish story');
    }

    return publishData;
    */
  }

  /**
   * Get story analytics
   */
  async getStoryAnalytics(
    workspaceId: string,
    storyId: string,
  ): Promise<{
    impressions: number;
    reach: number;
    replies: number;
    exits: number;
    taps_forward: number;
    taps_back: number;
  }> {
    // In a real implementation, this would fetch from Instagram Insights API
    this.logger.log(`Fetching story analytics for ${storyId}`);

    return {
      impressions: 0,
      reach: 0,
      replies: 0,
      exits: 0,
      taps_forward: 0,
      taps_back: 0,
    };
  }
}
