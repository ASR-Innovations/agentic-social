import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IntegrationType {
  ZAPIER = 'ZAPIER',
  MAKE = 'MAKE',
  N8N = 'N8N',
  CRM = 'CRM',
  DESIGN_TOOL = 'DESIGN_TOOL',
  MARKETING_AUTOMATION = 'MARKETING_AUTOMATION',
  CUSTOM = 'CUSTOM',
  WEBHOOK = 'WEBHOOK',
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Integration name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: IntegrationType, description: 'Integration type' })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiProperty({ description: 'Integration provider (e.g., zapier, salesforce)' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ description: 'Integration description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Integration configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'OAuth scopes' })
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

  @ApiPropertyOptional({ description: 'Is public in marketplace', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
