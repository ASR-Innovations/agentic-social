import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { AIRequestType } from '../entities/ai-request.entity';

export class GenerateCaptionDto {
  @IsString()
  topic: string;

  @IsString()
  @IsOptional()
  tone?: string; // e.g., professional, casual, funny, inspirational

  @IsString()
  @IsOptional()
  platform?: string; // Target platform for caption optimization

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  variations?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsNumber()
  @Min(10)
  @Max(500)
  @IsOptional()
  maxLength?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GenerateContentDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  contentType?: string; // e.g., blog, social post, ad copy

  @IsString()
  @IsOptional()
  tone?: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  variations?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GenerateImageDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  style?: string; // e.g., realistic, artistic, cartoon

  @IsString()
  @IsOptional()
  size?: string; // e.g., 1024x1024, 1024x1792

  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  n?: number; // Number of images to generate

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GenerateHashtagsDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsNumber()
  @Min(3)
  @Max(30)
  @IsOptional()
  count?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ImproveContentDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  improvementType?: string; // e.g., grammar, clarity, engagement

  @IsString()
  @IsOptional()
  tone?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class TranslateContentDto {
  @IsString()
  content: string;

  @IsString()
  targetLanguage: string;

  @IsString()
  @IsOptional()
  sourceLanguage?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AnalyzeSentimentDto {
  @IsString()
  content: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
