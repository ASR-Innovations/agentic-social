import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue.service';

/**
 * Queue Monitoring Service
 * 
 * Monitors queue health, performance, and alerts on issues.
 * Provides automated cleanup and maintenance tasks.
 */
@Injectable()
export class QueueMonitoringService {
  private readonly logger = new Logger(QueueMonitoringService.name);

  // Alert thresholds
  private readonly FAILED_JOBS_THRESHOLD = 100;
  private readonly WAITING_JOBS_THRESHOLD = 10000;
  private readonly DELAYED_JOBS_THRESHOLD = 5000;
  private readonly ACTIVE_JOBS_THRESHOLD = 1000;

  constructor(private readonly queueService: QueueService) {}

  /**
   * Monitor queue health every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorQueueHealth() {
    this.logger.log('Running queue health monitoring...');

    try {
      const stats = await this.queueService.getAllQueueStats();

      for (const [queueName, queueStats] of Object.entries(stats)) {
        await this.checkQueueHealth(queueName, queueStats);
      }

      this.logger.log('Queue health monitoring completed');
    } catch (error) {
      this.logger.error('Error during queue health monitoring:', error);
    }
  }

  /**
   * Clean old completed jobs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanCompletedJobs() {
    this.logger.log('Cleaning old completed jobs...');

    const queues = [
      'post-publishing',
      'analytics-collection',
      'social-listening',
      'media-processing',
      'email-notifications',
      'webhook-delivery',
      'report-generation',
      'data-export',
      'ai-processing',
      'maintenance',
    ];

    let totalCleaned = 0;

    for (const queueName of queues) {
      try {
        const cleaned = await this.queueService.cleanQueue(
          queueName,
          86400000, // 24 hours
          1000,
          'completed',
        );
        totalCleaned += cleaned.length;
      } catch (error) {
        this.logger.error(`Error cleaning queue "${queueName}":`, error);
      }
    }

    this.logger.log(`Cleaned ${totalCleaned} completed jobs across all queues`);
  }

  /**
   * Clean old failed jobs every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours
  async cleanFailedJobs() {
    this.logger.log('Cleaning old failed jobs...');

    const queues = [
      'post-publishing',
      'analytics-collection',
      'social-listening',
      'media-processing',
      'email-notifications',
      'webhook-delivery',
      'report-generation',
      'data-export',
      'ai-processing',
      'maintenance',
    ];

    let totalCleaned = 0;

    for (const queueName of queues) {
      try {
        const cleaned = await this.queueService.cleanQueue(
          queueName,
          604800000, // 7 days
          500,
          'failed',
        );
        totalCleaned += cleaned.length;
      } catch (error) {
        this.logger.error(`Error cleaning failed jobs in queue "${queueName}":`, error);
      }
    }

    this.logger.log(`Cleaned ${totalCleaned} failed jobs across all queues`);
  }

  /**
   * Generate queue metrics report every 15 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async generateMetricsReport() {
    try {
      const stats = await this.queueService.getAllQueueStats();
      
      const report = {
        timestamp: new Date().toISOString(),
        queues: stats,
        summary: this.calculateSummary(stats),
      };

      this.logger.log(`Queue Metrics Report: ${JSON.stringify(report.summary)}`);

      // In production, you would send this to a monitoring service
      // like DataDog, Prometheus, or CloudWatch
    } catch (error) {
      this.logger.error('Error generating metrics report:', error);
    }
  }

  /**
   * Check individual queue health and alert if needed
   */
  private async checkQueueHealth(queueName: string, stats: any) {
    const alerts: string[] = [];

    // Check for too many failed jobs
    if (stats.failed > this.FAILED_JOBS_THRESHOLD) {
      alerts.push(
        `High number of failed jobs: ${stats.failed} (threshold: ${this.FAILED_JOBS_THRESHOLD})`,
      );
    }

    // Check for too many waiting jobs
    if (stats.waiting > this.WAITING_JOBS_THRESHOLD) {
      alerts.push(
        `High number of waiting jobs: ${stats.waiting} (threshold: ${this.WAITING_JOBS_THRESHOLD})`,
      );
    }

    // Check for too many delayed jobs
    if (stats.delayed > this.DELAYED_JOBS_THRESHOLD) {
      alerts.push(
        `High number of delayed jobs: ${stats.delayed} (threshold: ${this.DELAYED_JOBS_THRESHOLD})`,
      );
    }

    // Check for too many active jobs (possible worker bottleneck)
    if (stats.active > this.ACTIVE_JOBS_THRESHOLD) {
      alerts.push(
        `High number of active jobs: ${stats.active} (threshold: ${this.ACTIVE_JOBS_THRESHOLD})`,
      );
    }

    // Check if queue is paused
    if (stats.paused) {
      alerts.push('Queue is paused');
    }

    // Log alerts
    if (alerts.length > 0) {
      this.logger.warn(
        `Queue "${queueName}" health alerts:\n${alerts.join('\n')}`,
      );

      // In production, send alerts via email, SMS, Slack, etc.
      await this.sendAlert(queueName, alerts);
    }
  }

