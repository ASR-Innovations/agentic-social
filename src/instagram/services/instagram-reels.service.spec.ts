import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InstagramReelsService } from './instagram-reels.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';
import { ReelsAspectRatio } from '../dto/reels.dto';

describe('InstagramReelsService', () => {
  let service: InstagramReelsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      findFirst: jest.fn(),
    },
    post: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramReelsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstagramReelsService>(InstagramReelsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReel', () => {
    it('should create a Reel successfully', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      mockPrismaService.post.create.mockResolvedValue({
        id: 'reel-1',
      });

      const result = await service.createReel(workspaceId, {
        accountId,
        videoUrl: 'https://example.com/reel.mp4',
        caption: 'Check out this Reel!',
        hashtags: ['#reels', '#instagram'],
      });

      expect(result.success).toBe(true);
      expect(result.reelId).toBe('reel-1');
      expect(mockPrismaService.post.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for caption too long', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      const longCaption = 'a'.repeat(2201);

      await expect(
        service.createReel('workspace-1', {
          accountId: 'account-1',
          videoUrl: 'https://example.com/reel.mp4',
          caption: longCaption,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for too many hashtags', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      const tooManyHashtags = Array.from({ length: 31 }, (_, i) => `#tag${i}`);

      await expect(
        service.createReel('workspace-1', {
          accountId: 'account-1',
          videoUrl: 'https://example.com/reel.mp4',
          caption: 'Test',
          hashtags: tooManyHashtags,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('optimizeReel', () => {
    it('should optimize video for Reels', async () => {
      const result = await service.optimizeReel('workspace-1', {
        videoUrl: 'https://example.com/video.mp4',
        aspectRatio: ReelsAspectRatio.VERTICAL_9_16,
        targetDuration: 30,
        autoCaptions: true,
      });

      expect(result).toHaveProperty('optimizedVideoUrl');
      expect(result).toHaveProperty('thumbnailUrl');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('aspectRatio');
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('suggestions');
      expect(result.captionsUrl).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should provide optimization suggestions', async () => {
      const result = await service.optimizeReel('workspace-1', {
        videoUrl: 'https://example.com/video.mp4',
        aspectRatio: ReelsAspectRatio.VERTICAL_9_16,
        targetDuration: 10,
      });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('completion rates'))).toBe(true);
    });
  });

  describe('getReelAnalytics', () => {
    it('should return Reel analytics', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: 'reel-1',
        workspaceId: 'workspace-1',
        platformPosts: [
          {
            platform: Platform.INSTAGRAM,
          },
        ],
      });

      const result = await service.getReelAnalytics('workspace-1', {
        postId: 'reel-1',
      });

      expect(result).toHaveProperty('plays');
      expect(result).toHaveProperty('reach');
      expect(result).toHaveProperty('likes');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('shares');
      expect(result).toHaveProperty('saves');
      expect(result).toHaveProperty('avgWatchTime');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('engagementRate');
    });

    it('should throw NotFoundException if Reel not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(
        service.getReelAnalytics('workspace-1', {
          postId: 'invalid-reel',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReelsRecommendations', () => {
    it('should return Reels recommendations', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
      });

      mockPrismaService.post.findMany.mockResolvedValue([]);

      const result = await service.getReelsRecommendations('workspace-1', 'account-1');

      expect(result).toHaveProperty('bestPostingTimes');
      expect(result).toHaveProperty('trendingAudio');
      expect(result).toHaveProperty('contentSuggestions');
      expect(result).toHaveProperty('performanceTips');
      expect(Array.isArray(result.bestPostingTimes)).toBe(true);
      expect(Array.isArray(result.trendingAudio)).toBe(true);
      expect(Array.isArray(result.contentSuggestions)).toBe(true);
      expect(Array.isArray(result.performanceTips)).toBe(true);
    });
  });

  describe('getBestPractices', () => {
    it('should return Reels best practices', () => {
      const result = service.getBestPractices();

      expect(result).toHaveProperty('technical');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('engagement');
      expect(Array.isArray(result.technical)).toBe(true);
      expect(Array.isArray(result.content)).toBe(true);
      expect(Array.isArray(result.engagement)).toBe(true);
      expect(result.technical.length).toBeGreaterThan(0);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.engagement.length).toBeGreaterThan(0);
    });
  });
});
