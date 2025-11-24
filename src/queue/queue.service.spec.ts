import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { Queue, Job } from 'bullmq';

describe('QueueService', () => {
  let service: QueueService;
  let mockQueue: Partial<Queue>;

  beforeEach(async () => {
    // Create mock queue
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' } as Job),
      getJob: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(5),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getFailedCount: jest.fn().mockResolvedValue(3),
      getDelayedCount: jest.fn().mockResolvedValue(10),
      isPaused: jest.fn().mockResolvedValue(false),
      pause: jest.fn().mockResolvedValue(undefined),
      resume: jest.fn().mockResolvedValue(undefined),
      clean: jest.fn().mockResolvedValue([]),
      drain: jest.fn().mockResolvedValue(undefined),
      getFailed: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getActive: jest.fn().mockResolvedValue([]),
      getWaiting: jest.fn().mockResolvedValue([]),
      getDelayed: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('post-publishing'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('analytics-collection'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('social-listening'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('media-processing'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('email-notifications'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('webhook-delivery'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('report-generation'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('data-export'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('ai-processing'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('maintenance'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addJob', () => {
    it('should add a job to the queue', async () => {
      const jobData = { workspaceId: 'workspace-123', postId: 'post-456' };
      
      const job = await service.addJob('post-publishing', 'publish-post', jobData);

      expect(mockQueue.add).toHaveBeenCalledWith('publish-post', jobData, undefined);
      expect(job.id).toBe('job-123');
    });

    it('should throw error for invalid queue name', async () => {
      await expect(
        service.addJob('invalid-queue', 'test-job', {}),
      ).rejects.toThrow('Queue "invalid-queue" not found');
    });
  });

  describe('addHighPriorityJob', () => {
    it('should add a high priority job', async () => {
      const jobData = { workspaceId: 'workspace-123' };
      
      await service.addHighPriorityJob('post-publishing', 'urgent-post', jobData);

      expect(mockQueue.add).toHaveBeenCalledWith('urgent-post', jobData, {
        priority: 1,
      });
    });
  });

  describe('addLowPriorityJob', () => {
    it('should add a low priority job', async () => {
      const jobData = { workspaceId: 'workspace-123' };
      
      await service.addLowPriorityJob('maintenance', 'cleanup', jobData);

      expect(mockQueue.add).toHaveBeenCalledWith('cleanup', jobData, {
        priority: 10,
      });
    });
  });

  describe('addDelayedJob', () => {
    it('should add a delayed job', async () => {
      const jobData = { workspaceId: 'workspace-123' };
      const delay = 3600000; // 1 hour
      
      await service.addDelayedJob('post-publishing', 'scheduled-post', jobData, delay);

      expect(mockQueue.add).toHaveBeenCalledWith('scheduled-post', jobData, {
        delay,
      });
    });
  });

  describe('addRepeatingJob', () => {
    it('should add a repeating job with cron pattern', async () => {
      const jobData = { workspaceId: 'workspace-123' };
      const repeatOptions = { pattern: '0 9 * * *' };
      
      await service.addRepeatingJob(
        'analytics-collection',
        'daily-metrics',
        jobData,
        repeatOptions,
      );

      expect(mockQueue.add).toHaveBeenCalledWith('daily-metrics', jobData, {
        repeat: repeatOptions,
      });
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const stats = await service.getQueueStats('post-publishing');

      expect(stats).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 10,
        paused: false,
        total: 17, // waiting + active + delayed
      });
    });
  });

  describe('getAllQueueStats', () => {
    it('should return statistics for all queues', async () => {
      const stats = await service.getAllQueueStats();

      expect(stats).toHaveProperty('post-publishing');
      expect(stats).toHaveProperty('analytics-collection');
      expect(stats).toHaveProperty('social-listening');
      expect(Object.keys(stats).length).toBe(10);
    });
  });

  describe('pauseQueue', () => {
    it('should pause a queue', async () => {
      await service.pauseQueue('post-publishing');

      expect(mockQueue.pause).toHaveBeenCalled();
    });
  });

  describe('resumeQueue', () => {
    it('should resume a paused queue', async () => {
      await service.resumeQueue('post-publishing');

      expect(mockQueue.resume).toHaveBeenCalled();
    });
  });

  describe('cleanQueue', () => {
    it('should clean old jobs from queue', async () => {
      (mockQueue.clean as jest.Mock).mockResolvedValue(['job-1', 'job-2']);

      const cleaned = await service.cleanQueue('post-publishing', 86400000, 1000, 'completed');

      expect(mockQueue.clean).toHaveBeenCalledWith(86400000, 1000, 'completed');
      expect(cleaned).toEqual(['job-1', 'job-2']);
    });
  });

  describe('drainQueue', () => {
    it('should drain a queue', async () => {
      await service.drainQueue('post-publishing', false);

      expect(mockQueue.drain).toHaveBeenCalledWith(false);
    });
  });

  describe('getJob', () => {
    it('should get a job by ID', async () => {
      const mockJob = { id: 'job-123', name: 'test-job' } as Job;
      (mockQueue.getJob as jest.Mock).mockResolvedValue(mockJob);

      const job = await service.getJob('post-publishing', 'job-123');

      expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
      expect(job).toEqual(mockJob);
    });
  });

  describe('removeJob', () => {
    it('should remove a job', async () => {
      const mockJob = {
        id: 'job-123',
        remove: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job;
      
      (mockQueue.getJob as jest.Mock).mockResolvedValue(mockJob);

      await service.removeJob('post-publishing', 'job-123');

      expect(mockJob.remove).toHaveBeenCalled();
    });
  });

  describe('retryJob', () => {
    it('should retry a failed job', async () => {
      const mockJob = {
        id: 'job-123',
        retry: jest.fn().mockResolvedValue(undefined),
      } as unknown as Job;
      
      (mockQueue.getJob as jest.Mock).mockResolvedValue(mockJob);

      await service.retryJob('post-publishing', 'job-123');

      expect(mockJob.retry).toHaveBeenCalled();
    });
  });
});
