import { IsOptional, IsInt, IsNumber, IsBoolean, IsArray, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdvocacySettingsDto {
  @ApiPropertyOptional({ description: 'Points awarded per share' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pointsPerShare?: number;

  @ApiPropertyOptional({ description: 'Points per reach unit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsPerReach?: number;

  @ApiPropertyOptional({ description: 'Points per engagement' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsPerEngagement?: number;

  @ApiPropertyOptional({ description: 'Enable leaderboard' })
  @IsBoolean()
  @IsOptional()
  enableLeaderboard?: boolean;

  @ApiPropertyOptional({ description: 'Leaderboard periods', type: [String] })
  @IsArray()
  @IsOptional()
  leaderboardPeriods?: string[];

  @ApiPropertyOptional({ description: 'Notify on new content' })
  @IsBoolean()
  @IsOptional()
  notifyOnNewContent?: boolean;

  @ApiPropertyOptional({ description: 'Notify on badge earned' })
  @IsBoolean()
  @IsOptional()
  notifyOnBadgeEarned?: boolean;

  @ApiPropertyOptional({ description: 'Notify on leaderboard update' })
  @IsBoolean()
  @IsOptional()
  notifyOnLeaderboard?: boolean;

  @ApiPropertyOptional({ description: 'Require approval for content' })
  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;

  @ApiPropertyOptional({ description: 'Allow content modification' })
  @IsBoolean()
  @IsOptional()
  allowContentModification?: boolean;

  @ApiPropertyOptional({ description: 'Mandatory disclaimer' })
  @IsString()
  @IsOptional()
  mandatoryDisclaimer?: string;

  @ApiPropertyOptional({ description: 'Enable AI suggestions' })
  @IsBoolean()
  @IsOptional()
  enableAISuggestions?: boolean;

  @ApiPropertyOptional({ description: 'Suggestion frequency' })
  @IsString()
  @IsOptional()
  suggestionFrequency?: string;
}
