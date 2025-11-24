import { IsEnum, IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ConsentType, LegalBasis } from '@prisma/client';

export class CreateConsentRecordDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsEnum(ConsentType)
  consentType: ConsentType;

  @IsString()
  purpose: string;

  @IsBoolean()
  granted: boolean;

  @IsOptional()
  @IsEnum(LegalBasis)
  legalBasis?: LegalBasis;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
