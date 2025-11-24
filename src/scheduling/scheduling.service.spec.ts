import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prismaService: PrismaService;
  let queueService: QueueService;

  const mockPrismaService = {
    post: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockQueueService = {
    addJob: jest.fn(),
    addDelayedJob: jest.fn(),
    removeJob: jest.fn(),
    getJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    prismaService = module.get<PrismaService>(PrismaService);
    queueService = module.get<QueueService>(QueueService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('schedulePost', () => {
    const workspaceId = 'workspace-123';
    const postId = 'post-123';
    const scheduledAt = new Date(Date.now() + 3600000); // 1 hour from now

    it('should schedule a post successfully', async () => {
      const mockPost = {
        id: postId,
        workspaceId,
        status: PostStatus.DRAFT,
        scheduledAt: null,
      };

      const updatedPost = {
        ...mockPost,
        status: PostStatus.SCHEDULED,
        scheduledAt,
      };

      mockPrismaService.post.findFirst.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue(updatedPost);
      mockQueueService.addDelayedJob.mockResolvedValue({ id: 'job-123' });

      const result = await service.schedulePost(workspaceId, postId, scheduledAt);

      expect(result).toEqual(updatedPost);
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          status: PostStatus.SCHEDULED,
          scheduledAt,
        },
      });
      expect(mockQueueService.addDelayedJob).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(
        service.schedulePost(workspaceId, postId, scheduledAt),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if post already published', async () => {
      const publishedPost = {
        id: postId,
        workspaceId,
        status: PostStatus.PUBLISHED,
      };

      mockPrismaService.post.findFirst.mockResolvedValue(publishedPost);

      await expect(
        service.schedulePost(workspaceId, postId, scheduledAt),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if scheduled time is in the past', async () => {
      const pastDate = new Date(Date.now() - 3600000);
      const mockPost = {
        id: postId,
        workspaceId,
        status: PostStatus.DRAFT,
      };

      mockPrismaService.post.findFirst.mockResolvedValue(mockPost);

      await expect(
        service.schedulePost(workspaceId, postId, pastDate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelSchedule', () => {
    const workspaceId = 'workspace-123';
    const postId = 'post-123';

    it('should cancel a scheduled post', async () => {
      const scheduledPost = {
        id: postId,
        workspaceId,
        status: PostStatus.SCHEDULED,
        scheduledAt: new Date(),
        jobId: 'job-123',
      };

      const cancelledPost = {
        ...scheduledPost,
        status: PostStatus.DRAFT,
        scheduledAt: null,
        jobId: null,
      };

      mockPrismaService.post.findFirst.mockResolvedValue(scheduledPost);
      mockPrismaService.post.update.mockResolvedValue(cancelledPost);
      mockQueueService.removeJob.mockResolvedValue(undefined);

      const result = await service.cancelSchedule(workspaceId, postId);

      expect(result).toEqual(cancelledPost);
      expect(mockQueueService.removeJob).toHaveBeenCalledWith(
        'post-publishing',
        'job-123',
      );
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(service.cancelSchedule(workspaceId, postId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if post not scheduled', async () => {
      const draftPost = {
        id: postId,
        workspaceId,
        status: PostStatus.DRAFT,
      };

      mockPrismaService.post.findFirst.mockResolvedValue(draftPost);

      await expect(service.cancelSchedule(workspaceId, postId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reschedulePost', () => {
    const workspaceId = 'workspace-123';
    const postId = 'post-123';
    const newScheduledAt = new Date(Date.now() + 7200000); // 2 hours from now

    it('should reschedule a post', async () => {
      const scheduledPost = {
        id: postId,
        workspaceId,
        status: PostStatus.SCHEDULED,
        scheduledAt: new Date(Date.now() + 3600000),
        jobId: 'old-job-123',
      };

      const rescheduledPost = {
        ...scheduledPost,
        scheduledAt: newScheduledAt,
        jobId: 'new-job-123',
      };

      mockPrismaService.post.findFirst.mockResolvedValue(scheduledPost);
      mockPrismaService.post.update.mockResolvedValue(rescheduledPost);
      mockQueueService.removeJob.mockResolvedValue(undefined);
      mockQueueService.addDelayedJob.mockResolvedValue({ id: 'new-job-123' });

      const result = await service.reschedulePost(workspaceId, postId, newScheduledAt);

      expect(result).toEqual(rescheduledPost);
      expect(mockQueueService.removeJob).toHaveBeenCalledWith(
        'post-publishing',
        'old-job-123',
      );
      expect(mockQueueService.addDelayedJob).toHaveBeenCalled();
    });
  });

  describe('getScheduledPosts', () => {
    const workspaceId = 'workspace-123';

    it('should return scheduled posts for a date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const scheduledPosts = [
        { id: 'post-1', status: PostStatus.SCHEDULED },
        { id: 'post-2', status: PostStatus.SCHEDULED },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(scheduledPosts);

      const result = await service.getScheduledPosts(workspaceId, startDate, endDate);

      expect(result).toEqual(scheduledPosts);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId,
          status: PostStatus.SCHEDULED,
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: expect.any(Object),
        orderBy: { scheduledAt: 'asc' },
      });
    });
  });

  describe('calculateOptimalPostingTime', () => {
    it('should calculate optimal posting time based on historical data', async () => {
      const workspaceId = 'workspace-123';
      const platform = 'INSTAGRAM';

      // Mock historical engagement data
      const result = await service.calculateOptimalPostingTime(workspaceId, platform);

      expect(result).toHaveProperty('hour');
      expect(result).toHaveProperty('dayOfWeek');
      expect(result.hour).toBeGreaterThanOrEqual(0);
      expect(result.hour).toBeLessThan(24);
      expect(result.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(result.dayOfWeek).toBeLessThan(7);
    });
  });
});
