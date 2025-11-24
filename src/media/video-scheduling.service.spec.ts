import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VideoSchedulingService } from './video-scheduling.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VideoSchedulingService', () => {
  let service: VideoSchedulingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoSchedulingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VideoSchedulingService>(VideoSchedulingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlatformRequirements', () => {
    it('should return requirements for YouTube', () => {
      const requirements = service.getPlatformRequirements('youtube');

      expect(requirements).toBeDefined();
      expect(requirements.platform).toBe('YOUTUBE');
      expect(requirements.maxDuration).toBe(43200);
      expect(requirements.supportedFormats).toContain('mp4');
    });

    it('should return requirements for TikTok', () => {
      const requirements = service.getPlatformRequirements('tiktok');

      expect(requirements).toBeDefined();
      expect(requirements.platform).toBe('TIKTOK');
      expect(requirements.maxDuration).toBe(600);
      expect(requirements.aspectRatios).toContain('9:16');
    });

    it('should return requirements for Instagram', () => {
      const requirements = service.getPlatformRequirements('instagram');

      expect(requirements).toBeDefined();
      expect(requirements.platform).toBe('INSTAGRAM');
      expect(requirements.maxDuration).toBe(60);
    });

    it('should throw error for unsupported platform', () => {
      expect(() => service.getPlatformRequirements('unsupported')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateVideoForPlatform', () => {
    it('should validate video that meets all requirements', () => {
      const result = service.validateVideoForPlatform(
        'youtube',
        120, // 2 minutes
        50 * 1024 * 1024, // 50MB
        'mp4',
        1920,
        1080,
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject video exceeding duration limit', () => {
      const result = service.validateVideoForPlatform(
        'tiktok',
        700, // 11+ minutes (exceeds TikTok's 10 min limit)
        50 * 1024 * 1024,
        'mp4',
        1080,
        1920,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('duration');
    });

    it('should reject video exceeding file size limit', () => {
      const result = service.validateVideoForPlatform(
        'instagram',
        30,
        150 * 1024 * 1024, // 150MB (exceeds Instagram's 100MB limit)
        'mp4',
        1080,
        1920,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('size'))).toBe(true);
    });

    it('should reject unsupported video format', () => {
      const result = service.validateVideoForPlatform(
        'youtube',
        120,
        50 * 1024 * 1024,
        'mkv', // Not in YouTube's supported formats
        1920,
        1080,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('format'))).toBe(true);
    });

    it('should reject video with resolution below minimum', () => {
      const result = service.validateVideoForPlatform(
        'youtube',
        120,
        50 * 1024 * 1024,
        'mp4',
        320, // Below YouTube's minimum
        180,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('resolution'))).toBe(true);
    });

    it('should reject video with resolution above maximum', () => {
      const result = service.validateVideoForPlatform(
        'youtube',
        120,
        50 * 1024 * 1024,
        'mp4',
        4000, // Above YouTube's maximum
        2500,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('resolution'))).toBe(true);
    });
  });

  describe('getOptimalSettings', () => {
    it('should return optimal settings for YouTube', () => {
      const settings = service.getOptimalSettings('youtube');

      expect(settings).toBeDefined();
      expect(settings.format).toBe('mp4');
      expect(settings.resolution.width).toBe(1920);
      expect(settings.resolution.height).toBe(1080);
      expect(settings.aspectRatio).toBe('16:9');
    });

    it('should return optimal settings for TikTok', () => {
      const settings = service.getOptimalSettings('tiktok');

      expect(settings).toBeDefined();
      expect(settings.format).toBe('mp4');
      expect(settings.resolution.width).toBe(1080);
      expect(settings.resolution.height).toBe(1920);
      expect(settings.aspectRatio).toBe('9:16');
    });

    it('should return optimal settings for Instagram', () => {
      const settings = service.getOptimalSettings('instagram');

      expect(settings).toBeDefined();
      expect(settings.aspectRatio).toBe('9:16');
    });
  });

  describe('scheduleVideoPost', () => {
    it('should schedule video post successfully', async () => {
      const mockPost = {
        id: 'post-1',
        workspaceId: 'workspace-1',
        mediaAssets: [
          {
            media: {
              id: 'video-1',
              type: 'VIDEO',
              duration: 30,
              size: 50 * 1024 * 1024,
              filename: 'video.mp4',
              dimensions: { width: 1920, height: 1080 },
            },
          },
        ],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({ ...mockPost, status: 'SCHEDULED' });

      const result = await service.scheduleVideoPost('workspace-1', {
        postId: 'post-1',
        videoId: 'video-1',
        platforms: ['youtube', 'facebook'],
        scheduledAt: new Date('2024-12-31T12:00:00Z'),
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('post-1');
      expect(result.platforms).toEqual(['youtube', 'facebook']);
      expect(mockPrismaService.post.update).toHaveBeenCalled();
    });

    it('should throw error if post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.scheduleVideoPost('workspace-1', {
          postId: 'invalid-post',
          videoId: 'video-1',
          platforms: ['youtube'],
          scheduledAt: new Date(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if post belongs to different workspace', async () => {
      const mockPost = {
        id: 'post-1',
        workspaceId: 'workspace-2',
        mediaAssets: [],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(
        service.scheduleVideoPost('workspace-1', {
          postId: 'post-1',
          videoId: 'video-1',
          platforms: ['youtube'],
          scheduledAt: new Date(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if video not found in post', async () => {
      const mockPost = {
        id: 'post-1',
        workspaceId: 'workspace-1',
        mediaAssets: [
          {
            media: {
              id: 'different-video',
              type: 'VIDEO',
            },
          },
        ],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(
        service.scheduleVideoPost('workspace-1', {
          postId: 'post-1',
          videoId: 'video-1',
          platforms: ['youtube'],
          scheduledAt: new Date(),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
