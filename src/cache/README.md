# Caching Implementation

This module provides a comprehensive multi-layer caching system with CDN integration and browser caching support.

## Features

- **Multi-Layer Caching**: L1 (in-memory), L2 (Redis short-term), L3 (Redis long-term)
- **Cache Invalidation**: Pattern-based and tag-based invalidation strategies
- **Cache Warming**: Proactive cache population for frequently accessed data
- **CDN Integration**: Support for Cloudflare, CloudFront, and Fastly
- **Browser Caching**: Service worker implementation for offline support
- **Compression**: Automatic compression for large cached values
- **Statistics**: Real-time cache performance metrics

## Architecture

### Cache Layers

#### L1 Cache (In-Memory)
- **Storage**: Node.js memory
- **TTL**: 60 seconds (default)
- **Capacity**: 1000 items
- **Use Case**: Frequently accessed data, hot paths
- **Pros**: Fastest access, no network latency
- **Cons**: Not shared across instances, limited capacity

#### L2 Cache (Redis Short-Term)
- **Storage**: Redis
- **TTL**: 300 seconds (5 minutes, default)
- **Capacity**: Large (depends on Redis configuration)
- **Use Case**: API responses, computed data, session data
- **Pros**: Shared across instances, persistent
- **Cons**: Network latency, requires Redis

#### L3 Cache (Redis Long-Term)
- **Storage**: Redis
- **TTL**: 3600 seconds (1 hour, default)
- **Capacity**: Very large
- **Use Case**: Static data, configuration, rarely changing data
- **Pros**: Long-term storage, reduces database load
- **Cons**: Potential stale data, requires invalidation strategy

## Usage

### Basic Caching

```typescript
import { CacheService, CacheLayer } from '@/cache';

@Injectable()
export class MyService {
  constructor(private readonly cacheService: CacheService) {}

  async getData(id: string) {
    // Try to get from cache
    const cached = await this.cacheService.get(`data:${id}`, {
      layer: CacheLayer.L2,
    });
    
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const data = await this.fetchFromDatabase(id);

    // Store in cache
    await this.cacheService.set(`data:${id}`, data, {
      ttl: 300, // 5 minutes
      layer: CacheLayer.L2,
      tags: ['data', `user:${id}`],
    });

    return data;
  }
}
```

### Cache-Aside Pattern

```typescript
async getData(id: string) {
  return await this.cacheService.getOrSet(
    `data:${id}`,
    async () => {
      // This function is only called on cache miss
      return await this.fetchFromDatabase(id);
    },
    {
      ttl: 300,
      layer: CacheLayer.L2,
      tags: ['data'],
    }
  );
}
```

### Using Decorators

```typescript
import { Cacheable, CacheLayer } from '@/cache';

@Injectable()
export class MyService {
  @Cacheable(
    (args) => `user:${args[0]}`, // Cache key generator
    300, // TTL in seconds
    CacheLayer.L2, // Cache layer
    ['users'] // Tags
  )
  async getUser(userId: string) {
    return await this.userRepository.findOne(userId);
  }
}
```

### Cache Invalidation

```typescript
import { CacheInvalidationService } from '@/cache';

@Injectable()
export class PostService {
  constructor(
    private readonly invalidationService: CacheInvalidationService,
  ) {}

  async updatePost(postId: string, workspaceId: string) {
    // Update post in database
    await this.postRepository.update(postId, data);

    // Invalidate related caches
    await this.invalidationService.invalidatePostCache(postId, workspaceId);
  }
}
```

### Cache Warming

```typescript
import { CacheWarmingService, CacheLayer } from '@/cache';

@Injectable()
export class MyService {
  constructor(
    private readonly warmingService: CacheWarmingService,
  ) {}

  async onModuleInit() {
    // Register cache warming configuration
    this.warmingService.registerWarmingConfig({
      key: 'popular-posts',
      fetchFunction: async () => {
        return await this.getPopularPosts();
      },
      ttl: 600, // 10 minutes
      layer: CacheLayer.L2,
      schedule: '*/10 * * * *', // Every 10 minutes
    });
  }
}
```

### CDN Integration

```typescript
import { CdnService } from '@/cache';

@Injectable()
export class MediaService {
  constructor(private readonly cdnService: CdnService) {}

  async uploadMedia(file: Express.Multer.File) {
    // Upload to storage
    const path = await this.storage.upload(file);

    // Get CDN URL
    const cdnUrl = this.cdnService.getCdnUrl(path);

    return { path, cdnUrl };
  }

  async deleteMedia(path: string) {
    // Delete from storage
    await this.storage.delete(path);

    // Purge from CDN
    await this.cdnService.purgeMediaAsset(path);
  }
}
```

### HTTP Cache Headers

```typescript
import { CacheControl } from '@/cache';

@Controller('api/posts')
export class PostsController {
  @Get(':id')
  @CacheControl(
    300, // max-age: 5 minutes
    600, // s-maxage: 10 minutes
    60   // stale-while-revalidate: 1 minute
  )
  async getPost(@Param('id') id: string) {
    return await this.postsService.getPost(id);
  }
}
```

