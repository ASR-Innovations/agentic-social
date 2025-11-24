import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  TWO_FACTOR_ENABLE = 'two_factor_enable',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  SESSION_REVOKE = 'session_revoke',
  POST_CREATE = 'post_create',
  POST_UPDATE = 'post_update',
  POST_DELETE = 'post_delete',
  SETTINGS_UPDATE = 'settings_update',
  USER_INVITE = 'user_invite',
  USER_REMOVE = 'user_remove',
  PERMISSION_CHANGE = 'permission_change',
  IP_WHITELIST_ADD = 'ip_whitelist_add',
  IP_WHITELIST_REMOVE = 'ip_whitelist_remove',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Action performed', enum: AuditAction })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ description: 'Resource type' })
  @IsString()
  resourceType: string;

  @ApiPropertyOptional({ description: 'Resource ID' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Status of the action' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Additional details' })
  @IsOptional()
  details?: any;

  @ApiPropertyOptional({ description: 'Severity level', enum: AuditSeverity, default: AuditSeverity.INFO })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;
}

export class QueryAuditLogsDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by action', enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Filter by resource type' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ description: 'Filter by severity', enum: AuditSeverity })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  limit?: number;
}
