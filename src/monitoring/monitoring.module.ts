import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';
import { MetricsService } from './metrics/metrics.service';
import { TracingService } from './tracing/tracing.service';
import { SentryService } from './sentry/sentry.service';
import { DatadogService } from './datadog/datadog.service';
import { MonitoringController } from './monitoring.controller';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { TracingInterceptor } from './interceptors/tracing.interceptor';
import { SentryInterceptor } from './interceptors/sentry.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [MonitoringController],
  providers: [
    LoggerService,
    MetricsService,
    TracingService,
    SentryService,
    DatadogService,
    LoggingInterceptor,
    MetricsInterceptor,
    TracingInterceptor,
    SentryInterceptor,
  ],
  exports: [
    LoggerService,
    MetricsService,
    TracingService,
    SentryService,
    DatadogService,
    LoggingInterceptor,
    MetricsInterceptor,
    TracingInterceptor,
    SentryInterceptor,
  ],
})
export class MonitoringModule {}
