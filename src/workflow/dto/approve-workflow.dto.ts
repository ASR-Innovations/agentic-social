import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SKIP = 'SKIP',
}

export class ApproveWorkflowDto {
  @ApiProperty({ enum: ApprovalAction })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: 'Comments about the approval decision' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BulkApproveDto {
  @ApiProperty({ description: 'Array of approval IDs to approve' })
  @IsArray()
  @IsString({ each: true })
  approvalIds: string[];

  @ApiProperty({ enum: ApprovalAction })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: 'Comments for all approvals' })
  @IsOptional()
  @IsString()
  comments?: string;
}
