import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review
   */
  async create(workspaceId: string, dto: CreateReviewDto) {
    // Check if review already exists
    const existing = await this.prisma.review.findUnique({
      where: {
        platform_platformReviewId: {
          platform: dto.platform,
          platformReviewId: dto.platformReviewId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Review already exists');
    }

    return this.prisma.review.create({
      data: {
        workspaceId,
        platform: dto.platform,
        platformReviewId: dto.platformReviewId,
        locationId: dto.locationId,
        locationName: dto.locationName,
        reviewerName: dto.reviewerName,
        reviewerAvatar: dto.reviewerAvatar,
        reviewerProfile: dto.reviewerProfile,
        rating: dto.rating,
        title: dto.title,
        content: dto.content,
        isVerified: dto.isVerified || false,
        tags: dto.tags || [],
        publishedAt: new Date(dto.publishedAt),
      },
    });
  }

  /**
   * Find reviews with filters and pagination
   */
  async findAll(workspaceId: string, query: QueryReviewsDto) {
    const {
      platform,
      status,
      sentiment,
      minRating,
      maxRating,
      locationId,
      assignedTo,
      startDate,
      endDate,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = query;

    const where: any = { workspaceId };

    if (platform) where.platform = platform;
    if (status) where.status = status;
    if (sentiment) where.sentiment = sentiment;
    if (locationId) where.locationId = locationId;
    if (assignedTo) where.assignedTo = assignedTo;

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    if (startDate || endDate) {
      where.publishedAt = {};
      if (startDate) where.publishedAt.gte = new Date(startDate);
      if (endDate) where.publishedAt.lte = new Date(endDate);
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { reviewerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single review by ID
   */
  async findOne(workspaceId: string, id: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, workspaceId },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
        },
        alerts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Update a review
   */
  async update(workspaceId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.findOne(workspaceId, id);

    return this.prisma.review.update({
      where: { id: review.id },
      data: dto,
    });
  }

  /**
   * Delete a review
   */
  async remove(workspaceId: string, id: string) {
    const review = await this.findOne(workspaceId, id);

    await this.prisma.review.delete({
      where: { id: review.id },
    });

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get review statistics
   */
  async getStatistics(workspaceId: string, filters?: {
    platform?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { workspaceId };

    if (filters?.platform) where.platform = filters.platform;
    if (filters?.locationId) where.locationId = filters.locationId;

    if (filters?.startDate || filters?.endDate) {
      where.publishedAt = {};
      if (filters.startDate) where.publishedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.publishedAt.lte = new Date(filters.endDate);
    }

    const [
      total,
      averageRating,
      sentimentCounts,
      statusCounts,
      responseRate,
    ] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['sentiment'],
        where,
        _count: true,
      }),
      this.prisma.review.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.getResponseRate(where),
    ]);

    const sentimentBreakdown = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
    };

    sentimentCounts.forEach((item) => {
      sentimentBreakdown[item.sentiment] = item._count;
    });

    const statusBreakdown = {};
    statusCounts.forEach((item) => {
      statusBreakdown[item.status] = item._count;
    });

    return {
      total,
      averageRating: averageRating._avg.rating || 0,
      sentimentBreakdown,
      statusBreakdown,
      responseRate,
    };
  }

  /**
   * Calculate response rate
   */
  private async getResponseRate(where: any): Promise<number> {
    const [total, responded] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.count({
        where: { ...where, hasResponse: true },
      }),
    ]);

    return total > 0 ? (responded / total) * 100 : 0;
  }

  /**
   * Bulk update reviews
   */
  async bulkUpdate(
    workspaceId: string,
    reviewIds: string[],
    updates: UpdateReviewDto,
  ) {
    // Verify all reviews belong to workspace
    const reviews = await this.prisma.review.findMany({
      where: {
        id: { in: reviewIds },
        workspaceId,
      },
      select: { id: true },
    });

    if (reviews.length !== reviewIds.length) {
      throw new BadRequestException('Some reviews not found or do not belong to workspace');
    }

    await this.prisma.review.updateMany({
      where: {
        id: { in: reviewIds },
        workspaceId,
      },
      data: updates,
    });

    return { message: `${reviews.length} reviews updated successfully` };
  }
}
