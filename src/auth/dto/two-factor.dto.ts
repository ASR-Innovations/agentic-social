import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @ApiProperty({ description: 'TOTP token to verify setup' })
  @IsString()
  token: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({ description: 'TOTP token or backup code' })
  @IsString()
  token: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'TOTP token to confirm disable' })
  @IsString()
  token: string;
}

export class RegenerateBackupCodesDto {
  @ApiProperty({ description: 'TOTP token to authorize regeneration' })
  @IsString()
  token: string;
}
