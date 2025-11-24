import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TracingService } from '../tracing/tracing.service';
import * as api from '@opentelemetry/api';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly tracingService: TracingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const spanName = `${controller.name}.${handler.name}`;
    const span = this.tracingService.startSpan(spanName, {
      kind: api.SpanKind.SERVER,
      attributes: {
        'http.method': request.method,
        'http.url': request.url,
        'http.route': request.route?.path,
        'user.id': request.user?.id,
        'workspace.id': request.user?.workspaceId,
      },
    });

    return api.context.with(
      api.trace.setSpan(api.context.active(), span),
      () => {
        return next.handle().pipe(
          tap({
            next: () => {
              span.setStatus({ code: api.SpanStatusCode.OK });
              span.end();
            },
            error: (error) => {
              span.setStatus({
                code: api.SpanStatusCode.ERROR,
                message: error.message,
              });
              span.recordException(error);
              span.end();
            },
          }),
        );
      },
    );
  }
}
