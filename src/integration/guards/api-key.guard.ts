import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract API key from header
    const apiKey = this.extractApiKey(request);
    
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Verify API key
    const verification = await this.apiKeyService.verify(apiKey);
    
    if (!verification) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check rate limit
    const rateLimit = await this.rateLimitService.checkRateLimit(
      'api_key',
      apiKey,
      verification.workspaceId,
      1000, // Default hourly limit
      10000, // Default daily limit
    );

    if (!rateLimit.allowed) {
      throw new UnauthorizedException(
        `Rate limit exceeded. Try again at ${rateLimit.resetAt.toISOString()}`,
      );
    }

    // Attach workspace info to request
    request.user = {
      workspaceId: verification.workspaceId,
      scopes: verification.scopes,
      authType: 'api_key',
    };

    // Add rate limit headers
    request.res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    request.res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    return null;
  }
}
