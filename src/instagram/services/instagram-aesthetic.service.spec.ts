import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InstagramAestheticService } from './instagram-aesthetic.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';

describe('InstagramAestheticService', () => {
  let service: InstagramAestheticService;
  let prisma: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      findFirst: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramAestheticService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstagramAestheticService>(InstagramAestheticService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeAesthetic', () => {
    it('should analyze aesthetic and return scores', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      });

      const now = new Date();
      mockPrismaService.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          scheduledAt: null,
          mediaAssets: [
            {
              media: {
                url: 'https://example.com/image1.jpg',
                type: 'IMAGE',
                metadata: {
                  dominantColors: ['#FF0000', '#00FF00'],
                  colorTemperature: 'warm',
                  brightness: 70,
                  saturation: 60,
                  contrast: 50,
                },
              },
            },
          ],
        },
        {
          id: 'post-2',
          publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          scheduledAt: null,
          mediaAssets: [
            {
              media: {
                url: 'https://example.com/image2.jpg',
                type: 'IMAGE',
                metadata: {
                  dominantColors: ['#FF0000', '#FFFF00'],
                  colorTemperature: 'warm',
                  brightness: 75,
                  saturation: 65,
                  contrast: 55,
                },
              },
            },
          ],
        },
      ]);

      const result = await service.analyzeAesthetic(workspaceId, {
        accountId,
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('colorHarmony');
      expect(result).toHaveProperty('themeConsistency');
      expect(result).toHaveProperty('visualBalance');
      expect(result).toHaveProperty('dominantPalette');
      expect(result).toHaveProperty('detectedThemes');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('colorDistribution');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.analyzeAesthetic('workspace-1', {
          accountId: 'invalid-account',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no posts found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
      });

      mockPrismaService.post.findMany.mockResolvedValue([]);

      await expect(
        service.analyzeAesthetic('workspace-1', {
          accountId: 'account-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('extractColorPalette', () => {
    it('should extract color palette from image', async () => {
      const result = await service.extractColorPalette({
        mediaUrl: 'https://example.com/image.jpg',
      });

      expect(result).toHaveProperty('dominantColors');
      expect(result).toHaveProperty('colorPercentages');
      expect(result).toHaveProperty('complementaryColors');
      expect(Array.isArray(result.dominantColors)).toBe(true);
      expect(result.dominantColors.length).toBeGreaterThan(0);
    });
  });
});
