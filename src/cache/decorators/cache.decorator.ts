import { SetMetadata } from '@nestjs/common';
import { CacheLayer } from '../interfaces/cache.interface';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_LAYER_METADATA = 'cache:layer';
export const CACHE_TAGS_METADATA = 'cache:tags';

/**
 * Decorator to enable caching for a method
 * @param key - Cache key or function to generate key
 * @param ttl - Time to live in seconds
 * @param layer - Cache layer to use
 * @param tags - Tags for cache invalidation
 */
export const Cacheable = (
  key: string | ((args: any[]) => string),
  ttl?: number,
  layer?: CacheLayer,
  tags?: string[],
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    if (ttl !== undefined) {
      SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    }
    if (layer !== undefined) {
      SetMetadata(CACHE_LAYER_METADATA, layer)(target, propertyKey, descriptor);
    }
    if (tags !== undefined) {
      SetMetadata(CACHE_TAGS_METADATA, tags)(target, propertyKey, descriptor);
    }
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache after method execution
 * @param patterns - Cache key patterns to invalidate
 */
export const CacheEvict = (patterns: string | string[]) => {
  return SetMetadata('cache:evict', Array.isArray(patterns) ? patterns : [patterns]);
};

/**
 * Decorator to set cache headers for HTTP responses
 * @param maxAge - Max age in seconds
 * @param sMaxAge - Shared cache max age
 * @param staleWhileRevalidate - Stale while revalidate time
 */
export const CacheControl = (
  maxAge: number,
  sMaxAge?: number,
  staleWhileRevalidate?: number,
) => {
  return SetMetadata('cache:control', { maxAge, sMaxAge, staleWhileRevalidate });
};
