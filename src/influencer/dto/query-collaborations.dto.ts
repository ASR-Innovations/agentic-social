import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { CollaborationStatus } from '@prisma/client';

export class QueryCollaborationsDto {
  @IsOptional()
  @IsString()
  influencerId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
