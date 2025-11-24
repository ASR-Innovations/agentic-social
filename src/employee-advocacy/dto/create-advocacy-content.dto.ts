import { IsString, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvocacyContentDto {
  @ApiProperty({ description: 'Content title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Content description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The actual post content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Media URLs', type: [String] })
  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'Hashtags', type: [String] })
  @IsArray()
  @IsOptional()
  hashtags?: string[];

  @ApiProperty({ description: 'Target platforms', type: [String] })
  @IsArray()
  targetPlatforms: string[];

  @ApiPropertyOptional({ description: 'Content category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Allow employees to modify content', default: false })
  @IsBoolean()
  @IsOptional()
  allowModification?: boolean;

  @ApiPropertyOptional({ description: 'Required disclaimer text' })
  @IsString()
  @IsOptional()
  requiredDisclaimer?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}
