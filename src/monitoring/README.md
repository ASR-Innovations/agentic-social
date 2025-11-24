# Monitoring and Observability

This module provides comprehensive monitoring and observability for the AI Social Media Platform, implementing structured logging, metrics collection, distributed tracing, error tracking, and performance monitoring.

## Features

### 1. Structured Logging (Winston)
- **Service**: `LoggerService`
- **Features**:
  - Structured JSON logging
  - Log levels: error, warn, info, debug, verbose
  - Daily log rotation
  - Separate error logs
  - Request/response logging
  - Business event logging
  - Performance logging
  - Security event logging

**Usage**:
```typescript
import { LoggerService } from './monitoring/logger/logger.service';

constructor(private readonly logger: LoggerService) {
  this.logger.setContext('MyService');
}

// Basic logging
this.logger.log('User logged in');
this.logger.error('Failed to process payment', error.stack);
this.logger.warn('High memory usage detected');

// Structured logging
this.logger.logWithMetadata('info', 'Payment processed', {
  userId: '123',
  amount: 99.99,
  currency: 'USD',
});

// Business events
this.logger.logBusinessEvent('post_published', {
  postId: 'abc123',
  platform: 'instagram',
  workspaceId: 'workspace-1',
});

// Performance tracking
this.logger.logPerformance('database_query', 150, {
  query: 'SELECT * FROM posts',
});
```

### 2. Prometheus Metrics
- **Service**: `MetricsService`
- **Features**:
  - HTTP request metrics (duration, count, errors)
  - Business metrics (posts published, AI requests, costs)
  - System metrics (connections, queue size, cache hit rate)
  - Platform API metrics
  - Custom metrics support

**Metrics Exposed**:
- `http_request_duration_seconds` - HTTP request duration histogram
- `http_requests_total` - Total HTTP requests counter
- `http_request_errors_total` - HTTP errors counter
- `posts_published_total` - Posts published counter
- `ai_requests_total` - AI requests counter
- `ai_cost_total_usd` - AI costs counter
- `platform_api_calls_total` - Platform API calls counter
- And many more...

**Usage**:
```typescript
import { MetricsService } from './monitoring/metrics/metrics.service';

constructor(private readonly metrics: MetricsService) {}

// Record HTTP request
this.metrics.recordHttpRequest('GET', '/api/posts', 200, 0.150);

// Record business metrics
this.metrics.recordPostPublished('instagram', 'workspace-1');
this.metrics.recordAiRequest('gpt-4o', 'content_creator', 'workspace-1', 2.5);
this.metrics.recordAiCost('gpt-4o', 'workspace-1', 0.05);

// Record platform API calls
this.metrics.recordPlatformApiCall('instagram', '/media/publish', 1.2);
```

**Accessing Metrics**:
- Prometheus format: `GET /monitoring/metrics`
- JSON format: `GET /monitoring/metrics/json`

### 3. OpenTelemetry Distributed Tracing
- **Service**: `TracingService`
- **Features**:
  - Automatic instrumentation for HTTP, database, Redis, MongoDB
  - Custom span creation
  - Trace context propagation
  - Jaeger exporter
  - Prometheus metrics exporter

**Usage**:
```typescript
import { TracingService } from './monitoring/tracing/tracing.service';

constructor(private readonly tracing: TracingService) {}

// Trace async function
await this.tracing.traceAsync('process_payment', async (span) => {
  span.setAttributes({
    'user.id': userId,
    'payment.amount': amount,
  });
  
  const result = await this.processPayment(userId, amount);
  
  span.addEvent('payment_processed', {
    'transaction.id': result.transactionId,
  });
  
  return result;
});

// Trace sync function
const result = this.tracing.trace('calculate_total', (span) => {
  span.setAttributes({ 'items.count': items.length });
  return this.calculateTotal(items);
});
```

**Viewing Traces**:
- Jaeger UI: `http://localhost:16686`
- Configure endpoint: `JAEGER_ENDPOINT` environment variable

### 4. Sentry Error Tracking
- **Service**: `SentryService`
- **Features**:
  - Automatic error capture
  - Performance monitoring
  - Profiling
  - User context tracking
  - Breadcrumbs
  - Custom tags and context

**Usage**:
```typescript
import { SentryService } from './monitoring/sentry/sentry.service';

constructor(private readonly sentry: SentryService) {}

// Capture exception
try {
  await this.riskyOperation();
} catch (error) {
  this.sentry.captureException(error, {
    operation: 'riskyOperation',
    userId: user.id,
  });
  throw error;
}

// Capture message
this.sentry.captureMessage('Unusual activity detected', 'warning', {
  userId: user.id,
  activityType: 'multiple_failed_logins',
});

// Set user context
this.sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Add breadcrumb
this.sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: { userId: user.id },
});

// Track performance
const transaction = this.sentry.startTransaction('checkout', 'http.server');
// ... perform operations
transaction.finish();
```

