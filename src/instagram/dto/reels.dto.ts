import { IsString, IsArray, IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReelsAspectRatio {
  VERTICAL_9_16 = '9:16',
  SQUARE_1_1 = '1:1',
  VERTICAL_4_5 = '4:5',
}

export class CreateReelDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Video URL' })
  @IsString()
  videoUrl: string;

  @ApiProperty({ description: 'Thumbnail URL (optional)', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Caption' })
  @IsString()
  caption: string;

  @ApiProperty({ description: 'Cover frame timestamp (seconds)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coverFrameTime?: number;

  @ApiProperty({ description: 'Audio track URL (optional)', required: false })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiProperty({ description: 'Share to feed', default: true })
  @IsOptional()
  @IsBoolean()
  shareToFeed?: boolean;

  @ApiProperty({ description: 'Hashtags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiProperty({ description: 'Schedule time (optional)', required: false })
  @IsOptional()
  scheduledAt?: Date;
}

export class OptimizeReelDto {
  @ApiProperty({ description: 'Video URL to optimize' })
  @IsString()
  videoUrl: string;

  @ApiProperty({ description: 'Target aspect ratio' })
  @IsEnum(ReelsAspectRatio)
  aspectRatio: ReelsAspectRatio;

  @ApiProperty({ description: 'Target duration (seconds)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(90)
  targetDuration?: number;

  @ApiProperty({ description: 'Apply auto-captions', default: false })
  @IsOptional()
  @IsBoolean()
  autoCaptions?: boolean;
}

export class ReelOptimizationResponseDto {
  @ApiProperty({ description: 'Optimized video URL' })
  optimizedVideoUrl: string;

  @ApiProperty({ description: 'Suggested thumbnail URL' })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Video duration (seconds)' })
  duration: number;

  @ApiProperty({ description: 'Aspect ratio' })
  aspectRatio: string;

  @ApiProperty({ description: 'File size (bytes)' })
  fileSize: number;

  @ApiProperty({ description: 'Optimization suggestions' })
  suggestions: string[];

  @ApiProperty({ description: 'Caption file URL (if auto-captions enabled)', required: false })
  captionsUrl?: string;
}

export class ReelAnalyticsDto {
  @ApiProperty({ description: 'Reel post ID' })
  @IsString()
  postId: string;
}

export class ReelAnalyticsResponseDto {
  @ApiProperty({ description: 'Total plays' })
  plays: number;

  @ApiProperty({ description: 'Reach' })
  reach: number;

  @ApiProperty({ description: 'Likes' })
  likes: number;

  @ApiProperty({ description: 'Comments' })
  comments: number;

  @ApiProperty({ description: 'Shares' })
  shares: number;

  @ApiProperty({ description: 'Saves' })
  saves: number;

  @ApiProperty({ description: 'Average watch time (seconds)' })
  avgWatchTime: number;

  @ApiProperty({ description: 'Completion rate (0-1)' })
  completionRate: number;

  @ApiProperty({ description: 'Engagement rate' })
  engagementRate: number;
}
