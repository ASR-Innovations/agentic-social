import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const sentryDsn = this.configService.get('SENTRY_DSN');
    const environment = this.configService.get('NODE_ENV', 'development');
    const enableSentry = this.configService.get('ENABLE_SENTRY', 'false') === 'true';

    if (!enableSentry || !sentryDsn) {
      console.log('Sentry error tracking is disabled');
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      environment,
      release: process.env.npm_package_version || '1.0.0',
      
      // Performance Monitoring
      tracesSampleRate: parseFloat(this.configService.get('SENTRY_TRACES_SAMPLE_RATE', '0.1')),
      
      // Profiling
      profilesSampleRate: parseFloat(this.configService.get('SENTRY_PROFILES_SAMPLE_RATE', '0.1')),
      integrations: [
        nodeProfilingIntegration(),
      ],

      // Error filtering
      beforeSend(event, hint) {
        // Filter out certain errors
        const error = hint.originalException;
        
        if (error instanceof Error) {
          // Don't send validation errors
          if (error.name === 'ValidationError') {
            return null;
          }
          
          // Don't send 404 errors
          if (error.message?.includes('404')) {
            return null;
          }
        }
        
        return event;
      },

      // Breadcrumbs
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
          return null;
        }
        return breadcrumb;
      },

      // Additional options
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      normalizeDepth: 10,
    });

    console.log('Sentry error tracking initialized successfully');
  }

  // Capture exception
  captureException(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  // Capture message
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  // Set user context
  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }) {
    Sentry.setUser(user);
  }

  // Clear user context
  clearUser() {
    Sentry.setUser(null);
  }

  // Set tags
  setTags(tags: Record<string, string>) {
    Sentry.setTags(tags);
  }

  // Set tag
  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  // Set context
  setContext(name: string, context: Record<string, any>) {
    Sentry.setContext(name, context);
  }

  // Add breadcrumb
  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  // Start transaction for performance monitoring
  startTransaction(name: string, op: string): any {
    // Using Sentry.startSpan for newer API
    return Sentry.startSpan({
      name,
      op,
    }, () => {
      // Return a transaction-like object
      return {
        setStatus: (status: string) => {},
        finish: () => {},
      };
    });
  }

  // Capture business event
  captureBusinessEvent(event: string, data: Record<string, any>) {
    this.addBreadcrumb({
      category: 'business',
      message: event,
      level: 'info',
      data,
    });
  }

  // Capture security event
  captureSecurityEvent(event: string, data: Record<string, any>) {
    this.captureMessage(`Security Event: ${event}`, 'warning', data);
    this.addBreadcrumb({
      category: 'security',
      message: event,
      level: 'warning',
      data,
    });
  }

  // Capture performance issue
  capturePerformanceIssue(operation: string, duration: number, threshold: number) {
    if (duration > threshold) {
      this.captureMessage(
        `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        'warning',
        { operation, duration, threshold },
      );
    }
  }

  // Wrap async function with error handling
  async wrapAsync<T>(fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.captureException(error as Error, context);
      throw error;
    }
  }

  // Wrap sync function with error handling
  wrap<T>(fn: () => T, context?: Record<string, any>): T {
    try {
      return fn();
    } catch (error) {
      this.captureException(error as Error, context);
      throw error;
    }
  }

  // Flush events (useful before shutdown)
  async flush(timeout: number = 2000): Promise<boolean> {
    return Sentry.flush(timeout);
  }

  // Close Sentry client
  async close(timeout: number = 2000): Promise<boolean> {
    return Sentry.close(timeout);
  }
}