**Configuration**:
```env
ENABLE_SENTRY=true
SENTRY_DSN=your-sentry-dsn
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### 5. DataDog Monitoring
- **Service**: `DatadogService`
- **Features**:
  - APM (Application Performance Monitoring)
  - Runtime metrics
  - Profiling
  - Custom metrics
  - Distributed tracing

**Usage**:
```typescript
import { DatadogService } from './monitoring/datadog/datadog.service';

constructor(private readonly datadog: DatadogService) {}

// Trace async operation
await this.datadog.traceAsync('process_order', async () => {
  return this.processOrder(orderId);
});

// Set tags
this.datadog.setTags({
  'user.id': userId,
  'workspace.id': workspaceId,
});

// Track business event
this.datadog.trackBusinessEvent('post_published', {
  platform: 'instagram',
  postId: postId,
});

// Track API call
this.datadog.trackApiCall('POST', '/api/posts', 201, 250);

// Track database query
this.datadog.trackDatabaseQuery('INSERT', 'posts', 50);

// Track external API
this.datadog.trackExternalApiCall('instagram', '/media/publish', 1200, true);
```

**Configuration**:
```env
ENABLE_DATADOG=true
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SAMPLE_RATE=1.0
```

## Automatic Instrumentation

The monitoring module provides interceptors for automatic instrumentation:

### LoggingInterceptor
Automatically logs all HTTP requests and responses.

### MetricsInterceptor
Automatically records HTTP metrics for all requests.

### TracingInterceptor
Automatically creates spans for all HTTP requests.

### SentryInterceptor
Automatically captures errors and creates transactions for all requests.

## Health Checks

Enhanced health check endpoints:

- `GET /health` - Comprehensive health check (database, Redis, MongoDB, disk, memory)
- `GET /health/ready` - Readiness probe (for Kubernetes)
- `GET /health/live` - Liveness probe (for Kubernetes)
- `GET /health/queues` - Queue health check

## Configuration

### Environment Variables

```env
# Logging
LOG_LEVEL=info

# Prometheus Metrics
PROMETHEUS_PORT=9464

# OpenTelemetry Tracing
ENABLE_TRACING=true
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Sentry Error Tracking
ENABLE_SENTRY=false
SENTRY_DSN=your-sentry-dsn
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# DataDog Monitoring
ENABLE_DATADOG=false
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SAMPLE_RATE=1.0
```

## Deployment

### Docker Compose (Development)

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
      - "14268:14268"  # Jaeger collector
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
```

### Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-social-platform'
    static_configs:
      - targets: ['localhost:9464']
```

### Kubernetes

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-social-platform-metrics
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9464"
    prometheus.io/path: "/monitoring/metrics"
spec:
  selector:
    app: ai-social-platform
  ports:
    - name: metrics
      port: 9464
      targetPort: 9464
```

## Best Practices

1. **Use Structured Logging**: Always include context and metadata in logs
2. **Track Business Metrics**: Monitor key business events (posts published, AI costs, etc.)
3. **Set Appropriate Sample Rates**: Don't trace/profile 100% in production
4. **Use Tags Consistently**: Use consistent tag names across all monitoring tools
5. **Monitor Performance**: Track slow operations and set up alerts
6. **Capture User Context**: Always set user context for better debugging
7. **Add Breadcrumbs**: Add breadcrumbs for important operations
8. **Monitor External APIs**: Track all external API calls and their performance
9. **Set Up Alerts**: Configure alerts for critical errors and performance issues
10. **Review Metrics Regularly**: Regularly review metrics and optimize based on insights

## Troubleshooting

### Logs Not Appearing
- Check `LOG_LEVEL` environment variable
- Ensure logs directory has write permissions
- Check console output in development mode

### Metrics Not Scraped
- Verify Prometheus can reach the metrics endpoint
- Check `PROMETHEUS_PORT` configuration
- Ensure metrics endpoint is not behind authentication

### Traces Not Appearing in Jaeger
- Verify `ENABLE_TRACING=true`
- Check Jaeger endpoint configuration
- Ensure Jaeger is running and accessible

### Sentry Not Capturing Errors
- Verify `ENABLE_SENTRY=true`
- Check `SENTRY_DSN` is correct
- Ensure errors are not filtered by `beforeSend`

### DataDog Not Showing Data
- Verify `ENABLE_DATADOG=true`
- Check `DATADOG_API_KEY` is correct
- Ensure DataDog agent is running

## Performance Impact

The monitoring system is designed to have minimal performance impact:

- **Logging**: < 1ms overhead per request
- **Metrics**: < 0.5ms overhead per request
- **Tracing**: < 2ms overhead per request (with sampling)
- **Sentry**: < 1ms overhead per request (with sampling)
- **DataDog**: < 2ms overhead per request (with sampling)

Total overhead: ~5-10ms per request with all monitoring enabled.

## License

This monitoring module is part of the AI Social Media Platform and follows the same license.
