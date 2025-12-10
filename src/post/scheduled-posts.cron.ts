import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Post, PostPlatform, PostStatus, PublishStatus } from './entities/post.entity';
import { SocialAccountService } from '../social-account/social-account.service';
import { PlatformClientFactory } from '../social-account/services/platform-client.factory';

@Injectable()
export class ScheduledPostsCron {
  private readonly logger = new Logger(ScheduledPostsCron.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostPlatform)
    private postPlatformRepository: Repository<PostPlatform>,
    private socialAccountService: SocialAccountService,
    private platformClientFactory: PlatformClientFactory,
  ) {}

  /**
   * Run every minute to check for scheduled posts that need publishing
   * This is a fallback mechanism for when Redis/Bull queue is unavailable
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts() {
    if (this.isProcessing) {
      this.logger.debug('Already processing scheduled posts, skipping...');
      return;
    }

    this.isProcessing = true;
    
    try {
      const postsToPublish = await this.postRepository.find({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: LessThanOrEqual(new Date()),
        },
        relations: ['platforms'],
      });

      if (postsToPublish.length === 0) {
        return;
      }

      this.logger.log(`Found ${postsToPublish.length} scheduled post(s) to publish`);

      for (const post of postsToPublish) {
        await this.publishPost(post);
      }
    } catch (error) {
      this.logger.error(`Error processing scheduled posts: ${error.message}`, error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Publish a single post to all its platforms
   */
  private async publishPost(post: Post): Promise<void> {
    this.logger.log(`Publishing scheduled post: ${post.id} - "${post.title}"`);

    if (!post.platforms || post.platforms.length === 0) {
      this.logger.warn(`Post ${post.id} has no platforms configured, marking as failed`);
      await this.markPostFailed(post.id, 'No platforms configured');
      return;
    }

    // Update status to publishing
    post.status = PostStatus.PUBLISHING;
    await this.postRepository.save(post);

    const results = await Promise.allSettled(
      post.platforms.map((platform) => this.publishToPlatform(post, platform)),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    if (failCount === 0) {
      post.status = PostStatus.PUBLISHED;
      post.publishedAt = new Date();
      this.logger.log(`Post ${post.id} published successfully to all ${successCount} platform(s)`);
    } else if (successCount > 0) {
      post.status = PostStatus.PUBLISHED;
      post.publishedAt = new Date();
      post.metadata = { 
        ...post.metadata, 
        partialPublish: true, 
        successCount, 
        failCount 
      };
      this.logger.warn(`Post ${post.id} partially published: ${successCount} success, ${failCount} failed`);
    } else {
      post.status = PostStatus.FAILED;
      post.metadata = { ...post.metadata, error: 'All platforms failed' };
      this.logger.error(`Post ${post.id} failed to publish to all platforms`);
    }

    await this.postRepository.save(post);
  }

  /**
   * Publish to a specific platform
   */
  private async publishToPlatform(post: Post, postPlatform: PostPlatform): Promise<void> {
    try {
      postPlatform.status = PublishStatus.PUBLISHING;
      await this.postPlatformRepository.save(postPlatform);

      const socialAccount = await this.socialAccountService.findOne(
        post.tenantId,
        postPlatform.socialAccountId,
      );

      const accessToken = await this.socialAccountService.getAccessToken(
        post.tenantId,
        postPlatform.socialAccountId,
      );

      const client = this.platformClientFactory.getClient(socialAccount.platform);
      const content = this.prepareContent(post, postPlatform, socialAccount);
      const result = await client.post(accessToken, content);

      postPlatform.status = PublishStatus.PUBLISHED;
      postPlatform.platformPostId = result.postId;
      postPlatform.platformPostUrl = result.url || result.postUrl;
      postPlatform.publishedAt = new Date();

      await this.postPlatformRepository.save(postPlatform);

      this.logger.log(`Published post ${post.id} to ${socialAccount.platform} (${result.postId})`);
    } catch (error) {
      this.logger.error(`Failed to publish to platform ${postPlatform.socialAccountId}: ${error.message}`);

      postPlatform.status = PublishStatus.FAILED;
      postPlatform.errorMessage = error.message;
      postPlatform.retryCount += 1;

      await this.postPlatformRepository.save(postPlatform);
      throw error;
    }
  }

  /**
   * Prepare content for platform
   */
  private prepareContent(post: Post, postPlatform: PostPlatform, socialAccount: any): any {
    const content = postPlatform.customContent || post.content;

    const baseContent: any = {
      text: content,
      caption: content,
      message: content,
    };

    if (post.mediaUrls && post.mediaUrls.length > 0) {
      baseContent.mediaUrls = post.mediaUrls;
      baseContent.mediaUrl = post.mediaUrls[0];
    }

    switch (socialAccount.platform) {
      case 'twitter':
        return { text: content, mediaIds: postPlatform.platformSettings?.mediaIds || [] };
      case 'linkedin':
        return { author: socialAccount.accountIdentifier, text: content, mediaUrls: post.mediaUrls };
      case 'instagram':
        return { accountId: socialAccount.accountIdentifier, caption: content, mediaUrl: post.mediaUrls?.[0] };
      case 'facebook':
        return { pageId: socialAccount.accountIdentifier, message: content };
      default:
        return baseContent;
    }
  }

  private async markPostFailed(postId: string, error: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (post) {
      post.status = PostStatus.FAILED;
      post.metadata = { ...post.metadata, error };
      await this.postRepository.save(post);
    }
  }
}
