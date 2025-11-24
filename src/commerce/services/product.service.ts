import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IntegrationService } from './integration.service';
import { ShopifyConnector } from '../connectors/shopify.connector';
import { WooCommerceConnector } from '../connectors/woocommerce.connector';
import { BigCommerceConnector } from '../connectors/bigcommerce.connector';
import { CommercePlatform } from '@prisma/client';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationService: IntegrationService,
    private readonly shopifyConnector: ShopifyConnector,
    private readonly woocommerceConnector: WooCommerceConnector,
    private readonly bigcommerceConnector: BigCommerceConnector,
  ) {}

  private getConnector(platform: CommercePlatform) {
    switch (platform) {
      case CommercePlatform.SHOPIFY:
        return this.shopifyConnector;
      case CommercePlatform.WOOCOMMERCE:
        return this.woocommerceConnector;
      case CommercePlatform.BIGCOMMERCE:
        return this.bigcommerceConnector;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async syncProducts(
    integrationId: string,
    workspaceId: string,
    options?: { fullSync?: boolean; cursor?: string },
  ) {
    const integration = await this.integrationService.getIntegration(integrationId, workspaceId);
    const credentials = await this.integrationService.getDecryptedCredentials(integrationId, workspaceId);
    const connector = this.getConnector(integration.platform);

    try {
      const result = await connector.syncProducts(credentials, options);

      // Upsert products
      for (const productData of result.products) {
        await this.prisma.product.upsert({
          where: {
            integrationId_platformProductId: {
              integrationId,
              platformProductId: productData.platformProductId,
            },
          },
          create: {
            ...productData,
            integrationId,
            workspaceId,
            variants: {
              create: productData.variants || [],
            },
          },
          update: {
            ...productData,
            lastSyncedAt: new Date(),
            variants: {
              deleteMany: {},
              create: productData.variants || [],
            },
          },
        });
      }

      // Update integration sync status
      await this.prisma.commerceIntegration.update({
        where: { id: integrationId },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'success',
          lastSyncError: null,
        },
      });

      this.logger.log(`Synced ${result.products.length} products for integration ${integrationId}`);

      return {
        syncedCount: result.products.length,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      };
    } catch (error) {
      await this.prisma.commerceIntegration.update({
        where: { id: integrationId },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'failed',
          lastSyncError: error.message,
        },
      });

      this.logger.error(`Failed to sync products for integration ${integrationId}`, error);
      throw error;
    }
  }

  async getProducts(workspaceId: string, query: any) {
    const where: any = { workspaceId };

    if (query.integrationId) where.integrationId = query.integrationId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.tags) where.tags = { hasSome: query.tags };
    if (query.inStock !== undefined) where.inStock = query.inStock;
    if (query.minPrice) where.price = { ...where.price, gte: query.minPrice };
    if (query.maxPrice) where.price = { ...where.price, lte: query.maxPrice };
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: true,
          integration: {
            select: {
              platform: true,
              storeName: true,
            },
          },
        },
        take: query.limit || 50,
        skip: query.offset || 0,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'asc' } : { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async getProduct(productId: string, workspaceId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
      include: {
        variants: true,
        integration: true,
        postTags: {
          include: {
            post: {
              select: {
                id: true,
                content: true,
                status: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async tagProductInPost(
    workspaceId: string,
    data: {
      postId: string;
      productId: string;
      mediaIndex?: number;
      xPosition?: number;
      yPosition?: number;
    },
  ) {
    // Verify product belongs to workspace
    const product = await this.getProduct(data.productId, workspaceId);

    // Verify post belongs to workspace
    const post = await this.prisma.post.findFirst({
      where: { id: data.postId, workspaceId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.productPostTag.create({
      data: {
        postId: data.postId,
        productId: data.productId,
        mediaIndex: data.mediaIndex,
        xPosition: data.xPosition,
        yPosition: data.yPosition,
      },
    });
  }

  async removeProductTag(tagId: string, workspaceId: string) {
    const tag = await this.prisma.productPostTag.findFirst({
      where: {
        id: tagId,
        post: { workspaceId },
      },
    });

    if (!tag) {
      throw new NotFoundException('Product tag not found');
    }

    await this.prisma.productPostTag.delete({
      where: { id: tagId },
    });
  }
}
