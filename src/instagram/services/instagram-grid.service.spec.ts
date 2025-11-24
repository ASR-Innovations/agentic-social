import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InstagramGridService } from './instagram-grid.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform, PostStatus } from '@prisma/client';

describe('InstagramGridService', () => {
  let service: InstagramGridService;
  let prisma: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      findFirst: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramGridService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstagramGridService>(InstagramGridService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGridPreview', () => {
    it('should return grid preview with aesthetic analysis', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      });

      mockPrismaService.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          content: { text: 'Test post' },
          publishedAt: new Date(),
          mediaAssets: [
            {
              media: {
                url: 'https://example.com/image1.jpg',
                type: 'IMAGE',
                metadata: {
                  dominantColors: ['#FF0000', '#00FF00'],
                },
              },
            },
          ],
          platformPosts: [{ accountId }],
        },
      ]);

      const result = await service.getGridPreview(workspaceId, {
        accountId,
        count: 9,
      });

      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('aestheticScore');
      expect(result).toHaveProperty('colorHarmony');
      expect(result).toHaveProperty('themeConsistency');
      expect(result.posts).toHaveLength(1);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.getGridPreview('workspace-1', {
          accountId: 'invalid-account',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('rearrangeGrid', () => {
    it('should rearrange grid posts by updating scheduled times', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';
      const postOrder = ['post-1', 'post-2', 'post-3'];

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      });

      mockPrismaService.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          status: PostStatus.SCHEDULED,
          scheduledAt: new Date(),
          platformPosts: [{ accountId }],
        },
        {
          id: 'post-2',
          status: PostStatus.SCHEDULED,
          scheduledAt: new Date(),
          platformPosts: [{ accountId }],
        },
        {
          id: 'post-3',
          status: PostStatus.SCHEDULED,
          scheduledAt: new Date(),
          platformPosts: [{ accountId }],
        },
      ]);

      mockPrismaService.post.update.mockResolvedValue({});

      // Mock getGridPreview to return after rearrange
      mockPrismaService.post.findMany.mockResolvedValueOnce([
        {
          id: 'post-1',
          content: { text: 'Test post' },
          publishedAt: new Date(),
          mediaAssets: [
            {
              media: {
                url: 'https://example.com/image1.jpg',
                type: 'IMAGE',
                metadata: {
                  dominantColors: ['#FF0000', '#00FF00'],
                },
              },
            },
          ],
          platformPosts: [{ accountId }],
        },
      ]);

      const result = await service.rearrangeGrid(workspaceId, {
        accountId,
        postOrder,
      });

      expect(mockPrismaService.post.update).toHaveBeenCalledTimes(3);
      expect(result).toHaveProperty('posts');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.rearrangeGrid('workspace-1', {
          accountId: 'invalid-account',
          postOrder: ['post-1'],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
