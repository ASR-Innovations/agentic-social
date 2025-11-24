import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { QueueHealthIndicator } from '../queue/health/queue-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly health: HealthCheckService,
    private readonly queueHealth: QueueHealthIndicator,
  ) {}

  @Get()
  async check() {
    return this.healthService.check();
  }

  @Get('ready')
  async ready() {
    return this.healthService.readiness();
  }

  @Get('live')
  async live() {
    return this.healthService.liveness();
  }

  @Get('queues')
  @HealthCheck()
  async checkQueues() {
    return this.health.check([
      () => this.queueHealth.isHealthy('queues'),
    ]);
  }
}
