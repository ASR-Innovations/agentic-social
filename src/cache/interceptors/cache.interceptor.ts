import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  CACHE_LAYER_METADATA,
  CACHE_TAGS_METADATA,
} from '../decorators/cache.decorator';
import { CacheLayer } from '../interfaces/cache.interface';

/**
 * Interceptor to handle caching for controller methods
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKeyMetadata = this.reflector.get<string | Function>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // If no cache metadata, skip caching
    if (!cacheKeyMetadata) {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );
    const layer = this.reflector.get<CacheLayer>(
      CACHE_LAYER_METADATA,
      context.getHandler(),
    );
    const tags = this.reflector.get<string[]>(
      CACHE_TAGS_METADATA,
      context.getHandler(),
    );

    // Generate cache key
    const args = context.getArgs();
    const cacheKey =
      typeof cacheKeyMetadata === 'function'
        ? cacheKeyMetadata(args)
        : cacheKeyMetadata;

    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey, { layer });
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(cached);
    }

    // Execute method and cache result
    return next.handle().pipe(
      tap(async (data) => {
        if (data !== undefined && data !== null) {
          await this.cacheService.set(cacheKey, data, {
            ttl,
            layer,
            tags,
          });
          this.logger.debug(`Cached result: ${cacheKey}`);
        }
      }),
    );
  }
}
