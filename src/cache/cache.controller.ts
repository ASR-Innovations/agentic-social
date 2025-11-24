import {
  Controller,
  Get,
  Delete,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheService } from './services/cache.service';
import { CacheInvalidationService } from './services/cache-invalidation.service';
import { CacheWarmingService } from './services/cache-warming.service';
import { CdnService } from './services/cdn.service';
import { CacheLayer } from './interfaces/cache.interface';

@ApiTags('Cache Management')
@Controller('api/cache')
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly invalidationService: CacheInvalidationService,
    private readonly warmingService: CacheWarmingService,
    private readonly cdnService: CdnService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics retrieved' })
  async getStats() {
    return await this.cacheService.getStats();
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache(@Query('layer') layer?: CacheLayer) {
    await this.cacheService.clear(layer);
    return { message: 'Cache cleared successfully', layer };
  }

  @Delete('key/:key')
  @ApiOperation({ summary: 'Delete specific cache key' })
  @ApiResponse({ status: 200, description: 'Cache key deleted' })
  async deleteKey(
    @Param('key') key: string,
    @Query('layer') layer?: CacheLayer,
  ) {
    await this.cacheService.delete(key, layer);
    return { message: 'Cache key deleted', key };
  }

  @Delete('pattern')
  @ApiOperation({ summary: 'Delete cache keys by pattern' })
  @ApiResponse({ status: 200, description: 'Cache keys deleted' })
  async deleteByPattern(
    @Query('pattern') pattern: string,
    @Query('layer') layer?: CacheLayer,
  ) {
    const count = await this.cacheService.deleteByPattern(pattern, layer);
    return { message: 'Cache keys deleted', pattern, count };
  }

  @Delete('tags')
  @ApiOperation({ summary: 'Delete cache by tags' })
  @ApiResponse({ status: 200, description: 'Cache deleted by tags' })
  async deleteByTags(@Body() body: { tags: string[] }) {
    const count = await this.cacheService.deleteByTags(body.tags);
    return { message: 'Cache deleted by tags', tags: body.tags, count };
  }

  @Post('invalidate/workspace/:workspaceId')
  @ApiOperation({ summary: 'Invalidate workspace cache' })
  @ApiResponse({ status: 200, description: 'Workspace cache invalidated' })
  async invalidateWorkspace(@Param('workspaceId') workspaceId: string) {
    await this.invalidationService.invalidateWorkspaceCache(workspaceId);
    return { message: 'Workspace cache invalidated', workspaceId };
  }

  @Post('invalidate/post/:postId')
  @ApiOperation({ summary: 'Invalidate post cache' })
  @ApiResponse({ status: 200, description: 'Post cache invalidated' })
  async invalidatePost(
    @Param('postId') postId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    await this.invalidationService.invalidatePostCache(postId, workspaceId);
    return { message: 'Post cache invalidated', postId };
  }

  @Post('invalidate/account/:accountId')
  @ApiOperation({ summary: 'Invalidate social account cache' })
  @ApiResponse({ status: 200, description: 'Account cache invalidated' })
  async invalidateAccount(
    @Param('accountId') accountId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    await this.invalidationService.invalidateSocialAccountCache(
      accountId,
      workspaceId,
    );
    return { message: 'Account cache invalidated', accountId };
  }

  @Post('warm')
  @ApiOperation({ summary: 'Warm all caches' })
  @ApiResponse({ status: 200, description: 'Cache warming initiated' })
  async warmAllCaches() {
    await this.warmingService.warmAllCaches();
    return { message: 'Cache warming completed' };
  }

  @Post('warm/workspace/:workspaceId')
  @ApiOperation({ summary: 'Warm workspace cache' })
  @ApiResponse({ status: 200, description: 'Workspace cache warmed' })
  async warmWorkspaceCache(@Param('workspaceId') workspaceId: string) {
    await this.warmingService.warmWorkspaceCache(workspaceId);
    return { message: 'Workspace cache warmed', workspaceId };
  }

  @Post('warm/user/:userId')
  @ApiOperation({ summary: 'Warm user cache' })
  @ApiResponse({ status: 200, description: 'User cache warmed' })
  async warmUserCache(
    @Param('userId') userId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    await this.warmingService.warmUserCache(userId, workspaceId);
    return { message: 'User cache warmed', userId };
  }

  @Post('cdn/purge')
  @ApiOperation({ summary: 'Purge CDN cache' })
  @ApiResponse({ status: 200, description: 'CDN cache purged' })
  async purgeCdn(
    @Body()
    body: {
      urls?: string[];
      tags?: string[];
      purgeEverything?: boolean;
    },
  ) {
    const success = await this.cdnService.purgeCache(body);
    return { message: 'CDN purge initiated', success };
  }

  @Post('cdn/purge/media')
  @ApiOperation({ summary: 'Purge media assets from CDN' })
  @ApiResponse({ status: 200, description: 'Media assets purged' })
  async purgeMediaAssets(@Body() body: { paths: string[] }) {
    const success = await this.cdnService.purgeMediaAssets(body.paths);
    return { message: 'Media assets purged', success, count: body.paths.length };
  }

  @Get('cdn/url')
  @ApiOperation({ summary: 'Get CDN URL for asset' })
  @ApiResponse({ status: 200, description: 'CDN URL retrieved' })
  getCdnUrl(@Query('path') path: string) {
    const cdnUrl = this.cdnService.getCdnUrl(path);
    return { path, cdnUrl };
  }
}
