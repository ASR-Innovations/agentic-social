import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

/**
 * Interceptor to set Cache-Control headers on HTTP responses
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheControl = this.reflector.get<{
      maxAge: number;
      sMaxAge?: number;
      staleWhileRevalidate?: number;
    }>('cache:control', context.getHandler());

    if (!cacheControl) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        let cacheControlValue = `public, max-age=${cacheControl.maxAge}`;

        if (cacheControl.sMaxAge !== undefined) {
          cacheControlValue += `, s-maxage=${cacheControl.sMaxAge}`;
        }

        if (cacheControl.staleWhileRevalidate !== undefined) {
          cacheControlValue += `, stale-while-revalidate=${cacheControl.staleWhileRevalidate}`;
        }

        response.setHeader('Cache-Control', cacheControlValue);
        response.setHeader('ETag', `"${Date.now()}"`);
      }),
    );
  }
}
