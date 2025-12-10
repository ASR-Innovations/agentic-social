import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThanOrEqual } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Post, PostPlatform, PostStatus, PublishStatus } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostPlatform)
    private postPlatformRepository: Repository<PostPlatform>,
    @Optional()
    @InjectQueue('post-publishing')
    private publishQueue: Queue,
  ) {
    if (!this.publishQueue) {
      this.logger.warn('Bull queue not available - scheduling will be handled by cron job');
    }
  }

  /**
   * Create a new post
   */
  async create(tenantId: string, userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const { socialAccountIds, platformSettings, ...postData } = createPostDto;

    // Create post
    const post = this.postRepository.create({
      ...postData,
      tenantId,
      createdBy: userId,
      status: createPostDto.scheduledAt ? PostStatus.SCHEDULED : (createPostDto.status || PostStatus.DRAFT),
    });

    const savedPost = await this.postRepository.save(post);

    // Create post-platform mappings
    if (socialAccountIds && socialAccountIds.length > 0) {
      const postPlatforms = socialAccountIds.map((accountId) =>
        this.postPlatformRepository.create({
          postId: savedPost.id,
          socialAccountId: accountId,
          status: PublishStatus.PENDING,
          platformSettings: platformSettings || {},
        }),
      );

      await this.postPlatformRepository.save(postPlatforms);
    }

    // Schedule post if scheduledAt is provided
    if (createPostDto.scheduledAt) {
      try {
        await this.schedulePost(savedPost.id, new Date(createPostDto.scheduledAt));
      } catch (error) {
        this.logger.warn(`Failed to schedule post: ${error.message}`);
        // Post is still created, just not queued
      }
    }

    return this.findOne(tenantId, savedPost.id);
  }

  /**
   * Find all posts for a tenant
   */
  async findAll(
    tenantId: string,
    options?: {
      status?: PostStatus;
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ posts: Post[]; total: number }> {
    const where: any = { tenantId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.from && options?.to) {
      where.createdAt = Between(options.from, options.to);
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      relations: ['platforms', 'creator'],
      order: { createdAt: 'DESC' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return { posts, total };
  }

  /**
   * Find one post by ID
   */
  async findOne(tenantId: string, postId: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId, tenantId },
      relations: ['platforms', 'creator'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   * Update a post
   */
  async update(tenantId: string, postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(tenantId, postId);

    // Don't allow editing published posts
    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Cannot edit published posts');
    }

    Object.assign(post, updatePostDto);

    // Update status if scheduling
    if (updatePostDto.scheduledAt) {
      post.status = PostStatus.SCHEDULED;
      await this.schedulePost(postId, new Date(updatePostDto.scheduledAt));
    }

    return await this.postRepository.save(post);
  }

  /**
   * Delete a post
   */
  async remove(tenantId: string, postId: string): Promise<void> {
    const post = await this.findOne(tenantId, postId);

    // Cancel scheduled job if exists
    if (post.status === PostStatus.SCHEDULED) {
      await this.cancelScheduledPost(postId);
    }

    await this.postRepository.remove(post);
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(postId: string, scheduledAt: Date): Promise<void> {
    const delay = scheduledAt.getTime() - Date.now();

    if (delay < 0) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    if (!this.publishQueue) {
      this.logger.warn(`Queue not available - post ${postId} saved with scheduled status, will be processed by cron job`);
      return;
    }

    try {
      await this.publishQueue.add(
        'publish-scheduled-post',
        { postId },
        {
          jobId: `post-${postId}`,
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      this.logger.log(`Scheduled post ${postId} for ${scheduledAt.toISOString()}`);
    } catch (error) {
      this.logger.warn(`Failed to add job to queue (Redis may not be running): ${error.message}`);
      // Post is still saved with SCHEDULED status, can be processed by a cron job later
      this.logger.log(`Post ${postId} saved with scheduled status, will be processed by cron job`);
    }
  }

  /**
   * Cancel a scheduled post
   */
  async cancelScheduledPost(postId: string): Promise<void> {
    if (this.publishQueue) {
      try {
        const job = await this.publishQueue.getJob(`post-${postId}`);
        if (job) {
          await job.remove();
          this.logger.log(`Cancelled scheduled post ${postId}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to remove job from queue: ${error.message}`);
      }
    }

    // Update post status
    await this.postRepository.update({ id: postId }, { status: PostStatus.CANCELLED });
  }

  /**
   * Publish a post immediately
   */
  async publishNow(tenantId: string, postId: string): Promise<Post> {
    this.logger.log(`[PUBLISH-NOW] ========== Starting publishNow for post ${postId} ==========`);
    this.logger.log(`[PUBLISH-NOW] Tenant: ${tenantId}, Timestamp: ${new Date().toISOString()}`);
    
    const post = await this.findOne(tenantId, postId);
    this.logger.log(`[PUBLISH-NOW] Post found: title="${post.title}", status=${post.status}, content length=${post.content?.length || 0}`);

    if (post.status === PostStatus.PUBLISHED) {
      this.logger.warn(`[PUBLISH-NOW] Post ${postId} is already published`);
      throw new BadRequestException('Post is already published');
    }

    if (post.status === PostStatus.PUBLISHING) {
      this.logger.warn(`[PUBLISH-NOW] Post ${postId} is currently being published`);
      throw new BadRequestException('Post is currently being published');
    }

    // Update status
    post.status = PostStatus.PUBLISHING;
    await this.postRepository.save(post);
    this.logger.log(`[PUBLISH-NOW] Post status updated to PUBLISHING`);

    // Add to publish queue if available
    if (this.publishQueue) {
      try {
        this.logger.log(`[PUBLISH-NOW] Adding to Bull queue...`);
        const job = await this.publishQueue.add(
          'publish-now',
          { postId },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
        this.logger.log(`[PUBLISH-NOW] Job added to queue: jobId=${job.id}`);
        this.logger.log(`[PUBLISH-NOW] ========== publishNow queued successfully ==========`);
      } catch (error) {
        this.logger.error(`[PUBLISH-NOW] Failed to add to queue: ${error.message}`);
        post.status = PostStatus.FAILED;
        post.metadata = { ...post.metadata, error: 'Queue unavailable' };
        await this.postRepository.save(post);
        this.logger.log(`[PUBLISH-NOW] ========== publishNow FAILED ==========`);
      }
    } else {
      this.logger.warn(`[PUBLISH-NOW] Queue not available - post ${postId} marked as publishing but needs manual processing`);
    }

    return post;
  }

  /**
   * Update platform-specific content
   */
  async updatePlatformContent(
    tenantId: string,
    postId: string,
    socialAccountId: string,
    customContent: string,
    platformSettings?: Record<string, any>,
  ): Promise<PostPlatform> {
    await this.findOne(tenantId, postId);

    const postPlatform = await this.postPlatformRepository.findOne({
      where: { postId, socialAccountId },
    });

    if (!postPlatform) {
      throw new NotFoundException('Post platform mapping not found');
    }

    postPlatform.customContent = customContent;
    if (platformSettings) {
      postPlatform.platformSettings = platformSettings;
    }

    return await this.postPlatformRepository.save(postPlatform);
  }

  /**
   * Get posts scheduled for a date range (for calendar view)
   */
  async getCalendar(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Post[]> {
    return await this.postRepository.find({
      where: {
        tenantId,
        scheduledAt: Between(startDate, endDate),
        status: In([PostStatus.SCHEDULED, PostStatus.PUBLISHED]),
      },
      relations: ['platforms'],
      order: { scheduledAt: 'ASC' },
    });
  }

  /**
   * Get posts that need to be published (for cron job)
   */
  async getPostsToPublish(): Promise<Post[]> {
    return await this.postRepository.find({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: LessThanOrEqual(new Date()),
      },
      relations: ['platforms'],
    });
  }

  /**
   * Mark post as published
   */
  async markAsPublished(postId: string): Promise<void> {
    await this.postRepository.update(
      { id: postId },
      {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    );
  }

  /**
   * Mark post as failed
   */
  async markAsFailed(postId: string, error: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (post) {
      post.status = PostStatus.FAILED;
      post.metadata = { ...post.metadata, error };
      await this.postRepository.save(post);
    }
  }

  /**
   * Update post platform status
   */
  async updatePlatformStatus(
    platformId: string,
    status: PublishStatus,
    platformPostId?: string,
    platformPostUrl?: string,
    error?: string,
  ): Promise<void> {
    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (platformPostId) {
      updates.platformPostId = platformPostId;
      updates.publishedAt = new Date();
    }

    if (platformPostUrl) {
      updates.platformPostUrl = platformPostUrl;
    }

    if (error) {
      updates.errorMessage = error;
      updates.retryCount = () => 'retry_count + 1';
    }

    await this.postPlatformRepository.update({ id: platformId }, updates);
  }

  /**
   * Duplicate a post
   */
  async duplicate(tenantId: string, postId: string, userId: string): Promise<Post> {
    const originalPost = await this.findOne(tenantId, postId);

    const newPost = this.postRepository.create({
      tenantId,
      createdBy: userId,
      title: `${originalPost.title} (Copy)`,
      content: originalPost.content,
      type: originalPost.type,
      status: PostStatus.DRAFT,
      mediaUrls: originalPost.mediaUrls,
      mediaMetadata: originalPost.mediaMetadata,
      metadata: originalPost.metadata,
    });

    const savedPost = await this.postRepository.save(newPost);

    // Copy platform mappings
    if (originalPost.platforms && originalPost.platforms.length > 0) {
      const newPlatforms = originalPost.platforms.map((platform) =>
        this.postPlatformRepository.create({
          postId: savedPost.id,
          socialAccountId: platform.socialAccountId,
          status: PublishStatus.PENDING,
          platformSettings: platform.platformSettings,
          customContent: platform.customContent,
        }),
      );

      await this.postPlatformRepository.save(newPlatforms);
    }

    return this.findOne(tenantId, savedPost.id);
  }
}