  /**
   * Calculate summary statistics across all queues
   */
  private calculateSummary(stats: Record<string, any>) {
    let totalWaiting = 0;
    let totalActive = 0;
    let totalCompleted = 0;
    let totalFailed = 0;
    let totalDelayed = 0;
    let pausedQueues = 0;

    for (const queueStats of Object.values(stats)) {
      totalWaiting += queueStats.waiting;
      totalActive += queueStats.active;
      totalCompleted += queueStats.completed;
      totalFailed += queueStats.failed;
      totalDelayed += queueStats.delayed;
      if (queueStats.paused) pausedQueues++;
    }

    return {
      totalQueues: Object.keys(stats).length,
      totalWaiting,
      totalActive,
      totalCompleted,
      totalFailed,
      totalDelayed,
      pausedQueues,
      totalPending: totalWaiting + totalActive + totalDelayed,
    };
  }

  /**
   * Send alert notification
   * In production, integrate with alerting services
   */
  private async sendAlert(queueName: string, alerts: string[]) {
    // TODO: Integrate with alerting services
    // - Email via SendGrid
    // - SMS via Twilio
    // - Slack webhook
    // - PagerDuty
    // - DataDog events
    
    this.logger.warn(
      `ALERT: Queue "${queueName}" requires attention:\n${alerts.join('\n')}`,
    );
  }

  /**
   * Get queue health status
   */
  async getQueueHealthStatus(queueName: string) {
    const stats = await this.queueService.getQueueStats(queueName);
    
    const health = {
      queueName,
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      stats,
      issues: [] as string[],
    };

    // Determine health status
    if (stats.failed > this.FAILED_JOBS_THRESHOLD) {
      health.status = 'critical';
      health.issues.push('High number of failed jobs');
    }

    if (stats.waiting > this.WAITING_JOBS_THRESHOLD) {
      health.status = health.status === 'critical' ? 'critical' : 'warning';
      health.issues.push('High number of waiting jobs');
    }

    if (stats.paused) {
      health.status = 'critical';
      health.issues.push('Queue is paused');
    }

    return health;
  }

  /**
   * Get overall system health
   */
  async getSystemHealth() {
    const stats = await this.queueService.getAllQueueStats();
    const summary = this.calculateSummary(stats);

    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      timestamp: new Date().toISOString(),
      summary,
      queues: {} as Record<string, any>,
    };

    // Check each queue
    for (const queueName of Object.keys(stats)) {
      const queueHealth = await this.getQueueHealthStatus(queueName);
      health.queues[queueName] = queueHealth;

      if (queueHealth.status === 'critical') {
        health.status = 'critical';
      } else if (queueHealth.status === 'warning' && health.status !== 'critical') {
        health.status = 'warning';
      }
    }

    return health;
  }
}
