import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueMonitoringService } from './services/queue-monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Queue Management Controller
 * 
 * Provides API endpoints for queue management, monitoring, and administration.
 * Requires authentication for all operations.
 */
@Controller('api/queues')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(
    private readonly queueService: QueueService,
    private readonly monitoringService: QueueMonitoringService,
  ) {}

  /**
   * Get statistics for all queues
   */
  @Get('stats')
  async getAllQueueStats() {
    return this.queueService.getAllQueueStats();
  }

  /**
   * Get statistics for a specific queue
   */
  @Get(':queueName/stats')
  async getQueueStats(@Param('queueName') queueName: string) {
    return this.queueService.getQueueStats(queueName);
  }

  /**
   * Get overall system health
   */
  @Get('health')
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  /**
   * Get health status for a specific queue
   */
  @Get(':queueName/health')
  async getQueueHealth(@Param('queueName') queueName: string) {
    return this.monitoringService.getQueueHealthStatus(queueName);
  }

  /**
   * Get failed jobs from a queue
   */
  @Get(':queueName/failed')
  async getFailedJobs(
    @Param('queueName') queueName: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startNum = start ? parseInt(start, 10) : 0;
    const endNum = end ? parseInt(end, 10) : 100;

    const jobs = await this.queueService.getFailedJobs(queueName, startNum, endNum);

    return {
      queueName,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      })),
    };
  }

  /**
   * Get completed jobs from a queue
   */
  @Get(':queueName/completed')
  async getCompletedJobs(
    @Param('queueName') queueName: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startNum = start ? parseInt(start, 10) : 0;
    const endNum = end ? parseInt(end, 10) : 100;

    const jobs = await this.queueService.getCompletedJobs(queueName, startNum, endNum);

    return {
      queueName,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        returnvalue: job.returnvalue,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      })),
    };
  }

  /**
   * Get active jobs from a queue
   */
  @Get(':queueName/active')
  async getActiveJobs(
    @Param('queueName') queueName: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startNum = start ? parseInt(start, 10) : 0;
    const endNum = end ? parseInt(end, 10) : 100;

    const jobs = await this.queueService.getActiveJobs(queueName, startNum, endNum);

    return {
      queueName,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
      })),
    };
  }

  /**
   * Get waiting jobs from a queue
   */
  @Get(':queueName/waiting')
  async getWaitingJobs(
    @Param('queueName') queueName: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startNum = start ? parseInt(start, 10) : 0;
    const endNum = end ? parseInt(end, 10) : 100;

    const jobs = await this.queueService.getWaitingJobs(queueName, startNum, endNum);

    return {
      queueName,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        timestamp: job.timestamp,
      })),
    };
  }

  /**
   * Get delayed jobs from a queue
   */
  @Get(':queueName/delayed')
  async getDelayedJobs(
    @Param('queueName') queueName: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startNum = start ? parseInt(start, 10) : 0;
    const endNum = end ? parseInt(end, 10) : 100;

    const jobs = await this.queueService.getDelayedJobs(queueName, startNum, endNum);

    return {
      queueName,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        delay: job.opts?.delay,
        timestamp: job.timestamp,
      })),
    };
  }

  /**
   * Get a specific job by ID
   */
  @Get(':queueName/jobs/:jobId')
  async getJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.queueService.getJob(queueName, jobId);

    if (!job) {
      return {
        found: false,
        message: 'Job not found',
      };
    }

    return {
      found: true,
      job: {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
        progress: job.progress,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      },
    };
  }

  /**
   * Retry a failed job
   */
  @Post(':queueName/jobs/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    await this.queueService.retryJob(queueName, jobId);

    return {
      success: true,
      message: `Job ${jobId} queued for retry`,
    };
  }

  /**
   * Remove a job from a queue
   */
  @Delete(':queueName/jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  async removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    await this.queueService.removeJob(queueName, jobId);

    return {
      success: true,
      message: `Job ${jobId} removed`,
    };
  }

  /**
   * Pause a queue
   */
  @Post(':queueName/pause')
  @HttpCode(HttpStatus.OK)
  async pauseQueue(@Param('queueName') queueName: string) {
    await this.queueService.pauseQueue(queueName);

    return {
      success: true,
      message: `Queue "${queueName}" paused`,
    };
  }

  /**
   * Resume a paused queue
   */
  @Post(':queueName/resume')
  @HttpCode(HttpStatus.OK)
  async resumeQueue(@Param('queueName') queueName: string) {
    await this.queueService.resumeQueue(queueName);

    return {
      success: true,
      message: `Queue "${queueName}" resumed`,
    };
  }

  /**
   * Clean old jobs from a queue
   */
  @Post(':queueName/clean')
  @HttpCode(HttpStatus.OK)
  async cleanQueue(
    @Param('queueName') queueName: string,
    @Body() body: { grace?: number; limit?: number; type?: 'completed' | 'failed' },
  ) {
    const cleaned = await this.queueService.cleanQueue(
      queueName,
      body.grace,
      body.limit,
      body.type,
    );

    return {
      success: true,
      message: `Cleaned ${cleaned.length} jobs from queue "${queueName}"`,
      count: cleaned.length,
    };
  }

  /**
   * Drain a queue (remove all waiting jobs)
   */
  @Post(':queueName/drain')
  @HttpCode(HttpStatus.OK)
  async drainQueue(
    @Param('queueName') queueName: string,
    @Body() body: { delayed?: boolean },
  ) {
    await this.queueService.drainQueue(queueName, body.delayed);

    return {
      success: true,
      message: `Queue "${queueName}" drained`,
    };
  }
}
