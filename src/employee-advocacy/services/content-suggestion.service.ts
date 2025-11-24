import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentSuggestionService {
  constructor(private prisma: PrismaService) {}

  async generateSuggestions(employeeId: string) {
    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: {
        shares: {
          take: 20,
          orderBy: {
            sharedAt: 'desc',
          },
          include: {
            content: {
              select: {
                category: true,
                tags: true,
                targetPlatforms: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return [];
    }

    // Get approved content
    const availableContent = await this.prisma.advocacyContent.findMany({
      where: {
        workspaceId: employee.workspaceId,
        isApproved: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    // Filter out already shared content
    const sharedContentIds = new Set(employee.shares.map(s => s.contentId));
    const unsharedContent = availableContent.filter(c => !sharedContentIds.has(c.id));

    // Calculate relevance scores
    const suggestions = unsharedContent.map(content => {
      let relevanceScore = 0.5; // Base score

      // Match interests
      if (employee.interests && employee.interests.length > 0) {
        const contentTags = [...(content.tags || []), content.category].filter(Boolean);
        const matchingInterests = employee.interests.filter((interest: any) =>
          contentTags.some((tag: any) => tag && tag.toLowerCase().includes(interest.toLowerCase())),
        );
        relevanceScore += matchingInterests.length * 0.1;
      }

      // Match preferred platforms
      if (employee.preferredPlatforms && employee.preferredPlatforms.length > 0) {
        const matchingPlatforms = content.targetPlatforms.filter(platform =>
          employee.preferredPlatforms.includes(platform),
        );
        relevanceScore += matchingPlatforms.length * 0.05;
      }

      // Boost newer content
      const daysSinceCreated = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        relevanceScore += 0.2;
      }

      // Boost popular content
      if (content.shareCount > 10) {
        relevanceScore += 0.1;
      }

      // Cap at 1.0
      relevanceScore = Math.min(1.0, relevanceScore);

      return {
        content,
        relevanceScore,
        reason: this.generateReason(content, employee, relevanceScore),
      };
    });

    // Sort by relevance and take top suggestions
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topSuggestions = suggestions.slice(0, 10);

    // Save suggestions
    const savedSuggestions = await Promise.all(
      topSuggestions.map(suggestion =>
        this.prisma.contentSuggestion.create({
          data: {
            employeeId,
            contentId: suggestion.content.id,
            reason: suggestion.reason,
            relevanceScore: suggestion.relevanceScore,
          },
          include: {
            content: true,
          },
        }),
      ),
    );

    return savedSuggestions;
  }

  async getSuggestions(employeeId: string, status?: string) {
    return this.prisma.contentSuggestion.findMany({
      where: {
        employeeId,
        ...(status && { status: status as any }),
      },
      include: {
        content: true,
      },
      orderBy: {
        relevanceScore: 'desc',
      },
    });
  }

  async markViewed(suggestionId: string) {
    return this.prisma.contentSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'VIEWED',
        viewedAt: new Date(),
      },
    });
  }

  async markShared(suggestionId: string) {
    return this.prisma.contentSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'SHARED',
        sharedAt: new Date(),
      },
    });
  }

  async markDismissed(suggestionId: string) {
    return this.prisma.contentSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
      },
    });
  }

  async clearOldSuggestions(employeeId: string) {
    // Delete suggestions older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.contentSuggestion.deleteMany({
      where: {
        employeeId,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
  }

  private generateReason(content: any, employee: any, score: number): string {
    const reasons = [];

    if (employee.interests && employee.interests.length > 0) {
      const contentTags = [...(content.tags || []), content.category].filter(Boolean);
      const matchingInterests = employee.interests.filter(interest =>
        contentTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())),
      );
      if (matchingInterests.length > 0) {
        reasons.push(`Matches your interests: ${matchingInterests.join(', ')}`);
      }
    }

    if (employee.preferredPlatforms && employee.preferredPlatforms.length > 0) {
      const matchingPlatforms = content.targetPlatforms.filter((platform: any) =>
        employee.preferredPlatforms.includes(platform),
      );
      if (matchingPlatforms.length > 0) {
        reasons.push(`Available on your preferred platforms`);
      }
    }

    const daysSinceCreated = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) {
      reasons.push('New content');
    }

    if (content.shareCount > 10) {
      reasons.push(`Popular with ${content.shareCount} shares`);
    }

    if (reasons.length === 0) {
      reasons.push('Recommended for you');
    }

    return reasons.join(' • ');
  }
}
