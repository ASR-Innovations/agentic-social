import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from './services/product.service';
import { IntegrationService } from './services/integration.service';
import { ConversionTrackingService } from './services/conversion-tracking.service';
import { CommerceAnalyticsService } from './services/commerce-analytics.service';
import { ShoppablePostStatus } from '@prisma/client';

@Injectable()
export class CommerceService {
  private readonly logger = new Logger(CommerceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly integrationService: IntegrationService,
    private readonly conversionTrackingService: ConversionTrackingService,
    private readonly commerceAnalyticsService: CommerceAnalyticsService,
  ) {}

  async createShoppablePost(
    workspaceId: string,
    data: {
      postId: string;
      productTags: Array<{
        productId: string;
        mediaIndex?: number;
        xPosition?: number;
        yPosition?: number;
      }>;
      catalogId?: string;
    },
  ) {
    // Verify post exists
    const post = await this.prisma.post.findFirst({
      where: { id: data.postId, workspaceId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Create product tags
    for (const tag of data.productTags) {
      await this.productService.tagProductInPost(workspaceId, {
        postId: data.postId,
        productId: tag.productId,
        mediaIndex: tag.mediaIndex,
        xPosition: tag.xPosition,
        yPosition: tag.yPosition,
      });
    }

    // Create shoppable post record
    const shoppablePost = await this.prisma.shoppablePost.create({
      data: {
        workspaceId,
        postId: data.postId,
        catalogId: data.catalogId,
        status: ShoppablePostStatus.PENDING,
      },
      include: {
        post: {
          include: {
            productTags: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Created shoppable post for post ${data.postId}`);

    return shoppablePost;
  }

  async getShoppablePost(postId: string, workspaceId: string) {
    const shoppablePost = await this.prisma.shoppablePost.findFirst({
      where: {
        postId,
        workspaceId,
      },
      include: {
        post: {
          include: {
            productTags: {
              include: {
                product: {
                  include: {
                    integration: {
                      select: {
                        platform: true,
                        storeName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shoppablePost) {
      throw new NotFoundException('Shoppable post not found');
    }

    return shoppablePost;
  }

  async updateShoppablePostStatus(
    postId: string,
    workspaceId: string,
    status: ShoppablePostStatus,
    platformShoppableIds?: Record<string, string>,
  ) {
    const shoppablePost = await this.getShoppablePost(postId, workspaceId);

    return this.prisma.shoppablePost.update({
      where: { id: shoppablePost.id },
      data: {
        status,
        platformShoppableIds: platformShoppableIds as any,
      },
    });
  }

  async getCommerceOverview(workspaceId: string, filters: any) {
    const [integrations, products, conversions, analytics] = await Promise.all([
      this.integrationService.getIntegrations(workspaceId),
      this.prisma.product.count({ where: { workspaceId, isActive: true } }),
      this.conversionTrackingService.getConversionFunnel(workspaceId, filters),
      this.commerceAnalyticsService.getTopProducts(workspaceId, filters),
    ]);

    return {
      integrations: {
        total: integrations.length,
        active: integrations.filter((i) => i.isActive).length,
        platforms: integrations.map((i) => ({
          platform: i.platform,
          storeName: i.storeName,
          productCount: i._count.products,
        })),
      },
      products: {
        total: products,
      },
      conversions,
      topProducts: analytics,
    };
  }
}
