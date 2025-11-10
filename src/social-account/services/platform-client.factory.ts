import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialPlatform } from '../entities/social-account.entity';
import { InstagramClient } from '../clients/instagram.client';
import { TwitterClient } from '../clients/twitter.client';
import { LinkedInClient } from '../clients/linkedin.client';
import { FacebookClient } from '../clients/facebook.client';
import { TikTokClient } from '../clients/tiktok.client';
import { YouTubeClient } from '../clients/youtube.client';
import { PinterestClient } from '../clients/pinterest.client';
import { ThreadsClient } from '../clients/threads.client';
import { RedditClient } from '../clients/reddit.client';

export interface PlatformClient {
  getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }>;

  post(accessToken: string, content: any): Promise<any>;

  getPost(accessToken: string, postId: string): Promise<any>;

  deletePost(accessToken: string, postId: string): Promise<void>;
}

@Injectable()
export class PlatformClientFactory {
  private clients: Map<SocialPlatform, PlatformClient>;

  constructor(
    private instagramClient: InstagramClient,
    private twitterClient: TwitterClient,
    private linkedinClient: LinkedInClient,
    private facebookClient: FacebookClient,
    private tiktokClient: TikTokClient,
    private youtubeClient: YouTubeClient,
    private pinterestClient: PinterestClient,
    private threadsClient: ThreadsClient,
    private redditClient: RedditClient,
  ) {
    this.clients = new Map<SocialPlatform, PlatformClient>();
    this.clients.set(SocialPlatform.INSTAGRAM, this.instagramClient);
    this.clients.set(SocialPlatform.TWITTER, this.twitterClient);
    this.clients.set(SocialPlatform.LINKEDIN, this.linkedinClient);
    this.clients.set(SocialPlatform.FACEBOOK, this.facebookClient);
    this.clients.set(SocialPlatform.TIKTOK, this.tiktokClient);
    this.clients.set(SocialPlatform.YOUTUBE, this.youtubeClient);
    this.clients.set(SocialPlatform.PINTEREST, this.pinterestClient);
    this.clients.set(SocialPlatform.THREADS, this.threadsClient);
    this.clients.set(SocialPlatform.REDDIT, this.redditClient);
  }

  getClient(platform: SocialPlatform): PlatformClient {
    const client = this.clients.get(platform);
    if (!client) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }
    return client;
  }
}
