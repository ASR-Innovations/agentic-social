import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: promClient.Registry;
  
  // HTTP Metrics
  private readonly httpRequestDuration: promClient.Histogram;
  private readonly httpRequestTotal: promClient.Counter;
  private readonly httpRequestErrors: promClient.Counter;
  
  // Business Metrics
  private readonly postsPublished: promClient.Counter;
  private readonly postsScheduled: promClient.Counter;
  private readonly postsFailed: promClient.Counter;
  private readonly aiRequestsTotal: promClient.Counter;
  private readonly aiRequestDuration: promClient.Histogram;
  private readonly aiCostTotal: promClient.Counter;
  
  // System Metrics
  private readonly activeConnections: promClient.Gauge;
  private readonly queueSize: promClient.Gauge;
  private readonly cacheHitRate: promClient.Gauge;
  private readonly databaseConnections: promClient.Gauge;
  
  // Social Platform Metrics
  private readonly platformApiCalls: promClient.Counter;
  private readonly platformApiErrors: promClient.Counter;
  private readonly platformApiDuration: promClient.Histogram;

  constructor(private readonly configService: ConfigService) {
    this.register = new promClient.Registry();
    
    // Set default labels
    this.register.setDefaultLabels({
      app: 'ai-social-media-platform',
      environment: this.configService.get('NODE_ENV', 'development'),
    });

    // Initialize HTTP metrics
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestErrors = new promClient.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register],
    });

    // Initialize business metrics
    this.postsPublished = new promClient.Counter({
      name: 'posts_published_total',
      help: 'Total number of posts published',
      labelNames: ['platform', 'workspace_id'],
      registers: [this.register],
    });

    this.postsScheduled = new promClient.Counter({
      name: 'posts_scheduled_total',
      help: 'Total number of posts scheduled',
      labelNames: ['platform', 'workspace_id'],
      registers: [this.register],
    });

    this.postsFailed = new promClient.Counter({
      name: 'posts_failed_total',
      help: 'Total number of posts that failed to publish',
      labelNames: ['platform', 'workspace_id', 'error_type'],
      registers: [this.register],
    });

    this.aiRequestsTotal = new promClient.Counter({
      name: 'ai_requests_total',
      help: 'Total number of AI requests',
      labelNames: ['model', 'agent_type', 'workspace_id'],
      registers: [this.register],
    });

    this.aiRequestDuration = new promClient.Histogram({
      name: 'ai_request_duration_seconds',
      help: 'Duration of AI requests in seconds',
      labelNames: ['model', 'agent_type'],
      buckets: [0.5, 1, 2, 5, 10, 30],
      registers: [this.register],
    });

    this.aiCostTotal = new promClient.Counter({
      name: 'ai_cost_total_usd',
      help: 'Total AI cost in USD',
      labelNames: ['model', 'workspace_id'],
      registers: [this.register],
    });

    // Initialize system metrics
    this.activeConnections = new promClient.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type'],
      registers: [this.register],
    });

    this.queueSize = new promClient.Gauge({
      name: 'queue_size',
      help: 'Number of jobs in queue',
      labelNames: ['queue_name', 'status'],
      registers: [this.register],
    });

    this.cacheHitRate = new promClient.Gauge({
      name: 'cache_hit_rate',
      help: 'Cache hit rate percentage',
      labelNames: ['cache_name'],
      registers: [this.register],
    });

    this.databaseConnections = new promClient.Gauge({
      name: 'database_connections',
      help: 'Number of active database connections',
      labelNames: ['database'],
      registers: [this.register],
    });

    // Initialize platform metrics
    this.platformApiCalls = new promClient.Counter({
      name: 'platform_api_calls_total',
      help: 'Total number of social platform API calls',
      labelNames: ['platform', 'endpoint'],
      registers: [this.register],
    });

    this.platformApiErrors = new promClient.Counter({
      name: 'platform_api_errors_total',
      help: 'Total number of social platform API errors',
      labelNames: ['platform', 'error_type'],
      registers: [this.register],
    });

    this.platformApiDuration = new promClient.Histogram({
      name: 'platform_api_duration_seconds',
      help: 'Duration of social platform API calls in seconds',
      labelNames: ['platform', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });
  }

  async onModuleInit() {
    // Collect default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register: this.register });
  }

  // HTTP Metrics Methods
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  recordHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  // Business Metrics Methods
  recordPostPublished(platform: string, workspaceId: string) {
    this.postsPublished.inc({ platform, workspace_id: workspaceId });
  }

  recordPostScheduled(platform: string, workspaceId: string) {
    this.postsScheduled.inc({ platform, workspace_id: workspaceId });
  }

  recordPostFailed(platform: string, workspaceId: string, errorType: string) {
    this.postsFailed.inc({ platform, workspace_id: workspaceId, error_type: errorType });
  }

  recordAiRequest(model: string, agentType: string, workspaceId: string, duration: number) {
    this.aiRequestsTotal.inc({ model, agent_type: agentType, workspace_id: workspaceId });
    this.aiRequestDuration.observe({ model, agent_type: agentType }, duration);
  }

  recordAiCost(model: string, workspaceId: string, cost: number) {
    this.aiCostTotal.inc({ model, workspace_id: workspaceId }, cost);
  }

  // System Metrics Methods
  setActiveConnections(type: string, count: number) {
    this.activeConnections.set({ type }, count);
  }

  setQueueSize(queueName: string, status: string, size: number) {
    this.queueSize.set({ queue_name: queueName, status }, size);
  }

  setCacheHitRate(cacheName: string, rate: number) {
    this.cacheHitRate.set({ cache_name: cacheName }, rate);
  }

  setDatabaseConnections(database: string, count: number) {
    this.databaseConnections.set({ database }, count);
  }

  // Platform Metrics Methods
  recordPlatformApiCall(platform: string, endpoint: string, duration: number) {
    this.platformApiCalls.inc({ platform, endpoint });
    this.platformApiDuration.observe({ platform, endpoint }, duration);
  }

  recordPlatformApiError(platform: string, errorType: string) {
    this.platformApiErrors.inc({ platform, error_type: errorType });
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Get metrics as JSON
  async getMetricsJSON(): Promise<any[]> {
    return this.register.getMetricsAsJSON();
  }

  // Reset all metrics (useful for testing)
  resetMetrics() {
    this.register.resetMetrics();
  }

  // Get registry for custom metrics
  getRegistry(): promClient.Registry {
    return this.register;
  }
}
