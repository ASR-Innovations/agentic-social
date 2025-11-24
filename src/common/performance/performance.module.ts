import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from '../dataloader/dataloader.service';
import { CursorPaginationService } from '../pagination/cursor-pagination.service';
import { RequestBatcherService } from '../batching/request-batcher.service';
import { CacheResponseInterceptor } from '../interceptors/cache-response.interceptor';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../../cache/cache.module';

/**
 * Global module providing performance optimization utilities
 * - DataLoader for N+1 prevention
 * - Cursor-based pagination
 * - Request batching
 * - Response caching
 */
@Global()
@Module({
  imports: [PrismaModule, CacheModule],
  providers: [
    DataLoaderService,
    CursorPaginationService,
    RequestBatcherService,
    CacheResponseInterceptor,
  ],
  exports: [
    DataLoaderService,
    CursorPaginationService,
    RequestBatcherService,
    CacheResponseInterceptor,
  ],
})
export class PerformanceModule {}
