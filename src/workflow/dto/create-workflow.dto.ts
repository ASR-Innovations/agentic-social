import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, IsInt, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkflowType {
  APPROVAL = 'APPROVAL',
  AUTOMATION = 'AUTOMATION',
}

export enum WorkflowStepType {
  APPROVAL = 'APPROVAL',
  CONDITION = 'CONDITION',
  NOTIFICATION = 'NOTIFICATION',
  ACTION = 'ACTION',
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

export class CreateWorkflowConditionDto {
  @ApiProperty({ description: 'Field to evaluate' })
  @IsString()
  field: string;

  @ApiProperty({ enum: ConditionOperator })
  @IsEnum(ConditionOperator)
  operator: ConditionOperator;

  @ApiProperty({ description: 'Value to compare against' })
  value: any;

  @ApiPropertyOptional({ description: 'Logical operator for multiple conditions', default: 'AND' })
  @IsOptional()
  @IsString()
  logicalOperator?: string;

  @ApiPropertyOptional({ description: 'Order of evaluation' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateWorkflowStepDto {
  @ApiProperty({ description: 'Step name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Step description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowStepType })
  @IsEnum(WorkflowStepType)
  type: WorkflowStepType;

  @ApiProperty({ description: 'Step order in workflow' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'Step configuration (approvers, actions, etc.)' })
  @IsObject()
  config: {
    approvers?: string[]; // User IDs for approval steps
    approvalType?: 'ANY' | 'ALL' | 'MAJORITY'; // How many approvers needed
    notificationRecipients?: string[]; // User IDs for notifications
    actionType?: string; // Type of action to perform
    actionConfig?: any; // Action-specific configuration
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Can this step be skipped?', default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Conditions for this step', type: [CreateWorkflowConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowConditionDto)
  conditions?: CreateWorkflowConditionDto[];
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowType, default: WorkflowType.APPROVAL })
  @IsEnum(WorkflowType)
  type: WorkflowType;

  @ApiProperty({ description: 'Workflow configuration' })
  @IsObject()
  config: {
    triggerType?: 'MANUAL' | 'AUTOMATIC'; // How workflow is triggered
    triggerConditions?: any[]; // Conditions for automatic trigger
    entityTypes?: string[]; // Types of entities this workflow applies to
    autoApprovalRules?: any[]; // Rules for automatic approval
    deadlineHours?: number; // Hours until approval deadline
    escalationEnabled?: boolean; // Enable escalation
    escalationHours?: number; // Hours before escalation
    escalationRecipients?: string[]; // User IDs to escalate to
    [key: string]: any;
  };

  @ApiProperty({ description: 'Workflow steps', type: [CreateWorkflowStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowStepDto)
  steps: CreateWorkflowStepDto[];

  @ApiPropertyOptional({ description: 'Is workflow active?', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
