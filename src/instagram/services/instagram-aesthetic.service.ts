import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Platform } from '@prisma/client';
import {
  AnalyzeAestheticDto,
  AestheticScoreDto,
  ColorPaletteDto,
  ColorPaletteResponseDto,
} from '../dto/aesthetic.dto';

/**
 * Service for Instagram aesthetic analysis
 * Provides color palette analysis, theme consistency checking, and visual harmony scoring
 */
@Injectable()
export class InstagramAestheticService {
  private readonly logger = new Logger(InstagramAestheticService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze aesthetic consistency of Instagram account
   */
  async analyzeAesthetic(
    workspaceId: string,
    dto: AnalyzeAestheticDto,
  ): Promise<AestheticScoreDto> {
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

    // Get posts to analyze
    const whereClause: any = {
      workspaceId,
      platformPosts: {
        some: {
          accountId: dto.accountId,
          platform: Platform.INSTAGRAM,
        },
      },
    };

    if (dto.postIds && dto.postIds.length > 0) {
      whereClause.id = { in: dto.postIds };
    }

    const posts = await this.prisma.post.findMany({
      where: whereClause,
      include: {
        mediaAssets: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 12, // Analyze last 12 posts (typical grid view)
    });

    if (posts.length === 0) {
      throw new NotFoundException('No posts found for analysis');
    }

    // Extract color data from all posts
    const colorData = posts.map(post => {
      const media = post.mediaAssets[0]?.media;
      return this.extractColorData(media?.metadata);
    }).filter(Boolean);

    // Analyze color harmony
    const colorHarmonyScore = this.calculateColorHarmonyScore(colorData);

    // Analyze theme consistency
    const themeConsistencyScore = this.calculateThemeConsistencyScore(colorData);

    // Analyze visual balance
    const visualBalanceScore = this.calculateVisualBalanceScore(posts);

    // Calculate overall aesthetic score
    const overallScore = Math.round(
      (colorHarmonyScore + themeConsistencyScore + visualBalanceScore) / 3
    );

    // Extract dominant palette
    const dominantPalette = this.extractDominantPalette(colorData);

    // Detect themes
    const detectedThemes = this.detectThemes(colorData, posts);

    // Generate suggestions
    const suggestions = this.generateSuggestions(
      overallScore,
      colorHarmonyScore,
      themeConsistencyScore,
      visualBalanceScore,
    );

    // Calculate color distribution
    const colorDistribution = this.calculateColorDistribution(colorData);

    return {
      score: overallScore,
      colorHarmony: colorHarmonyScore,
      themeConsistency: themeConsistencyScore,
      visualBalance: visualBalanceScore,
      dominantPalette,
      detectedThemes,
      suggestions,
      colorDistribution,
    };
  }

  /**
   * Extract color palette from a single image
   */
  async extractColorPalette(
    dto: ColorPaletteDto,
  ): Promise<ColorPaletteResponseDto> {
    // In a real implementation, this would use image processing library
    // to extract dominant colors from the image
    this.logger.log(`Extracting color palette from ${dto.mediaUrl}`);

    // Simulated color extraction
    const dominantColors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
    ];

    const colorPercentages = dominantColors.map((color, index) => ({
      color,
      percentage: Math.round((100 / dominantColors.length) * (dominantColors.length - index)),
    }));

    const complementaryColors = this.calculateComplementaryColors(dominantColors);

    return {
      dominantColors,
      colorPercentages,
      complementaryColors,
    };
  }

  /**
   * Extract color data from media metadata
   */
  private extractColorData(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return null;
    }

    return {
      dominantColors: metadata.dominantColors || [],
      colorTemperature: metadata.colorTemperature || 'neutral',
      brightness: metadata.brightness || 50,
      saturation: metadata.saturation || 50,
      contrast: metadata.contrast || 50,
    };
  }

  /**
   * Calculate color harmony score (0-100)
   */
  private calculateColorHarmonyScore(colorData: any[]): number {
    if (colorData.length === 0) return 50;

    // Analyze color consistency across posts
    const allColors = colorData.flatMap(d => d.dominantColors || []);
    const uniqueColors = new Set(allColors);

    // Calculate color frequency
    const colorFrequency = new Map<string, number>();
    allColors.forEach(color => {
      colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
    });

    // Higher frequency of recurring colors = better harmony
    const avgFrequency = allColors.length / uniqueColors.size;
    const harmonyScore = Math.min(100, Math.round(avgFrequency * 20));

    return harmonyScore;
  }

  /**
   * Calculate theme consistency score (0-100)
   */
  private calculateThemeConsistencyScore(colorData: any[]): number {
    if (colorData.length === 0) return 50;

    // Analyze color temperature consistency
    const temperatures = colorData.map(d => d.colorTemperature).filter(Boolean);
    const tempConsistency = this.calculateConsistency(temperatures);

    // Analyze brightness consistency
    const brightness = colorData.map(d => d.brightness).filter(Boolean);
    const brightnessConsistency = this.calculateNumericConsistency(brightness);

    // Analyze saturation consistency
    const saturation = colorData.map(d => d.saturation).filter(Boolean);
    const saturationConsistency = this.calculateNumericConsistency(saturation);

    // Average of all consistency metrics
    const themeScore = Math.round(
      (tempConsistency + brightnessConsistency + saturationConsistency) / 3
    );

    return themeScore;
  }

