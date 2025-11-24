/**
 * Queue Usage Examples
 * 
 * This file demonstrates how to use the queue system in various scenarios.
 */

import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../queue.service';
import { JobPriority, QueueName } from '../interfaces/queue.interface';

@Injectable()
export class QueueUsageExamples {
  private readonly logger = new Logger(QueueUsageExamples.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Example 1: Schedule a social media post
   */
  async schedulePost(postId: string, workspaceId: string, scheduledAt: Date) {
    const delay = scheduledAt.getTime() - Date.now();

    await this.queueService.addDelayedJob(
      QueueName.POST_PUBLISHING,
      'publish-scheduled-post',
      {
        postId,
        workspaceId,
        scheduledAt,
      },
      delay,
      {
        jobId: `post-${postId}`, // Unique ID to prevent duplicates
        priority: JobPriority.NORMAL,
      },
    );

    this.logger.log(`Scheduled post ${postId} for ${scheduledAt}`);
  }

  /**
   * Example 2: Urgent post publishing (high priority)
   */
  async publishUrgentPost(postId: string, workspaceId: string) {
    await this.queueService.addHighPriorityJob(
      QueueName.POST_PUBLISHING,
      'publish-urgent-post',
      {
        postId,
        workspaceId,
        urgent: true,
      },
      {
        jobId: `urgent-post-${postId}`,
      },
    );

    this.logger.log(`Added urgent post ${postId} to queue`);
  }

  /**
   * Example 3: Collect analytics for all accounts
   */
  async collectAnalytics(workspaceId: string, accountIds: string[]) {
    const jobs = accountIds.map((accountId) =>
      this.queueService.addJob(
        QueueName.ANALYTICS_COLLECTION,
        'collect-account-metrics',
        {
          workspaceId,
          accountId,
          timestamp: new Date(),
        },
        {
          priority: JobPriority.NORMAL,
        },
      ),
    );

    await Promise.all(jobs);

    this.logger.log(`Queued analytics collection for ${accountIds.length} accounts`);
  }

  /**
   * Example 4: Schedule daily analytics report
   */
  async scheduleDailyReport(workspaceId: string) {
    await this.queueService.addRepeatingJob(
      QueueName.REPORT_GENERATION,
      'daily-analytics-report',
      {
        workspaceId,
        reportType: 'daily-summary',
      },
      {
        pattern: '0 9 * * *', // Every day at 9 AM
      },
      {
        priority: JobPriority.LOW,
      },
    );

    this.logger.log(`Scheduled daily report for workspace ${workspaceId}`);
  }

  /**
   * Example 5: Process media upload
   */
  async processMediaUpload(
    mediaId: string,
    workspaceId: string,
    operations: string[],
  ) {
    await this.queueService.addJob(
      QueueName.MEDIA_PROCESSING,
      'process-media',
      {
        mediaId,
        workspaceId,
        operations, // ['resize', 'compress', 'optimize']
      },
      {
        priority: JobPriority.HIGH,
        attempts: 2, // Only retry once
      },
    );

    this.logger.log(`Queued media processing for ${mediaId}`);
  }

  /**
   * Example 6: Send email notification
   */
  async sendEmailNotification(
    to: string,
    subject: string,
    template: string,
    data: any,
  ) {
    await this.queueService.addJob(
      QueueName.EMAIL_NOTIFICATIONS,
      'send-email',
      {
        to,
        subject,
        template,
        data,
      },
      {
        priority: JobPriority.HIGH,
        attempts: 5, // Retry up to 5 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
      },
    );

    this.logger.log(`Queued email to ${to}`);
  }

  /**
   * Example 7: Deliver webhook
   */
  async deliverWebhook(
    url: string,
    event: string,
    payload: any,
    workspaceId: string,
  ) {
    await this.queueService.addJob(
      QueueName.WEBHOOK_DELIVERY,
      'deliver-webhook',
      {
        url,
        event,
        payload,
        workspaceId,
      },
      {
        priority: JobPriority.NORMAL,
        attempts: 10, // Aggressive retry for webhooks
        backoff: {
          type: 'exponential',
          delay: 1000, // Start with 1 second
        },
      },
    );

    this.logger.log(`Queued webhook delivery to ${url}`);
  }

  /**
   * Example 8: Export data to CSV
   */
  async exportData(
    workspaceId: string,
    exportType: string,
    filters: any,
    userId: string,
  ) {
    const job = await this.queueService.addJob(
      QueueName.DATA_EXPORT,
      'export-to-csv',
      {
        workspaceId,
        exportType,
        filters,
        userId,
      },
      {
        priority: JobPriority.LOW,
        jobId: `export-${workspaceId}-${Date.now()}`,
      },
    );

    this.logger.log(`Queued data export, job ID: ${job.id}`);

    return job.id; // Return job ID so user can track progress
  }

  /**
   * Example 9: AI content generation
   */
  async generateAIContent(
    workspaceId: string,
    prompt: string,
    options: any,
  ) {
    await this.queueService.addJob(
      QueueName.AI_PROCESSING,
      'generate-content',
      {
        workspaceId,
        prompt,
        options,
      },
      {
        priority: JobPriority.HIGH,
        attempts: 3,
      },
    );

    this.logger.log(`Queued AI content generation for workspace ${workspaceId}`);
  }

  /**
   * Example 10: Background maintenance task
   */
  async scheduleMaintenanceTask(taskName: string, data: any) {
    await this.queueService.addLowPriorityJob(
      QueueName.MAINTENANCE,
      taskName,
      data,
    );

    this.logger.log(`Queued maintenance task: ${taskName}`);
  }

  /**
   * Example 11: Monitor queue health
   */
  async monitorQueueHealth() {
    const stats = await this.queueService.getAllQueueStats();

    for (const [queueName, queueStats] of Object.entries(stats)) {
      if (queueStats.failed > 100) {
        this.logger.warn(
          `Queue "${queueName}" has ${queueStats.failed} failed jobs`,
        );
      }

      if (queueStats.waiting > 10000) {
        this.logger.warn(
          `Queue "${queueName}" has ${queueStats.waiting} waiting jobs`,
        );
      }
    }
  }

  /**
   * Example 12: Retry failed jobs
   */
  async retryFailedJobs(queueName: string) {
    const failedJobs = await this.queueService.getFailedJobs(queueName, 0, 100);

    for (const job of failedJobs) {
      try {
        await this.queueService.retryJob(queueName, job.id!);
        this.logger.log(`Retrying job ${job.id}`);
      } catch (error) {
        this.logger.error(`Failed to retry job ${job.id}:`, error);
      }
    }

    this.logger.log(`Retried ${failedJobs.length} failed jobs in ${queueName}`);
  }

  /**
   * Example 13: Clean old jobs
   */
  async cleanOldJobs() {
    const queues = [
      QueueName.POST_PUBLISHING,
      QueueName.ANALYTICS_COLLECTION,
      QueueName.EMAIL_NOTIFICATIONS,
    ];

    for (const queueName of queues) {
      const cleaned = await this.queueService.cleanQueue(
        queueName,
        86400000, // 24 hours
        1000,
        'completed',
      );

      this.logger.log(`Cleaned ${cleaned.length} jobs from ${queueName}`);
    }
  }

  /**
   * Example 14: Pause and resume queue
   */
  async pauseQueueForMaintenance(queueName: string) {
    await this.queueService.pauseQueue(queueName);
    this.logger.log(`Paused queue ${queueName} for maintenance`);

    // Perform maintenance...
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await this.queueService.resumeQueue(queueName);
    this.logger.log(`Resumed queue ${queueName}`);
  }

  /**
   * Example 15: Batch job processing
   */
  async processBatchJobs(items: any[], workspaceId: string) {
    const jobs = items.map((item, index) =>
      this.queueService.addJob(
        QueueName.POST_PUBLISHING,
        'batch-publish',
        {
          workspaceId,
          item,
          batchIndex: index,
          batchTotal: items.length,
        },
        {
          priority: JobPriority.NORMAL,
          jobId: `batch-${workspaceId}-${index}`,
        },
      ),
    );

    await Promise.all(jobs);

    this.logger.log(`Queued ${items.length} batch jobs for workspace ${workspaceId}`);
  }
}
