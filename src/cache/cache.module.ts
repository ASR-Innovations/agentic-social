import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheService } from './services/cache.service';
import { CacheWarmingService } from './services/cache-warming.service';
import { CacheInvalidationService } from './services/cache-invalidation.service';
import { CdnService } from './services/cdn.service';
import { CacheController } from './cache.controller';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheControlInterceptor } from './interceptors/cache-control.interceptor';

@Global()
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    // L1 Cache: In-memory cache (fastest, smallest)
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: 'memory',
        max: 1000, // Maximum number of items in cache
        ttl: 60, // 1 minute default TTL for L1
      }),
    }),
    // L2/L3 Cache: Redis (persistent, shared across instances)
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          keyPrefix: 'app:',
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true,
        },
      }) as any,
    }),
  ],
  controllers: [CacheController],
  providers: [
    CacheService,
    CacheWarmingService,
    CacheInvalidationService,
    CdnService,
    CacheInterceptor,
    CacheControlInterceptor,
  ],
  exports: [
    CacheService,
    CacheWarmingService,
    CacheInvalidationService,
    CdnService,
    CacheInterceptor,
    CacheControlInterceptor,
  ],
})
export class CacheModule {}
