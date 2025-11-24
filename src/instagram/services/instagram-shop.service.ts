import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';
import {
  TagProductDto,
  CreateShoppablePostDto,
  InstagramShopProductDto,
  SyncInstagramShopDto,
} from '../dto/shop.dto';

/**
 * Service for Instagram Shopping integration
 * Enables product tagging in posts and Instagram Shop management
 */
@Injectable()
export class InstagramShopService {
  private readonly logger = new Logger(InstagramShopService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a shoppable Instagram post with product tags
   */
  async createShoppablePost(
    workspaceId: string,
    dto: CreateShoppablePostDto,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Validate product tags
    this.validateProductTags(dto.productTags, dto.mediaUrls.length);

    try {
      // Create post with product tags
      const post = await this.prisma.post.create({
        data: {
          workspaceId,
          authorId: account.id, // Using account ID as author
          content: {
            text: dto.content,
            media: dto.mediaUrls.map((url, index) => ({
              url,
              type: 'image',
              order: index,
            })),
          },
          status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
          scheduledAt: dto.scheduledAt,
          platformPosts: {
            create: {
              accountId: dto.accountId,
              platform: Platform.INSTAGRAM,
              publishStatus: 'PENDING',
              customContent: {
                productTags: dto.productTags,
              },
            },
          },
        },
      });

      // Store product tags
      if (dto.productTags.length > 0) {
        await this.storeProductTags(post.id, dto.productTags);
      }

      this.logger.log(`Shoppable post created: ${post.id}`);

      return {
        success: true,
        postId: post.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create shoppable post: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Tag products in an existing post
   */
  async tagProduct(
    workspaceId: string,
    dto: TagProductDto,
  ): Promise<{ success: boolean; error?: string }> {
    // Verify post belongs to workspace
    const post = await this.prisma.post.findFirst({
      where: {
        id: dto.postId,
        workspaceId,
      },
      include: {
        platformPosts: {
          where: {
            platform: Platform.INSTAGRAM,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.platformPosts.length === 0) {
      throw new BadRequestException('Post is not scheduled for Instagram');
    }

    try {
      // Add product tag to post
      await this.storeProductTags(dto.postId, [{
        productId: dto.productId,
        x: dto.x,
        y: dto.y,
      }]);

      this.logger.log(`Product tagged in post ${dto.postId}`);

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to tag product: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sync Instagram Shop with commerce platform
   */
  async syncInstagramShop(
    workspaceId: string,
    dto: SyncInstagramShopDto,
  ): Promise<{
    success: boolean;
    syncedProducts?: number;
    error?: string;
  }> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    try {
      // Fetch products from commerce platform
      const products = await this.fetchProductsFromCommercePlatform(
        workspaceId,
        dto.platform,
      );

      // Sync products to Instagram Shop via API
      const syncedCount = await this.syncProductsToInstagram(
        account.platformAccountId,
        account.accessToken,
        products,
      );

      this.logger.log(`Synced ${syncedCount} products to Instagram Shop`);

      return {
        success: true,
        syncedProducts: syncedCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to sync Instagram Shop: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get Instagram Shop products
   */
  async getShopProducts(
    workspaceId: string,
    accountId: string,
  ): Promise<InstagramShopProductDto[]> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
        isActive: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Fetch products from Instagram Shop
    // In a real implementation, this would call Instagram Graph API
    this.logger.log(`Fetching Instagram Shop products for account ${accountId}`);

    return [];
  }

  /**
   * Get shopping analytics for a post
   */
  async getShoppingAnalytics(
    workspaceId: string,
    postId: string,
  ): Promise<{
    productViews: number;
    productClicks: number;
    addToCart: number;
    purchases: number;
    revenue: number;
  }> {
    // Verify post belongs to workspace
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        workspaceId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Fetch shopping analytics from Instagram Insights API
    // In a real implementation, this would call Instagram Graph API
    this.logger.log(`Fetching shopping analytics for post ${postId}`);

    return {
      productViews: 0,
      productClicks: 0,
      addToCart: 0,
      purchases: 0,
      revenue: 0,
    };
  }

  /**
   * Validate product tags
   */
  private validateProductTags(
    tags: Array<{ productId: string; x: number; y: number; mediaIndex?: number }>,
    mediaCount: number,
  ): void {
    // Instagram allows max 5 product tags per image
    const MAX_TAGS_PER_IMAGE = 5;

    // Group tags by media index
    const tagsByMedia = new Map<number, number>();

    tags.forEach(tag => {
      const mediaIndex = tag.mediaIndex || 0;

      if (mediaIndex >= mediaCount) {
        throw new BadRequestException(`Invalid media index: ${mediaIndex}`);
      }

      if (tag.x < 0 || tag.x > 1 || tag.y < 0 || tag.y > 1) {
        throw new BadRequestException('Product tag coordinates must be between 0 and 1');
      }

      const count = tagsByMedia.get(mediaIndex) || 0;
      tagsByMedia.set(mediaIndex, count + 1);

      if (count + 1 > MAX_TAGS_PER_IMAGE) {
        throw new BadRequestException(
          `Maximum ${MAX_TAGS_PER_IMAGE} product tags allowed per image`,
        );
      }
    });
  }

  /**
   * Store product tags in database
   */
  private async storeProductTags(
    postId: string,
    tags: Array<{ productId: string; x: number; y: number; mediaIndex?: number }>,
  ): Promise<void> {
    // In a real implementation, this would store tags in a ProductPostTag table
    // For now, we'll just log
    this.logger.log(`Storing ${tags.length} product tags for post ${postId}`);
  }

  /**
   * Fetch products from commerce platform
   */
  private async fetchProductsFromCommercePlatform(
    workspaceId: string,
    platform: string,
  ): Promise<any[]> {
    // In a real implementation, this would fetch from Shopify/WooCommerce/BigCommerce
    this.logger.log(`Fetching products from ${platform} for workspace ${workspaceId}`);

    return [];
  }

  /**
   * Sync products to Instagram Shop
   */
  private async syncProductsToInstagram(
    accountId: string,
    accessToken: string,
    products: any[],
  ): Promise<number> {
    // In a real implementation, this would call Instagram Graph API
    // to create/update products in Instagram Shop
    this.logger.log(`Syncing ${products.length} products to Instagram account ${accountId}`);

    return products.length;
  }
}
