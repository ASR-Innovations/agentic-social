import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { SocialAccountService } from './social-account.service';
import { SocialAccountController } from './social-account.controller';
import { EncryptionService } from './services/encryption.service';
import { OAuthService } from './services/oauth.service';
import { PlatformClientFactory } from './services/platform-client.factory';
import { InstagramClient } from './clients/instagram.client';
import { TwitterClient } from './clients/twitter.client';
import { LinkedInClient } from './clients/linkedin.client';
import { FacebookClient } from './clients/facebook.client';
import { TikTokClient } from './clients/tiktok.client';
import { YouTubeClient } from './clients/youtube.client';
import { PinterestClient } from './clients/pinterest.client';
import { ThreadsClient } from './clients/threads.client';
import { RedditClient } from './clients/reddit.client';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount])],
  controllers: [SocialAccountController],
  providers: [
    SocialAccountService,
    EncryptionService,
    OAuthService,
    PlatformClientFactory,
    InstagramClient,
    TwitterClient,
    LinkedInClient,
    FacebookClient,
    TikTokClient,
    YouTubeClient,
    PinterestClient,
    ThreadsClient,
    RedditClient,
  ],
  exports: [SocialAccountService, PlatformClientFactory],
})
export class SocialAccountModule {}
