import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  CreatePostDto,
  UpdatePostDto,
  SchedulePostDto,
  PublishNowDto,
  UpdatePlatformContentDto,
} from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostStatus } from './entities/post.entity';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * Create a new post
   * POST /api/v1/posts
   */
  @HttpPost()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(req.user.tenantId, req.user.userId, createPostDto);
  }

  /**
   * Get all posts
   * GET /api/v1/posts
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: PostStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.postService.findAll(req.user.tenantId, {
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  /**
   * Get calendar view of posts
   * GET /api/v1/posts/calendar
   */
  @Get('calendar')
  async getCalendar(
    @Request() req,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.postService.getCalendar(
      req.user.tenantId,
      new Date(start),
      new Date(end),
    );
  }

  /**
   * Get a single post
   * GET /api/v1/posts/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.postService.findOne(req.user.tenantId, id);
  }

  /**
   * Update a post
   * PATCH /api/v1/posts/:id
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(req.user.tenantId, id, updatePostDto);
  }

  /**
   * Delete a post
   * DELETE /api/v1/posts/:id
   */
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.postService.remove(req.user.tenantId, id);
    return { message: 'Post deleted successfully' };
  }

  /**
   * Schedule a post
   * POST /api/v1/posts/:id/schedule
   */
  @HttpPost(':id/schedule')
  async schedule(@Request() req, @Body() scheduleDto: SchedulePostDto) {
    await this.postService.schedulePost(scheduleDto.postId, new Date(scheduleDto.scheduledAt));
    return { message: 'Post scheduled successfully' };
  }

  /**
   * Cancel a scheduled post
   * POST /api/v1/posts/:id/cancel
   */
  @HttpPost(':id/cancel')
  async cancel(@Request() req, @Param('id') id: string) {
    await this.postService.cancelScheduledPost(id);
    return { message: 'Scheduled post cancelled' };
  }

  /**
   * Publish a post immediately
   * POST /api/v1/posts/:id/publish
   */
  @HttpPost(':id/publish')
  async publishNow(@Request() req, @Param('id') id: string) {
    return this.postService.publishNow(req.user.tenantId, id);
  }

  /**
   * Update platform-specific content
   * PATCH /api/v1/posts/:id/platforms
   */
  @Patch(':id/platforms')
  async updatePlatformContent(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdatePlatformContentDto,
  ) {
    return this.postService.updatePlatformContent(
      req.user.tenantId,
      id,
      updateDto.socialAccountId,
      updateDto.customContent,
      updateDto.platformSettings,
    );
  }

  /**
   * Duplicate a post
   * POST /api/v1/posts/:id/duplicate
   */
  @HttpPost(':id/duplicate')
  async duplicate(@Request() req, @Param('id') id: string) {
    return this.postService.duplicate(req.user.tenantId, id, req.user.userId);
  }
}
