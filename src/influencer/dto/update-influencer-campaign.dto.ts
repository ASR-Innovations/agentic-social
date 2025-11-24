import { PartialType } from '@nestjs/mapped-types';
import { CreateInfluencerCampaignDto } from './create-influencer-campaign.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class UpdateInfluencerCampaignDto extends PartialType(CreateInfluencerCampaignDto) {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
