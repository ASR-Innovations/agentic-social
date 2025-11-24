import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import * as api from '@opentelemetry/api';

@Injectable()
export class TracingService implements OnModuleInit {
  private sdk: NodeSDK;
  private tracer: api.Tracer;

  constructor(private readonly configService: ConfigService) {
    this.initializeTracing();
  }

  private initializeTracing() {
    const serviceName = 'ai-social-media-platform';
    const environment = this.configService.get('NODE_ENV', 'development');
    const jaegerEndpoint = this.configService.get('JAEGER_ENDPOINT', 'http://localhost:14268/api/traces');
    const enableTracing = this.configService.get('ENABLE_TRACING', 'true') === 'true';

    if (!enableTracing) {
      console.log('Tracing is disabled');
      return;
    }

    try {
      // Configure exporters
      const prometheusExporter = new PrometheusExporter(
        {
          port: parseInt(this.configService.get('PROMETHEUS_PORT', '9464')),
        },
        () => {
          console.log(`Prometheus metrics available at http://localhost:${this.configService.get('PROMETHEUS_PORT', '9464')}/metrics`);
        },
      );

      const jaegerExporter = new JaegerExporter({
        endpoint: jaegerEndpoint,
      });

      // Initialize SDK with minimal configuration
      this.sdk = new NodeSDK({
        traceExporter: jaegerExporter,
        metricReader: prometheusExporter,
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
              enabled: false,
            },
          }),
        ],
      });

      // Get tracer
      this.tracer = api.trace.getTracer(serviceName);
    } catch (error) {
      console.error('Failed to initialize tracing:', error);
    }
  }

  async onModuleInit() {
    const enableTracing = this.configService.get('ENABLE_TRACING', 'true') === 'true';
    
    if (enableTracing && this.sdk) {
      try {
        await this.sdk.start();
        console.log('OpenTelemetry tracing initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OpenTelemetry tracing:', error);
      }
    }
  }

  async onModuleDestroy() {
    if (this.sdk) {
      try {
        await this.sdk.shutdown();
        console.log('OpenTelemetry tracing shut down successfully');
      } catch (error) {
        console.error('Error shutting down OpenTelemetry tracing:', error);
      }
    }
  }

  // Create a new span
  startSpan(name: string, options?: api.SpanOptions): api.Span {
    return this.tracer.startSpan(name, options);
  }

  // Create a span and execute a function within its context
  async traceAsync<T>(
    name: string,
    fn: (span: api.Span) => Promise<T>,
    options?: api.SpanOptions,
  ): Promise<T> {
    const span = this.startSpan(name, options);
    
    try {
      const result = await api.context.with(
        api.trace.setSpan(api.context.active(), span),
        () => fn(span),
      );
      span.setStatus({ code: api.SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  // Trace a synchronous function
  trace<T>(
    name: string,
    fn: (span: api.Span) => T,
    options?: api.SpanOptions,
  ): T {
    const span = this.startSpan(name, options);
    
    try {
      const result = api.context.with(
        api.trace.setSpan(api.context.active(), span),
        () => fn(span),
      );
      span.setStatus({ code: api.SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  // Add attributes to current span
  addSpanAttributes(attributes: api.Attributes) {
    const span = api.trace.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }

  // Add event to current span
  addSpanEvent(name: string, attributes?: api.Attributes) {
    const span = api.trace.getActiveSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  // Get current span
  getCurrentSpan(): api.Span | undefined {
    return api.trace.getActiveSpan();
  }

  // Get trace context for distributed tracing
  getTraceContext(): api.Context {
    return api.context.active();
  }

  // Inject trace context into carrier (for HTTP headers)
  injectTraceContext(carrier: any) {
    api.propagation.inject(api.context.active(), carrier);
  }

  // Extract trace context from carrier (for HTTP headers)
  extractTraceContext(carrier: any): api.Context {
    return api.propagation.extract(api.context.active(), carrier);
  }
}
