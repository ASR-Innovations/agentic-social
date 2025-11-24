# Queue Module

Comprehensive background job processing system using BullMQ with Redis. Provides reliable, scalable job queue management with retry logic, priority support, and monitoring capabilities.

## Features

- **Multiple Queues**: 10 specialized queues for different job types
- **Priority System**: Critical, High, Normal, Low, and Background priorities
- **Retry Logic**: Exponential backoff with configurable attempts
- **Job Monitoring**: Real-time statistics and health checks
- **Automated Cleanup**: Scheduled cleanup of old jobs
- **Health Indicators**: Integration with NestJS health checks
- **Admin API**: RESTful API for queue management

## Available Queues

### 1. Post Publishing Queue
- **Name**: `post-publishing`
- **Purpose**: Schedule and publish social media posts
- **Retry**: 3 attempts with exponential backoff (5s start)
- **Cleanup**: 24h completed, 7d failed

### 2. Analytics Collection Queue
- **Name**: `analytics-collection`
- **Purpose**: Collect metrics from social platforms
- **Retry**: 5 attempts with exponential backoff (10s start)
- **Cleanup**: 12h completed, 7d failed

### 3. Social Listening Queue
- **Name**: `social-listening`
- **Purpose**: Monitor mentions and brand keywords
- **Retry**: 3 attempts with exponential backoff (5s start)
- **Cleanup**: 6h completed, 3d failed

### 4. Media Processing Queue
- **Name**: `media-processing`
- **Purpose**: Process images and videos
- **Retry**: 2 attempts with fixed backoff (30s)
- **Cleanup**: 24h completed, 7d failed

### 5. Email Notifications Queue
- **Name**: `email-notifications`
- **Purpose**: Send transactional emails
- **Retry**: 5 attempts with exponential backoff (2s start)
- **Cleanup**: 12h completed, 3d failed

### 6. Webhook Delivery Queue
- **Name**: `webhook-delivery`
- **Purpose**: Deliver webhooks to external services
- **Retry**: 10 attempts with exponential backoff (1s start)
- **Cleanup**: 24h completed, 7d failed

### 7. Report Generation Queue
- **Name**: `report-generation`
- **Purpose**: Generate analytics reports
- **Retry**: 2 attempts with fixed backoff (60s)
- **Cleanup**: 48h completed, 7d failed

### 8. Data Export Queue
- **Name**: `data-export`
- **Purpose**: Export data to CSV/Excel
- **Retry**: 2 attempts with fixed backoff (30s)
- **Cleanup**: 48h completed, 7d failed

### 9. AI Processing Queue
- **Name**: `ai-processing`
- **Purpose**: AI content generation and analysis
- **Retry**: 3 attempts with exponential backoff (3s start)
- **Cleanup**: 24h completed, 3d failed

### 10. Maintenance Queue
- **Name**: `maintenance`
- **Purpose**: Cleanup and maintenance tasks
- **Retry**: 1 attempt (no retry)
- **Cleanup**: 24h completed, 3d failed

## Usage

### Adding Jobs

```typescript
import { QueueService } from './queue/queue.service';

@Injectable()
export class MyService {
  constructor(private readonly queueService: QueueService) {}

  async schedulePost(postData: any) {
    // Add normal priority job
    await this.queueService.addJob(
      'post-publishing',
      'publish-post',
      postData,
    );

    // Add high priority job
    await this.queueService.addHighPriorityJob(
      'post-publishing',
      'publish-urgent-post',
      postData,
    );

    // Add delayed job (publish in 1 hour)
    await this.queueService.addDelayedJob(
      'post-publishing',
      'publish-scheduled-post',
      postData,
      3600000, // 1 hour in ms
    );

    // Add repeating job (every day at 9 AM)
    await this.queueService.addRepeatingJob(
      'analytics-collection',
      'daily-metrics',
      { workspaceId: 'workspace-123' },
      { pattern: '0 9 * * *' }, // Cron pattern
    );
  }
}
```

### Creating Processors

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('my-queue')
export class MyQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MyQueueProcessor.name);

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);

    try {
      // Update progress
      await job.updateProgress(25);

      // Do work
      const result = await this.doWork(job.data);

      await job.updateProgress(100);

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      throw error; // Triggers retry
    }
  }

  private async doWork(data: any) {
    // Your business logic here
    return { success: true };
  }
}
```

### Monitoring Queues

```typescript
import { QueueService } from './queue/queue.service';

