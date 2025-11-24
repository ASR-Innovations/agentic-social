import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import * as zlib from 'zlib';
import { promisify } from 'util';
import {
  CacheLayer,
  CacheOptions,
  CacheStats,
  CacheKey,
} from '../interfaces/cache.interface';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // Default TTLs for each layer (in seconds)
  private readonly DEFAULT_TTLS = {
    [CacheLayer.L1]: 60, // 1 minute
    [CacheLayer.L2]: 300, // 5 minutes
    [CacheLayer.L3]: 3600, // 1 hour
  };

  // Compression threshold (bytes)
  private readonly COMPRESSION_THRESHOLD = 1024; // 1KB

  constructor(
    @Inject(CACHE_MANAGER) private readonly l1Cache: Cache,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Get value from cache with multi-layer fallback
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.buildCacheKey(key);
    const layer = options?.layer || CacheLayer.L1;

    try {
      // Try L1 cache first (fastest)
      if (layer === CacheLayer.L1 || !options?.layer) {
        const l1Value = await this.l1Cache.get<T>(cacheKey);
        if (l1Value !== undefined && l1Value !== null) {
          this.logger.debug(`L1 cache hit: ${cacheKey}`);
          return l1Value;
        }
      }

      // Try L2/L3 cache (Redis)
      if (layer !== CacheLayer.L1) {
        const redisValue = await this.redis.get(this.getRedisKey(cacheKey, layer));
        if (redisValue) {
          this.logger.debug(`${layer} cache hit: ${cacheKey}`);
          const parsed = await this.deserialize<T>(redisValue, options?.compress);

          // Populate L1 cache for faster subsequent access
          // This code is unreachable since we're already in the layer !== L1 block
          // but keeping it for type safety
          await this.l1Cache.set(cacheKey, parsed, this.DEFAULT_TTLS[CacheLayer.L1] * 1000);

          return parsed;
        }
      }

      this.logger.debug(`Cache miss: ${cacheKey}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(key);
    const layer = options?.layer || CacheLayer.L1;
    const ttl = options?.ttl || this.DEFAULT_TTLS[layer];

    try {
      // Store in L1 cache
      if (layer === CacheLayer.L1 || !options?.layer) {
        await this.l1Cache.set(cacheKey, value, ttl * 1000);
        this.logger.debug(`Stored in L1 cache: ${cacheKey} (TTL: ${ttl}s)`);
      }

      // Store in L2/L3 cache (Redis)
      if (layer !== CacheLayer.L1) {
        const serialized = await this.serialize(value, options?.compress);
        const redisKey = this.getRedisKey(cacheKey, layer);
        await this.redis.setex(redisKey, ttl, serialized);

        // Store tags for invalidation
        if (options?.tags && options.tags.length > 0) {
          await this.storeTags(redisKey, options.tags);
        }

        this.logger.debug(`Stored in ${layer} cache: ${cacheKey} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      this.logger.error(`Cache set error for ${cacheKey}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, layer?: CacheLayer): Promise<void> {
    const cacheKey = this.buildCacheKey(key);

    try {
      // Delete from L1
      if (!layer || layer === CacheLayer.L1) {
        await this.l1Cache.del(cacheKey);
      }

      // Delete from Redis
      if (!layer || layer !== CacheLayer.L1) {
        const layers = layer ? [layer] : [CacheLayer.L2, CacheLayer.L3];
        for (const l of layers) {
          await this.redis.del(this.getRedisKey(cacheKey, l));
        }
      }

      this.logger.debug(`Deleted from cache: ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Cache delete error for ${cacheKey}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string, layer?: CacheLayer): Promise<number> {
    try {
      let deletedCount = 0;

      // Delete from Redis
      if (!layer || layer !== CacheLayer.L1) {
        const layers = layer ? [layer] : [CacheLayer.L2, CacheLayer.L3];
        for (const l of layers) {
          const redisPattern = this.getRedisKey(pattern, l);
          const keys = await this.redis.keys(redisPattern);
          if (keys.length > 0) {
            deletedCount += await this.redis.del(...keys);
          }
        }
      }

      // Note: L1 cache (cache-manager) doesn't support pattern deletion
      // We would need to track keys separately for that

      this.logger.log(`Deleted ${deletedCount} keys matching pattern: ${pattern}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Cache delete by pattern error:`, error);
      return 0;
    }
  }

  /**
   * Delete by tags
   */
  async deleteByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;

      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await this.redis.smembers(tagKey);

        if (keys.length > 0) {
          deletedCount += await this.redis.del(...keys);
          await this.redis.del(tagKey);
        }
      }

      this.logger.log(`Deleted ${deletedCount} keys with tags: ${tags.join(', ')}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Cache delete by tags error:`, error);
      return 0;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const value = await fetchFunction();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats[]> {
    const stats: CacheStats[] = [];

    try {
      // L1 stats (memory cache)
      // Note: cache-manager doesn't provide detailed stats
      stats.push({
        layer: CacheLayer.L1,
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      });

      // Redis stats
      const info = await this.redis.info('stats');
      const memoryInfo = await this.redis.info('memory');

      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      const memoryMatch = memoryInfo.match(/used_memory_human:(.+)/);

      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
      const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;

      // L2 stats
      const l2Keys = await this.redis.keys('app:l2:*');
      stats.push({
        layer: CacheLayer.L2,
        hits,
        misses,
        hitRate: Math.round(hitRate * 100) / 100,
        size: l2Keys.length,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : 'unknown',
      });

      // L3 stats
      const l3Keys = await this.redis.keys('app:l3:*');
      stats.push({
        layer: CacheLayer.L3,
        hits,
        misses,
        hitRate: Math.round(hitRate * 100) / 100,
        size: l3Keys.length,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : 'unknown',
      });
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
    }

    return stats;
  }

  /**
   * Clear all cache
   */
  async clear(layer?: CacheLayer): Promise<void> {
    try {
      if (!layer || layer === CacheLayer.L1) {
        await (this.l1Cache as any).reset();
        this.logger.log('Cleared L1 cache');
      }

      if (!layer || layer !== CacheLayer.L1) {
        const layers = layer ? [layer] : [CacheLayer.L2, CacheLayer.L3];
        for (const l of layers) {
          const pattern = `app:${l.toLowerCase()}:*`;
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            this.logger.log(`Cleared ${l} cache (${keys.length} keys)`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Build cache key from components
   */
  private buildCacheKey(key: string | CacheKey): string {
    if (typeof key === 'string') {
      return key;
    }

    const parts = [key.prefix, key.identifier];
    if (key.params) {
      const paramString = Object.entries(key.params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      parts.push(paramString);
    }

    return parts.join(':');
  }

  /**
   * Get Redis key with layer prefix
   */
  private getRedisKey(key: string, layer: CacheLayer): string {
    return `${layer.toLowerCase()}:${key}`;
  }

  /**
   * Serialize value for storage
   */
  private async serialize(value: any, compress?: boolean): Promise<string> {
    const json = JSON.stringify(value);

    if (compress && json.length > this.COMPRESSION_THRESHOLD) {
      const compressed = await gzip(Buffer.from(json));
      return `gzip:${compressed.toString('base64')}`;
    }

    return json;
  }

  /**
   * Deserialize value from storage
   */
  private async deserialize<T>(value: string, compressed?: boolean): Promise<T> {
    if (value.startsWith('gzip:')) {
      const base64 = value.substring(5);
      const buffer = Buffer.from(base64, 'base64');
      const decompressed = await gunzip(buffer);
      return JSON.parse(decompressed.toString());
    }

    return JSON.parse(value);
  }

  /**
   * Store tags for a cache key
   */
  private async storeTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      await this.redis.sadd(tagKey, key);
    }
  }
}
