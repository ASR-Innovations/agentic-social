/**
 * Examples of using the caching system
 */

import { Injectable } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { CacheInvalidationService } from '../services/cache-invalidation.service';
import { CacheWarmingService } from '../services/cache-warming.service';
import { CdnService } from '../services/cdn.service';
import { Cacheable, CacheControl, CacheEvict } from '../decorators/cache.decorator';
import { CacheLayer } from '../interfaces/cache.interface';

// Example 1: Basic Service with Caching
@Injectable()
export class PostsExampleService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  /**
   * Get post with manual caching
   */
  async getPost(postId: string) {
    // Try cache first
    const cached = await this.cacheService.get(`post:${postId}`, {
      layer: CacheLayer.L2,
    });

    if (cached) {
      return cached;
    }

    // Fetch from database
    const post = await this.fetchPostFromDatabase(postId);

    // Store in cache
    await this.cacheService.set(`post:${postId}`, post, {
      ttl: 300, // 5 minutes
      layer: CacheLayer.L2,
      tags: ['posts', `workspace:${post.workspaceId}`],
    });

    return post;
  }

  /**
   * Get post with cache-aside pattern
   */
  async getPostCacheAside(postId: string) {
    return await this.cacheService.getOrSet(
      `post:${postId}`,
      async () => {
        return await this.fetchPostFromDatabase(postId);
      },
      {
        ttl: 300,
        layer: CacheLayer.L2,
        tags: ['posts'],
      },
    );
  }

  /**
   * Update post with cache invalidation
   */
  async updatePost(postId: string, workspaceId: string, data: any) {
    // Update in database
    const updated = await this.updatePostInDatabase(postId, data);

    // Invalidate cache
    await this.invalidationService.invalidatePostCache(postId, workspaceId);

    return updated;
  }

  /**
   * Delete post with cache invalidation
   */
  async deletePost(postId: string, workspaceId: string) {
    // Delete from database
    await this.deletePostFromDatabase(postId);

    // Invalidate cache
    await this.invalidationService.invalidatePostCache(postId, workspaceId);
  }

  // Mock database methods
  private async fetchPostFromDatabase(postId: string): Promise<any> {
    return { id: postId, title: 'Example Post', workspaceId: '123' };
  }

  private async updatePostInDatabase(postId: string, data: any): Promise<any> {
    return { id: postId, ...data };
  }

  private async deletePostFromDatabase(postId: string): Promise<void> {
    // Delete logic
  }
}

// Example 2: Using Decorators
@Injectable()
export class AnalyticsExampleService {
  /**
   * Get analytics with @Cacheable decorator
   */
  @Cacheable(
    (args) => `analytics:workspace:${args[0]}:${args[1]}:${args[2]}`,
    300, // 5 minutes TTL
    CacheLayer.L2,
    ['analytics'],
  )
  async getWorkspaceAnalytics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // This method result will be automatically cached
    return await this.calculateAnalytics(workspaceId, startDate, endDate);
  }

  /**
   * Update analytics with @CacheEvict decorator
   */
  @CacheEvict(['analytics:*'])
  async refreshAnalytics(workspaceId: string) {
    // After this method executes, matching cache entries will be invalidated
    return await this.recalculateAnalytics(workspaceId);
  }

  private async calculateAnalytics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return { workspaceId, metrics: {} };
  }

  private async recalculateAnalytics(workspaceId: string): Promise<any> {
    return { workspaceId, metrics: {} };
  }
}

