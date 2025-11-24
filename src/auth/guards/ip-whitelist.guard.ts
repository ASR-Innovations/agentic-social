import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IPWhitelistService } from '../services/ip-whitelist.service';

@Injectable()
export class IPWhitelistGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private ipWhitelistService: IPWhitelistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if IP whitelist is disabled for this route
    const skipIPCheck = this.reflector.get<boolean>(
      'skipIPWhitelist',
      context.getHandler(),
    );

    if (skipIPCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.user?.workspaceId;

    if (!workspaceId) {
      // No workspace context, skip check
      return true;
    }

    // Get client IP address
    const ipAddress = this.getClientIP(request);

    // Check if IP is whitelisted
    const isWhitelisted = await this.ipWhitelistService.isIPWhitelisted(
      workspaceId,
      ipAddress,
    );

    if (!isWhitelisted) {
      throw new ForbiddenException(
        'Access denied: IP address not whitelisted',
      );
    }

    return true;
  }

  private getClientIP(request: any): string {
    // Try various headers for IP address (for proxies/load balancers)
    return (
      request.headers['x-forwarded-for']?.split(',')[0].trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0'
    );
  }
}
