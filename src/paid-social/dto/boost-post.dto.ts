import { IsUUID, IsEnum, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdPlatform } from './create-ad-campaign.dto';

export class BoostPostDto {
  @ApiProperty({ description: 'Post ID to boost' })
  @IsUUID()
  postId: string;

  @ApiProperty({ enum: AdPlatform, isArray: true, description: 'Platforms to boost on' })
  @IsEnum(AdPlatform, { each: true })
  platforms: AdPlatform[];

  @ApiProperty({ description: 'Total budget for boosting' })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional({ description: 'Duration in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ description: 'Target audience configuration' })
  @IsOptional()
  @IsObject()
  targetAudience?: any;
}
