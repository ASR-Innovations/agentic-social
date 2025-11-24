import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sentiment } from './query-reviews.dto';

export enum ReviewTemplateCategory {
  THANK_YOU = 'THANK_YOU',
  APOLOGY = 'APOLOGY',
  CLARIFICATION = 'CLARIFICATION',
  RESOLUTION = 'RESOLUTION',
  FOLLOW_UP = 'FOLLOW_UP',
  GENERAL = 'GENERAL',
}

export class CreateReviewTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ReviewTemplateCategory })
  @IsEnum(ReviewTemplateCategory)
  category: ReviewTemplateCategory;

  @ApiProperty({ enum: Sentiment })
  @IsEnum(Sentiment)
  sentiment: Sentiment;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ratingRange?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateReviewTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: ReviewTemplateCategory })
  @IsOptional()
  @IsEnum(ReviewTemplateCategory)
  category?: ReviewTemplateCategory;

  @ApiPropertyOptional({ enum: Sentiment })
  @IsOptional()
  @IsEnum(Sentiment)
  sentiment?: Sentiment;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ratingRange?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