## Cache Invalidation Strategies

### 1. Time-Based (TTL)
Automatic expiration after specified time.

```typescript
await cacheService.set('key', data, { ttl: 300 });
```

### 2. Pattern-Based
Invalidate multiple keys matching a pattern.

```typescript
await cacheService.deleteByPattern('posts:workspace:123:*');
```

### 3. Tag-Based
Invalidate all keys with specific tags.

```typescript
// Set with tags
await cacheService.set('key', data, { tags: ['posts', 'workspace:123'] });

// Invalidate by tags
await cacheService.deleteByTags(['posts']);
```

### 4. Event-Based
Invalidate on specific events.

```typescript
// After post creation
await invalidationService.invalidatePostCache(postId, workspaceId);

// After workspace update
await invalidationService.invalidateWorkspaceCache(workspaceId);
```

## Browser Caching (Service Worker)

### Registration

Add to your Next.js app:

```typescript
// app/layout.tsx
import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/service-worker';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker({
        onSuccess: () => console.log('Service worker registered'),
        onUpdate: () => console.log('New version available'),
      });
    }
  }, []);

  return <html>{children}</html>;
}
```

### Cache Strategies

The service worker implements multiple caching strategies:

1. **Cache First**: Static assets (JS, CSS, fonts)
2. **Network First**: API calls, dynamic content
3. **Stale While Revalidate**: Posts, analytics data

### Clear Browser Cache

```typescript
import { clearAllCaches } from '@/lib/service-worker';

// Clear all browser caches
await clearAllCaches();
```

## Configuration

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CDN Configuration
CDN_PROVIDER=cloudflare
CDN_API_KEY=your-api-key
CDN_ZONE_ID=your-zone-id
CDN_BASE_URL=https://cdn.example.com
```

## API Endpoints

### Cache Management

```
GET    /api/cache/stats              - Get cache statistics
DELETE /api/cache/clear              - Clear all cache
DELETE /api/cache/key/:key           - Delete specific key
DELETE /api/cache/pattern            - Delete by pattern
DELETE /api/cache/tags               - Delete by tags
```

### Cache Invalidation

```
POST   /api/cache/invalidate/workspace/:id  - Invalidate workspace cache
POST   /api/cache/invalidate/post/:id       - Invalidate post cache
POST   /api/cache/invalidate/account/:id    - Invalidate account cache
```

### Cache Warming

```
POST   /api/cache/warm                      - Warm all caches
POST   /api/cache/warm/workspace/:id        - Warm workspace cache
POST   /api/cache/warm/user/:id             - Warm user cache
```

### CDN Management

```
POST   /api/cache/cdn/purge                 - Purge CDN cache
POST   /api/cache/cdn/purge/media           - Purge media assets
GET    /api/cache/cdn/url                   - Get CDN URL
```

## Best Practices

### 1. Choose the Right Layer

- **L1**: Hot paths, frequently accessed data (< 1 minute)
- **L2**: API responses, computed data (5-10 minutes)
- **L3**: Static data, configuration (1+ hours)

### 2. Use Appropriate TTLs

- Short TTL for frequently changing data
- Long TTL for static data
- Consider stale-while-revalidate for better UX

### 3. Tag Your Caches

Always add tags for easier invalidation:

```typescript
await cacheService.set('key', data, {
  tags: ['posts', 'workspace:123', 'user:456'],
});
```

### 4. Invalidate Proactively

Invalidate cache immediately after data changes:

```typescript
await this.updateDatabase(data);
await this.invalidationService.invalidatePostCache(postId, workspaceId);
```

### 5. Monitor Cache Performance

Regularly check cache statistics:

```typescript
const stats = await cacheService.getStats();
console.log('Cache hit rate:', stats[0].hitRate);
```

### 6. Compress Large Values

Enable compression for large cached values:

```typescript
await cacheService.set('key', largeData, {
  compress: true,
});
```

## Performance Metrics

Expected performance improvements:

- **API Response Time**: 50-80% reduction for cached endpoints
- **Database Load**: 60-90% reduction for frequently accessed data
- **CDN Offload**: 70-95% of static asset traffic
- **Browser Cache**: 90%+ reduction in repeat asset downloads

## Troubleshooting

### Cache Not Working

1. Check Redis connection
2. Verify environment variables
3. Check cache key generation
4. Review TTL settings

### High Memory Usage

1. Reduce L1 cache size
2. Lower TTL values
3. Implement more aggressive invalidation
4. Enable compression

### Stale Data

1. Reduce TTL
2. Implement event-based invalidation
3. Use stale-while-revalidate pattern
4. Add cache versioning

## Related Documentation

- [Redis Configuration](../config/redis.config.ts)
- [Service Worker](../../frontend/public/service-worker.js)
- [CDN Setup](./services/cdn.service.ts)
