import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScanType {
  VULNERABILITY = 'vulnerability',
  COMPLIANCE = 'compliance',
  DEPENDENCY = 'dependency',
  CODE = 'code',
}

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class InitiateSecurityScanDto {
  @ApiProperty({ description: 'Type of security scan', enum: ScanType })
  @IsEnum(ScanType)
  scanType: ScanType;

  @ApiPropertyOptional({ description: 'Additional scan configuration' })
  @IsOptional()
  config?: any;
}

export class QuerySecurityScansDto {
  @ApiPropertyOptional({ description: 'Filter by scan type', enum: ScanType })
  @IsOptional()
  @IsEnum(ScanType)
  scanType?: ScanType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ScanStatus })
  @IsOptional()
  @IsEnum(ScanStatus)
  status?: ScanStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;
}
