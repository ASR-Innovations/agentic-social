import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdvocacyContentDto, UpdateAdvocacyContentDto, QueryContentDto, ApproveContentDto } from '../dto';

@Injectable()
export class AdvocacyContentService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateAdvocacyContentDto) {
    return this.prisma.advocacyContent.create({
      data: {
        workspaceId,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        mediaUrls: dto.mediaUrls || [],
        hashtags: dto.hashtags || [],
        targetPlatforms: dto.targetPlatforms,
        category: dto.category,
        tags: dto.tags || [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        allowModification: dto.allowModification || false,
        requiredDisclaimer: dto.requiredDisclaimer,
        metadata: dto.metadata,
      },
    });
  }

  async findAll(workspaceId: string, query: QueryContentDto) {
    const { page = 1, limit = 20, category, isApproved, tags, platforms, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId,
      ...(category && { category }),
      ...(isApproved !== undefined && { isApproved }),
      ...(tags && tags.length > 0 && {
        tags: {
          hasSome: tags,
        },
      }),
      ...(platforms && platforms.length > 0 && {
        targetPlatforms: {
          hasSome: platforms,
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.advocacyContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              shares: true,
            },
          },
        },
      }),
      this.prisma.advocacyContent.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findApproved(workspaceId: string, query: QueryContentDto) {
    return this.findAll(workspaceId, { ...query, isApproved: true });
  }

  async findOne(workspaceId: string, id: string) {
    const content = await this.prisma.advocacyContent.findFirst({
      where: { id, workspaceId },
      include: {
        shares: {
          take: 10,
          orderBy: {
            sharedAt: 'desc',
          },
          include: {
            employee: {
              select: {
                id: true,
                displayName: true,
                user: {
                  select: {
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            shares: true,
            suggestions: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }

  async update(workspaceId: string, id: string, dto: UpdateAdvocacyContentDto) {
    const content = await this.findOne(workspaceId, id);

    return this.prisma.advocacyContent.update({
      where: { id: content.id },
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        mediaUrls: dto.mediaUrls,
        hashtags: dto.hashtags,
        targetPlatforms: dto.targetPlatforms,
        category: dto.category,
        tags: dto.tags,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        allowModification: dto.allowModification,
        requiredDisclaimer: dto.requiredDisclaimer,
        metadata: dto.metadata,
      },
    });
  }

  async approve(workspaceId: string, id: string, userId: string, dto: ApproveContentDto) {
    const content = await this.findOne(workspaceId, id);

    return this.prisma.advocacyContent.update({
      where: { id: content.id },
      data: {
        isApproved: dto.isApproved,
        approvedBy: dto.isApproved ? userId : null,
        approvedAt: dto.isApproved ? new Date() : null,
      },
    });
  }

  async delete(workspaceId: string, id: string) {
    const content = await this.findOne(workspaceId, id);

    return this.prisma.advocacyContent.delete({
      where: { id: content.id },
    });
  }

  async incrementShareCount(contentId: string) {
    return this.prisma.advocacyContent.update({
      where: { id: contentId },
      data: {
        shareCount: { increment: 1 },
      },
    });
  }

  async updateMetrics(contentId: string, metrics: {
    reach?: number;
    engagement?: number;
  }) {
    return this.prisma.advocacyContent.update({
      where: { id: contentId },
      data: {
        ...(metrics.reach !== undefined && {
          totalReach: { increment: metrics.reach },
        }),
        ...(metrics.engagement !== undefined && {
          totalEngagement: { increment: metrics.engagement },
        }),
      },
    });
  }

  async getCategories(workspaceId: string) {
    const contents = await this.prisma.advocacyContent.findMany({
      where: { workspaceId, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });

    return contents.map(c => c.category).filter(Boolean);
  }

  async getTags(workspaceId: string) {
    const contents = await this.prisma.advocacyContent.findMany({
      where: { workspaceId },
      select: { tags: true },
    });

    const allTags = contents.flatMap(c => c.tags);
    return [...new Set(allTags)];
  }
}
