import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Platform } from '@prisma/client';

export class CommerceAnalyticsQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  productId?: string;
}
