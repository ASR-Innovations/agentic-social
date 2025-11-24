import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveContentDto {
  @ApiProperty({ description: 'Approval status' })
  @IsBoolean()
  isApproved: boolean;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
