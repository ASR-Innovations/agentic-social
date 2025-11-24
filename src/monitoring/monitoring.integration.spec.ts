import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MonitoringModule } from './monitoring.module';
import { LoggerService } from './logger/logger.service';
import { MetricsService } from './metrics/metrics.service';
import { TracingService } from './tracing/tracing.service';
import { SentryService } from './sentry/sentry.service';
import { DatadogService } from './datadog/datadog.service';

describe('MonitoringModule Integration Tests', () => {
  let module: TestingModule;
  let loggerService: LoggerService;
  let metricsService: MetricsService;
  let tracingService: TracingService;
  let sentryService: SentryService;
  let datadogService: DatadogService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MonitoringModule,
      ],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
    metricsService = module.get<MetricsService>(MetricsService);
    tracingService = module.get<TracingService>(TracingService);
    sentryService = module.get<SentryService>(SentryService);
    datadogService = module.get<DatadogService>(DatadogService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('LoggerService', () => {
    it('should be defined', () => {
      expect(loggerService).toBeDefined();
    });

    it('should log messages with different levels', () => {
      loggerService.setContext('TestContext');
      
      expect(() => loggerService.log('Test log message')).not.toThrow();
      expect(() => loggerService.error('Test error message')).not.toThrow();
      expect(() => loggerService.warn('Test warning message')).not.toThrow();
      expect(() => loggerService.debug('Test debug message')).not.toThrow();
      expect(() => loggerService.verbose('Test verbose message')).not.toThrow();
    });

    it('should log structured data', () => {
      expect(() => {
        loggerService.logWithMetadata('info', 'Test structured log', {
          userId: '123',
          action: 'test',
        });
      }).not.toThrow();
    });

    it('should log business events', () => {
      expect(() => {
        loggerService.logBusinessEvent('post_published', {
          postId: 'abc123',
          platform: 'instagram',
        });
      }).not.toThrow();
    });

    it('should log performance metrics', () => {
      expect(() => {
        loggerService.logPerformance('database_query', 150, {
          query: 'SELECT * FROM posts',
        });
      }).not.toThrow();
    });

    it('should log security events', () => {
      expect(() => {
        loggerService.logSecurityEvent('failed_login', {
          userId: '123',
          ip: '192.168.1.1',
        });
      }).not.toThrow();
    });
  });

  describe('MetricsService', () => {
    it('should be defined', () => {
      expect(metricsService).toBeDefined();
    });

    it('should record HTTP metrics', () => {
      expect(() => {
        metricsService.recordHttpRequest('GET', '/api/posts', 200, 0.150);
      }).not.toThrow();
    });

    it('should record business metrics', () => {
      expect(() => {
        metricsService.recordPostPublished('instagram', 'workspace-1');
        metricsService.recordPostScheduled('facebook', 'workspace-1');
        metricsService.recordPostFailed('twitter', 'workspace-1', 'api_error');
      }).not.toThrow();
    });

    it('should record AI metrics', () => {
      expect(() => {
        metricsService.recordAiRequest('gpt-4o', 'content_creator', 'workspace-1', 2.5);
        metricsService.recordAiCost('gpt-4o', 'workspace-1', 0.05);
      }).not.toThrow();
    });

    it('should record platform API metrics', () => {
      expect(() => {
        metricsService.recordPlatformApiCall('instagram', '/media/publish', 1.2);
        metricsService.recordPlatformApiError('facebook', 'rate_limit');
      }).not.toThrow();
    });

    it('should get metrics in Prometheus format', async () => {
      const metrics = await metricsService.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should get metrics as JSON', async () => {
      const metrics = await metricsService.getMetricsJSON();
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('TracingService', () => {
    it('should be defined', () => {
      expect(tracingService).toBeDefined();
    });

    it('should trace async operations', async () => {
      const result = await tracingService.traceAsync('test_operation', async (span) => {
        span.setAttributes({ test: 'value' });
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should trace sync operations', () => {
      const result = tracingService.trace('test_sync_operation', (span) => {
        span.setAttributes({ test: 'value' });
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should handle errors in traced operations', async () => {
      await expect(
        tracingService.traceAsync('failing_operation', async () => {
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');
    });
  });

  describe('SentryService', () => {
    it('should be defined', () => {
      expect(sentryService).toBeDefined();
    });

    it('should capture exceptions', () => {
      const error = new Error('Test error');
      expect(() => {
        sentryService.captureException(error, { context: 'test' });
      }).not.toThrow();
    });

    it('should capture messages', () => {
      expect(() => {
        sentryService.captureMessage('Test message', 'info', { context: 'test' });
      }).not.toThrow();
    });

    it('should set user context', () => {
      expect(() => {
        sentryService.setUser({
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
        });
      }).not.toThrow();
    });

    it('should add breadcrumbs', () => {
      expect(() => {
        sentryService.addBreadcrumb({
          category: 'test',
          message: 'Test breadcrumb',
          level: 'info',
        });
      }).not.toThrow();
    });

    it('should capture business events', () => {
      expect(() => {
        sentryService.captureBusinessEvent('post_published', {
          postId: 'abc123',
        });
      }).not.toThrow();
    });

    it('should capture security events', () => {
      expect(() => {
        sentryService.captureSecurityEvent('failed_login', {
          userId: '123',
        });
      }).not.toThrow();
    });
  });

  describe('DatadogService', () => {
    it('should be defined', () => {
      expect(datadogService).toBeDefined();
    });

    it('should trace async operations', async () => {
      const result = await datadogService.traceAsync('test_operation', async () => {
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should trace sync operations', () => {
      const result = datadogService.trace('test_sync_operation', () => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should track business events', () => {
      expect(() => {
        datadogService.trackBusinessEvent('post_published', {
          postId: 'abc123',
        });
      }).not.toThrow();
    });

    it('should track API calls', () => {
      expect(() => {
        datadogService.trackApiCall('POST', '/api/posts', 201, 250);
      }).not.toThrow();
    });

    it('should track database queries', () => {
      expect(() => {
        datadogService.trackDatabaseQuery('INSERT', 'posts', 50);
      }).not.toThrow();
    });

    it('should track external API calls', () => {
      expect(() => {
        datadogService.trackExternalApiCall('instagram', '/media/publish', 1200, true);
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work together for a complete request flow', async () => {
      // Log the request
      loggerService.setContext('IntegrationTest');
      loggerService.log('Starting request flow');

      // Record metrics
      metricsService.recordHttpRequest('POST', '/api/posts', 201, 0.250);
      metricsService.recordPostPublished('instagram', 'workspace-1');

      // Trace the operation
      const result = await tracingService.traceAsync('publish_post', async (span) => {
        span.setAttributes({
          'post.platform': 'instagram',
          'workspace.id': 'workspace-1',
        });

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 10));

        return { success: true, postId: 'abc123' };
      });

      // Log the result
      loggerService.logBusinessEvent('post_published', {
        postId: result.postId,
        platform: 'instagram',
      });

      // Capture in Sentry
      sentryService.captureBusinessEvent('post_published', {
        postId: result.postId,
      });

      // Track in DataDog
      datadogService.trackBusinessEvent('post_published', {
        postId: result.postId,
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('abc123');
    });
  });
})