// Get statistics for all queues
const stats = await queueService.getAllQueueStats();

// Get statistics for specific queue
const postStats = await queueService.getQueueStats('post-publishing');

// Get failed jobs
const failedJobs = await queueService.getFailedJobs('post-publishing', 0, 10);

// Retry a failed job
await queueService.retryJob('post-publishing', 'job-123');

// Remove a job
await queueService.removeJob('post-publishing', 'job-123');
```

### Queue Management

```typescript
// Pause a queue
await queueService.pauseQueue('post-publishing');

// Resume a queue
await queueService.resumeQueue('post-publishing');

// Clean old completed jobs
await queueService.cleanQueue('post-publishing', 86400000, 1000, 'completed');

// Drain a queue (remove all waiting jobs)
await queueService.drainQueue('post-publishing');
```

## API Endpoints

### Get Queue Statistics
```
GET /api/queues/stats
GET /api/queues/:queueName/stats
```

### Get Queue Health
```
GET /api/queues/health
GET /api/queues/:queueName/health
```

### Get Jobs
```
GET /api/queues/:queueName/failed
GET /api/queues/:queueName/completed
GET /api/queues/:queueName/active
GET /api/queues/:queueName/waiting
GET /api/queues/:queueName/delayed
GET /api/queues/:queueName/jobs/:jobId
```

### Manage Jobs
```
POST /api/queues/:queueName/jobs/:jobId/retry
DELETE /api/queues/:queueName/jobs/:jobId
```

### Manage Queues
```
POST /api/queues/:queueName/pause
POST /api/queues/:queueName/resume
POST /api/queues/:queueName/clean
POST /api/queues/:queueName/drain
```

## Monitoring

The queue module includes automated monitoring:

- **Health Checks**: Every 5 minutes
- **Cleanup**: Hourly for completed jobs, every 6 hours for failed jobs
- **Metrics**: Every 10 minutes

### Alert Thresholds

- Failed jobs: 100
- Waiting jobs: 10,000
- Delayed jobs: 5,000
- Active jobs: 1,000

## Configuration

Configure Redis connection in `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

## Best Practices

1. **Use Appropriate Queues**: Choose the right queue for your job type
2. **Set Priorities**: Use priority levels for time-sensitive jobs
3. **Handle Failures**: Implement proper error handling in processors
4. **Monitor Regularly**: Check queue health and failed jobs
5. **Clean Up**: Let automated cleanup run or trigger manually
6. **Test Retry Logic**: Ensure your jobs are idempotent
7. **Use Job IDs**: Provide unique job IDs to prevent duplicates
8. **Update Progress**: Report progress for long-running jobs
9. **Log Appropriately**: Use structured logging for debugging
10. **Set Timeouts**: Configure appropriate timeouts for jobs

## Performance Considerations

- **Concurrency**: BullMQ processes jobs concurrently (default: 1 per worker)
- **Scaling**: Add more worker processes to increase throughput
- **Redis**: Use Redis Cluster for high availability
- **Memory**: Monitor Redis memory usage
- **Network**: Ensure low latency between workers and Redis

## Troubleshooting

### Jobs Not Processing
1. Check if queue is paused
2. Verify Redis connection
3. Check worker processes are running
4. Review job logs for errors

### High Failed Job Count
1. Review error logs
2. Check external service availability
3. Verify retry configuration
4. Consider increasing retry attempts

### Memory Issues
1. Reduce job retention periods
2. Clean old jobs more frequently
3. Limit job data size
4. Use Redis memory optimization

## Integration with Health Checks

```typescript
import { QueueHealthIndicator } from './queue/health/queue-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private queueHealth: QueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.queueHealth.isHealthy('queues'),
    ]);
  }
}
```

## Requirements Satisfied

- ✅ **31.2**: Queue-based architecture with background job processing
- ✅ **31.4**: Retry mechanisms with exponential backoff
- ✅ Implements BullMQ job queues
- ✅ Build worker processes for background tasks
- ✅ Create job retry logic with exponential backoff
- ✅ Implement job monitoring and alerting
- ✅ Build job priority system
