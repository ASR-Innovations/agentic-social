import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SentryService } from '../sentry/sentry.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const transactionName = `${controller.name}.${handler.name}`;
    const transaction = this.sentryService.startTransaction(transactionName, 'http.server');

    // Set user context if available
    if (request.user) {
      this.sentryService.setUser({
        id: request.user.id,
        email: request.user.email,
        username: request.user.username,
      });
    }

    // Set request context
    this.sentryService.setContext('request', {
      method: request.method,
      url: request.url,
      headers: request.headers,
      query: request.query,
      body: request.body,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          transaction.setStatus('ok');
          transaction.finish();
        },
        error: (error) => {
          transaction.setStatus('internal_error');
          this.sentryService.captureException(error, {
            controller: controller.name,
            handler: handler.name,
            method: request.method,
            url: request.url,
            userId: request.user?.id,
            workspaceId: request.user?.workspaceId,
          });
          transaction.finish();
        },
      }),
    );
  }
}
