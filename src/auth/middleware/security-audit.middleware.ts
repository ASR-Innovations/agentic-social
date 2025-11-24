import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityAuditService } from '../services/security-audit.service';
import { AuditAction, AuditSeverity } from '../dto/security-audit.dto';

@Injectable()
export class SecurityAuditMiddleware implements NestMiddleware {
  constructor(private securityAuditService: SecurityAuditService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Capture response
    const originalSend = res.send;
    let responseBody: any;

    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Wait for response to complete
    res.on('finish', async () => {
      try {
        // Only log certain actions
        if (this.shouldLog(req)) {
          const user = (req as any).user;
          const workspaceId = user?.workspaceId;
          const userId = user?.userId;

          if (workspaceId) {
            const action = this.getActionFromRequest(req);
            const resourceType = this.getResourceType(req);
            const ipAddress = this.getClientIP(req);
            const userAgent = req.headers['user-agent'] || '';

            await this.securityAuditService.create(workspaceId, userId, {
              action: action as any,
              resourceType,
              resourceId: req.params.id,
              ipAddress,
              userAgent,
              status: res.statusCode < 400 ? 'success' : 'failure',
              severity: this.getSeverity(req, res.statusCode),
              details: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: Date.now() - startTime,
              },
            });
          }
        }
      } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Audit logging error:', error);
      }
    });

    next();
  }

  private shouldLog(req: Request): boolean {
    // Don't log health checks, static assets, etc.
    const skipPaths = ['/health', '/metrics', '/favicon.ico'];
    return !skipPaths.some(path => req.path.startsWith(path));
  }

  private getActionFromRequest(req: Request): string {
    const method = req.method;
    const path = req.path;

    // Map common patterns to actions
    if (path.includes('/auth/login')) return 'login';
    if (path.includes('/auth/logout')) return 'logout';
    if (path.includes('/auth/register')) return 'register';
    if (path.includes('/posts') && method === 'POST') return 'post_create';
    if (path.includes('/posts') && method === 'PUT') return 'post_update';
    if (path.includes('/posts') && method === 'DELETE') return 'post_delete';
    if (path.includes('/settings') && method === 'PUT') return 'settings_update';
    if (path.includes('/team/invite')) return 'user_invite';
    if (path.includes('/team') && method === 'DELETE') return 'user_remove';

    // Default action
    return `${method.toLowerCase()}_${path.split('/')[1] || 'unknown'}`;
  }

  private getResourceType(req: Request): string {
    const path = req.path;
    
    if (path.includes('/posts')) return 'post';
    if (path.includes('/users') || path.includes('/team')) return 'user';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/campaigns')) return 'campaign';
    if (path.includes('/media')) return 'media';
    
    return 'unknown';
  }

  private getSeverity(req: Request, statusCode: number): AuditSeverity {
    if (statusCode >= 500) return AuditSeverity.CRITICAL;
    if (statusCode >= 400) return AuditSeverity.WARNING;
    
    // Sensitive operations get higher severity
    if (req.path.includes('/auth') || req.path.includes('/security')) {
      return AuditSeverity.WARNING;
    }
    
    return AuditSeverity.INFO;
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.headers['x-real-ip']?.toString() ||
      req.socket?.remoteAddress ||
      '0.0.0.0'
    );
  }
}
