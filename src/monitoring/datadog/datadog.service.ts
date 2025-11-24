import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import tracer from 'dd-trace';

@Injectable()
export class DatadogService implements OnModuleInit {
  private tracer: typeof tracer;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const enableDatadog = this.configService.get('ENABLE_DATADOG', 'false') === 'true';
    const datadogApiKey = this.configService.get('DATADOG_API_KEY');
    const environment = this.configService.get('NODE_ENV', 'development');
    const serviceName = 'ai-social-media-platform';

    if (!enableDatadog) {
      console.log('DataDog monitoring is disabled');
      return;
    }

    // Initialize DataDog tracer
    this.tracer = tracer.init({
      service: serviceName,
      env: environment,
      version: process.env.npm_package_version || '1.0.0',
      
      // APM Configuration
      runtimeMetrics: true,
      profiling: true,
      
      // Sampling
      sampleRate: parseFloat(this.configService.get('DATADOG_SAMPLE_RATE', '1.0')),
      
      // Logging
      logInjection: true,
      
      // Tags
      tags: {
        service: serviceName,
        env: environment,
      },

      // Plugin configuration
      plugins: true,
    });

    console.log('DataDog monitoring initialized successfully');
  }

  // Get tracer instance
  getTracer() {
    return this.tracer;
  }

  // Create a custom span
  trace<T>(name: string, fn: () => T, options?: any): T {
    if (!this.tracer) {
      return fn();
    }

    const span = this.tracer.startSpan(name, options);
    
    try {
      const result = fn();
      span.finish();
      return result;
    } catch (error) {
      span.setTag('error', true);
      span.setTag('error.message', error instanceof Error ? error.message : 'Unknown error');
      span.setTag('error.stack', error instanceof Error ? error.stack : '');
      span.finish();
      throw error;
    }
  }

  // Create a custom async span
  async traceAsync<T>(name: string, fn: () => Promise<T>, options?: any): Promise<T> {
    if (!this.tracer) {
      return fn();
    }

    const span = this.tracer.startSpan(name, options);
    
    try {
      const result = await fn();
      span.finish();
      return result;
    } catch (error) {
      span.setTag('error', true);
      span.setTag('error.message', error instanceof Error ? error.message : 'Unknown error');
      span.setTag('error.stack', error instanceof Error ? error.stack : '');
      span.finish();
      throw error;
    }
  }

  // Add tags to current span
  setTags(tags: Record<string, any>) {
    if (!this.tracer) return;
    
    const span = this.tracer.scope().active();
    if (span) {
      Object.entries(tags).forEach(([key, value]) => {
        span.setTag(key, value);
      });
    }
  }

  // Set a single tag
  setTag(key: string, value: any) {
    if (!this.tracer) return;
    
    const span = this.tracer.scope().active();
    if (span) {
      span.setTag(key, value);
    }
  }

  // Record custom metric
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    // DataDog metrics are typically sent via DogStatsD
    // This is a placeholder for custom metric recording
    console.log(`Metric: ${name} = ${value}`, tags);
  }

  // Record distribution metric
  recordDistribution(name: string, value: number, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    console.log(`Distribution: ${name} = ${value}`, tags);
  }

  // Record histogram metric
  recordHistogram(name: string, value: number, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    console.log(`Histogram: ${name} = ${value}`, tags);
  }

  // Increment counter
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    console.log(`Counter: ${name} += ${value}`, tags);
  }

  // Record gauge
  recordGauge(name: string, value: number, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    console.log(`Gauge: ${name} = ${value}`, tags);
  }

  // Record timing
  recordTiming(name: string, duration: number, tags?: Record<string, string>) {
    if (!this.tracer) return;
    
    this.recordDistribution(`${name}.duration`, duration, tags);
  }

  // Track business event
  trackBusinessEvent(event: string, data: Record<string, any>) {
    this.setTags({
      'business.event': event,
      ...data,
    });
  }

  // Track error
  trackError(error: Error, context?: Record<string, any>) {
    if (!this.tracer) return;
    
    const span = this.tracer.scope().active();
    if (span) {
      span.setTag('error', true);
      span.setTag('error.type', error.name);
      span.setTag('error.message', error.message);
      span.setTag('error.stack', error.stack);
      
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          span.setTag(`error.context.${key}`, value);
        });
      }
    }
  }

  // Track performance
  trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.recordTiming(operation, duration, metadata);
    
    if (metadata) {
      this.setTags(metadata);
    }
  }

  // Track user action
  trackUserAction(userId: string, action: string, metadata?: Record<string, any>) {
    this.setTags({
      'user.id': userId,
      'user.action': action,
      ...metadata,
    });
  }

  // Track API call
  trackApiCall(method: string, endpoint: string, statusCode: number, duration: number) {
    this.setTags({
      'http.method': method,
      'http.endpoint': endpoint,
      'http.status_code': statusCode,
    });
    
    this.recordTiming('api.request', duration, {
      method,
      endpoint,
      status_code: statusCode.toString(),
    });
  }

  // Track database query
  trackDatabaseQuery(operation: string, table: string, duration: number) {
    this.setTags({
      'db.operation': operation,
      'db.table': table,
    });
    
    this.recordTiming('db.query', duration, {
      operation,
      table,
    });
  }

  // Track external API call
  trackExternalApiCall(service: string, endpoint: string, duration: number, success: boolean) {
    this.setTags({
      'external.service': service,
      'external.endpoint': endpoint,
      'external.success': success,
    });
    
    this.recordTiming('external.api', duration, {
      service,
      endpoint,
      success: success.toString(),
    });
  }

  // Track cache operation
  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string) {
    this.incrementCounter('cache.operation', 1, {
      operation,
      key_prefix: key.split(':')[0],
    });
  }

  // Track queue operation
  trackQueueOperation(queue: string, operation: 'add' | 'process' | 'complete' | 'fail', duration?: number) {
    this.incrementCounter('queue.operation', 1, {
      queue,
      operation,
    });
    
    if (duration !== undefined) {
      this.recordTiming('queue.job', duration, {
        queue,
        operation,
      });
    }
  }
}
