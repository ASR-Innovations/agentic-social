import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InstagramShopService } from './instagram-shop.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';

describe('InstagramShopService', () => {
  let service: InstagramShopService;
  let prisma: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      findFirst: jest.fn(),
    },
    post: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramShopService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstagramShopService>(InstagramShopService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShoppablePost', () => {
    it('should create a shoppable post with product tags', async () => {
      const workspaceId = 'workspace-1';
      const accountId = 'account-1';

      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      mockPrismaService.post.create.mockResolvedValue({
        id: 'post-1',
      });

      const result = await service.createShoppablePost(workspaceId, {
        accountId,
        content: 'Check out our new products!',
        mediaUrls: ['https://example.com/product1.jpg'],
        productTags: [
          {
            productId: 'product-1',
            x: 0.5,
            y: 0.5,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBe('post-1');
      expect(mockPrismaService.post.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for too many product tags', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      const tooManyTags = Array.from({ length: 6 }, (_, i) => ({
        productId: `product-${i}`,
        x: 0.5,
        y: 0.5,
      }));

      await expect(
        service.createShoppablePost('workspace-1', {
          accountId: 'account-1',
          content: 'Test',
          mediaUrls: ['https://example.com/image.jpg'],
          productTags: tooManyTags,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid coordinates', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      await expect(
        service.createShoppablePost('workspace-1', {
          accountId: 'account-1',
          content: 'Test',
          mediaUrls: ['https://example.com/image.jpg'],
          productTags: [
            {
              productId: 'product-1',
              x: 1.5, // Invalid: > 1
              y: 0.5,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('tagProduct', () => {
    it('should tag product in existing post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: 'post-1',
        workspaceId: 'workspace-1',
        platformPosts: [
          {
            platform: Platform.INSTAGRAM,
            accountId: 'account-1',
          },
        ],
      });

      const result = await service.tagProduct('workspace-1', {
        postId: 'post-1',
        productId: 'product-1',
        x: 0.5,
        y: 0.5,
      });

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(
        service.tagProduct('workspace-1', {
          postId: 'invalid-post',
          productId: 'product-1',
          x: 0.5,
          y: 0.5,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('syncInstagramShop', () => {
    it('should sync products from commerce platform', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
        platformAccountId: 'ig-account-123',
        accessToken: 'test-token',
      });

      const result = await service.syncInstagramShop('workspace-1', {
        accountId: 'account-1',
        platform: 'shopify',
      });

      expect(result.success).toBe(true);
      expect(result.syncedProducts).toBeDefined();
    });
  });

  describe('getShopProducts', () => {
    it('should return shop products', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({
        id: 'account-1',
        workspaceId: 'workspace-1',
        platform: Platform.INSTAGRAM,
        isActive: true,
      });

      const result = await service.getShopProducts('workspace-1', 'account-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getShoppingAnalytics', () => {
    it('should return shopping analytics for post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: 'post-1',
        workspaceId: 'workspace-1',
      });

      const result = await service.getShoppingAnalytics('workspace-1', 'post-1');

      expect(result).toHaveProperty('productViews');
      expect(result).toHaveProperty('productClicks');
      expect(result).toHaveProperty('addToCart');
      expect(result).toHaveProperty('purchases');
      expect(result).toHaveProperty('revenue');
    });
  });
});
