import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversionType } from '@prisma/client';

@Injectable()
export class CommerceAnalyticsService {
  private readonly logger = new Logger(CommerceAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(workspaceId: string, query: any) {
    const where: any = { workspaceId };

    if (query.platform) where.platform = query.platform;
    if (query.accountId) where.accountId = query.accountId;
    if (query.productId) where.productId = query.productId;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const analytics = await this.prisma.commerceAnalytics.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            primaryImage: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Aggregate totals
    const totals = analytics.reduce(
      (acc, item) => ({
        totalClicks: acc.totalClicks + item.totalClicks,
        totalViews: acc.totalViews + item.totalViews,
        addToCartCount: acc.addToCartCount + item.addToCartCount,
        purchaseCount: acc.purchaseCount + item.purchaseCount,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
      }),
      {
        totalClicks: 0,
        totalViews: 0,
        addToCartCount: 0,
        purchaseCount: 0,
        totalRevenue: 0,
      },
    );

    return {
      analytics,
      totals,
      averageOrderValue: totals.purchaseCount > 0 ? totals.totalRevenue / totals.purchaseCount : 0,
      overallConversionRate: totals.totalClicks > 0 ? (totals.purchaseCount / totals.totalClicks) * 100 : 0,
    };
  }

  async getTopProducts(workspaceId: string, query: any) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const where: any = {
      workspaceId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.platform) where.platform = query.platform;

    const products = await this.prisma.commerceAnalytics.groupBy({
      by: ['productId'],
      where,
      _sum: {
        totalRevenue: true,
        purchaseCount: true,
        totalClicks: true,
      },
      orderBy: {
        _sum: {
          totalRevenue: 'desc',
        },
      },
      take: query.limit || 10,
    });

    // Fetch product details
    const productIds = products.map((p) => p.productId).filter(Boolean);
    const productDetails = await this.prisma.product.findMany({
      where: { id: { in: productIds as string[] } },
      select: {
        id: true,
        name: true,
        price: true,
        primaryImage: true,
      },
    });

    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    return products.map((p) => ({
      product: productMap.get(p.productId as string),
      revenue: p._sum.totalRevenue || 0,
      units: p._sum.purchaseCount || 0,
      clicks: p._sum.totalClicks || 0,
      conversionRate: p._sum.totalClicks ? ((p._sum.purchaseCount || 0) / p._sum.totalClicks) * 100 : 0,
    }));
  }

  async aggregateDailyAnalytics(workspaceId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conversions = await this.prisma.commerceConversion.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Group by platform, account, and product
    const groups = new Map<string, any>();

    for (const conversion of conversions) {
      const key = `${conversion.platform || 'none'}-${conversion.accountId || 'none'}-${conversion.productId || 'none'}`;

      if (!groups.has(key)) {
        groups.set(key, {
          platform: conversion.platform,
          accountId: conversion.accountId,
          productId: conversion.productId,
          totalClicks: 0,
          totalViews: 0,
          addToCartCount: 0,
          checkoutCount: 0,
          purchaseCount: 0,
          totalRevenue: 0,
        });
      }

      const group = groups.get(key);

      switch (conversion.conversionType) {
        case ConversionType.CLICK:
          group.totalClicks++;
          break;
        case ConversionType.VIEW:
          group.totalViews++;
          break;
        case ConversionType.ADD_TO_CART:
          group.addToCartCount++;
          break;
        case ConversionType.INITIATE_CHECKOUT:
          group.checkoutCount++;
          break;
        case ConversionType.PURCHASE:
          group.purchaseCount++;
          group.totalRevenue += conversion.orderValue;
          break;
      }
    }

    // Upsert analytics records
    for (const [, data] of groups) {
      const conversionRates = {
        clickToViewRate: data.totalClicks > 0 ? (data.totalViews / data.totalClicks) * 100 : 0,
        viewToCartRate: data.totalViews > 0 ? (data.addToCartCount / data.totalViews) * 100 : 0,
        cartToCheckoutRate: data.addToCartCount > 0 ? (data.checkoutCount / data.addToCartCount) * 100 : 0,
        checkoutToPurchaseRate: data.checkoutCount > 0 ? (data.purchaseCount / data.checkoutCount) * 100 : 0,
        overallConversionRate: data.totalClicks > 0 ? (data.purchaseCount / data.totalClicks) * 100 : 0,
      };

      await this.prisma.commerceAnalytics.upsert({
        where: {
          workspaceId_date_platform_accountId_productId: {
            workspaceId,
            date: startOfDay,
            platform: data.platform,
            accountId: data.accountId,
            productId: data.productId,
          },
        },
        create: {
          workspaceId,
          date: startOfDay,
          platform: data.platform,
          accountId: data.accountId,
          productId: data.productId,
          ...data,
          ...conversionRates,
          averageOrderValue: data.purchaseCount > 0 ? data.totalRevenue / data.purchaseCount : 0,
        },
        update: {
          ...data,
          ...conversionRates,
          averageOrderValue: data.purchaseCount > 0 ? data.totalRevenue / data.purchaseCount : 0,
        },
      });
    }

    this.logger.log(`Aggregated commerce analytics for ${date.toISOString().split('T')[0]}`);
  }
}
