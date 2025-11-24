import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsDateString, IsBoolean, Min } from 'class-validator';
import { CollaborationType, CollaborationStatus } from '@prisma/client';

export class CreateCollaborationDto {
  @IsString()
  influencerId: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsEnum(CollaborationType)
  type: CollaborationType;

  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus;

  @IsArray()
  @IsString({ each: true })
  deliverables: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  compensation?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  contractUrl?: string;

  @IsOptional()
  @IsBoolean()
  contractSigned?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
