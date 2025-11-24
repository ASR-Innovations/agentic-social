import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartWorkflowDto {
  @ApiProperty({ description: 'Workflow ID to execute' })
  @IsString()
  workflowId: string;

  @ApiProperty({ description: 'Type of entity (e.g., "post", "campaign")' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'ID of the entity being approved' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Additional context data' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
