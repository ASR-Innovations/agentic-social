import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/common/cache/cache.constants';
import { CacheService } from '../../cache/services/cache.service';

/**
 * Interceptor for caching API responses
 * Automatically caches GET requests based on route and query parameters
 */
@Injectable()
export class CacheResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if caching is disabled for this route
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, handler);
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    if (cacheKey === null || cacheTTL === 0) {
      return next.handle();
    }

    // Generate cache key from route and query parameters
    const generatedKey = this.generateCacheKey(request);
    const finalKey = cacheKey || generatedKey;

    // Try to get cached response
    const cachedResponse = await this.cacheService.get(finalKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // If not cached, execute handler and cache the result
    return next.handle().pipe(
      tap(async (response) => {
        const ttl = cacheTTL || 300; // Default 5 minutes
        await this.cacheService.set(finalKey, response, { ttl } as any);
      }),
    );
  }

  /**
   * Generate a unique cache key based on request details
   */
  private generateCacheKey(request: any): string {
    const { url, query, user } = request;
    const workspaceId = user?.workspaceId || 'anonymous';
    
    // Create a deterministic key from URL and query params
    const queryString = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    return `api:${workspaceId}:${url}:${queryString}`;
  }
}
