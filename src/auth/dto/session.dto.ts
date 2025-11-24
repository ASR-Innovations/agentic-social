import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  deviceInfo?: any;
}

export class RevokeSessionDto {
  @ApiProperty({ description: 'Session ID to revoke' })
  @IsString()
  sessionId: string;
}

export class RevokeAllSessionsDto {
  @ApiPropertyOptional({ description: 'Keep current session active', default: true })
  @IsOptional()
  @IsBoolean()
  keepCurrent?: boolean;
}
