import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignGoalDto {
  @ApiProperty({ description: 'Goal metric name (e.g., "reach", "engagement", "conversions")' })
  @IsString()
  @IsNotEmpty()
  metric: string;

  @ApiProperty({ description: 'Target value for the metric' })
  @IsNumber()
  @Min(0)
  target: number;

  @ApiPropertyOptional({ description: 'Current value for the metric', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  current?: number;
}

export class UTMParametersDto {
  @ApiPropertyOptional({ description: 'UTM source parameter' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'UTM medium parameter' })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiPropertyOptional({ description: 'UTM campaign parameter' })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiPropertyOptional({ description: 'UTM term parameter' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({ description: 'UTM content parameter' })
  @IsString()
  @IsOptional()
  content?: string;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Campaign start date (ISO 8601 format)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Campaign end date (ISO 8601 format)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'Campaign goals', type: [CampaignGoalDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampaignGoalDto)
  goals?: CampaignGoalDto[];

  @ApiPropertyOptional({ description: 'Campaign budget in USD' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ description: 'Campaign tags', type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'UTM parameters for tracking', type: UTMParametersDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => UTMParametersDto)
  utmParams?: UTMParametersDto;
}
