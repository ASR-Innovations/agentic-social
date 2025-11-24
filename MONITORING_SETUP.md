# Monitoring and Observability Setup Guide

This guide will help you set up comprehensive monitoring and observability for the AI Social Media Platform.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Components](#components)
4. [Configuration](#configuration)
5. [Accessing Dashboards](#accessing-dashboards)
6. [Alert Configuration](#alert-configuration)
7. [Production Setup](#production-setup)
8. [Troubleshooting](#troubleshooting)

## Overview

The monitoring stack includes:

- **Winston**: Structured logging with daily rotation
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Jaeger**: Distributed tracing
- **Loki**: Log aggregation
- **Sentry**: Error tracking and performance monitoring
- **DataDog**: APM and infrastructure monitoring
- **AlertManager**: Alert routing and management

## Quick Start

### 1. Start Monitoring Infrastructure

```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify all services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Configure Environment Variables

Update your `.env` file with monitoring configuration:

```env
# Logging
LOG_LEVEL=info

# Prometheus Metrics
PROMETHEUS_PORT=9464

# OpenTelemetry Tracing
ENABLE_TRACING=true
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Sentry Error Tracking (optional)
ENABLE_SENTRY=false
SENTRY_DSN=your-sentry-dsn
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# DataDog Monitoring (optional)
ENABLE_DATADOG=false
DATADOG_API_KEY=your-datadog-api-key
DATADOG_SAMPLE_RATE=1.0
```

### 3. Start the Application

```bash
npm run start:dev
```

### 4. Access Monitoring Dashboards

- **Grafana**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **AlertManager**: http://localhost:9093

## Components

### Winston Logger

Structured logging with multiple transports:

```typescript
import { LoggerService } from './monitoring/logger/logger.service';

constructor(private readonly logger: LoggerService) {
  this.logger.setContext('MyService');
}

// Basic logging
this.logger.log('User logged in');
this.logger.error('Failed to process payment', error.stack);

// Structured logging
this.logger.logWithMetadata('info', 'Payment processed', {
  userId: '123',
  amount: 99.99,
});

// Business events
this.logger.logBusinessEvent('post_published', {
  postId: 'abc123',
  platform: 'instagram',
});
```

**Log Files Location**: `./logs/`
- `application-YYYY-MM-DD.log` - Application logs
- `error-YYYY-MM-DD.log` - Error logs only
- `combined-YYYY-MM-DD.log` - All logs

### Prometheus Metrics

Automatic and custom metrics collection:

```typescript
import { MetricsService } from './monitoring/metrics/metrics.service';

// HTTP metrics (automatic via interceptor)
this.metrics.recordHttpRequest('POST', '/api/posts', 201, 0.250);

// Business metrics
this.metrics.recordPostPublished('instagram', 'workspace-1');
this.metrics.recordAiRequest('gpt-4o', 'content_creator', 'workspace-1', 2.5);
this.metrics.recordAiCost('gpt-4o', 'workspace-1', 0.05);

// Platform metrics
this.metrics.recordPlatformApiCall('instagram', '/media/publish', 1.2);
```

**Metrics Endpoint**: http://localhost:9464/monitoring/metrics

**Available Metrics**:
- `http_request_duration_seconds` - HTTP request duration
- `http_requests_total` - Total HTTP requests
- `posts_published_total` - Posts published
- `ai_requests_total` - AI requests
- `ai_cost_total_usd` - AI costs
- `platform_api_calls_total` - Platform API calls
- And many more...

### Jaeger Tracing

Distributed tracing for request flows:

```typescript
import { TracingService } from './monitoring/tracing/tracing.service';

// Trace async operation
const result = await this.tracing.traceAsync('publish_post', async (span) => {
  span.setAttributes({
    'post.id': 'post_123',
    'post.platform': 'instagram',
  });
  
  // Your operation here
  
  span.addEvent('post_validated');
  
  return result;
});
```

**Jaeger UI**: http://localhost:16686

### Sentry Error Tracking

Automatic error capture and performance monitoring:

```typescript
import { SentryService } from './monitoring/sentry/sentry.service';

try {
  await this.riskyOperation();
} catch (error) {
  this.sentry.captureException(error, {
    operation: 'riskyOperation',
    userId: user.id,
  });
  throw error;
}

// Set user context
this.sentry.setUser({
  id: user.id,
  email: user.email,
});

// Add breadcrumbs
this.sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

**Setup**:
1. Create account at https://sentry.io
2. Get your DSN
3. Set `ENABLE_SENTRY=true` and `SENTRY_DSN=your-dsn`

### DataDog APM

Application performance monitoring:

```typescript
import { DatadogService } from './monitoring/datadog/datadog.service';

// Trace operation
await this.datadog.traceAsync('process_payment', async () => {
  return this.processPayment();
});

// Track metrics
this.datadog.trackApiCall('POST', '/api/posts', 201, 250);
this.datadog.trackDatabaseQuery('INSERT', 'posts', 50);
this.datadog.trackExternalApiCall('instagram', '/media/publish', 1200, true);
```

**Setup**:
1. Create account at https://datadoghq.com
2. Get your API key
3. Set `ENABLE_DATADOG=true` and `DATADOG_API_KEY=your-key`

## Configuration

### Prometheus Configuration

Edit `monitoring/prometheus.yml` to add scrape targets:

```yaml
scrape_configs:
  - job_name: 'ai-social-platform'
    static_configs:
      - targets: ['host.docker.internal:9464']
    metrics_path: '/monitoring/metrics'
```

### Alert Rules

Edit `monitoring/alerts/application.yml` to configure alerts:

```yaml
groups:
  - name: application_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          (sum(rate(http_request_errors_total[5m])) / sum(rate(http_requests_total[5m]))) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
```

### AlertManager Configuration

Edit `monitoring/alertmanager.yml` to configure notification channels:

```yaml
receivers:
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@example.com'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#critical-alerts'
```

## Accessing Dashboards

### Grafana

1. Open http://localhost:3002
2. Login with `admin/admin`
3. Navigate to Dashboards
4. Import pre-built dashboards or create custom ones

**Recommended Dashboards**:
- Application Overview
- HTTP Metrics
- Business Metrics (Posts, AI Usage)
- Platform API Performance
- System Resources

### Prometheus

1. Open http://localhost:9090
2. Use PromQL to query metrics
3. Create graphs and alerts

**Example Queries**:
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_request_errors_total[5m]) / rate(http_requests_total[5m])

# AI cost per hour
sum(rate(ai_cost_total_usd[1h])) by (workspace_id)

# Post publish success rate
sum(rate(posts_published_total[5m])) / (sum(rate(posts_published_total[5m])) + sum(rate(posts_failed_total[5m])))
```

### Jaeger

1. Open http://localhost:16686
2. Select service: `ai-social-media-platform`
3. Search for traces
4. Analyze request flows and performance

## Alert Configuration

### Email Alerts

Configure SMTP in `monitoring/alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'your-app-password'
```

### Slack Alerts

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Add to `monitoring/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#critical-alerts'
        title: '[CRITICAL] {{ .GroupLabels.alertname }}'
```

### PagerDuty Alerts

1. Get PagerDuty service key
2. Add to `monitoring/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-alerts'
    pagerduty_configs:
      - service_key: 'your-pagerduty-service-key'
```

## Production Setup

### 1. External Monitoring Services

For production, consider using managed services:

**Sentry** (Error Tracking):
- Sign up at https://sentry.io
- Create project
- Set `SENTRY_DSN` in production environment

**DataDog** (APM):
- Sign up at https://datadoghq.com
- Install DataDog agent
- Set `DATADOG_API_KEY` in production environment

### 2. Log Retention

Configure log retention in production:

```typescript
// In logger.service.ts
new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d', // Keep logs for 30 days
})
```

### 3. Metrics Retention

Configure Prometheus retention:

```yaml
# In prometheus.yml
command:
  - '--storage.tsdb.retention.time=30d'
  - '--storage.tsdb.retention.size=50GB'
```

### 4. Sampling Rates

Adjust sampling rates for production:

```env
# Reduce sampling to save costs
SENTRY_TRACES_SAMPLE_RATE=0.01  # 1% of transactions
SENTRY_PROFILES_SAMPLE_RATE=0.01  # 1% of profiles
DATADOG_SAMPLE_RATE=0.1  # 10% of traces
```

### 5. Security

- Use HTTPS for all monitoring endpoints
- Implement authentication for Grafana, Prometheus, Jaeger
- Restrict access to monitoring infrastructure
- Rotate API keys regularly
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)

## Troubleshooting

### Logs Not Appearing

**Problem**: Logs are not being written to files

**Solution**:
1. Check logs directory exists and has write permissions
2. Verify `LOG_LEVEL` is set correctly
3. Check console output for errors
4. Ensure Winston is initialized properly

### Metrics Not Scraped

**Problem**: Prometheus not scraping metrics

**Solution**:
1. Verify application is running on correct port
2. Check metrics endpoint: http://localhost:9464/monitoring/metrics
3. Verify Prometheus can reach the application
4. Check Prometheus targets: http://localhost:9090/targets
5. Review Prometheus logs: `docker logs ai-social-prometheus`

### Traces Not Appearing

**Problem**: Traces not showing in Jaeger

**Solution**:
1. Verify `ENABLE_TRACING=true`
2. Check Jaeger endpoint configuration
3. Ensure Jaeger is running: `docker ps | grep jaeger`
4. Check application logs for tracing errors
5. Verify network connectivity to Jaeger

### Sentry Not Capturing Errors

**Problem**: Errors not appearing in Sentry

**Solution**:
1. Verify `ENABLE_SENTRY=true`
2. Check `SENTRY_DSN` is correct
3. Ensure errors are not filtered by `beforeSend`
4. Check Sentry project settings
5. Review application logs for Sentry initialization

### High Memory Usage

**Problem**: Monitoring causing high memory usage

**Solution**:
1. Reduce log retention period
2. Decrease metrics cardinality
3. Adjust sampling rates
4. Increase log rotation frequency
5. Monitor with `docker stats`

### Alerts Not Firing

**Problem**: Alerts configured but not firing

**Solution**:
1. Check alert rules syntax in Prometheus
2. Verify AlertManager is running
3. Check AlertManager configuration
4. Test alert rules in Prometheus UI
5. Review AlertManager logs

## Best Practices

1. **Use Structured Logging**: Always include context and metadata
2. **Monitor Business Metrics**: Track posts published, AI costs, etc.
3. **Set Appropriate Sample Rates**: Balance cost vs. visibility
4. **Create Meaningful Alerts**: Alert on symptoms, not causes
5. **Use Tags Consistently**: Use same tag names across all tools
6. **Monitor Performance**: Track slow operations and set up alerts
7. **Capture User Context**: Always set user context for better debugging
8. **Add Breadcrumbs**: Add breadcrumbs for important operations
9. **Monitor External APIs**: Track all external API calls
10. **Review Metrics Regularly**: Regularly review and optimize

## Support

For issues or questions:
- Check documentation: `src/monitoring/README.md`
- Review examples: `src/monitoring/examples/`
- Check integration tests: `src/monitoring/monitoring.integration.spec.ts`

## License

This monitoring setup is part of the AI Social Media Platform and follows the same license.