// Example 3: Multi-Layer Caching Strategy
@Injectable()
export class UserExampleService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Get user profile with L1 cache (hot data)
   */
  async getUserProfile(userId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:profile`,
      async () => {
        return await this.fetchUserProfile(userId);
      },
      {
        ttl: 60, // 1 minute
        layer: CacheLayer.L1, // In-memory for fastest access
        tags: ['users', `user:${userId}`],
      },
    );
  }

  /**
   * Get user settings with L2 cache (warm data)
   */
  async getUserSettings(userId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:settings`,
      async () => {
        return await this.fetchUserSettings(userId);
      },
      {
        ttl: 300, // 5 minutes
        layer: CacheLayer.L2, // Redis for shared access
        tags: ['users', `user:${userId}`],
      },
    );
  }

  /**
   * Get user permissions with L3 cache (cold data)
   */
  async getUserPermissions(userId: string, workspaceId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:workspace:${workspaceId}:permissions`,
      async () => {
        return await this.fetchUserPermissions(userId, workspaceId);
      },
      {
        ttl: 3600, // 1 hour
        layer: CacheLayer.L3, // Long-term Redis cache
        tags: ['permissions', `user:${userId}`, `workspace:${workspaceId}`],
      },
    );
  }

  private async fetchUserProfile(userId: string): Promise<any> {
    return { id: userId, name: 'John Doe' };
  }

  private async fetchUserSettings(userId: string): Promise<any> {
    return { userId, theme: 'dark' };
  }

  private async fetchUserPermissions(
    userId: string,
    workspaceId: string,
  ): Promise<any> {
    return { userId, workspaceId, permissions: [] };
  }
}

// Example 4: Cache Warming
@Injectable()
export class DashboardExampleService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly warmingService: CacheWarmingService,
  ) {}

  async onModuleInit() {
    // Register cache warming for popular dashboard data
    this.warmingService.registerWarmingConfig({
      key: 'dashboard:popular-posts',
      fetchFunction: async () => {
        return await this.getPopularPosts();
      },
      ttl: 600, // 10 minutes
      layer: CacheLayer.L2,
      schedule: '*/10 * * * *', // Every 10 minutes
    });

    // Register cache warming for trending hashtags
    this.warmingService.registerWarmingConfig({
      key: 'dashboard:trending-hashtags',
      fetchFunction: async () => {
        return await this.getTrendingHashtags();
      },
      ttl: 1800, // 30 minutes
      layer: CacheLayer.L2,
      schedule: '*/30 * * * *', // Every 30 minutes
    });
  }

  private async getPopularPosts(): Promise<any[]> {
    return [];
  }

  private async getTrendingHashtags(): Promise<any[]> {
    return [];
  }
}

// Example 5: CDN Integration
@Injectable()
export class MediaExampleService {
  constructor(private readonly cdnService: CdnService) {}

  /**
   * Upload media and get CDN URL
   */
  async uploadMedia(file: any) {
    // Upload to storage
    const path = `/media/${Date.now()}-${file.name}`;

    // Get CDN URL
    const cdnUrl = this.cdnService.getCdnUrl(path);

    return {
      path,
      cdnUrl,
      headers: this.cdnService.getStaticAssetHeaders(),
    };
  }

  /**
   * Delete media and purge from CDN
   */
  async deleteMedia(path: string) {
    // Delete from storage
    await this.deleteFromStorage(path);

    // Purge from CDN
    await this.cdnService.purgeMediaAsset(path);
  }

  /**
   * Bulk delete media
   */
  async bulkDeleteMedia(paths: string[]) {
    // Delete from storage
    await Promise.all(paths.map((path) => this.deleteFromStorage(path)));

    // Purge from CDN
    await this.cdnService.purgeMediaAssets(paths);
  }

  private async deleteFromStorage(path: string): Promise<void> {
    // Delete logic
  }
}

// Example 6: HTTP Cache Headers
import { Controller, Get, Param } from '@nestjs/common';

@Controller('api/posts')
export class PostsExampleController {
  /**
   * Get post with cache control headers
   */
  @Get(':id')
  @CacheControl(
    300, // max-age: 5 minutes
    600, // s-maxage: 10 minutes (CDN)
    60, // stale-while-revalidate: 1 minute
  )
  async getPost(@Param('id') id: string) {
    return { id, title: 'Example Post' };
  }

  /**
   * Get static content with long cache
   */
  @Get('static/:id')
  @CacheControl(
    31536000, // max-age: 1 year
    31536000, // s-maxage: 1 year
    86400, // stale-while-revalidate: 1 day
  )
  async getStaticContent(@Param('id') id: string) {
    return { id, content: 'Static content' };
  }
}

// Example 7: Tag-Based Invalidation
@Injectable()
export class WorkspaceExampleService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  /**
   * Cache workspace data with tags
   */
  async getWorkspaceData(workspaceId: string) {
    return await this.cacheService.getOrSet(
      `workspace:${workspaceId}:data`,
      async () => {
        return await this.fetchWorkspaceData(workspaceId);
      },
      {
        ttl: 600,
        layer: CacheLayer.L2,
        tags: [
          'workspaces',
          `workspace:${workspaceId}`,
          'workspace-data',
        ],
      },
    );
  }

  /**
   * Invalidate all workspace-related caches
   */
  async invalidateWorkspace(workspaceId: string) {
    // Invalidate by tags
    await this.cacheService.deleteByTags([
      `workspace:${workspaceId}`,
      'workspace-data',
    ]);

    // Or use the invalidation service
    await this.invalidationService.invalidateWorkspaceCache(workspaceId);
  }

  private async fetchWorkspaceData(workspaceId: string): Promise<any> {
    return { id: workspaceId, name: 'Example Workspace' };
  }
}

// Example 8: Compression for Large Data
@Injectable()
export class ReportsExampleService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Cache large report data with compression
   */
  async getReport(reportId: string) {
    return await this.cacheService.getOrSet(
      `report:${reportId}`,
      async () => {
        return await this.generateReport(reportId);
      },
      {
        ttl: 3600, // 1 hour
        layer: CacheLayer.L3,
        compress: true, // Enable compression for large data
        tags: ['reports', `report:${reportId}`],
      },
    );
  }

  private async generateReport(reportId: string): Promise<any> {
    // Generate large report data
    return {
      id: reportId,
      data: new Array(10000).fill({ metric: 'value' }),
    };
  }
}
