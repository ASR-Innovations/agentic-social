import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VideoScheduleOptions {
  postId: string;
  videoId: string;
  platforms: string[];
  scheduledAt: Date;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    privacy?: 'public' | 'private' | 'unlisted';
    thumbnailUrl?: string;
  };
}

export interface PlatformVideoRequirements {
  platform: string;
  maxDuration: number; // in seconds
  maxFileSize: number; // in bytes
  supportedFormats: string[];
  aspectRatios: string[];
  minResolution: { width: number; height: number };
  maxResolution: { width: number; height: number };
}

@Injectable()
export class VideoSchedulingService {
  private readonly logger = new Logger(VideoSchedulingService.name);

  // Platform-specific video requirements
  private readonly platformRequirements: { [key: string]: PlatformVideoRequirements } = {
    youtube: {
      platform: 'YOUTUBE',
      maxDuration: 43200, // 12 hours
      maxFileSize: 256 * 1024 * 1024 * 1024, // 256GB
      supportedFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
      aspectRatios: ['16:9', '9:16', '1:1', '4:3'],
      minResolution: { width: 426, height: 240 },
      maxResolution: { width: 3840, height: 2160 },
    },
    tiktok: {
      platform: 'TIKTOK',
      maxDuration: 600, // 10 minutes
      maxFileSize: 287 * 1024 * 1024, // 287MB
      supportedFormats: ['mp4', 'mov', 'webm'],
      aspectRatios: ['9:16', '1:1'],
      minResolution: { width: 720, height: 1280 },
      maxResolution: { width: 1080, height: 1920 },
    },
    instagram: {
      platform: 'INSTAGRAM',
      maxDuration: 60, // 1 minute for feed, 90 seconds for reels
      maxFileSize: 100 * 1024 * 1024, // 100MB
      supportedFormats: ['mp4', 'mov'],
      aspectRatios: ['9:16', '1:1', '4:5'],
      minResolution: { width: 600, height: 600 },
      maxResolution: { width: 1080, height: 1920 },
    },
    facebook: {
      platform: 'FACEBOOK',
      maxDuration: 14400, // 4 hours
      maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
      supportedFormats: ['mp4', 'mov', 'avi'],
      aspectRatios: ['16:9', '9:16', '1:1', '4:5'],
      minResolution: { width: 600, height: 315 },
      maxResolution: { width: 1920, height: 1080 },
    },
    linkedin: {
      platform: 'LINKEDIN',
      maxDuration: 600, // 10 minutes
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      supportedFormats: ['mp4', 'mov', 'avi'],
      aspectRatios: ['16:9', '1:1', '9:16'],
      minResolution: { width: 256, height: 144 },
      maxResolution: { width: 1920, height: 1080 },
    },
    twitter: {
      platform: 'TWITTER',
      maxDuration: 140, // 2 minutes 20 seconds
      maxFileSize: 512 * 1024 * 1024, // 512MB
      supportedFormats: ['mp4', 'mov'],
      aspectRatios: ['16:9', '1:1'],
      minResolution: { width: 32, height: 32 },
      maxResolution: { width: 1920, height: 1200 },
    },
    pinterest: {
      platform: 'PINTEREST',
      maxDuration: 900, // 15 minutes
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
      supportedFormats: ['mp4', 'mov', 'm4v'],
      aspectRatios: ['2:3', '9:16', '1:1', '16:9'],
      minResolution: { width: 240, height: 240 },
      maxResolution: { width: 1920, height: 1080 },
    },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Get platform-specific video requirements
   */
  getPlatformRequirements(platform: string): PlatformVideoRequirements {
    const requirements = this.platformRequirements[platform.toLowerCase()];
    if (!requirements) {
      throw new BadRequestException(
        `Platform ${platform} is not supported for video scheduling`,
      );
    }
    return requirements;
  }

  /**
   * Validate video against platform requirements
   */
  validateVideoForPlatform(
    platform: string,
    videoDuration: number,
    videoSize: number,
    videoFormat: string,
    videoWidth: number,
    videoHeight: number,
  ): { valid: boolean; errors: string[] } {
    const requirements = this.getPlatformRequirements(platform);
    const errors: string[] = [];

    // Check duration
    if (videoDuration > requirements.maxDuration) {
      errors.push(
        `Video duration (${videoDuration}s) exceeds maximum allowed (${requirements.maxDuration}s) for ${platform}`,
      );
    }

    // Check file size
    if (videoSize > requirements.maxFileSize) {
      const maxSizeMB = Math.round(requirements.maxFileSize / (1024 * 1024));
      const currentSizeMB = Math.round(videoSize / (1024 * 1024));
      errors.push(
        `Video size (${currentSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB) for ${platform}`,
      );
    }

    // Check format
    if (!requirements.supportedFormats.includes(videoFormat.toLowerCase())) {
      errors.push(
        `Video format ${videoFormat} is not supported for ${platform}. Supported formats: ${requirements.supportedFormats.join(', ')}`,
      );
    }

    // Check resolution
    if (
      videoWidth < requirements.minResolution.width ||
      videoHeight < requirements.minResolution.height
    ) {
      errors.push(
        `Video resolution (${videoWidth}x${videoHeight}) is below minimum required (${requirements.minResolution.width}x${requirements.minResolution.height}) for ${platform}`,
      );
    }

    if (
      videoWidth > requirements.maxResolution.width ||
      videoHeight > requirements.maxResolution.height
    ) {
      errors.push(
        `Video resolution (${videoWidth}x${videoHeight}) exceeds maximum allowed (${requirements.maxResolution.width}x${requirements.maxResolution.height}) for ${platform}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Schedule video post for multiple platforms
   */
  async scheduleVideoPost(
    workspaceId: string,
    options: VideoScheduleOptions,
  ): Promise<any> {
    const { postId, videoId, platforms, scheduledAt, metadata } = options;

    // Validate that the post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        mediaAssets: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.workspaceId !== workspaceId) {
      throw new BadRequestException('Post does not belong to this workspace');
    }

    // Find the video media asset
    const videoAsset = post.mediaAssets.find(
      (pm) => pm.media.id === videoId && pm.media.type === 'VIDEO',
    );

    if (!videoAsset) {
      throw new BadRequestException('Video not found in post');
    }

    // Validate video for each platform
    const validationResults: { [platform: string]: { valid: boolean; errors: string[] } } = {};
    
    for (const platform of platforms) {
      const videoDuration = videoAsset.media.duration || 0;
      const videoSize = videoAsset.media.size;
      const videoFormat = videoAsset.media.filename.split('.').pop() || 'mp4';
      const dimensions = videoAsset.media.dimensions as any;
      const videoWidth = dimensions?.width || 1920;
      const videoHeight = dimensions?.height || 1080;

      validationResults[platform] = this.validateVideoForPlatform(
        platform,
        videoDuration,
        videoSize,
        videoFormat,
        videoWidth,
        videoHeight,
      );
    }

    // Check if any platform failed validation
    const failedPlatforms = Object.entries(validationResults)
      .filter(([_, result]) => !result.valid)
      .map(([platform, result]) => ({ platform, errors: result.errors }));

    if (failedPlatforms.length > 0) {
      this.logger.warn(
        `Video validation failed for platforms: ${JSON.stringify(failedPlatforms)}`,
      );
    }

    // Update post with schedule
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        scheduledAt,
        status: 'SCHEDULED',
      },
    });

    this.logger.log(
      `Video post ${postId} scheduled for ${platforms.join(', ')} at ${scheduledAt}`,
    );

    return {
      success: true,
      postId,
      videoId,
      scheduledAt,
      platforms,
      validationResults,
      failedPlatforms: failedPlatforms.length > 0 ? failedPlatforms : undefined,
    };
  }

  /**
   * Get optimal video settings for a platform
   */
  getOptimalSettings(platform: string): {
    format: string;
    resolution: { width: number; height: number };
    aspectRatio: string;
    bitrate: string;
  } {
    const requirements = this.getPlatformRequirements(platform);

    // Return optimal settings based on platform
    const settings: { [key: string]: any } = {
      youtube: {
        format: 'mp4',
        resolution: { width: 1920, height: 1080 },
        aspectRatio: '16:9',
        bitrate: '8000k',
      },
      tiktok: {
        format: 'mp4',
        resolution: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        bitrate: '4000k',
      },
      instagram: {
        format: 'mp4',
        resolution: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        bitrate: '3500k',
      },
      facebook: {
        format: 'mp4',
        resolution: { width: 1920, height: 1080 },
        aspectRatio: '16:9',
        bitrate: '4000k',
      },
      linkedin: {
        format: 'mp4',
        resolution: { width: 1920, height: 1080 },
        aspectRatio: '16:9',
        bitrate: '5000k',
      },
      twitter: {
        format: 'mp4',
        resolution: { width: 1280, height: 720 },
        aspectRatio: '16:9',
        bitrate: '2000k',
      },
      pinterest: {
        format: 'mp4',
        resolution: { width: 1080, height: 1920 },
        aspectRatio: '9:16',
        bitrate: '3000k',
      },
    };

    return settings[platform.toLowerCase()] || settings.youtube;
  }
}
