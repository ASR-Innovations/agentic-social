import { IsString, IsEnum, IsOptional, IsNumber, IsInt, IsObject, IsDateString, Min } from 'class-validator';
import { ConversionType, Platform } from '@prisma/client';

export class TrackConversionDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsEnum(ConversionType)
  conversionType: ConversionType;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string; // Will be hashed for privacy

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsNumber()
  @Min(0)
  orderValue: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  productsSold?: any; // Array of { productId, quantity, price }

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  referrerUrl?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsDateString()
  clickedAt?: string;

  @IsOptional()
  @IsDateString()
  addedToCartAt?: string;

  @IsOptional()
  @IsDateString()
  purchasedAt?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
