import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewTemplateDto, UpdateReviewTemplateDto } from '../dto/create-review-template.dto';

@Injectable()
export class ReviewTemplateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review template
   */
  async create(workspaceId: string, userId: string, dto: CreateReviewTemplateDto) {
    return this.prisma.reviewTemplate.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        content: dto.content,
        category: dto.category,
        sentiment: dto.sentiment,
        ratingRange: dto.ratingRange,
        variables: dto.variables || [],
        tags: dto.tags || [],
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        createdBy: userId,
      },
    });
  }

  /**
   * Find all templates for a workspace
   */
  async findAll(workspaceId: string, filters?: {
    category?: string;
    sentiment?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = { workspaceId };

    if (filters?.category) where.category = filters.category;
    if (filters?.sentiment) where.sentiment = filters.sentiment;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.reviewTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find a single template
   */
  async findOne(workspaceId: string, id: string) {
    const template = await this.prisma.reviewTemplate.findFirst({
      where: { id, workspaceId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(workspaceId: string, id: string, dto: UpdateReviewTemplateDto) {
    const template = await this.findOne(workspaceId, id);

    return this.prisma.reviewTemplate.update({
      where: { id: template.id },
      data: dto,
    });
  }

  /**
   * Delete a template
   */
  async remove(workspaceId: string, id: string) {
    const template = await this.findOne(workspaceId, id);

    await this.prisma.reviewTemplate.delete({
      where: { id: template.id },
    });

    return { message: 'Template deleted successfully' };
  }

  /**
   * Get suggested templates for a review
   */
  async getSuggestedTemplates(workspaceId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, workspaceId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Find templates matching the review's sentiment
    const where: any = {
      workspaceId,
      sentiment: review.sentiment,
      isActive: true,
    };

    // Filter by rating range if specified
    const templates = await this.prisma.reviewTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' },
      take: 5,
    });

    // Filter templates by rating range
    return templates.filter(template => {
      if (!template.ratingRange) return true;

      const rating = review.rating;
      
      // Parse rating range (e.g., "1-2", "3", "4-5")
      if (template.ratingRange.includes('-')) {
        const [min, max] = template.ratingRange.split('-').map(Number);
        return rating >= min && rating <= max;
      } else {
        return rating === Number(template.ratingRange);
      }
    });
  }

  /**
   * Create default templates for a workspace
   */
  async createDefaultTemplates(workspaceId: string, userId: string) {
    const defaultTemplates = [
      {
        name: 'Thank You - Positive Review',
        description: 'Standard thank you response for positive reviews',
        content: 'Thank you so much for your wonderful review, {{reviewer_name}}! We\'re thrilled to hear you had a great experience. We look forward to serving you again soon!',
        category: 'THANK_YOU',
        sentiment: 'POSITIVE',
        ratingRange: '4-5',
        variables: ['reviewer_name'],
      },
      {
        name: 'Apology - Negative Review',
        description: 'Sincere apology for negative experiences',
        content: 'We\'re truly sorry to hear about your experience, {{reviewer_name}}. This is not the level of service we strive to provide. We would love the opportunity to make this right. Please contact us at {{contact_email}} so we can address your concerns.',
        category: 'APOLOGY',
        sentiment: 'NEGATIVE',
        ratingRange: '1-2',
        variables: ['reviewer_name', 'contact_email'],
      },
      {
        name: 'Clarification - Neutral Review',
        description: 'Response to neutral reviews seeking clarification',
        content: 'Thank you for your feedback, {{reviewer_name}}. We appreciate you taking the time to share your thoughts. If there\'s anything specific we can improve or if you have any questions, please don\'t hesitate to reach out.',
        category: 'CLARIFICATION',
        sentiment: 'NEUTRAL',
        ratingRange: '3',
        variables: ['reviewer_name'],
      },
      {
        name: 'Resolution Offer',
        description: 'Offering to resolve an issue',
        content: 'Hi {{reviewer_name}}, we sincerely apologize for the inconvenience. We\'d like to make this right. Please contact our customer service team at {{contact_email}} or {{contact_phone}}, and we\'ll work to resolve this issue immediately.',
        category: 'RESOLUTION',
        sentiment: 'NEGATIVE',
        variables: ['reviewer_name', 'contact_email', 'contact_phone'],
      },
    ];

    const created = await Promise.all(
      defaultTemplates.map(template =>
        this.prisma.reviewTemplate.create({
          data: {
            ...template,
            workspaceId,
            createdBy: userId,
          } as any,
        }),
      ),
    );

    return created;
  }
}
