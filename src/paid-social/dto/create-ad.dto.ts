import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdPlatform } from './create-ad-campaign.dto';

export class CreateAdDto {
  @ApiProperty({ description: 'Ad name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AdPlatform, description: 'Platform for this ad' })
  @IsEnum(AdPlatform)
  platform: AdPlatform;

  @ApiPropertyOptional({ description: 'Post ID to boost (if boosting organic post)' })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @ApiProperty({ description: 'Ad creative configuration' })
  @IsObject()
  creative: any;

  @ApiPropertyOptional({ description: 'Call to action text' })
  @IsOptional()
  @IsString()
  callToAction?: string;

  @ApiPropertyOptional({ description: 'Destination URL' })
  @IsOptional()
  @IsString()
  destinationUrl?: string;
}
