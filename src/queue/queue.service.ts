import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobsOptions } from 'bullmq';

/**
 * Queue Service
 * 
 * Centralized service for managing background jobs across all queues.
 * Provides a unified interface for adding jobs, managing priorities,
 * and implementing retry strategies.
 */
@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('post-publishing') private readonly postPublishingQueue: Queue,
    @InjectQueue('analytics-collection') private readonly analyticsQueue: Queue,
    @InjectQueue('social-listening') private readonly listeningQueue: Queue,
    @InjectQueue('media-processing') private readonly mediaQueue: Queue,
    @InjectQueue('email-notifications') private readonly emailQueue: Queue,
    @InjectQueue('webhook-delivery') private readonly webhookQueue: Queue,
    @InjectQueue('report-generation') private readonly reportQueue: Queue,
    @InjectQueue('data-export') private readonly exportQueue: Queue,
    @InjectQueue('ai-processing') private readonly aiQueue: Queue,
    @InjectQueue('maintenance') private readonly maintenanceQueue: Queue,
  ) {}

  async onModuleInit() {
    this.logger.log('Queue Service initialized with 10 queues');
    
    // Log queue configurations
    const queues = this.getAllQueues();
    for (const [name, queue] of Object.entries(queues)) {
      const counts = await this.getQueueCounts(queue);
      this.logger.log(`Queue "${name}": ${JSON.stringify(counts)}`);
    }
  }

  /**
   * Get all registered queues
   */
  private getAllQueues(): Record<string, Queue> {
    return {
      'post-publishing': this.postPublishingQueue,
      'analytics-collection': this.analyticsQueue,
      'social-listening': this.listeningQueue,
      'media-processing': this.mediaQueue,
      'email-notifications': this.emailQueue,
      'webhook-delivery': this.webhookQueue,
      'report-generation': this.reportQueue,
      'data-export': this.exportQueue,
      'ai-processing': this.aiQueue,
      'maintenance': this.maintenanceQueue,
    };
  }

  /**
   * Add a job to a specific queue with priority support
   */
  async addJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    const job = await queue.add(jobName, data, options);
    
    this.logger.log(
      `Added job "${jobName}" to queue "${queueName}" with ID: ${job.id}`,
    );

    return job;
  }

  /**
   * Add a high-priority job (processed before normal jobs)
   */
  async addHighPriorityJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<Job<T>> {
    return this.addJob(queueName, jobName, data, {
      ...options,
      priority: 1, // Lower number = higher priority
    });
  }

  /**
   * Add a low-priority job (processed after normal jobs)
   */
  async addLowPriorityJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<Job<T>> {
    return this.addJob(queueName, jobName, data, {
      ...options,
      priority: 10, // Higher number = lower priority
    });
  }

  /**
   * Add a delayed job (processed after specified delay)
   */
  async addDelayedJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    delayMs: number,
    options?: JobsOptions,
  ): Promise<Job<T>> {
    return this.addJob(queueName, jobName, data, {
      ...options,
      delay: delayMs,
    });
  }

  /**
   * Add a repeating job (cron-like scheduling)
   */
  async addRepeatingJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    repeatOptions: {
      pattern?: string; // Cron pattern
      every?: number; // Interval in milliseconds
      limit?: number; // Max number of repetitions
    },
    options?: JobsOptions,
  ): Promise<Job<T>> {
    return this.addJob(queueName, jobName, data, {
      ...options,
      repeat: repeatOptions,
    });
  }

  /**
   * Get a job by ID from a specific queue
   */
  async getJob(queueName: string, jobId: string): Promise<Job | undefined> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getJob(jobId);
  }

  /**
   * Remove a job from a queue
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    
    if (job) {
      await job.remove();
      this.logger.log(`Removed job ${jobId} from queue "${queueName}"`);
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    
    if (job) {
      await job.retry();
      this.logger.log(`Retrying job ${jobId} in queue "${queueName}"`);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string) {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return this.getQueueCounts(queue);
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats() {
    const queues = this.getAllQueues();
    const stats: Record<string, any> = {};

    for (const [name, queue] of Object.entries(queues)) {
      stats[name] = await this.getQueueCounts(queue);
    }

    return stats;
  }

  /**
   * Pause a queue (stop processing jobs)
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    await queue.pause();
    this.logger.log(`Paused queue "${queueName}"`);
  }

  /**
   * Resume a paused queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    await queue.resume();
    this.logger.log(`Resumed queue "${queueName}"`);
  }

  /**
   * Clean old jobs from a queue
   */
  async cleanQueue(
    queueName: string,
    grace: number = 86400000, // 24 hours in ms
    limit: number = 1000,
    type: 'completed' | 'failed' = 'completed',
  ): Promise<string[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    const jobs = await queue.clean(grace, limit, type);
    this.logger.log(
      `Cleaned ${jobs.length} ${type} jobs from queue "${queueName}"`,
    );

    return jobs;
  }

  /**
   * Drain a queue (remove all waiting jobs)
   */
  async drainQueue(queueName: string, delayed: boolean = false): Promise<void> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    await queue.drain(delayed);
    this.logger.log(`Drained queue "${queueName}"`);
  }

  /**
   * Get failed jobs from a queue
   */
  async getFailedJobs(
    queueName: string,
    start: number = 0,
    end: number = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getFailed(start, end);
  }

  /**
   * Get completed jobs from a queue
   */
  async getCompletedJobs(
    queueName: string,
    start: number = 0,
    end: number = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getCompleted(start, end);
  }

  /**
   * Get active jobs from a queue
   */
  async getActiveJobs(
    queueName: string,
    start: number = 0,
    end: number = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getActive(start, end);
  }

  /**
   * Get waiting jobs from a queue
   */
  async getWaitingJobs(
    queueName: string,
    start: number = 0,
    end: number = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getWaiting(start, end);
  }

  /**
   * Get delayed jobs from a queue
   */
  async getDelayedJobs(
    queueName: string,
    start: number = 0,
    end: number = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    if (!queue) {
      throw new Error(`Queue "${queueName}" not found`);
    }

    return queue.getDelayed(start, end);
  }

  /**
   * Helper method to get queue by name
   */
  private getQueue(queueName: string): Queue | undefined {
    const queues = this.getAllQueues();
    return queues[queueName];
  }

  /**
   * Helper method to get queue counts
   */
  private async getQueueCounts(queue: Queue) {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      total: waiting + active + delayed,
    };
  }
}
