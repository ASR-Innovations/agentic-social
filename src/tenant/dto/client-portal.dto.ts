import { IsString, IsEmail, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClientPortalAccessLevel {
  VIEW_ONLY = 'VIEW_ONLY',
  VIEW_AND_COMMENT = 'VIEW_AND_COMMENT',
  VIEW_AND_APPROVE = 'VIEW_AND_APPROVE',
}

export class CreateClientPortalAccessDto {
  @ApiProperty({
    description: 'Client email address',
    example: 'client@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Workspace ID to grant access to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  workspaceId: string;

  @ApiProperty({
    description: 'Access level for the client',
    enum: ClientPortalAccessLevel,
    example: ClientPortalAccessLevel.VIEW_AND_APPROVE,
  })
  @IsEnum(ClientPortalAccessLevel)
  accessLevel: ClientPortalAccessLevel;

  @ApiPropertyOptional({
    description: 'Specific permissions for the client',
    example: ['view_analytics', 'approve_posts'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateClientPortalAccessDto {
  @ApiPropertyOptional({
    description: 'Access level for the client',
    enum: ClientPortalAccessLevel,
  })
  @IsOptional()
  @IsEnum(ClientPortalAccessLevel)
  accessLevel?: ClientPortalAccessLevel;

  @ApiPropertyOptional({
    description: 'Specific permissions for the client',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
