import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversionType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ConversionTrackingService {
  private readonly logger = new Logger(ConversionTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  async trackConversion(workspaceId: string, data: any) {
    const conversionData: any = {
      workspaceId,
      conversionType: data.conversionType,
      orderValue: data.orderValue,
      currency: data.currency || 'USD',
      quantity: data.quantity || 1,
    };

    if (data.postId) conversionData.postId = data.postId;
    if (data.productId) conversionData.productId = data.productId;
    if (data.platform) conversionData.platform = data.platform;
    if (data.accountId) conversionData.accountId = data.accountId;
    if (data.customerId) conversionData.customerId = data.customerId;
    if (data.customerEmail) conversionData.customerEmail = this.hashEmail(data.customerEmail);
    if (data.orderId) conversionData.orderId = data.orderId;
    if (data.productsSold) conversionData.productsSold = data.productsSold;
    if (data.utmSource) conversionData.utmSource = data.utmSource;
    if (data.utmMedium) conversionData.utmMedium = data.utmMedium;
    if (data.utmCampaign) conversionData.utmCampaign = data.utmCampaign;
    if (data.utmContent) conversionData.utmContent = data.utmContent;
    if (data.utmTerm) conversionData.utmTerm = data.utmTerm;
    if (data.referrerUrl) conversionData.referrerUrl = data.referrerUrl;
    if (data.landingPage) conversionData.landingPage = data.landingPage;
    if (data.clickedAt) conversionData.clickedAt = new Date(data.clickedAt);
    if (data.addedToCartAt) conversionData.addedToCartAt = new Date(data.addedToCartAt);
    if (data.purchasedAt) conversionData.purchasedAt = new Date(data.purchasedAt);
    if (data.deviceType) conversionData.deviceType = data.deviceType;
    if (data.location) conversionData.location = data.location;

    // Calculate conversion funnel timing
    if (data.clickedAt && data.addedToCartAt) {
      const clickTime = new Date(data.clickedAt).getTime();
      const cartTime = new Date(data.addedToCartAt).getTime();
      conversionData.timeToCart = Math.floor((cartTime - clickTime) / 1000);
    }

    if (data.clickedAt && data.purchasedAt) {
      const clickTime = new Date(data.clickedAt).getTime();
      const purchaseTime = new Date(data.purchasedAt).getTime();
      conversionData.timeToPurchase = Math.floor((purchaseTime - clickTime) / 1000);
    }

    const conversion = await this.prisma.commerceConversion.create({
      data: conversionData,
    });

    this.logger.log(`Tracked ${data.conversionType} conversion for workspace ${workspaceId}`);

    return conversion;
  }

  async getConversions(workspaceId: string, filters: any) {
    const where: any = { workspaceId };

    if (filters.postId) where.postId = filters.postId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.platform) where.platform = filters.platform;
    if (filters.conversionType) where.conversionType = filters.conversionType;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.commerceConversion.findMany({
      where,
      include: {
        post: {
          select: {
            id: true,
            content: true,
            publishedAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            primaryImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }

  async getConversionFunnel(workspaceId: string, filters: any) {
    const where: any = { workspaceId };

    if (filters.postId) where.postId = filters.postId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.platform) where.platform = filters.platform;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [clicks, views, addToCarts, checkouts, purchases] = await Promise.all([
      this.prisma.commerceConversion.count({
        where: { ...where, conversionType: ConversionType.CLICK },
      }),
      this.prisma.commerceConversion.count({
        where: { ...where, conversionType: ConversionType.VIEW },
      }),
      this.prisma.commerceConversion.count({
        where: { ...where, conversionType: ConversionType.ADD_TO_CART },
      }),
      this.prisma.commerceConversion.count({
        where: { ...where, conversionType: ConversionType.INITIATE_CHECKOUT },
      }),
      this.prisma.commerceConversion.count({
        where: { ...where, conversionType: ConversionType.PURCHASE },
      }),
    ]);

    const totalRevenue = await this.prisma.commerceConversion.aggregate({
      where: { ...where, conversionType: ConversionType.PURCHASE },
      _sum: { orderValue: true },
    });

    return {
      clicks,
      views,
      addToCarts,
      checkouts,
      purchases,
      totalRevenue: totalRevenue._sum.orderValue || 0,
      conversionRates: {
        clickToView: clicks > 0 ? (views / clicks) * 100 : 0,
        viewToCart: views > 0 ? (addToCarts / views) * 100 : 0,
        cartToCheckout: addToCarts > 0 ? (checkouts / addToCarts) * 100 : 0,
        checkoutToPurchase: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
        overall: clicks > 0 ? (purchases / clicks) * 100 : 0,
      },
    };
  }
}