  /**
   * Calculate visual balance score (0-100)
   */
  private calculateVisualBalanceScore(posts: any[]): number {
    if (posts.length === 0) return 50;

    // Analyze variety in post types
    const mediaTypes = posts.map(p => {
      const mediaCount = p.mediaAssets?.length || 0;
      return mediaCount > 1 ? 'carousel' : 'single';
    });

    const typeVariety = new Set(mediaTypes).size;
    const varietyScore = Math.min(100, typeVariety * 50);

    // Analyze posting consistency
    const postDates = posts
      .map(p => p.publishedAt || p.scheduledAt)
      .filter(Boolean)
      .map(d => new Date(d).getTime());

    const consistencyScore = this.calculatePostingConsistency(postDates);

    // Average of variety and consistency
    const balanceScore = Math.round((varietyScore + consistencyScore) / 2);

    return balanceScore;
  }

  /**
   * Calculate consistency of categorical values
   */
  private calculateConsistency(values: string[]): number {
    if (values.length === 0) return 50;

    const frequency = new Map<string, number>();
    values.forEach(v => {
      frequency.set(v, (frequency.get(v) || 0) + 1);
    });

    const maxFrequency = Math.max(...frequency.values());
    const consistencyRatio = maxFrequency / values.length;

    return Math.round(consistencyRatio * 100);
  }

  /**
   * Calculate consistency of numeric values
   */
  private calculateNumericConsistency(values: number[]): number {
    if (values.length === 0) return 50;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - stdDev);

    return Math.round(consistencyScore);
  }

  /**
   * Calculate posting consistency score
   */
  private calculatePostingConsistency(timestamps: number[]): number {
    if (timestamps.length < 2) return 50;

    // Calculate intervals between posts
    const sortedTimestamps = timestamps.sort((a, b) => a - b);
    const intervals: number[] = [];

    for (let i = 1; i < sortedTimestamps.length; i++) {
      intervals.push(sortedTimestamps[i] - sortedTimestamps[i - 1]);
    }

    // Calculate consistency of intervals
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance = more consistent posting
    const consistencyRatio = 1 - Math.min(1, stdDev / avgInterval);

    return Math.round(consistencyRatio * 100);
  }

  /**
   * Extract dominant color palette
   */
  private extractDominantPalette(colorData: any[]): string[] {
    const allColors = colorData.flatMap(d => d.dominantColors || []);

    const colorFrequency = new Map<string, number>();
    allColors.forEach(color => {
      colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
    });

    return Array.from(colorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  /**
   * Detect themes from color and content data
   */
  private detectThemes(colorData: any[], posts: any[]): string[] {
    const themes: string[] = [];

    // Analyze color temperatures
    const temperatures = colorData.map(d => d.colorTemperature).filter(Boolean);
    const warmCount = temperatures.filter(t => t === 'warm').length;
    const coolCount = temperatures.filter(t => t === 'cool').length;

    if (warmCount > coolCount * 1.5) themes.push('warm-toned');
    if (coolCount > warmCount * 1.5) themes.push('cool-toned');

    // Analyze brightness
    const avgBrightness = colorData.reduce((sum, d) => sum + (d.brightness || 50), 0) / colorData.length;
    if (avgBrightness > 70) themes.push('bright');
    if (avgBrightness < 30) themes.push('dark');

    // Analyze saturation
    const avgSaturation = colorData.reduce((sum, d) => sum + (d.saturation || 50), 0) / colorData.length;
    if (avgSaturation > 70) themes.push('vibrant');
    if (avgSaturation < 30) themes.push('muted');

    return themes.length > 0 ? themes : ['mixed'];
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    overall: number,
    colorHarmony: number,
    themeConsistency: number,
    visualBalance: number,
  ): string[] {
    const suggestions: string[] = [];

    if (overall >= 80) {
      suggestions.push('Excellent aesthetic! Your grid has a strong, cohesive visual identity');
    }

    if (colorHarmony < 60) {
      suggestions.push('Consider using a more consistent color palette across your posts');
      suggestions.push('Try creating a brand color palette with 3-5 signature colors');
    }

    if (themeConsistency < 60) {
      suggestions.push('Your posts show varying themes. Consider establishing a consistent visual style');
      suggestions.push('Try maintaining similar brightness and saturation levels across posts');
    }

    if (visualBalance < 60) {
      suggestions.push('Mix up your content types (single images, carousels, videos) for better variety');
      suggestions.push('Maintain a consistent posting schedule for better grid flow');
    }

    if (overall < 50) {
      suggestions.push('Focus on developing a clear visual identity for your brand');
      suggestions.push('Study successful Instagram accounts in your niche for inspiration');
    }

    return suggestions;
  }

  /**
   * Calculate color distribution
   */
  private calculateColorDistribution(colorData: any[]): { color: string; percentage: number }[] {
    const allColors = colorData.flatMap(d => d.dominantColors || []);

    const colorFrequency = new Map<string, number>();
    allColors.forEach(color => {
      colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
    });

    const total = allColors.length;

    return Array.from(colorFrequency.entries())
      .map(([color, count]) => ({
        color,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);
  }

  /**
   * Calculate complementary colors
   */
  private calculateComplementaryColors(colors: string[]): string[] {
    // Simplified complementary color calculation
    // In a real implementation, this would use color theory
    return colors.map(color => {
      // This is a placeholder - real implementation would convert to HSL
      // and rotate hue by 180 degrees
      return color;
    });
  }
}
