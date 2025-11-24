import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import {
  CacheLayer,
  CacheInvalidationPattern,
} from '../interfaces/cache.interface';

/**
 * Service for managing cache invalidation strategies
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalidate cache when a post is created/updated
   */
  async invalidatePostCache(postId: string, workspaceId: string): Promise<void> {
    this.logger.log(`Invalidating cache for post: ${postId}`);

    const patterns = [
      `post:${postId}:*`,
      `posts:workspace:${workspaceId}:*`,
      `posts:list:*`,
      `analytics:post:${postId}:*`,
      `feed:*`,
    ];

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when workspace data changes
   */
  async invalidateWorkspaceCache(workspaceId: string): Promise<void> {
    this.logger.log(`Invalidating cache for workspace: ${workspaceId}`);

    const patterns = [
      `workspace:${workspaceId}:*`,
      `posts:workspace:${workspaceId}:*`,
      `analytics:workspace:${workspaceId}:*`,
      `metrics:workspace:${workspaceId}:*`,
      `team:workspace:${workspaceId}:*`,
    ];

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when social account is connected/disconnected
   */
  async invalidateSocialAccountCache(
    accountId: string,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(`Invalidating cache for social account: ${accountId}`);

    const patterns = [
      `account:${accountId}:*`,
      `accounts:workspace:${workspaceId}:*`,
      `posts:account:${accountId}:*`,
      `analytics:account:${accountId}:*`,
      `metrics:account:${accountId}:*`,
    ];

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when analytics data is updated
   */
  async invalidateAnalyticsCache(
    workspaceId: string,
    accountId?: string,
  ): Promise<void> {
    this.logger.log(`Invalidating analytics cache for workspace: ${workspaceId}`);

    const patterns = [
      `analytics:workspace:${workspaceId}:*`,
      `metrics:workspace:${workspaceId}:*`,
      `dashboard:workspace:${workspaceId}:*`,
    ];

    if (accountId) {
      patterns.push(
        `analytics:account:${accountId}:*`,
        `metrics:account:${accountId}:*`,
      );
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when user data changes
   */
  async invalidateUserCache(userId: string, workspaceId: string): Promise<void> {
    this.logger.log(`Invalidating cache for user: ${userId}`);

    const patterns = [
      `user:${userId}:*`,
      `team:workspace:${workspaceId}:*`,
      `permissions:user:${userId}:*`,
    ];

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when AI content is generated
   */
  async invalidateAICache(workspaceId: string, contentType?: string): Promise<void> {
    this.logger.log(`Invalidating AI cache for workspace: ${workspaceId}`);

    const patterns = [
      `ai:workspace:${workspaceId}:*`,
      `ai:suggestions:workspace:${workspaceId}:*`,
    ];

    if (contentType) {
      patterns.push(`ai:${contentType}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when listening data changes
   */
  async invalidateListeningCache(
    workspaceId: string,
    queryId?: string,
  ): Promise<void> {
    this.logger.log(`Invalidating listening cache for workspace: ${workspaceId}`);

    const patterns = [
      `listening:workspace:${workspaceId}:*`,
      `mentions:workspace:${workspaceId}:*`,
      `sentiment:workspace:${workspaceId}:*`,
      `trends:workspace:${workspaceId}:*`,
    ];

    if (queryId) {
      patterns.push(`listening:query:${queryId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when inbox messages change
   */
  async invalidateInboxCache(
    workspaceId: string,
    conversationId?: string,
  ): Promise<void> {
    this.logger.log(`Invalidating inbox cache for workspace: ${workspaceId}`);

    const patterns = [
      `inbox:workspace:${workspaceId}:*`,
      `conversations:workspace:${workspaceId}:*`,
      `messages:workspace:${workspaceId}:*`,
    ];

    if (conversationId) {
      patterns.push(`conversation:${conversationId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when media library changes
   */
  async invalidateMediaCache(workspaceId: string, mediaId?: string): Promise<void> {
    this.logger.log(`Invalidating media cache for workspace: ${workspaceId}`);

    const patterns = [
      `media:workspace:${workspaceId}:*`,
      `media:list:workspace:${workspaceId}:*`,
    ];

    if (mediaId) {
      patterns.push(`media:${mediaId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache when campaign data changes
   */
  async invalidateCampaignCache(
    workspaceId: string,
    campaignId?: string,
  ): Promise<void> {
    this.logger.log(`Invalidating campaign cache for workspace: ${workspaceId}`);

    const patterns = [
      `campaign:workspace:${workspaceId}:*`,
      `campaigns:list:workspace:${workspaceId}:*`,
    ];

    if (campaignId) {
      patterns.push(`campaign:${campaignId}:*`);
    }

    await this.invalidatePatterns(patterns);
  }

  /**
   * Time-based invalidation - invalidate old cache entries
   */
  async invalidateExpiredCache(): Promise<void> {
    this.logger.log('Running expired cache cleanup');

    // Redis handles TTL automatically, but we can clean up orphaned tags
    const patterns = ['tag:*'];
    await this.invalidatePatterns(patterns);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    this.logger.log(`Invalidating cache by tags: ${tags.join(', ')}`);
    return await this.cacheService.deleteByTags(tags);
  }

  /**
   * Invalidate multiple patterns
   */
  private async invalidatePatterns(patterns: string[]): Promise<void> {
    const results = await Promise.allSettled(
      patterns.map((pattern) =>
        this.cacheService.deleteByPattern(pattern),
      ),
    );

    const totalDeleted = results.reduce((sum, result) => {
      if (result.status === 'fulfilled') {
        return sum + result.value;
      }
      return sum;
    }, 0);

    this.logger.debug(`Invalidated ${totalDeleted} cache entries`);
  }

  /**
   * Invalidate all cache (use with caution)
   */
  async invalidateAll(layer?: CacheLayer): Promise<void> {
    this.logger.warn('Invalidating ALL cache');
    await this.cacheService.clear(layer);
  }
}
