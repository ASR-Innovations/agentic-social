import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewSentimentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Analyze sentiment of a review
   * This is a simplified implementation. In production, you would use
   * a proper NLP service like Hugging Face, OpenAI, or AWS Comprehend
   */
  async analyzeSentiment(content: string, rating: number): Promise<{
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    sentimentScore: number;
    topics: string[];
    keywords: string[];
  }> {
    // Simple rule-based sentiment analysis based on rating
    // In production, use proper NLP models
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    let sentimentScore: number;

    if (rating >= 4) {
      sentiment = 'POSITIVE';
      sentimentScore = 0.5 + (rating - 4) * 0.5; // 0.5 to 1.0
    } else if (rating >= 3) {
      sentiment = 'NEUTRAL';
      sentimentScore = 0; // -0.2 to 0.2
    } else {
      sentiment = 'NEGATIVE';
      sentimentScore = -1 + (rating - 1) * 0.5; // -1.0 to -0.5
    }

    // Extract topics and keywords (simplified)
    const topics = this.extractTopics(content);
    const keywords = this.extractKeywords(content);

    return {
      sentiment,
      sentimentScore,
      topics,
      keywords,
    };
  }

  /**
   * Extract topics from review content
   * In production, use NLP topic modeling
   */
  private extractTopics(content: string): string[] {
    const topicKeywords = {
      service: ['service', 'staff', 'employee', 'waiter', 'server', 'help', 'support'],
      quality: ['quality', 'good', 'bad', 'excellent', 'poor', 'great', 'terrible'],
      price: ['price', 'expensive', 'cheap', 'value', 'cost', 'worth'],
      cleanliness: ['clean', 'dirty', 'hygiene', 'sanitary'],
      food: ['food', 'meal', 'dish', 'taste', 'flavor', 'delicious'],
      atmosphere: ['atmosphere', 'ambiance', 'environment', 'vibe', 'decor'],
      location: ['location', 'parking', 'access', 'convenient'],
      speed: ['fast', 'slow', 'quick', 'wait', 'time'],
    };

    const contentLower = content.toLowerCase();
    const topics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Extract keywords from review content
   * In production, use proper keyword extraction algorithms
   */
  private extractKeywords(content: string): string[] {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your',
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Return top keywords
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Batch analyze sentiment for multiple reviews
   */
  async batchAnalyzeSentiment(reviews: Array<{ id: string; content: string; rating: number }>) {
    const results = await Promise.all(
      reviews.map(async (review) => {
        const analysis = await this.analyzeSentiment(review.content, review.rating);
        return {
          id: review.id,
          ...analysis,
        };
      }),
    );

    return results;
  }

  /**
   * Update review with sentiment analysis
   */
  async updateReviewSentiment(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const analysis = await this.analyzeSentiment(review.content, review.rating);

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        topics: analysis.topics,
        keywords: analysis.keywords,
      },
    });
  }

  /**
   * Get sentiment trends over time
   */
  async getSentimentTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    platform?: string,
  ) {
    const where: any = {
      workspaceId,
      publishedAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (platform) {
      where.platform = platform;
    }

    const reviews = await this.prisma.review.findMany({
      where,
      select: {
        publishedAt: true,
        sentiment: true,
        sentimentScore: true,
        rating: true,
      },
      orderBy: { publishedAt: 'asc' },
    });

    // Group by day
    const dailyTrends = new Map<string, {
      date: string;
      positive: number;
      neutral: number;
      negative: number;
      avgSentiment: number;
      avgRating: number;
      count: number;
    }>();

    reviews.forEach(review => {
      const dateKey = review.publishedAt.toISOString().split('T')[0];
      
      if (!dailyTrends.has(dateKey)) {
        dailyTrends.set(dateKey, {
          date: dateKey,
          positive: 0,
          neutral: 0,
          negative: 0,
          avgSentiment: 0,
          avgRating: 0,
          count: 0,
        });
      }

      const trend = dailyTrends.get(dateKey)!;
      trend.count++;
      trend[review.sentiment.toLowerCase()] = (trend[review.sentiment.toLowerCase()] || 0) + 1;
      trend.avgSentiment += review.sentimentScore || 0;
      trend.avgRating += review.rating;
    });

    // Calculate averages
    dailyTrends.forEach(trend => {
      trend.avgSentiment = trend.avgSentiment / trend.count;
      trend.avgRating = trend.avgRating / trend.count;
    });

    return Array.from(dailyTrends.values());
  }
}
