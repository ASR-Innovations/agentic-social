import { PartialType } from '@nestjs/swagger';
import { CreateAdCampaignDto } from './create-ad-campaign.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AdCampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateAdCampaignDto extends PartialType(CreateAdCampaignDto) {
  @ApiPropertyOptional({ enum: AdCampaignStatus, description: 'Campaign status' })
  @IsOptional()
  @IsEnum(AdCampaignStatus)
  status?: AdCampaignStatus;
}
