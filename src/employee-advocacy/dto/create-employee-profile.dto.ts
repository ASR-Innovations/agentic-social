import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeProfileDto {
  @ApiProperty({ description: 'User ID to create profile for' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Display name for the employee' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Employee bio' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Topics of interest', type: [String] })
  @IsArray()
  @IsOptional()
  interests?: string[];

  @ApiPropertyOptional({ description: 'Preferred platforms for sharing', type: [String] })
  @IsArray()
  @IsOptional()
  preferredPlatforms?: string[];

  @ApiPropertyOptional({ description: 'Personal social accounts for sharing' })
  @IsOptional()
  personalAccounts?: any;

  @ApiPropertyOptional({ description: 'Notification settings' })
  @IsOptional()
  notificationSettings?: any;
}
