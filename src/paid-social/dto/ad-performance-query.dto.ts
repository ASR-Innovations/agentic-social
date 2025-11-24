import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdPlatform } from './create-ad-campaign.dto';

export class AdPerformanceQueryDto {
  @ApiPropertyOptional({ description: 'Campaign ID' })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Ad Set ID' })
  @IsOptional()
  @IsUUID()
  adSetId?: string;

  @ApiPropertyOptional({ description: 'Ad ID' })
  @IsOptional()
  @IsUUID()
  adId?: string;

  @ApiPropertyOptional({ enum: AdPlatform, description: 'Filter by platform' })
  @IsOptional()
  @IsEnum(AdPlatform)
  platform?: AdPlatform;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
