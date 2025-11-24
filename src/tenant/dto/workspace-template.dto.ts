import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'E-commerce Starter',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'Pre-configured workspace for e-commerce businesses',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Template configuration including settings, workflows, and defaults',
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether this template is publicly available',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ApplyWorkspaceTemplateDto {
  @ApiProperty({
    description: 'The ID of the template to apply',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  templateId: string;

  @ApiProperty({
    description: 'The ID of the workspace to apply the template to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  workspaceId: string;
}
