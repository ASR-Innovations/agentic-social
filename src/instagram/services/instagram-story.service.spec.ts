import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InstagramStoryService } from './instagram-story.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';

describe('InstagramStoryService', () => {
  let service: InstagramStoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      findFirst: jest.fn(),
    },
    post: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramStoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstagramStoryService>(InstagramStoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStory', () => {
    it('should create and publish a story successfully', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
        accessToken: 'test-token',
        platformAccountId: 'ig-account-123',
      });

      const result = await service.createStory(workspaceId, {
        accountId,
        mediaUrl: 'https://example.com/story.jpg',
        mediaType: 'image',
      });

      expect(result.success).toBe(true);
      expect(result.storyId).toBeDefined();
    });

    it('should create story with poll sticker', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
        accessToken: 'test-token',
        platformAccountId: 'ig-account-123',
      });

      const result = await service.createStory(workspaceId, {
        accountId,
        mediaUrl: 'https://example.com/story.jpg',
        mediaType: 'image',
        pollSticker: {
          question: 'Which do you prefer?',
          options: ['Option A', 'Option B'],
          x: 0.5,
          y: 0.5,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.createStory('workspace-1', {
          accountId: 'invalid-account',
          mediaUrl: 'https://example.com/story.jpg',
          mediaType: 'image',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid poll options', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      await expect(
        service.createStory('workspace-1', {
          accountId: 'account-1',
          mediaUrl: 'https://example.com/story.jpg',
          mediaType: 'image',
          pollSticker: {
            question: 'Test?',
            options: ['Only one option'] as any,
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('scheduleStory', () => {
    it('should schedule a story for future publishing', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      mockPrismaService.post.create.mockResolvedValue({
        id: 'scheduled-story-1',
      });

      const result = await service.scheduleStory(workspaceId, {
        accountId,
        mediaUrl: 'https://example.com/story.jpg',
        mediaType: 'image',
        scheduledAt: futureDate,
      });

      expect(result.success).toBe(true);
      expect(result.scheduledId).toBe('scheduled-story-1');
      expect(mockPrismaService.post.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for past scheduled time', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await expect(
        service.scheduleStory('workspace-1', {
          accountId: 'account-1',
          mediaUrl: 'https://example.com/story.jpg',
          mediaType: 'image',
          scheduledAt: pastDate,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStoryAnalytics', () => {
    it('should return story analytics', async () => {
      const result = await service.getStoryAnalytics('workspace-1', 'story-1');

      expect(result).toHaveProperty('impressions');
      expect(result).toHaveProperty('reach');
      expect(result).toHaveProperty('replies');
      expect(result).toHaveProperty('exits');
    });
  });
});
