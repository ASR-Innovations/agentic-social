import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareContentDto {
  @ApiProperty({ description: 'Content ID to share' })
  @IsString()
  contentId: string;

  @ApiProperty({ description: 'Platform to share on' })
  @IsString()
  platform: string;

  @ApiPropertyOptional({ description: 'Custom message (if modification allowed)' })
  @IsString()
  @IsOptional()
  customMessage?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}
