import { IsString, IsEnum, IsOptional, IsObject, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdPlatform } from './create-ad-campaign.dto';

export class CreateAdSetDto {
  @ApiProperty({ description: 'Ad set name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AdPlatform, description: 'Platform for this ad set' })
  @IsEnum(AdPlatform)
  platform: AdPlatform;

  @ApiPropertyOptional({ description: 'Budget for this ad set' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ description: 'Bid amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bidAmount?: number;

  @ApiProperty({ description: 'Targeting configuration' })
  @IsObject()
  targeting: any;

  @ApiPropertyOptional({ description: 'Schedule configuration' })
  @IsOptional()
  @IsObject()
  schedule?: any;

  @ApiPropertyOptional({ description: 'Optimization settings' })
  @IsOptional()
  @IsObject()
  optimization?: any;
}
