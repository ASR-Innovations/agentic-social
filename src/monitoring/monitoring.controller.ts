import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics/metrics.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  @Get('metrics/json')
  async getMetricsJson() {
    return this.metricsService.getMetricsJSON();
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };
  }
}
