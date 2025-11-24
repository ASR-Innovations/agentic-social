import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Log request
    this.logger.logRequest(request);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.logResponse(request, response, responseTime);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `Request failed: ${request.method} ${request.url}`,
            error.stack,
            'HTTP',
          );
          this.logger.logWithMetadata('error', 'Request error', {
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: `${responseTime}ms`,
            error: error.message,
            userId: request.user?.id,
            workspaceId: request.user?.workspaceId,
          });
        },
      }),
    );
  }
}
