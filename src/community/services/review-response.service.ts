import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewResponseDto } from '../dto/create-review-response.dto';

@Injectable()
export class ReviewResponseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a response to a review
   */
  async createResponse(workspaceId: string, userId: string, dto: CreateReviewResponseDto) {
    // Verify review exists and belongs to workspace
    const review = await this.prisma.review.findFirst({
      where: {
        id: dto.reviewId,
        workspaceId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if review already has a published response
    const existingResponse = await this.prisma.reviewResponse.findFirst({
      where: {
        reviewId: dto.reviewId,
        status: 'PUBLISHED',
      },
    });

    if (existingResponse) {
      throw new BadRequestException('Review already has a published response');
    }

    // Create response
    const response = await this.prisma.reviewResponse.create({
      data: {
        reviewId: dto.reviewId,
        content: dto.content,
        templateId: dto.templateId,
        status: dto.requiresApproval ? 'PENDING_APPROVAL' : 'DRAFT',
        requiresApproval: dto.requiresApproval || false,
        createdBy: userId,
      },
    });

    // If publish immediately and no approval required
    if (dto.publishImmediately && !dto.requiresApproval) {
      return this.publishResponse(response.id, userId);
    }

    return response;
  }

  /**
   * Publish a response
   */
  async publishResponse(responseId: string, userId: string) {
    const response = await this.prisma.reviewResponse.findUnique({
      where: { id: responseId },
      include: { review: true },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status === 'PUBLISHED') {
      throw new BadRequestException('Response already published');
    }

    if (response.requiresApproval && response.status !== 'APPROVED') {
      throw new BadRequestException('Response requires approval before publishing');
    }

    // In production, this would call the platform API to post the response
    // For now, we'll just update the status
    const publishedResponse = await this.prisma.reviewResponse.update({
      where: { id: responseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        platformResponseId: `mock_${Date.now()}`, // Would be real ID from platform
      },
    });

    // Update review to mark as responded
    await this.prisma.review.update({
      where: { id: response.reviewId },
      data: {
        hasResponse: true,
        responseText: response.content,
        responseDate: new Date(),
        respondedBy: userId,
        status: 'RESPONDED',
      },
    });

    return publishedResponse;
  }

  /**
   * Approve a response
   */
  async approveResponse(responseId: string, userId: string) {
    const response = await this.prisma.reviewResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Response is not pending approval');
    }

    return this.prisma.reviewResponse.update({
      where: { id: responseId },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Get responses for a review
   */
  async getResponsesForReview(reviewId: string) {
    return this.prisma.reviewResponse.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a response
   */
  async updateResponse(responseId: string, content: string) {
    const response = await this.prisma.reviewResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot update published response');
    }

    return this.prisma.reviewResponse.update({
      where: { id: responseId },
      data: { content },
    });
  }

  /**
   * Delete a response
   */
  async deleteResponse(responseId: string) {
    const response = await this.prisma.reviewResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot delete published response');
    }

    await this.prisma.reviewResponse.delete({
      where: { id: responseId },
    });

    return { message: 'Response deleted successfully' };
  }

  /**
   * Generate response using template
   */
  async generateFromTemplate(
    templateId: string,
    reviewId: string,
    variables?: Record<string, string>,
  ) {
    const [template, review] = await Promise.all([
      this.prisma.reviewTemplate.findUnique({
        where: { id: templateId },
      }),
      this.prisma.review.findUnique({
        where: { id: reviewId },
      }),
    ]);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Replace template variables
    let content = template.content;

    // Default variables
    const defaultVariables: Record<string, string> = {
      reviewer_name: review.reviewerName,
      rating: review.rating.toString(),
      location: review.locationName || '',
    };

    const allVariables = { ...defaultVariables, ...variables };

    // Replace all variables in format {{variable_name}}
    Object.entries(allVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });

    // Update template usage
    await this.prisma.reviewTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return { content, templateId };
  }
}
