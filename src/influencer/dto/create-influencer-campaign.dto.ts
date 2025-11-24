import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Platform } from '@prisma/client';

export class CreateInfluencerCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @IsString({ each: true })
  targetNiches: string[];

  @IsArray()
  @IsEnum(Platform, { each: true })
  targetPlatforms: Platform[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minFollowers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxFollowers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minEngagementRate?: number;
}
