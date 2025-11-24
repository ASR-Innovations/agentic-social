import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewPlatform {
  GOOGLE_MY_BUSINESS = 'GOOGLE_MY_BUSINESS',
  FACEBOOK = 'FACEBOOK',
  YELP = 'YELP',
  TRIPADVISOR = 'TRIPADVISOR',
  TRUSTPILOT = 'TRUSTPILOT',
  AMAZON = 'AMAZON',
  APP_STORE = 'APP_STORE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
}

export class CreateReviewDto {
  @ApiProperty({ enum: ReviewPlatform })
  @IsEnum(ReviewPlatform)
  platform: ReviewPlatform;

  @ApiProperty()
  @IsString()
  platformReviewId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiProperty()
  @IsString()
  reviewerName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewerAvatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewerProfile?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty()
  @IsString()
  publishedAt: string;
}
