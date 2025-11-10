import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { PostService } from './post.service';
import { Post, PostPlatform, PostStatus, PublishStatus } from './entities/post.entity';
import { BadRequestException } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let postRepository: Repository<Post>;
  let postPlatformRepository: Repository<PostPlatform>;
  let publishQueue: Queue;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockPostPlatformRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(PostPlatform),
          useValue: mockPostPlatformRepository,
        },
        {
          provide: getQueueToken('post-publishing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    postPlatformRepository = module.get<Repository<PostPlatform>>(getRepositoryToken(PostPlatform));
    publishQueue = module.get<Queue>(getQueueToken('post-publishing'));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post with draft status', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const createPostDto = {
        title: 'Test Post',
        content: 'Test content',
        type: 'text' as any,
        socialAccountIds: ['account-1', 'account-2'],
      };

      const savedPost = {
        id: 'post-123',
        tenantId,
        createdBy: userId,
        ...createPostDto,
        status: PostStatus.DRAFT,
      };

      mockPostRepository.create.mockReturnValue(savedPost);
      mockPostRepository.save.mockResolvedValue(savedPost);
      mockPostPlatformRepository.create.mockImplementation((data) => data);
      mockPostPlatformRepository.save.mockResolvedValue([]);
      mockPostRepository.findOne.mockResolvedValue({
        ...savedPost,
        platforms: [],
        creator: { id: userId },
      });

      const result = await service.create(tenantId, userId, createPostDto);

      expect(result).toBeDefined();
      expect(mockPostRepository.create).toHaveBeenCalled();
      expect(mockPostRepository.save).toHaveBeenCalled();
      expect(mockPostPlatformRepository.save).toHaveBeenCalled();
    });

    it('should create scheduled post and add to queue', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const scheduledAt = new Date(Date.now() + 3600000).toISOString();
      const createPostDto = {
        title: 'Scheduled Post',
        content: 'Test content',
        type: 'text' as any,
        socialAccountIds: ['account-1'],
        scheduledAt,
      };

      const savedPost = {
        id: 'post-123',
        tenantId,
        createdBy: userId,
        ...createPostDto,
        status: PostStatus.SCHEDULED,
      };

      mockPostRepository.create.mockReturnValue(savedPost);
      mockPostRepository.save.mockResolvedValue(savedPost);
      mockPostPlatformRepository.create.mockImplementation((data) => data);
      mockPostPlatformRepository.save.mockResolvedValue([]);
      mockQueue.add.mockResolvedValue({ id: 'job-123' });
      mockPostRepository.findOne.mockResolvedValue({
        ...savedPost,
        platforms: [],
        creator: { id: userId },
      });

      const result = await service.create(tenantId, userId, createPostDto);

      expect(result).toBeDefined();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'publish-scheduled-post',
        { postId: savedPost.id },
        expect.objectContaining({
          jobId: `post-${savedPost.id}`,
          delay: expect.any(Number),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return posts with pagination', async () => {
      const tenantId = 'tenant-123';
      const posts = [
        { id: 'post-1', tenantId, title: 'Post 1' },
        { id: 'post-2', tenantId, title: 'Post 2' },
      ];

      mockPostRepository.findAndCount.mockResolvedValue([posts, 2]);

      const result = await service.findAll(tenantId, { limit: 10, offset: 0 });

      expect(result.posts).toEqual(posts);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const tenantId = 'tenant-123';
      const posts = [
        { id: 'post-1', tenantId, status: PostStatus.PUBLISHED },
      ];

      mockPostRepository.findAndCount.mockResolvedValue([posts, 1]);

      const result = await service.findAll(tenantId, { status: PostStatus.PUBLISHED });

      expect(result.posts).toEqual(posts);
      expect(mockPostRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, status: PostStatus.PUBLISHED },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a draft post', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';
      const updateDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const existingPost = {
        id: postId,
        tenantId,
        status: PostStatus.DRAFT,
        title: 'Old Title',
        content: 'Old content',
      };

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue({
        ...existingPost,
        ...updateDto,
      });

      const result = await service.update(tenantId, postId, updateDto);

      expect(result.title).toBe(updateDto.title);
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should not allow editing published posts', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';
      const updateDto = { title: 'Updated' };

      const existingPost = {
        id: postId,
        tenantId,
        status: PostStatus.PUBLISHED,
      };

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(service.update(tenantId, postId, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('publishNow', () => {
    it('should queue post for immediate publishing', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';

      const post = {
        id: postId,
        tenantId,
        status: PostStatus.DRAFT,
      };

      mockPostRepository.findOne.mockResolvedValue(post);
      mockPostRepository.save.mockResolvedValue({
        ...post,
        status: PostStatus.PUBLISHING,
      });
      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const result = await service.publishNow(tenantId, postId);

      expect(result.status).toBe(PostStatus.PUBLISHING);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'publish-now',
        { postId },
        expect.any(Object),
      );
    });

    it('should not allow republishing', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';

      const post = {
        id: postId,
        tenantId,
        status: PostStatus.PUBLISHED,
      };

      mockPostRepository.findOne.mockResolvedValue(post);

      await expect(service.publishNow(tenantId, postId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('schedulePost', () => {
    it('should schedule post for future publishing', async () => {
      const postId = 'post-123';
      const scheduledAt = new Date(Date.now() + 3600000);

      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      await service.schedulePost(postId, scheduledAt);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'publish-scheduled-post',
        { postId },
        expect.objectContaining({
          jobId: `post-${postId}`,
          delay: expect.any(Number),
        }),
      );
    });

    it('should reject past dates', async () => {
      const postId = 'post-123';
      const pastDate = new Date(Date.now() - 3600000);

      await expect(service.schedulePost(postId, pastDate)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelScheduledPost', () => {
    it('should cancel scheduled job and update status', async () => {
      const postId = 'post-123';
      const mockJob = {
        remove: jest.fn(),
      };

      mockQueue.getJob.mockResolvedValue(mockJob);
      mockPostRepository.update.mockResolvedValue({ affected: 1 });

      await service.cancelScheduledPost(postId);

      expect(mockJob.remove).toHaveBeenCalled();
      expect(mockPostRepository.update).toHaveBeenCalledWith(
        { id: postId },
        { status: PostStatus.CANCELLED },
      );
    });
  });

  describe('duplicate', () => {
    it('should create a copy of existing post', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';
      const userId = 'user-123';

      const originalPost = {
        id: postId,
        tenantId,
        title: 'Original Post',
        content: 'Original content',
        type: 'text',
        status: PostStatus.PUBLISHED,
        platforms: [
          { socialAccountId: 'account-1', platformSettings: {} },
        ],
      };

      const newPost = {
        id: 'post-456',
        tenantId,
        title: 'Original Post (Copy)',
        content: 'Original content',
        status: PostStatus.DRAFT,
      };

      mockPostRepository.findOne
        .mockResolvedValueOnce(originalPost)
        .mockResolvedValueOnce({ ...newPost, platforms: [] });
      mockPostRepository.create.mockReturnValue(newPost);
      mockPostRepository.save.mockResolvedValue(newPost);
      mockPostPlatformRepository.create.mockImplementation((data) => data);
      mockPostPlatformRepository.save.mockResolvedValue([]);

      const result = await service.duplicate(tenantId, postId, userId);

      expect(result.title).toContain('(Copy)');
      expect(result.status).toBe(PostStatus.DRAFT);
    });
  });

  describe('getCalendar', () => {
    it('should return posts within date range', async () => {
      const tenantId = 'tenant-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const posts = [
        {
          id: 'post-1',
          tenantId,
          scheduledAt: new Date('2024-01-15'),
          status: PostStatus.SCHEDULED,
        },
      ];

      mockPostRepository.find.mockResolvedValue(posts);

      const result = await service.getCalendar(tenantId, startDate, endDate);

      expect(result).toEqual(posts);
      expect(mockPostRepository.find).toHaveBeenCalled();
    });
  });

  describe('updatePlatformStatus', () => {
    it('should update platform publishing status', async () => {
      const platformId = 'platform-123';
      const status = PublishStatus.PUBLISHED;
      const platformPostId = 'twitter-post-123';
      const platformPostUrl = 'https://twitter.com/post/123';

      mockPostPlatformRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePlatformStatus(
        platformId,
        status,
        platformPostId,
        platformPostUrl,
      );

      expect(mockPostPlatformRepository.update).toHaveBeenCalledWith(
        { id: platformId },
        expect.objectContaining({
          status,
          platformPostId,
          platformPostUrl,
        }),
      );
    });
  });
});
