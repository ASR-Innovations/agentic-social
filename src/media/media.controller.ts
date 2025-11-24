import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { VideoService } from './video.service';
import { VideoAnalyticsService } from './video-analytics.service';
import { VideoSchedulingService } from './video-scheduling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideoUploadDto } from './dto/video-upload.dto';
import { VideoTrimDto } from './dto/video-trim.dto';
import { ThumbnailExtractDto } from './dto/thumbnail-extract.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    tenantId: string;
    email: string;
  };
}

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly videoService: VideoService,
    private readonly videoAnalyticsService: VideoAnalyticsService,
    private readonly videoSchedulingService: VideoSchedulingService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.mediaService.uploadMedia(file, req.user.tenantId);
  }

  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToFolder(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.mediaService.uploadMedia(file, req.user.tenantId, folder);
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.mediaService.deleteMedia(key);
    return { message: 'File deleted successfully' };
  }

  // Video-specific endpoints

  @Post('video/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: VideoUploadDto,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    this.videoService.validateVideoFile(file);

    const result = await this.videoService.processAndUploadVideo(
      file,
      req.user.tenantId,
      options,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('video/:videoId/trim')
  async trimVideo(
    @Param('videoId') videoId: string,
    @Body() trimOptions: VideoTrimDto,
    @Request() req: RequestWithUser,
  ) {
    // In production, this would fetch the video from S3, trim it, and re-upload
    return {
      success: true,
      message: 'Video trimming initiated',
      videoId,
      trimOptions,
    };
  }

  @Post('video/:videoId/thumbnails')
  async extractThumbnails(
    @Param('videoId') videoId: string,
    @Body() options: ThumbnailExtractDto,
    @Request() req: RequestWithUser,
  ) {
    // In production, this would fetch the video from S3 and extract thumbnails
    return {
      success: true,
      message: 'Thumbnail extraction initiated',
      videoId,
      options,
    };
  }

  @Post('video/:videoId/captions')
  async generateCaptions(
    @Param('videoId') videoId: string,
    @Request() req: RequestWithUser,
  ) {
    // In production, this would use AI to generate captions
    return {
      success: true,
      message: 'Caption generation initiated',
      videoId,
    };
  }

  @Get('video/:videoId/analytics')
  async getVideoAnalytics(
    @Param('videoId') videoId: string,
    @Request() req: RequestWithUser,
  ) {
    const analytics = await this.videoAnalyticsService.getVideoPerformance(
      videoId,
      req.user.tenantId,
    );

    if (!analytics) {
      throw new BadRequestException('Video analytics not found');
    }

    return {
      success: true,
      data: analytics,
    };
  }

  @Get('video/analytics/workspace')
  async getWorkspaceVideoAnalytics(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const analytics = await this.videoAnalyticsService.getWorkspaceVideoAnalytics(
      req.user.tenantId,
      start,
      end,
    );

    return {
      success: true,
      data: analytics,
    };
  }

  @Get('video/analytics/top-performing')
  async getTopPerformingVideos(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'views' | 'completionRate' | 'engagementRate',
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const videos = await this.videoAnalyticsService.getTopPerformingVideos(
      req.user.tenantId,
      limitNum,
      sortBy,
    );

    return {
      success: true,
      data: videos,
    };
  }

  @Get('video/analytics/averages')
  async getAverageVideoMetrics(@Request() req: RequestWithUser) {
    const averages = await this.videoAnalyticsService.getAverageMetrics(
      req.user.tenantId,
    );

    return {
      success: true,
      data: averages,
    };
  }

  @Post('video/:videoId/analytics/view')
  async trackVideoView(
    @Param('videoId') videoId: string,
    @Body() body: { postId: string; platform: string; watchTime: number; isUnique?: boolean },
    @Request() req: RequestWithUser,
  ) {
    await this.videoAnalyticsService.trackView(
      videoId,
      req.user.tenantId,
      body.postId,
      body.platform,
      body.watchTime,
      body.isUnique,
    );

    return {
      success: true,
      message: 'View tracked successfully',
    };
  }

  @Post('video/:videoId/analytics/completion')
  async trackVideoCompletion(
    @Param('videoId') videoId: string,
    @Body() body: { postId: string; platform: string },
    @Request() req: RequestWithUser,
  ) {
    await this.videoAnalyticsService.trackCompletion(
      videoId,
      req.user.tenantId,
      body.postId,
      body.platform,
    );

    return {
      success: true,
      message: 'Completion tracked successfully',
    };
  }

  // Video scheduling endpoints

  @Get('video/platforms/:platform/requirements')
  async getPlatformRequirements(@Param('platform') platform: string) {
    const requirements = this.videoSchedulingService.getPlatformRequirements(platform);

    return {
      success: true,
      data: requirements,
    };
  }

  @Get('video/platforms/:platform/optimal-settings')
  async getOptimalSettings(@Param('platform') platform: string) {
    const settings = this.videoSchedulingService.getOptimalSettings(platform);

    return {
      success: true,
      data: settings,
    };
  }

  @Post('video/schedule')
  async scheduleVideoPost(
    @Body()
    body: {
      postId: string;
      videoId: string;
      platforms: string[];
      scheduledAt: string;
      metadata?: any;
    },
    @Request() req: RequestWithUser,
  ) {
    const result = await this.videoSchedulingService.scheduleVideoPost(
      req.user.tenantId,
      {
        ...body,
        scheduledAt: new Date(body.scheduledAt),
      },
    );

    return result;
  }

  @Post('video/:videoId/validate')
  async validateVideoForPlatforms(
    @Param('videoId') videoId: string,
    @Body() body: { platforms: string[]; videoDuration: number; videoSize: number; videoFormat: string; videoWidth: number; videoHeight: number },
  ) {
    const validationResults: any = {};

    for (const platform of body.platforms) {
      validationResults[platform] = this.videoSchedulingService.validateVideoForPlatform(
        platform,
        body.videoDuration,
        body.videoSize,
        body.videoFormat,
        body.videoWidth,
        body.videoHeight,
      );
    }

    return {
      success: true,
      data: validationResults,
    };
  }
}