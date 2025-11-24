import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InstagramGridService } from './services/instagram-grid.service';
import { InstagramStoryService } from './services/instagram-story.service';
import { InstagramAestheticService } from './services/instagram-aesthetic.service';
import { InstagramShopService } from './services/instagram-shop.service';
import { InstagramReelsService } from './services/instagram-reels.service';
import {
  GridPreviewRequestDto,
  GridPreviewResponseDto,
  GridRearrangeDto,
} from './dto/grid-preview.dto';
import {
  CreateStoryDto,
  ScheduleStoryDto,
} from './dto/story.dto';
import {
  AnalyzeAestheticDto,
  AestheticScoreDto,
  ColorPaletteDto,
  ColorPaletteResponseDto,
} from './dto/aesthetic.dto';
import {
  TagProductDto,
  CreateShoppablePostDto,
  SyncInstagramShopDto,
  InstagramShopProductDto,
} from './dto/shop.dto';
import {
  CreateReelDto,
  OptimizeReelDto,
  ReelOptimizationResponseDto,
  ReelAnalyticsDto,
  ReelAnalyticsResponseDto,
} from './dto/reels.dto';

@ApiTags('Instagram')
@Controller('instagram')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InstagramController {
  constructor(
    private readonly gridService: InstagramGridService,
    private readonly storyService: InstagramStoryService,
    private readonly aestheticService: InstagramAestheticService,
    private readonly shopService: InstagramShopService,
    private readonly reelsService: InstagramReelsService,
  ) {}

  // ============================================
  // Grid Preview & Management
  // ============================================

  @Get('grid/preview')
  @ApiOperation({ summary: 'Get Instagram grid preview' })
  @ApiResponse({ status: 200, description: 'Grid preview retrieved', type: GridPreviewResponseDto })
  async getGridPreview(
    @Request() req: any,
    @Query() dto: GridPreviewRequestDto,
  ): Promise<GridPreviewResponseDto> {
    return this.gridService.getGridPreview(req.user.workspaceId, dto);
  }

  @Put('grid/rearrange')
  @ApiOperation({ summary: 'Rearrange grid posts' })
  @ApiResponse({ status: 200, description: 'Grid rearranged successfully', type: GridPreviewResponseDto })
  async rearrangeGrid(
    @Request() req: any,
    @Body() dto: GridRearrangeDto,
  ): Promise<GridPreviewResponseDto> {
    return this.gridService.rearrangeGrid(req.user.workspaceId, dto);
  }

  // ============================================
  // Stories
  // ============================================

  @Post('stories')
  @ApiOperation({ summary: 'Create and publish Instagram Story' })
  @ApiResponse({ status: 201, description: 'Story created successfully' })
  async createStory(
    @Request() req: any,
    @Body() dto: CreateStoryDto,
  ): Promise<{ success: boolean; storyId?: string; error?: string }> {
    return this.storyService.createStory(req.user.workspaceId, dto);
  }

  @Post('stories/schedule')
  @ApiOperation({ summary: 'Schedule Instagram Story' })
  @ApiResponse({ status: 201, description: 'Story scheduled successfully' })
  async scheduleStory(
    @Request() req: any,
    @Body() dto: ScheduleStoryDto,
  ): Promise<{ success: boolean; scheduledId?: string; error?: string }> {
    return this.storyService.scheduleStory(req.user.workspaceId, dto);
  }

  @Get('stories/:storyId/analytics')
  @ApiOperation({ summary: 'Get story analytics' })
  @ApiResponse({ status: 200, description: 'Story analytics retrieved' })
  async getStoryAnalytics(
    @Request() req: any,
    @Param('storyId') storyId: string,
  ): Promise<any> {
    return this.storyService.getStoryAnalytics(req.user.workspaceId, storyId);
  }

  // ============================================
  // Aesthetic Analysis
  // ============================================

  @Post('aesthetic/analyze')
  @ApiOperation({ summary: 'Analyze Instagram aesthetic' })
  @ApiResponse({ status: 200, description: 'Aesthetic analysis completed', type: AestheticScoreDto })
  async analyzeAesthetic(
    @Request() req: any,
    @Body() dto: AnalyzeAestheticDto,
  ): Promise<AestheticScoreDto> {
    return this.aestheticService.analyzeAesthetic(req.user.workspaceId, dto);
  }

  @Post('aesthetic/color-palette')
  @ApiOperation({ summary: 'Extract color palette from image' })
  @ApiResponse({ status: 200, description: 'Color palette extracted', type: ColorPaletteResponseDto })
  async extractColorPalette(
    @Body() dto: ColorPaletteDto,
  ): Promise<ColorPaletteResponseDto> {
    return this.aestheticService.extractColorPalette(dto);
  }

  // ============================================
  // Instagram Shop
  // ============================================

  @Post('shop/posts')
  @ApiOperation({ summary: 'Create shoppable Instagram post' })
  @ApiResponse({ status: 201, description: 'Shoppable post created' })
  async createShoppablePost(
    @Request() req: any,
    @Body() dto: CreateShoppablePostDto,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    return this.shopService.createShoppablePost(req.user.workspaceId, dto);
  }

  @Post('shop/tag-product')
  @ApiOperation({ summary: 'Tag product in post' })
  @ApiResponse({ status: 200, description: 'Product tagged successfully' })
  async tagProduct(
    @Request() req: any,
    @Body() dto: TagProductDto,
  ): Promise<{ success: boolean; error?: string }> {
    return this.shopService.tagProduct(req.user.workspaceId, dto);
  }

  @Post('shop/sync')
  @ApiOperation({ summary: 'Sync Instagram Shop with commerce platform' })
  @ApiResponse({ status: 200, description: 'Shop synced successfully' })
  async syncInstagramShop(
    @Request() req: any,
    @Body() dto: SyncInstagramShopDto,
  ): Promise<{ success: boolean; syncedProducts?: number; error?: string }> {
    return this.shopService.syncInstagramShop(req.user.workspaceId, dto);
  }

  @Get('shop/products')
  @ApiOperation({ summary: 'Get Instagram Shop products' })
  @ApiResponse({ status: 200, description: 'Products retrieved', type: [InstagramShopProductDto] })
  async getShopProducts(
    @Request() req: any,
    @Query('accountId') accountId: string,
  ): Promise<InstagramShopProductDto[]> {
    return this.shopService.getShopProducts(req.user.workspaceId, accountId);
  }

  @Get('shop/posts/:postId/analytics')
  @ApiOperation({ summary: 'Get shopping analytics for post' })
  @ApiResponse({ status: 200, description: 'Shopping analytics retrieved' })
  async getShoppingAnalytics(
    @Request() req: any,
    @Param('postId') postId: string,
  ): Promise<any> {
    return this.shopService.getShoppingAnalytics(req.user.workspaceId, postId);
  }

  // ============================================
  // Reels
  // ============================================

  @Post('reels')
  @ApiOperation({ summary: 'Create Instagram Reel' })
  @ApiResponse({ status: 201, description: 'Reel created successfully' })
  async createReel(
    @Request() req: any,
    @Body() dto: CreateReelDto,
  ): Promise<{ success: boolean; reelId?: string; error?: string }> {
    return this.reelsService.createReel(req.user.workspaceId, dto);
  }

  @Post('reels/optimize')
  @ApiOperation({ summary: 'Optimize video for Reels' })
  @ApiResponse({ status: 200, description: 'Video optimized', type: ReelOptimizationResponseDto })
  async optimizeReel(
    @Request() req: any,
    @Body() dto: OptimizeReelDto,
  ): Promise<ReelOptimizationResponseDto> {
    return this.reelsService.optimizeReel(req.user.workspaceId, dto);
  }

  @Get('reels/:postId/analytics')
  @ApiOperation({ summary: 'Get Reel analytics' })
  @ApiResponse({ status: 200, description: 'Reel analytics retrieved', type: ReelAnalyticsResponseDto })
  async getReelAnalytics(
    @Request() req: any,
    @Param('postId') postId: string,
  ): Promise<ReelAnalyticsResponseDto> {
    return this.reelsService.getReelAnalytics(req.user.workspaceId, { postId });
  }

  @Get('reels/recommendations')
  @ApiOperation({ summary: 'Get Reels optimization recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved' })
  async getReelsRecommendations(
    @Request() req: any,
    @Query('accountId') accountId: string,
  ): Promise<any> {
    return this.reelsService.getReelsRecommendations(req.user.workspaceId, accountId);
  }

  @Get('reels/best-practices')
  @ApiOperation({ summary: 'Get Reels best practices' })
  @ApiResponse({ status: 200, description: 'Best practices retrieved' })
  getBestPractices(): any {
    return this.reelsService.getBestPractices();
  }
}
