import { IsString, IsOptional, IsBoolean, IsIP } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIPWhitelistDto {
  @ApiProperty({ description: 'IP address to whitelist (supports CIDR notation)' })
  @IsIP()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'Description of the IP address' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the whitelist entry is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateIPWhitelistDto {
  @ApiPropertyOptional({ description: 'Description of the IP address' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the whitelist entry is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
