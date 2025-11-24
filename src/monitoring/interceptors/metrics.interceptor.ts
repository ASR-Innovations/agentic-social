import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract route pattern
    const route = this.getRoutePattern(context);
    const method = request.method;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds
          const statusCode = response.statusCode;
          
          this.metricsService.recordHttpRequest(method, route, statusCode, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode || 500;
          
          this.metricsService.recordHttpRequest(method, route, statusCode, duration);
          this.metricsService.recordHttpError(method, route, error.name || 'UnknownError');
        },
      }),
    );
  }

  private getRoutePattern(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    
    // Try to get route from metadata
    const controllerPath = Reflect.getMetadata('path', controller) || '';
    const handlerPath = Reflect.getMetadata('path', handler) || '';
    
    return `/${controllerPath}/${handlerPath}`.replace(/\/+/g, '/').replace(/\/$/, '') || 'unknown';
  }
}
