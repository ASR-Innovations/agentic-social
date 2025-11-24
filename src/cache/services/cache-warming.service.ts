import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from './cache.service';
import {
  CacheLayer,
  CacheWarmingConfig,
} from '../interfaces/cache.interface';

/**
 * Service for warming cache with frequently accessed data
 */
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmingService.name);
  private warmingConfigs: Map<string, CacheWarmingConfig> = new Map();

  constructor(private readonly cacheService: CacheService) {}

  async onModuleInit() {
    // Register default warming configurations
    this.registerDefaultWarmingConfigs();

    // Warm cache on startup
    await this.warmAllCaches();
  }

  /**
   * Register a cache warming configuration
   */
  registerWarmingConfig(config: CacheWarmingConfig): void {
    this.warmingConfigs.set(config.key, config);
    this.logger.log(`Registered cache warming config: ${config.key}`);
  }

  /**
   * Warm a specific cache
   */
  async warmCache(key: string): Promise<void> {
    const config = this.warmingConfigs.get(key);
    if (!config) {
      this.logger.warn(`No warming config found for key: ${key}`);
      return;
    }

    try {
      this.logger.log(`Warming cache: ${key}`);
      const data = await config.fetchFunction();
      await this.cacheService.set(config.key, data, {
        ttl: config.ttl,
        layer: config.layer,
      });
      this.logger.log(`Successfully warmed cache: ${key}`);
    } catch (error) {
      this.logger.error(`Error warming cache ${key}:`, error);
    }
  }

  /**
   * Warm all registered caches
   */
  async warmAllCaches(): Promise<void> {
    this.logger.log('Warming all caches...');

    const promises = Array.from(this.warmingConfigs.keys()).map((key) =>
      this.warmCache(key),
    );

    await Promise.allSettled(promises);
    this.logger.log('Cache warming complete');
  }

  /**
   * Scheduled cache warming - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledCacheWarming(): Promise<void> {
    this.logger.log('Running scheduled cache warming');
    await this.warmAllCaches();
  }

  /**
   * Warm workspace-specific caches
   */
  async warmWorkspaceCache(workspaceId: string): Promise<void> {
    this.logger.log(`Warming cache for workspace: ${workspaceId}`);

    // Warm common workspace queries
    const warmingTasks = [
      this.warmWorkspaceSettings(workspaceId),
      this.warmWorkspaceAccounts(workspaceId),
      this.warmWorkspaceTeam(workspaceId),
      this.warmWorkspaceAnalytics(workspaceId),
    ];

    await Promise.allSettled(warmingTasks);
  }

  /**
   * Warm user-specific caches
   */
  async warmUserCache(userId: string, workspaceId: string): Promise<void> {
    this.logger.log(`Warming cache for user: ${userId}`);

    const warmingTasks = [
      this.warmUserProfile(userId),
      this.warmUserPermissions(userId, workspaceId),
      this.warmUserPreferences(userId),
    ];

    await Promise.allSettled(warmingTasks);
  }

  /**
   * Register default warming configurations
   */
  private registerDefaultWarmingConfigs(): void {
    // Platform rate limits
    this.registerWarmingConfig({
      key: 'platform:rate-limits',
      fetchFunction: async () => this.fetchPlatformRateLimits(),
      ttl: 3600, // 1 hour
      layer: CacheLayer.L2,
    });

    // Common hashtags
    this.registerWarmingConfig({
      key: 'hashtags:trending',
      fetchFunction: async () => this.fetchTrendingHashtags(),
      ttl: 1800, // 30 minutes
      layer: CacheLayer.L2,
    });

    // AI model configurations
    this.registerWarmingConfig({
      key: 'ai:models:config',
      fetchFunction: async () => this.fetchAIModelConfigs(),
      ttl: 7200, // 2 hours
      layer: CacheLayer.L3,
    });
  }

  /**
   * Warm workspace settings
   */
  private async warmWorkspaceSettings(workspaceId: string): Promise<void> {
    const key = `workspace:${workspaceId}:settings`;
    // In a real implementation, this would fetch from database
    // For now, we'll just log
    this.logger.debug(`Warming workspace settings: ${workspaceId}`);
  }

  /**
   * Warm workspace social accounts
   */
  private async warmWorkspaceAccounts(workspaceId: string): Promise<void> {
    const key = `accounts:workspace:${workspaceId}`;
    this.logger.debug(`Warming workspace accounts: ${workspaceId}`);
  }

  /**
   * Warm workspace team members
   */
  private async warmWorkspaceTeam(workspaceId: string): Promise<void> {
    const key = `team:workspace:${workspaceId}`;
    this.logger.debug(`Warming workspace team: ${workspaceId}`);
  }

  /**
   * Warm workspace analytics
   */
  private async warmWorkspaceAnalytics(workspaceId: string): Promise<void> {
    const key = `analytics:workspace:${workspaceId}:overview`;
    this.logger.debug(`Warming workspace analytics: ${workspaceId}`);
  }

  /**
   * Warm user profile
   */
  private async warmUserProfile(userId: string): Promise<void> {
    const key = `user:${userId}:profile`;
    this.logger.debug(`Warming user profile: ${userId}`);
  }

  /**
   * Warm user permissions
   */
  private async warmUserPermissions(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const key = `permissions:user:${userId}:workspace:${workspaceId}`;
    this.logger.debug(`Warming user permissions: ${userId}`);
  }

  /**
   * Warm user preferences
   */
  private async warmUserPreferences(userId: string): Promise<void> {
    const key = `user:${userId}:preferences`;
    this.logger.debug(`Warming user preferences: ${userId}`);
  }

  /**
   * Fetch platform rate limits (placeholder)
   */
  private async fetchPlatformRateLimits(): Promise<any> {
    return {
      instagram: { limit: 200, window: 3600 },
      twitter: { limit: 300, window: 900 },
      facebook: { limit: 200, window: 3600 },
      linkedin: { limit: 100, window: 86400 },
      tiktok: { limit: 100, window: 86400 },
    };
  }

  /**
   * Fetch trending hashtags (placeholder)
   */
  private async fetchTrendingHashtags(): Promise<any> {
    return {
      trending: ['#socialmedia', '#marketing', '#digitalmarketing'],
      timestamp: new Date(),
    };
  }

  /**
   * Fetch AI model configurations (placeholder)
   */
  private async fetchAIModelConfigs(): Promise<any> {
    return {
      'gpt-4o': { maxTokens: 4096, temperature: 0.7 },
      'gpt-4o-mini': { maxTokens: 4096, temperature: 0.7 },
      'claude-3.5-sonnet': { maxTokens: 4096, temperature: 0.7 },
      'claude-haiku': { maxTokens: 4096, temperature: 0.7 },
    };
  }
}
