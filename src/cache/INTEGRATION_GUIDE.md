# Cache Integration Guide

This guide shows how to integrate the caching system into existing services.

## Quick Start

### 1. Import CacheService

```typescript
import { CacheService, CacheLayer } from '@/cache';

@Injectable()
export class YourService {
  constructor(private readonly cacheService: CacheService) {}
}
```

### 2. Use Cache-Aside Pattern

```typescript
async getData(id: string) {
  return await this.cacheService.getOrSet(
    `data:${id}`,
    async () => {
      // This function only runs on cache miss
      return await this.database.findOne(id);
    },
    {
      ttl: 300, // 5 minutes
      layer: CacheLayer.L2,
      tags: ['data'],
    }
  );
}
```

## Integration Examples

### Analytics Service

```typescript
// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService, CacheLayer, CacheInvalidationService } from '@/cache';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  async getWorkspaceAnalytics(workspaceId: string, startDate: Date, endDate: Date) {
    const cacheKey = `analytics:workspace:${workspaceId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Expensive analytics calculation
        return await this.calculateAnalytics(workspaceId, startDate, endDate);
      },
      {
        ttl: 300, // 5 minutes
        layer: CacheLayer.L2,
        tags: ['analytics', `workspace:${workspaceId}`],
      }
    );
  }

  async refreshAnalytics(workspaceId: string) {
    // Recalculate analytics
    const result = await this.recalculateAnalytics(workspaceId);
    
    // Invalidate cache
    await this.invalidationService.invalidateAnalyticsCache(workspaceId);
    
    return result;
  }
}
```

### Publishing Service

```typescript
// src/publishing/publishing.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService, CacheLayer, CacheInvalidationService } from '@/cache';

@Injectable()
export class PublishingService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  async getPost(postId: string) {
    return await this.cacheService.getOrSet(
      `post:${postId}`,
      async () => {
        return await this.prisma.post.findUnique({
          where: { id: postId },
          include: { media: true, platforms: true },
        });
      },
      {
        ttl: 300,
        layer: CacheLayer.L2,
        tags: ['posts', `post:${postId}`],
      }
    );
  }

  async updatePost(postId: string, workspaceId: string, data: any) {
    // Update in database
    const updated = await this.prisma.post.update({
      where: { id: postId },
      data,
    });

    // Invalidate cache
    await this.invalidationService.invalidatePostCache(postId, workspaceId);

    return updated;
  }

  async getWorkspacePosts(workspaceId: string, page: number = 1, limit: number = 20) {
    const cacheKey = `posts:workspace:${workspaceId}:page:${page}:limit:${limit}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return await this.prisma.post.findMany({
          where: { workspaceId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
      },
      {
        ttl: 60, // 1 minute for list views
        layer: CacheLayer.L2,
        tags: ['posts', `workspace:${workspaceId}`],
      }
    );
  }
}
```

### User Service

```typescript
// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService, CacheLayer, CacheInvalidationService } from '@/cache';

@Injectable()
export class UserService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  // Hot data - L1 cache
  async getUserProfile(userId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:profile`,
      async () => {
        return await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
          },
        });
      },
      {
        ttl: 60, // 1 minute
        layer: CacheLayer.L1, // In-memory for fastest access
        tags: ['users', `user:${userId}`],
      }
    );
  }

  // Warm data - L2 cache
  async getUserSettings(userId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:settings`,
      async () => {
        return await this.prisma.userSettings.findUnique({
          where: { userId },
        });
      },
      {
        ttl: 300, // 5 minutes
        layer: CacheLayer.L2,
        tags: ['users', `user:${userId}`],
      }
    );
  }

  // Cold data - L3 cache
  async getUserPermissions(userId: string, workspaceId: string) {
    return await this.cacheService.getOrSet(
      `user:${userId}:workspace:${workspaceId}:permissions`,
      async () => {
        return await this.calculateUserPermissions(userId, workspaceId);
      },
      {
        ttl: 3600, // 1 hour
        layer: CacheLayer.L3,
        tags: ['permissions', `user:${userId}`, `workspace:${workspaceId}`],
      }
    );
  }

  async updateUser(userId: string, workspaceId: string, data: any) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    // Invalidate user cache
    await this.invalidationService.invalidateUserCache(userId, workspaceId);

    return updated;
  }
}
```

### Media Service

```typescript
// src/media/media.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService, CdnService } from '@/cache';

@Injectable()
export class MediaService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly cdnService: CdnService,
  ) {}

  async uploadMedia(file: Express.Multer.File, workspaceId: string) {
    // Upload to S3
    const path = await this.s3Service.upload(file);

    // Get CDN URL
    const cdnUrl = this.cdnService.getCdnUrl(path);

    // Store in database
    const media = await this.prisma.mediaAsset.create({
      data: {
        workspaceId,
        type: file.mimetype.startsWith('image') ? 'image' : 'video',
        url: path,
        cdnUrl,
        filename: file.originalname,
        size: file.size,
      },
    });

    return media;
  }

  async deleteMedia(mediaId: string, workspaceId: string) {
    const media = await this.prisma.mediaAsset.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from S3
    await this.s3Service.delete(media.url);

    // Purge from CDN
    await this.cdnService.purgeMediaAsset(media.url);

    // Delete from database
    await this.prisma.mediaAsset.delete({
      where: { id: mediaId },
    });

    // Invalidate cache
    await this.cacheService.delete(`media:${mediaId}`);
    await this.cacheService.deleteByPattern(`media:workspace:${workspaceId}:*`);
  }

  async getMediaLibrary(workspaceId: string, page: number = 1, limit: number = 50) {
    const cacheKey = `media:workspace:${workspaceId}:page:${page}:limit:${limit}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return await this.prisma.mediaAsset.findMany({
          where: { workspaceId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
      },
      {
        ttl: 300,
        layer: CacheLayer.L2,
        tags: ['media', `workspace:${workspaceId}`],
      }
    );
  }
}
```

### AI Service

```typescript
// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService, CacheLayer } from '@/cache';

