import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDateString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdCampaignObjective {
  AWARENESS = 'AWARENESS',
  TRAFFIC = 'TRAFFIC',
  ENGAGEMENT = 'ENGAGEMENT',
  LEADS = 'LEADS',
  CONVERSIONS = 'CONVERSIONS',
  APP_INSTALLS = 'APP_INSTALLS',
  VIDEO_VIEWS = 'VIDEO_VIEWS',
  MESSAGES = 'MESSAGES',
}

export enum AdPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
}

export enum BidStrategy {
  LOWEST_COST = 'LOWEST_COST',
  COST_CAP = 'COST_CAP',
  BID_CAP = 'BID_CAP',
  TARGET_COST = 'TARGET_COST',
}

export class CreateAdCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AdCampaignObjective, description: 'Campaign objective' })
  @IsEnum(AdCampaignObjective)
  objective: AdCampaignObjective;

  @ApiProperty({ enum: AdPlatform, isArray: true, description: 'Platforms to run ads on' })
  @IsArray()
  @IsEnum(AdPlatform, { each: true })
  platforms: AdPlatform[];

  @ApiPropertyOptional({ description: 'Campaign start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Campaign end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Total campaign budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBudget?: number;

  @ApiPropertyOptional({ description: 'Daily budget limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @ApiProperty({ enum: BidStrategy, description: 'Bidding strategy' })
  @IsEnum(BidStrategy)
  bidStrategy: BidStrategy;

  @ApiPropertyOptional({ description: 'Target audience configuration' })
  @IsOptional()
  @IsObject()
  targetAudience?: any;

  @ApiPropertyOptional({ description: 'Creative assets configuration' })
  @IsOptional()
  @IsObject()
  creativeAssets?: any;

  @ApiPropertyOptional({ description: 'Campaign tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
