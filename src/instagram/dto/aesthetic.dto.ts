import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeAestheticDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Post IDs to analyze', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postIds?: string[];
}

export class AestheticScoreDto {
  @ApiProperty({ description: 'Overall aesthetic score (0-100)' })
  score: number;

  @ApiProperty({ description: 'Color harmony score (0-100)' })
  colorHarmony: number;

  @ApiProperty({ description: 'Theme consistency score (0-100)' })
  themeConsistency: number;

  @ApiProperty({ description: 'Visual balance score (0-100)' })
  visualBalance: number;

  @ApiProperty({ description: 'Dominant color palette' })
  dominantPalette: string[];

  @ApiProperty({ description: 'Detected themes' })
  detectedThemes: string[];

  @ApiProperty({ description: 'Suggestions for improvement' })
  suggestions: string[];

  @ApiProperty({ description: 'Color distribution analysis' })
  colorDistribution: {
    color: string;
    percentage: number;
  }[];
}

export class ColorPaletteDto {
  @ApiProperty({ description: 'Media URL to analyze' })
  @IsString()
  mediaUrl: string;
}

export class ColorPaletteResponseDto {
  @ApiProperty({ description: 'Dominant colors' })
  dominantColors: string[];

  @ApiProperty({ description: 'Color percentages' })
  colorPercentages: {
    color: string;
    percentage: number;
  }[];

  @ApiProperty({ description: 'Suggested complementary colors' })
  complementaryColors: string[];
}
