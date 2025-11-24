import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { QueueService } from '../queue.service';

/**
 * Queue Health Indicator
 * 
 * Provides health check integration for queue monitoring.
 * Used by the health check endpoint to report queue status.
 */
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(private readonly queueService: QueueService) {
    super();
  }

  /**
   * Check health of all queues
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const stats = await this.queueService.getAllQueueStats();
      
      // Calculate overall health
      let totalFailed = 0;
      let totalWaiting = 0;
      let pausedQueues = 0;

      for (const queueStats of Object.values(stats)) {
        totalFailed += queueStats.failed;
        totalWaiting += queueStats.waiting;
        if (queueStats.paused) pausedQueues++;
      }

      // Determine if healthy
      const isHealthy = totalFailed < 1000 && pausedQueues === 0;

      const result = this.getStatus(key, isHealthy, {
        totalQueues: Object.keys(stats).length,
        totalFailed,
        totalWaiting,
        pausedQueues,
        stats,
      });

      if (!isHealthy) {
        throw new HealthCheckError('Queue health check failed', result);
      }

      return result;
    } catch (error) {
      throw new HealthCheckError('Queue health check failed', error);
    }
  }

  /**
   * Check health of a specific queue
   */
  async checkQueue(queueName: string): Promise<HealthIndicatorResult> {
    try {
      const stats = await this.queueService.getQueueStats(queueName);
      
      const isHealthy = stats.failed < 100 && !stats.paused;

      const result = this.getStatus(queueName, isHealthy, stats);

      if (!isHealthy) {
        throw new HealthCheckError(`Queue "${queueName}" health check failed`, result);
      }

      return result;
    } catch (error) {
      throw new HealthCheckError(`Queue "${queueName}" health check failed`, error);
    }
  }
}
