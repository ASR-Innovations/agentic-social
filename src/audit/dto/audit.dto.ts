import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  
  // User Management
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_INVITE = 'user_invite',
  PERMISSION_CHANGE = 'permission_change',
  ROLE_CHANGE = 'role_change',
  
  // Content Management
  POST_CREATE = 'post_create',
  POST_UPDATE = 'post_update',
  POST_DELETE = 'post_delete',
  POST_PUBLISH = 'post_publish',
  POST_SCHEDULE = 'post_schedule',
  POST_APPROVE = 'post_approve',
  POST_REJECT = 'post_reject',
  
  // Media Management
  MEDIA_UPLOAD = 'media_upload',
  MEDIA_DELETE = 'media_delete',
  MEDIA_UPDATE = 'media_update',
  
  // Social Account Management
  ACCOUNT_CONNECT = 'account_connect',
  ACCOUNT_DISCONNECT = 'account_disconnect',
  ACCOUNT_UPDATE = 'account_update',
  
  // Workspace Management
  WORKSPACE_CREATE = 'workspace_create',
  WORKSPACE_UPDATE = 'workspace_update',
  WORKSPACE_DELETE = 'workspace_delete',
  WORKSPACE_SETTINGS_UPDATE = 'workspace_settings_update',
  
  // Campaign Management
  CAMPAIGN_CREATE = 'campaign_create',
  CAMPAIGN_UPDATE = 'campaign_update',
  CAMPAIGN_DELETE = 'campaign_delete',
  
  // Analytics & Reports
  REPORT_GENERATE = 'report_generate',
  REPORT_EXPORT = 'report_export',
  ANALYTICS_VIEW = 'analytics_view',
  
  // Compliance & Data
  DATA_EXPORT = 'data_export',
  DATA_DELETE = 'data_delete',
  CONSENT_GRANT = 'consent_grant',
  CONSENT_REVOKE = 'consent_revoke',
  
  // Security
  IP_WHITELIST_ADD = 'ip_whitelist_add',
  IP_WHITELIST_REMOVE = 'ip_whitelist_remove',
  SECURITY_SCAN = 'security_scan',
  ENCRYPTION_KEY_ROTATE = 'encryption_key_rotate',
  
  // Integration
  INTEGRATION_CONNECT = 'integration_connect',
  INTEGRATION_DISCONNECT = 'integration_disconnect',
  API_KEY_CREATE = 'api_key_create',
  API_KEY_DELETE = 'api_key_delete',
  
  // Workflow
  WORKFLOW_CREATE = 'workflow_create',
  WORKFLOW_UPDATE = 'workflow_update',
  WORKFLOW_DELETE = 'workflow_delete',
  WORKFLOW_EXECUTE = 'workflow_execute',
  APPROVAL_SUBMIT = 'approval_submit',
  APPROVAL_APPROVE = 'approval_approve',
  APPROVAL_REJECT = 'approval_reject',
  
  // AI Operations
  AI_CONTENT_GENERATE = 'ai_content_generate',
  AI_BRAND_VOICE_TRAIN = 'ai_brand_voice_train',
  AI_ANALYSIS = 'ai_analysis',
  
  // Community Management
  MESSAGE_SEND = 'message_send',
  MESSAGE_DELETE = 'message_delete',
  CONVERSATION_ASSIGN = 'conversation_assign',
  CONVERSATION_RESOLVE = 'conversation_resolve',
  
  // System
  SYSTEM_CONFIG_UPDATE = 'system_config_update',
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

export class CreateAuditLogDto {
  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  resourceType: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  ipAddress: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsEnum(AuditStatus)
  status: AuditStatus;

  @IsOptional()
  details?: any;

  @IsEnum(AuditSeverity)
  @IsOptional()
  severity?: AuditSeverity;
}

export class QueryAuditLogsDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsEnum(AuditSeverity)
  @IsOptional()
  severity?: AuditSeverity;

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class AuditReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @IsEnum(AuditAction, { each: true })
  @IsOptional()
  actions?: AuditAction[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  resourceTypes?: string[];

  @IsEnum(AuditSeverity)
  @IsOptional()
  minSeverity?: AuditSeverity;

  @IsString()
  @IsOptional()
  format?: 'json' | 'csv' | 'pdf';

  @IsOptional()
  includeDetails?: boolean;
}

export class AuditStatisticsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  groupBy?: 'action' | 'user' | 'resourceType' | 'severity' | 'status' | 'day' | 'hour';
}
