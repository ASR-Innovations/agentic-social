import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDelegationDto {
  @ApiProperty({ description: 'User ID to delegate to' })
  @IsString()
  toUserId: string;

  @ApiProperty({ description: 'Start date of delegation' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of delegation' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Reason for delegation' })
  @IsOptional()
  @IsString()
  reason?: string;
}
