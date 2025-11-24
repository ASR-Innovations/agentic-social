import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { QueueModule } from '../queue/queue.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [TerminusModule, QueueModule, MonitoringModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