@Injectable()
export class AIService {
  constructor(private readonly cacheService: CacheService) {}

  async generateContent(prompt: string, options: any) {
    // Generate cache key from prompt and options
    const cacheKey = this.generateCacheKey(prompt, options);
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Call OpenAI API (expensive)
        return await this.openai.chat.completions.create({
          model: options.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
        });
      },
      {
        ttl: 86400, // 24 hours for AI responses
        layer: CacheLayer.L3,
        tags: ['ai', 'content-generation'],
        compress: true, // Compress large AI responses
      }
    );
  }

  async getHashtagSuggestions(content: string) {
    const cacheKey = `ai:hashtags:${this.hashString(content)}`;
    
    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Generate relevant hashtags for social media content.',
            },
            { role: 'user', content },
          ],
        });
      },
      {
        ttl: 86400, // 24 hours
        layer: CacheLayer.L3,
        tags: ['ai', 'hashtags'],
      }
    );
  }

  private generateCacheKey(prompt: string, options: any): string {
    const hash = this.hashString(JSON.stringify({ prompt, options }));
    return `ai:content:${options.model}:${hash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
```

## Controller Integration

### Using Decorators

```typescript
// src/posts/posts.controller.ts
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheControl, CacheInterceptor } from '@/cache';

@Controller('api/posts')
@UseInterceptors(CacheInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':id')
  @CacheControl(
    300, // max-age: 5 minutes
    600, // s-maxage: 10 minutes (CDN)
    60   // stale-while-revalidate: 1 minute
  )
  async getPost(@Param('id') id: string) {
    return await this.postsService.getPost(id);
  }

  @Get('static/:id')
  @CacheControl(
    31536000, // max-age: 1 year
    31536000, // s-maxage: 1 year
    86400     // stale-while-revalidate: 1 day
  )
  async getStaticContent(@Param('id') id: string) {
    return await this.postsService.getStaticContent(id);
  }
}
```

## Cache Warming Integration

```typescript
// src/analytics/analytics.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheWarmingService, CacheLayer } from '@/cache';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    private readonly warmingService: CacheWarmingService,
  ) {}

  async onModuleInit() {
    // Register cache warming for popular analytics
    this.warmingService.registerWarmingConfig({
      key: 'analytics:popular-metrics',
      fetchFunction: async () => {
        return await this.getPopularMetrics();
      },
      ttl: 600, // 10 minutes
      layer: CacheLayer.L2,
      schedule: '*/10 * * * *', // Every 10 minutes
    });

    // Register cache warming for dashboard data
    this.warmingService.registerWarmingConfig({
      key: 'analytics:dashboard-overview',
      fetchFunction: async () => {
        return await this.getDashboardOverview();
      },
      ttl: 300, // 5 minutes
      layer: CacheLayer.L2,
      schedule: '*/5 * * * *', // Every 5 minutes
    });
  }
}
```

## Best Practices

### 1. Choose the Right Layer

```typescript
// Hot data (frequently accessed) - L1
await cacheService.getOrSet(key, fetchFn, {
  ttl: 60,
  layer: CacheLayer.L1,
});

// Warm data (API responses) - L2
await cacheService.getOrSet(key, fetchFn, {
  ttl: 300,
  layer: CacheLayer.L2,
});

// Cold data (static, rarely changes) - L3
await cacheService.getOrSet(key, fetchFn, {
  ttl: 3600,
  layer: CacheLayer.L3,
});
```

### 2. Always Use Tags

```typescript
await cacheService.set(key, data, {
  ttl: 300,
  layer: CacheLayer.L2,
  tags: ['posts', `workspace:${workspaceId}`, `user:${userId}`],
});
```

### 3. Invalidate Proactively

```typescript
// After data changes
await this.updateDatabase(data);
await this.invalidationService.invalidatePostCache(postId, workspaceId);
```

### 4. Enable Compression for Large Data

```typescript
await cacheService.set(key, largeData, {
  ttl: 3600,
  layer: CacheLayer.L3,
  compress: true, // Automatically compress if > 1KB
});
```

### 5. Use Descriptive Cache Keys

```typescript
// Good
const key = `analytics:workspace:${workspaceId}:${startDate}:${endDate}`;

// Bad
const key = `data:${id}`;
```

## Migration Guide

### Replacing Existing Cache

If you have existing cache code, here's how to migrate:

#### Before (Old Code)
```typescript
const cached = await this.redis.get(key);
if (cached) {
  return JSON.parse(cached);
}

const data = await this.fetchData();
await this.redis.setex(key, 300, JSON.stringify(data));
return data;
```

#### After (New Code)
```typescript
return await this.cacheService.getOrSet(
  key,
  async () => this.fetchData(),
  { ttl: 300, layer: CacheLayer.L2 }
);
```

## Monitoring

### Get Cache Statistics

```typescript
const stats = await this.cacheService.getStats();
console.log('Cache hit rate:', stats[0].hitRate);
console.log('Cache size:', stats[0].size);
```

### Log Cache Operations

```typescript
// The cache service automatically logs:
// - Cache hits
// - Cache misses
// - Cache invalidations
// - Cache warming

// Check logs for:
// [CacheService] Cache hit: post:123
// [CacheService] Cache miss: post:456
// [CacheInvalidationService] Invalidating cache for post: 123
```

## Troubleshooting

### Cache Not Working

1. Check Redis connection
2. Verify cache key generation
3. Check TTL settings
4. Review logs for errors

### Stale Data

1. Reduce TTL
2. Implement event-based invalidation
3. Use stale-while-revalidate pattern

### High Memory Usage

1. Reduce L1 cache size
2. Lower TTL values
3. Enable compression
4. Implement more aggressive invalidation

## Additional Resources

- [Full Documentation](./README.md)
- [Usage Examples](./examples/cache-usage.example.ts)
- [API Reference](./cache.controller.ts)
