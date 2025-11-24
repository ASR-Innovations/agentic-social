/**
 * Monitoring and Observability Usage Examples
 * 
 * This file demonstrates how to use the monitoring system in your services.
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import { TracingService } from '../tracing/tracing.service';
import { SentryService } from '../sentry/sentry.service';
import { DatadogService } from '../datadog/datadog.service';

@Injectable()
export class MonitoringExampleService {
  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly tracing: TracingService,
    private readonly sentry: SentryService,
    private readonly datadog: DatadogService,
  ) {
    this.logger.setContext('MonitoringExampleService');
  }

  /**
   * Example 1: Basic Logging
   */
  async basicLoggingExample() {
    // Simple log messages
    this.logger.log('User logged in successfully');
    this.logger.warn('High memory usage detected');
    this.logger.error('Failed to connect to database', 'Connection timeout');
    this.logger.debug('Processing request with params: {...}');

    // Structured logging with metadata
    this.logger.logWithMetadata('info', 'Payment processed', {
      userId: '123',
      amount: 99.99,
      currency: 'USD',
      transactionId: 'txn_abc123',
    });

    // Business event logging
    this.logger.logBusinessEvent('post_published', {
      postId: 'post_123',
      platform: 'instagram',
      workspaceId: 'workspace_1',
      scheduledAt: new Date().toISOString(),
    });

    // Performance logging
    const startTime = Date.now();
    // ... perform operation
    const duration = Date.now() - startTime;
    this.logger.logPerformance('database_query', duration, {
      query: 'SELECT * FROM posts WHERE workspace_id = ?',
      rowCount: 150,
    });

    // Security event logging
    this.logger.logSecurityEvent('failed_login_attempt', {
      userId: '123',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      attemptCount: 3,
    });
  }

  /**
   * Example 2: Metrics Collection
   */
  async metricsExample() {
    // HTTP request metrics
    this.metrics.recordHttpRequest('POST', '/api/posts', 201, 0.250);
    this.metrics.recordHttpError('POST', '/api/posts', 'ValidationError');

    // Business metrics
    this.metrics.recordPostPublished('instagram', 'workspace-1');
    this.metrics.recordPostScheduled('facebook', 'workspace-1');
    this.metrics.recordPostFailed('twitter', 'workspace-1', 'api_error');

    // AI metrics
    this.metrics.recordAiRequest('gpt-4o', 'content_creator', 'workspace-1', 2.5);
    this.metrics.recordAiCost('gpt-4o', 'workspace-1', 0.05);

    // System metrics
    this.metrics.setActiveConnections('websocket', 150);
    this.metrics.setQueueSize('publishing', 'waiting', 25);
    this.metrics.setCacheHitRate('redis', 0.85);
    this.metrics.setDatabaseConnections('postgres', 10);

    // Platform API metrics
    this.metrics.recordPlatformApiCall('instagram', '/media/publish', 1.2);
    this.metrics.recordPlatformApiError('facebook', 'rate_limit');
  }

  /**
   * Example 3: Distributed Tracing
   */
  async tracingExample() {
    // Trace an async operation
    const result = await this.tracing.traceAsync(
      'publish_post',
      async (span) => {
        // Add attributes to the span
        span.setAttributes({
          'post.id': 'post_123',
          'post.platform': 'instagram',
          'workspace.id': 'workspace_1',
        });

        // Simulate API call
        await this.simulateApiCall();

        // Add an event to the span
        span.addEvent('post_validated', {
          'validation.duration': '50ms',
        });

        // Simulate database operation
        await this.simulateDatabaseOperation();

        return { success: true, postId: 'post_123' };
      },
    );

    return result;
  }

  /**
   * Example 4: Error Tracking with Sentry
   */
  async sentryExample() {
    try {
      // Set user context
      this.sentry.setUser({
        id: '123',
        email: 'user@example.com',
        username: 'johndoe',
      });

      // Set tags for filtering
      this.sentry.setTags({
        workspace: 'workspace_1',
        feature: 'publishing',
      });

      // Add breadcrumb for context
      this.sentry.addBreadcrumb({
        category: 'auth',
        message: 'User authenticated',
        level: 'info',
        data: { userId: '123' },
      });

      // Perform operation that might fail
      await this.riskyOperation();

      // Capture business event
      this.sentry.captureBusinessEvent('post_published', {
        postId: 'post_123',
        platform: 'instagram',
      });
    } catch (error) {
      // Capture exception with context
      this.sentry.captureException(error as Error, {
        operation: 'publish_post',
        postId: 'post_123',
        platform: 'instagram',
      });

      throw error;
    }
  }

  /**
   * Example 5: DataDog APM
   */
  async datadogExample() {
    // Trace an operation
    const result = await this.datadog.traceAsync('process_payment', async () => {
      // Set tags
      this.datadog.setTags({
        'user.id': '123',
        'workspace.id': 'workspace_1',
        'payment.amount': '99.99',
      });

      // Track business event
      this.datadog.trackBusinessEvent('payment_initiated', {
        amount: 99.99,
        currency: 'USD',
      });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      return { success: true, transactionId: 'txn_123' };
    });

    // Track API call
    this.datadog.trackApiCall('POST', '/api/payments', 201, 250);

    // Track database query
    this.datadog.trackDatabaseQuery('INSERT', 'payments', 50);

    // Track external API call
    this.datadog.trackExternalApiCall('stripe', '/charges', 1200, true);

    return result;
  }

  /**
   * Example 6: Complete Request Flow with All Monitoring
   */
  async completeMonitoringExample(userId: string, postData: any) {
    // 1. Log the request
    this.logger.log(`Publishing post for user ${userId}`);
    this.logger.logWithMetadata('info', 'Post publish request received', {
      userId,
      platform: postData.platform,
      workspaceId: postData.workspaceId,
    });

    // 2. Set user context in Sentry
    this.sentry.setUser({
      id: userId,
      email: postData.userEmail,
    });

    // 3. Start tracing
    return await this.tracing.traceAsync('publish_post_flow', async (span) => {
      span.setAttributes({
        'user.id': userId,
        'post.platform': postData.platform,
        'workspace.id': postData.workspaceId,
      });

      try {
        // 4. Add breadcrumb
        this.sentry.addBreadcrumb({
          category: 'publishing',
          message: 'Starting post validation',
          level: 'info',
        });

        // 5. Validate post
        const validationStart = Date.now();
        await this.validatePost(postData);
        const validationDuration = Date.now() - validationStart;

        // 6. Log performance
        this.logger.logPerformance('post_validation', validationDuration);

        // 7. Track in DataDog
        this.datadog.trackPerformance('post_validation', validationDuration);

        // 8. Publish to platform
        const publishStart = Date.now();
        const result = await this.publishToPlatform(postData);
        const publishDuration = Date.now() - publishStart;

        // 9. Record metrics
        this.metrics.recordPostPublished(postData.platform, postData.workspaceId);
        this.metrics.recordPlatformApiCall(
          postData.platform,
          '/media/publish',
          publishDuration / 1000,
        );

        // 10. Log success
        this.logger.logBusinessEvent('post_published', {
          postId: result.postId,
          platform: postData.platform,
          workspaceId: postData.workspaceId,
          duration: publishDuration,
        });

        // 11. Capture in Sentry
        this.sentry.captureBusinessEvent('post_published', {
          postId: result.postId,
          platform: postData.platform,
        });

        // 12. Track in DataDog
        this.datadog.trackBusinessEvent('post_published', {
          postId: result.postId,
          platform: postData.platform,
        });

        return result;
      } catch (error) {
        // 13. Record error metrics
        this.metrics.recordPostFailed(
          postData.platform,
          postData.workspaceId,
          error instanceof Error ? error.name : 'UnknownError',
        );

        // 14. Log error
        this.logger.error(
          `Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );

        // 15. Capture in Sentry
        this.sentry.captureException(error as Error, {
          operation: 'publish_post',
          userId,
          platform: postData.platform,
          workspaceId: postData.workspaceId,
        });

        // 16. Track error in DataDog
        this.datadog.trackError(error as Error, {
          operation: 'publish_post',
          platform: postData.platform,
        });

        throw error;
      }
    });
  }

  /**
   * Example 7: Performance Monitoring
   */
  async performanceMonitoringExample() {
    const startTime = Date.now();

    try {
      // Perform operation
      await this.expensiveOperation();

      const duration = Date.now() - startTime;

      // Check if operation exceeded threshold
      const threshold = 1000; // 1 second
      if (duration > threshold) {
        // Log performance issue
        this.logger.warn(`Slow operation detected: ${duration}ms`);

        // Capture in Sentry
        this.sentry.capturePerformanceIssue('expensive_operation', duration, threshold);

        // Track in DataDog
        this.datadog.trackPerformance('expensive_operation', duration, {
          threshold: threshold.toString(),
          exceeded: 'true',
        });
      }

      // Always log performance
      this.logger.logPerformance('expensive_operation', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Operation failed after ${duration}ms`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  // Helper methods
  private async simulateApiCall(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private async simulateDatabaseOperation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  private async riskyOperation(): Promise<void> {
    // Simulate an operation that might fail
    if (Math.random() > 0.5) {
      throw new Error('Random failure occurred');
    }
  }

  private async validatePost(postData: any): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private async publishToPlatform(postData: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { postId: 'post_123', platformPostId: 'platform_post_456' };
  }

  private async expensiveOperation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
