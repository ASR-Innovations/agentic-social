import { IsString, IsArray, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'API key name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'API scopes/permissions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional({ description: 'Rate limit per hour', default: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitPerHour?: number;

  @ApiPropertyOptional({ description: 'Rate limit per day', default: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rateLimitPerDay?: number;

  @ApiPropertyOptional({ description: 'Expiration date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
