import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/common/cache/cache.constants';

/**
 * Decorator to enable API response caching
 * @param ttl Time to live in seconds
 * @param key Optional custom cache key
 */
export const CacheApi = (ttl: number, key?: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (key) {
      SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    }
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator to disable caching for a specific route
 */
export const NoCache = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, null)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, 0)(target, propertyKey, descriptor);
    return descriptor;
  };
};
