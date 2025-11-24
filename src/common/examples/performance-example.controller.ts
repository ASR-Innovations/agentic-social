import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DataLoaderService } from '../dataloader/dataloader.service';
import { CursorPaginationService } from '../pagination/cursor-pagination.service';
import { CursorPaginationDto, CursorPaginationResponse } from '../pagination/cursor-pagination.dto';
import { RequestBatcherService } from '../batching/request-batcher.service';
import { CacheResponseInterceptor } from '../interceptors/cache-response.interceptor';
import { CacheApi } from '../decorators/cache-api.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Example controller demonstrating API performance optimization features
 * This shows how to use DataLoader, cursor pagination, caching, and batching
 */
@ApiTags('Performance Examples')
@Controller('examples/performance')
@UseInterceptors(CacheResponseInterceptor)
export class PerformanceExampleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataLoaderService: DataLoaderService,
    private readonly paginationService: CursorPaginationService,
    private readonly batcherService: RequestBatcherService,
  ) {}

  /**
   * Example 1: Using DataLoader to prevent N+1 queries
   * When fetching posts with their authors, DataLoader batches author queries
   */
  @Get('posts-with-authors')
  @ApiOperation({
    summary: 'Get posts with authors (DataLoader example)',
    description: 'Demonstrates N+1 prevention using DataLoader to batch author queries',
  })
  @CacheApi(300) // Cache for 5 minutes
  async getPostsWithAuthors() {
    // Fetch posts
    const posts = await this.prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Use DataLoader to batch-load authors
    // Instead of N queries (one per post), this makes 1 batched query
    const userLoader = this.dataLoaderService.getUserLoader();
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        author: await userLoader.load(post.authorId),
      })),
    );

    return {
      posts: postsWithAuthors,
      message: 'Authors loaded efficiently using DataLoader',
    };
  }

  /**
   * Example 2: Cursor-based pagination
   * More efficient than offset-based pagination for large datasets
   */
  @Get('posts-paginated')
  @ApiOperation({
    summary: 'Get paginated posts (Cursor pagination example)',
    description: 'Demonstrates efficient cursor-based pagination',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @CacheApi(60) // Cache for 1 minute
  async getPostsPaginated(
    @Query() paginationDto: CursorPaginationDto,
  ): Promise<CursorPaginationResponse<any>> {
    const { cursor, limit = 20, direction = 'forward' } = paginationDto;

    // Build pagination query
    const query = this.paginationService.buildPaginationQuery(
      cursor,
      limit,
      direction,
      { status: 'published' }, // Additional filters
    );

    // Fetch posts
    const posts = await this.prisma.post.findMany(query);

    // Create paginated response with cursor information
    return this.paginationService.createResponse(posts, limit, direction);
  }

  /**
   * Example 3: Request batching
   * Batch multiple similar requests into a single operation
   */
  @Get('user-stats')
  @ApiOperation({
    summary: 'Get user statistics (Request batching example)',
    description: 'Demonstrates batching multiple user stat requests',
  })
  @ApiQuery({ name: 'userId', required: true, type: String })
  async getUserStats(@Query('userId') userId: string) {
    // This request will be automatically batched with other similar requests
    // within a 10ms window
    const stats = await this.batcherService.addToBatch(
      'user-stats',
      userId,
      async (userIds: string[]) => {
        // This function is called once for all batched requests
        const users = await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          include: {
            _count: {
              select: {
                posts: true,
              },
            } as any,
          },
        });

        // Return stats in the same order as requested
        return userIds.map((id) => {
          const user = users.find((u) => u.id === id);
          return {
            userId: id,
            postCount: (user as any)?._count?.posts || 0,
            found: !!user,
          };
        });
      },
      { batchWindow: 10, maxBatchSize: 50 },
    );

    return stats;
  }

  /**
   * Example 4: Combined optimization
   * Uses DataLoader, pagination, and caching together
   */
  @Get('workspace-posts')
  @ApiOperation({
    summary: 'Get workspace posts with full optimization',
    description: 'Demonstrates combined use of DataLoader, pagination, and caching',
  })
  @ApiQuery({ name: 'workspaceId', required: true, type: String })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @CacheApi(120) // Cache for 2 minutes
  async getWorkspacePosts(
    @Query('workspaceId') workspaceId: string,
    @Query() paginationDto: CursorPaginationDto,
  ) {
    const { cursor, limit = 20, direction = 'forward' } = paginationDto;

    // Build pagination query with workspace filter
    const query = this.paginationService.buildPaginationQuery(
      cursor,
      limit,
      direction,
      { workspaceId },
    );

    // Fetch posts
    const posts = await this.prisma.post.findMany(query);

    // Use DataLoader to efficiently load related data
    const userLoader = this.dataLoaderService.getUserLoader();
    const campaignLoader = this.dataLoaderService.getCampaignLoader();

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        author: post.authorId ? await userLoader.load(post.authorId) : null,
        campaign: post.campaignId ? await campaignLoader.load(post.campaignId) : null,
      })),
    );

    // Create paginated response
    const response = this.paginationService.createResponse(
      enrichedPosts,
      limit,
      direction,
    );

    return {
      ...response,
      optimizations: {
        dataLoader: 'Batched author and campaign queries',
        pagination: 'Cursor-based for efficient large dataset handling',
        caching: 'Response cached for 2 minutes',
      },
    };
  }
}
