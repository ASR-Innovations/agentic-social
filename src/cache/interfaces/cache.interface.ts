export enum CacheLayer {
  L1 = 'L1', // In-memory cache (fastest, smallest capacity)
  L2 = 'L2', // Redis cache (fast, medium capacity)
  L3 = 'L3', // Redis cache with longer TTL (slower, large capacity)
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  layer?: CacheLayer; // Which cache layer to use
  tags?: string[]; // Tags for cache invalidation
  compress?: boolean; // Whether to compress the data
}

export interface CacheStats {
  layer: CacheLayer;
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsed?: string;
}

export interface CacheKey {
  prefix: string;
  identifier: string;
  params?: Record<string, any>;
}

export interface CacheWarmingConfig {
  key: string;
  fetchFunction: () => Promise<any>;
  ttl: number;
  layer: CacheLayer;
  schedule?: string; // Cron expression
}

export interface CacheInvalidationPattern {
  pattern: string;
  layer?: CacheLayer;
}

export interface CdnConfig {
  provider: 'cloudflare' | 'cloudfront' | 'fastly';
  apiKey?: string;
  zoneId?: string;
  distributionId?: string;
  baseUrl: string;
}

export interface CdnPurgeOptions {
  urls?: string[];
  tags?: string[];
  purgeEverything?: boolean;
}
