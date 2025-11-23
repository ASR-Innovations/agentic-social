import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { SocialPlatform } from '../entities/social-account.entity';

export class ConnectAccountDto {
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class DisconnectAccountDto {
  @IsString()
  accountId: string;
}

export class RefreshAccountDto {
  @IsString()
  accountId: string;
}
