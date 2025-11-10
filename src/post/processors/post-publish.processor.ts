import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostPlatform, PostStatus, PublishStatus } from '../entities/post.entity';
import { SocialAccountService } from '../../social-account/social-account.service';
import { PlatformClientFactory } from '../../social-account/services/platform-client.factory';

@Processor('post-publishing')
export class PostPublishProcessor {
  private readonly logger = new Logger(PostPublishProcessor.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostPlatform)
    private postPlatformRepository: Repository<PostPlatform>,
    private socialAccountService: SocialAccountService,
    private platformClientFactory: PlatformClientFactory,
  ) {}

  @Process('publish-scheduled-post')
  async handleScheduledPost(job: Job) {
    const { postId } = job.data;
    this.logger.log(`Processing scheduled post: ${postId}`);

    try {
      await this.publishPost(postId);
      return { success: true, postId };
    } catch (error) {
      this.logger.error(`Failed to publish scheduled post ${postId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('publish-now')
  async handlePublishNow(job: Job) {
    const { postId } = job.data;
    this.logger.log(`Publishing post now: ${postId}`);

    try {
      await this.publishPost(postId);
      return { success: true, postId };
    } catch (error) {
      this.logger.error(`Failed to publish post ${postId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Publish a post to all connected platforms
   */
  private async publishPost(postId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['platforms'],
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (!post.platforms || post.platforms.length === 0) {
      throw new Error('No platforms configured for this post');
    }

    this.logger.log(`Publishing post ${postId} to ${post.platforms.length} platform(s)`);

    // Update post status
    post.status = PostStatus.PUBLISHING;
    await this.postRepository.save(post);

    const publishResults = await Promise.allSettled(
      post.platforms.map((platform) => this.publishToPlatform(post, platform)),
    );

    // Check if all platforms published successfully
    const allSuccessful = publishResults.every((result) => result.status === 'fulfilled');

    if (allSuccessful) {
      post.status = PostStatus.PUBLISHED;
      post.publishedAt = new Date();
      this.logger.log(`Post ${postId} published successfully to all platforms`);
    } else {
      const failedCount = publishResults.filter((r) => r.status === 'rejected').length;
      post.status = PostStatus.FAILED;
      this.logger.error(`Post ${postId} failed to publish to ${failedCount} platform(s)`);
    }

    await this.postRepository.save(post);
  }

  /**
   * Publish post to a specific platform
   */
  private async publishToPlatform(post: Post, postPlatform: PostPlatform): Promise<void> {
    try {
      // Update status to publishing
      postPlatform.status = PublishStatus.PUBLISHING;
      await this.postPlatformRepository.save(postPlatform);

      // Get social account
      const socialAccount = await this.socialAccountService.findOne(
        post.tenantId,
        postPlatform.socialAccountId,
      );

      // Get access token
      const accessToken = await this.socialAccountService.getAccessToken(
        post.tenantId,
        postPlatform.socialAccountId,
      );

      // Get platform client
      const client = this.platformClientFactory.getClient(socialAccount.platform);

      // Prepare content
      const content = this.prepareContent(post, postPlatform, socialAccount);

      // Publish to platform
      const result = await client.post(accessToken, content);

      // Update platform status
      postPlatform.status = PublishStatus.PUBLISHED;
      postPlatform.platformPostId = result.postId;
      postPlatform.platformPostUrl = result.url || result.postUrl;
      postPlatform.publishedAt = new Date();

      await this.postPlatformRepository.save(postPlatform);

      this.logger.log(
        `Successfully published post ${post.id} to ${socialAccount.platform} (${result.postId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish post ${post.id} to platform ${postPlatform.socialAccountId}: ${error.message}`,
        error.stack,
      );

      // Update platform status
      postPlatform.status = PublishStatus.FAILED;
      postPlatform.errorMessage = error.message;
      postPlatform.retryCount += 1;

      await this.postPlatformRepository.save(postPlatform);

      throw error;
    }
  }

  /**
   * Prepare content for specific platform
   */
  private prepareContent(post: Post, postPlatform: PostPlatform, socialAccount: any): any {
    const content = postPlatform.customContent || post.content;
    const platform = socialAccount.platform;

    // Platform-specific content preparation
    const baseContent: any = {
      text: content,
      caption: content,
      message: content,
    };

    // Add media
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      baseContent.mediaUrls = post.mediaUrls;
      baseContent.mediaUrl = post.mediaUrls[0];
      baseContent.photoUrl = post.mediaUrls[0];
      baseContent.videoUrl = post.mediaUrls[0];
    }

    // Platform-specific fields
    switch (platform) {
      case 'instagram':
        return {
          accountId: socialAccount.accountIdentifier,
          caption: content,
          mediaUrl: post.mediaUrls?.[0],
          mediaType: post.type === 'video' ? 'VIDEO' : 'IMAGE',
          ...postPlatform.platformSettings,
        };

      case 'twitter':
        return {
          text: content,
          mediaIds: postPlatform.platformSettings?.mediaIds || [],
          ...postPlatform.platformSettings,
        };

      case 'linkedin':
        return {
          author: socialAccount.accountIdentifier,
          text: content,
          mediaUrls: post.mediaUrls,
          ...postPlatform.platformSettings,
        };

      case 'facebook':
        return {
          pageId: socialAccount.accountIdentifier,
          message: content,
          link: postPlatform.platformSettings?.link,
          photoUrl: post.mediaUrls?.[0],
          ...postPlatform.platformSettings,
        };

      case 'tiktok':
        return {
          videoUrl: post.mediaUrls?.[0],
          caption: content,
          privacyLevel: postPlatform.platformSettings?.privacyLevel || 'PUBLIC_TO_EVERYONE',
          ...postPlatform.platformSettings,
        };

      case 'youtube':
        return {
          title: post.title,
          description: content,
          videoUrl: post.mediaUrls?.[0],
          privacyStatus: postPlatform.platformSettings?.privacyStatus || 'public',
          tags: postPlatform.platformSettings?.tags || [],
          ...postPlatform.platformSettings,
        };

      case 'pinterest':
        return {
          boardId: postPlatform.platformSettings?.boardId,
          title: post.title,
          description: content,
          link: postPlatform.platformSettings?.link,
          mediaUrl: post.mediaUrls?.[0],
          ...postPlatform.platformSettings,
        };

      case 'threads':
        return {
          userId: socialAccount.accountIdentifier,
          text: content,
          mediaUrl: post.mediaUrls?.[0],
          mediaType: post.mediaUrls?.[0] ? 'IMAGE' : 'TEXT',
          ...postPlatform.platformSettings,
        };

      case 'reddit':
        return {
          subreddit: postPlatform.platformSettings?.subreddit,
          title: post.title,
          text: content,
          url: postPlatform.platformSettings?.url,
          kind: postPlatform.platformSettings?.kind || 'self',
          ...postPlatform.platformSettings,
        };

      default:
        return baseContent;
    }
  }
}
