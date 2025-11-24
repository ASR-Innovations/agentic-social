import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform, PostStatus } from '@prisma/client';
import {
  GridPreviewRequestDto,
  GridPreviewResponseDto,
  GridPostDto,
  GridRearrangeDto,
} from '../dto/grid-preview.dto';

/**
 * Service for Instagram grid preview and management
 * Implements visual grid preview with drag-and-drop rearrangement
 */
@Injectable()
export class InstagramGridService {
  private readonly logger = new Logger(InstagramGridService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get Instagram grid preview for an account
   * Shows how posts will appear in the Instagram feed
   */
  async getGridPreview(
    workspaceId: string,
    dto: GridPreviewRequestDto,
  ): Promise<GridPreviewResponseDto> {
    const count = dto.count || 9;

    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Get published and scheduled posts for this account
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        status: {
          in: [PostStatus.PUBLISHED, PostStatus.SCHEDULED],
        },
        platformPosts: {
          some: {
            accountId: dto.accountId,
            platform: Platform.INSTAGRAM,
          },
        },
      },
      include: {
        mediaAssets: {
          include: {
            media: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        platformPosts: {
          where: {
            accountId: dto.accountId,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { scheduledAt: 'desc' },
      ],
      take: count,
    });

    // Transform posts to grid format
    const gridPosts: GridPostDto[] = posts.map((post, index) => {
      const firstMedia = post.mediaAssets[0]?.media;
      const content = post.content as any;

      return {
        id: post.id,
        mediaUrl: firstMedia?.url || '',
        thumbnailUrl: firstMedia?.thumbnailUrl || undefined,
        type: post.mediaAssets.length > 1 ? 'carousel' : (firstMedia?.type.toLowerCase() as any) || 'image',
        position: index,
        dominantColors: this.extractDominantColors(firstMedia?.metadata),
        publishedAt: post.publishedAt || post.scheduledAt || undefined,
      };
    });

    // Analyze aesthetic consistency
    const aestheticAnalysis = await this.analyzeGridAesthetic(gridPosts);

    return {
      posts: gridPosts,
      aestheticScore: aestheticAnalysis.overallScore,
      colorHarmony: aestheticAnalysis.colorHarmony,
      themeConsistency: aestheticAnalysis.themeConsistency,
    };
  }

  /**
   * Rearrange grid posts by updating scheduled times
   * This allows drag-and-drop reordering of scheduled posts
   */
  async rearrangeGrid(
    workspaceId: string,
    dto: GridRearrangeDto,
  ): Promise<GridPreviewResponseDto> {
    // Verify account belongs to workspace
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: dto.accountId,
        workspaceId,
        platform: Platform.INSTAGRAM,
      },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    // Get all posts in the new order
    const posts = await this.prisma.post.findMany({
      where: {
        id: { in: dto.postOrder },
        workspaceId,
        status: PostStatus.SCHEDULED,
      },
      include: {
        platformPosts: {
          where: {
            accountId: dto.accountId,
          },
        },
      },
    });

    // Create a map of post ID to post
    const postMap = new Map(posts.map(p => [p.id, p]));

    // Update scheduled times based on new order
    // Earlier positions get earlier times
    const now = new Date();
    const updates = dto.postOrder.map((postId, index) => {
      const post = postMap.get(postId);
      if (!post) return null;

      // Calculate new scheduled time (1 day apart for each position)
      const newScheduledTime = new Date(now.getTime() + (index * 24 * 60 * 60 * 1000));

      return this.prisma.post.update({
        where: { id: postId },
        data: {
          scheduledAt: newScheduledTime,
        },
      });
    }).filter(Boolean);

    await Promise.all(updates);

    // Return updated grid preview
    return this.getGridPreview(workspaceId, { accountId: dto.accountId, count: dto.postOrder.length });
  }

  /**
   * Analyze aesthetic consistency of grid
   */
  private async analyzeGridAesthetic(posts: GridPostDto[]): Promise<{
    overallScore: number;
    colorHarmony: {
      score: number;
      dominantPalette: string[];
      suggestions: string[];
    };
    themeConsistency: {
      score: number;
      detectedThemes: string[];
      suggestions: string[];
    };
  }> {
    // Extract all colors from posts
    const allColors = posts
      .flatMap(p => p.dominantColors || [])
      .filter(Boolean);

    // Calculate color frequency
    const colorFrequency = new Map<string, number>();
    allColors.forEach(color => {
      colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
    });

    // Get dominant palette (top 5 colors)
    const dominantPalette = Array.from(colorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    // Calculate color harmony score
    const colorHarmonyScore = this.calculateColorHarmony(dominantPalette);

    // Detect themes based on color patterns
    const detectedThemes = this.detectThemes(dominantPalette);

    // Calculate theme consistency
    const themeConsistencyScore = this.calculateThemeConsistency(posts, detectedThemes);

    // Overall score is average of color harmony and theme consistency
    const overallScore = Math.round((colorHarmonyScore + themeConsistencyScore) / 2);

    // Generate suggestions
    const colorSuggestions = this.generateColorSuggestions(colorHarmonyScore, dominantPalette);
    const themeSuggestions = this.generateThemeSuggestions(themeConsistencyScore, detectedThemes);

    return {
      overallScore,
      colorHarmony: {
        score: colorHarmonyScore,
        dominantPalette,
        suggestions: colorSuggestions,
      },
      themeConsistency: {
        score: themeConsistencyScore,
        detectedThemes,
        suggestions: themeSuggestions,
      },
    };
  }

  /**
   * Extract dominant colors from media metadata
   */
  private extractDominantColors(metadata: any): string[] {
    if (!metadata || typeof metadata !== 'object') {
      return [];
    }

    // Check if metadata has dominantColors field
    if (Array.isArray(metadata.dominantColors)) {
      return metadata.dominantColors;
    }

    // Return empty array if no color data
    return [];
  }

  /**
   * Calculate color harmony score (0-100)
   */
  private calculateColorHarmony(palette: string[]): number {
    if (palette.length === 0) return 50;

    // Simple heuristic: more consistent palette = higher score
    // In a real implementation, this would use color theory
    const uniqueColors = new Set(palette).size;
    const consistencyRatio = 1 - (uniqueColors / Math.max(palette.length, 1));

    return Math.round(50 + (consistencyRatio * 50));
  }

  /**
   * Detect themes from color palette
   */
  private detectThemes(palette: string[]): string[] {
    const themes: string[] = [];

    // Simple theme detection based on color patterns
    // In a real implementation, this would use ML/AI
    const hasWarmColors = palette.some(c => 
      c.toLowerCase().includes('red') || 
      c.toLowerCase().includes('orange') || 
      c.toLowerCase().includes('yellow')
    );

    const hasCoolColors = palette.some(c => 
      c.toLowerCase().includes('blue') || 
      c.toLowerCase().includes('green') || 
      c.toLowerCase().includes('purple')
    );

    const hasNeutralColors = palette.some(c => 
      c.toLowerCase().includes('gray') || 
      c.toLowerCase().includes('white') || 
      c.toLowerCase().includes('black')
    );

    if (hasWarmColors && !hasCoolColors) themes.push('warm');
    if (hasCoolColors && !hasWarmColors) themes.push('cool');
    if (hasWarmColors && hasCoolColors) themes.push('vibrant');
    if (hasNeutralColors) themes.push('minimalist');

    return themes.length > 0 ? themes : ['mixed'];
  }

  /**
   * Calculate theme consistency score (0-100)
   */
  private calculateThemeConsistency(posts: GridPostDto[], themes: string[]): number {
    if (posts.length === 0) return 50;

    // Simple heuristic: fewer themes = more consistent
    const themeScore = Math.max(0, 100 - (themes.length * 20));

    return Math.round(themeScore);
  }

  /**
   * Generate color harmony suggestions
   */
  private generateColorSuggestions(score: number, palette: string[]): string[] {
    const suggestions: string[] = [];

    if (score < 60) {
      suggestions.push('Consider using a more consistent color palette across your posts');
      suggestions.push('Try limiting your palette to 3-4 main colors');
    }

    if (palette.length > 6) {
      suggestions.push('Your grid uses many different colors. Consider focusing on a signature palette');
    }

    if (score >= 80) {
      suggestions.push('Great color harmony! Your grid has a cohesive look');
    }

    return suggestions;
  }

  /**
   * Generate theme consistency suggestions
   */
  private generateThemeSuggestions(score: number, themes: string[]): string[] {
    const suggestions: string[] = [];

    if (score < 60) {
      suggestions.push('Your posts show mixed themes. Consider focusing on a consistent aesthetic');
    }

    if (themes.includes('mixed')) {
      suggestions.push('Try establishing a clear visual theme (e.g., minimalist, vibrant, warm tones)');
    }

    if (score >= 80) {
      suggestions.push('Excellent theme consistency! Your grid tells a cohesive visual story');
    }

    return suggestions;
  }
}
