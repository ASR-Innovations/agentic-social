import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import { AuditAction, AuditStatus, AuditSeverity } from '../dto/audit.dto';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
  action: AuditAction;
  resourceType: string;
  severity?: AuditSeverity;
  includeBody?: boolean;
  includeResponse?: boolean;
}

/**
 * Decorator to mark routes for automatic audit logging
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  Reflect.metadata(AUDIT_LOG_KEY, metadata);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, body, params, query, ip, headers } = request;

    const workspaceId = user?.workspaceId || params?.workspaceId;
    const userId = user?.id;
    const ipAddress = ip || headers['x-forwarded-for'] || 'unknown';
    const userAgent = headers['user-agent'] || 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;

          const details: any = {
            duration,
            method: request.method,
            path: request.path,
          };

          if (metadata.includeBody && body) {
            details.requestBody = this.sanitizeData(body);
          }

          if (metadata.includeResponse && response) {
            details.response = this.sanitizeData(response);
          }

          if (params) {
            details.params = params;
          }

          if (query && Object.keys(query).length > 0) {
            details.query = query;
          }

          // Extract resource ID from params or response
          const resourceId =
            params?.id || response?.id || params?.resourceId || null;

          this.auditService.create(workspaceId, userId, {
            action: metadata.action,
            resourceType: metadata.resourceType,
            resourceId,
            ipAddress,
            userAgent,
            status: AuditStatus.SUCCESS,
            details,
            severity: metadata.severity || AuditSeverity.INFO,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          const details: any = {
            duration,
            method: request.method,
            path: request.path,
            error: {
              message: error.message,
              statusCode: error.status,
            },
          };

          if (metadata.includeBody && body) {
            details.requestBody = this.sanitizeData(body);
          }

          this.auditService.create(workspaceId, userId, {
            action: metadata.action,
            resourceType: metadata.resourceType,
            resourceId: params?.id || null,
            ipAddress,
            userAgent,
            status: AuditStatus.FAILURE,
            details,
            severity: AuditSeverity.ERROR,
          });
        },
      }),
    );
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
