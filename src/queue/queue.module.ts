import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueMonitoringService } from './services/queue-monitoring.service';
import { QueueHealthIndicator } from './health/queue-health.indicator';

/**
 * Global Queue Module
 * 
 * Provides centralized queue management for background job processing
 * across the entire application. Supports multiple queues with different
 * priorities, retry strategies, and monitoring capabilities.
 */
@Global()
@Module({
  imports: [
    // Register all application queues
    BullModule.registerQueue(
      // Post publishing queue (existing)
      {
        name: 'post-publishing',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
          removeOnComplete: {
            age: 86400, // 24 hours
            count: 1000,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // Analytics collection queue
      {
        name: 'analytics-collection',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000, // Start with 10 seconds
          },
          removeOnComplete: {
            age: 43200, // 12 hours
            count: 5000,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // Social listening queue
      {
        name: 'social-listening',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: {
            age: 21600, // 6 hours
            count: 10000,
          },
          removeOnFail: {
            age: 259200, // 3 days
          },
        },
      },
      // Media processing queue
      {
        name: 'media-processing',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 30000, // 30 seconds
          },
          removeOnComplete: {
            age: 86400, // 24 hours
            count: 500,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // Email notifications queue
      {
        name: 'email-notifications',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 seconds
          },
          removeOnComplete: {
            age: 43200, // 12 hours
            count: 2000,
          },
          removeOnFail: {
            age: 259200, // 3 days
          },
        },
      },
      // Webhook delivery queue
      {
        name: 'webhook-delivery',
        defaultJobOptions: {
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 1000, // Start with 1 second
          },
          removeOnComplete: {
            age: 86400, // 24 hours
            count: 1000,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // Report generation queue
      {
        name: 'report-generation',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 60000, // 1 minute
          },
          removeOnComplete: {
            age: 172800, // 48 hours
            count: 100,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // Data export queue
      {
        name: 'data-export',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 30000, // 30 seconds
          },
          removeOnComplete: {
            age: 172800, // 48 hours
            count: 50,
          },
          removeOnFail: {
            age: 604800, // 7 days
          },
        },
      },
      // AI processing queue (high priority)
      {
        name: 'ai-processing',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000, // Start with 3 seconds
          },
          removeOnComplete: {
            age: 86400, // 24 hours
            count: 2000,
          },
          removeOnFail: {
            age: 259200, // 3 days
          },
        },
      },
      // Cleanup and maintenance queue (low priority)
      {
        name: 'maintenance',
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: {
            age: 86400, // 24 hours
            count: 100,
          },
          removeOnFail: {
            age: 259200, // 3 days
          },
        },
      },
    ),
  ],
  controllers: [QueueController],
  providers: [
    QueueService,
    QueueMonitoringService,
    QueueHealthIndicator,
  ],
  exports: [
    QueueService,
    QueueMonitoringService,
    BullModule,
  ],
})
export class QueueModule {}
