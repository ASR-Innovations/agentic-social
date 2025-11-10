import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PostType, PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsObject()
  @IsOptional()
  mediaMetadata?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  socialAccountIds: string[];

  @IsObject()
  @IsOptional()
  platformSettings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsObject()
  @IsOptional()
  mediaMetadata?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SchedulePostDto {
  @IsUUID()
  postId: string;

  @IsDateString()
  scheduledAt: string;
}

export class PublishNowDto {
  @IsUUID()
  postId: string;
}

export class UpdatePlatformContentDto {
  @IsUUID()
  postId: string;

  @IsUUID()
  socialAccountId: string;

  @IsString()
  customContent: string;

  @IsObject()
  @IsOptional()
  platformSettings?: Record<string, any>;
}
