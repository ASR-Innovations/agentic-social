import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, IsObject, Min } from 'class-validator';
import { CommercePlatform } from '@prisma/client';

export class CreateIntegrationDto {
  @IsEnum(CommercePlatform)
  platform: CommercePlatform;

  @IsString()
  storeName: string;

  @IsOptional()
  @IsString()
  storeUrl?: string;

  @IsOptional()
  @IsString()
  storeDomain?: string;

  @IsObject()
  credentials: Record<string, any>; // Will be encrypted before storage

  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  syncFrequency?: number; // Minutes between syncs
}
