import { Injectable, BadRequestException } from '@nestjs/common';
import { SocialPlatform } from '../entities/social-account.entity';
import axios from 'axios';

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  redirectUri: string;
}

interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
  userId?: string;
  accountId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class OAuthService {
  private configs: Map<SocialPlatform, OAuthConfig> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Instagram (Facebook Graph API)
    if (process.env.INSTAGRAM_CLIENT_ID) {
      this.configs.set(SocialPlatform.INSTAGRAM, {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        scope: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
        redirectUri: process.env.INSTAGRAM_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // Twitter (X)
    if (process.env.TWITTER_CLIENT_ID) {
      this.configs.set(SocialPlatform.TWITTER, {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        redirectUri: process.env.TWITTER_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // LinkedIn
    if (process.env.LINKEDIN_CLIENT_ID) {
      this.configs.set(SocialPlatform.LINKEDIN, {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'rw_organization_admin'],
        redirectUri: process.env.LINKEDIN_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // Facebook
    if (process.env.FACEBOOK_CLIENT_ID) {
      this.configs.set(SocialPlatform.FACEBOOK, {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        scope: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile'],
        redirectUri: process.env.FACEBOOK_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // TikTok
    if (process.env.TIKTOK_CLIENT_KEY) {
      this.configs.set(SocialPlatform.TIKTOK, {
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
        clientId: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        scope: ['user.info.basic', 'video.upload', 'video.publish'],
        redirectUri: process.env.TIKTOK_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // YouTube (Google)
    if (process.env.YOUTUBE_CLIENT_ID) {
      this.configs.set(SocialPlatform.YOUTUBE, {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
        redirectUri: process.env.YOUTUBE_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // Pinterest
    if (process.env.PINTEREST_CLIENT_ID) {
      this.configs.set(SocialPlatform.PINTEREST, {
        authUrl: 'https://www.pinterest.com/oauth/',
        tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
        clientId: process.env.PINTEREST_CLIENT_ID,
        clientSecret: process.env.PINTEREST_CLIENT_SECRET,
        scope: ['boards:read', 'pins:read', 'pins:write'],
        redirectUri: process.env.PINTEREST_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // Threads (Meta)
    if (process.env.THREADS_CLIENT_ID) {
      this.configs.set(SocialPlatform.THREADS, {
        authUrl: 'https://threads.net/oauth/authorize',
        tokenUrl: 'https://graph.threads.net/oauth/access_token',
        clientId: process.env.THREADS_CLIENT_ID,
        clientSecret: process.env.THREADS_CLIENT_SECRET,
        scope: ['threads_basic', 'threads_content_publish'],
        redirectUri: process.env.THREADS_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }

    // Reddit
    if (process.env.REDDIT_CLIENT_ID) {
      this.configs.set(SocialPlatform.REDDIT, {
        authUrl: 'https://www.reddit.com/api/v1/authorize',
        tokenUrl: 'https://www.reddit.com/api/v1/access_token',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        scope: ['identity', 'submit', 'read'],
        redirectUri: process.env.REDDIT_CALLBACK_URL || `${process.env.FRONTEND_URL}/oauth/callback`,
      });
    }
  }

  /**
   * Get OAuth authorization URL for a platform
   */
  getAuthUrl(platform: SocialPlatform, state?: string): string {
    const config = this.configs.get(platform);
    if (!config) {
      throw new BadRequestException(`OAuth not configured for platform: ${platform}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope.join(' '),
      ...(state && { state }),
    });

    // Platform-specific adjustments
    if (platform === SocialPlatform.TWITTER) {
      // Twitter OAuth 2.0 requires PKCE
      // Using 'plain' method with a static challenge for simplicity
      // In production, generate a random code_verifier and store it
      params.set('code_challenge', 'challenge');
      params.set('code_challenge_method', 'plain');
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    platform: SocialPlatform,
    code: string,
    redirectUri?: string,
  ): Promise<OAuthTokenResponse> {
    const config = this.configs.get(platform);
    if (!config) {
      throw new BadRequestException(`OAuth not configured for platform: ${platform}`);
    }

    try {
      const tokenData: any = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || config.redirectUri,
      };

      // Add code_verifier for Twitter PKCE
      if (platform === SocialPlatform.TWITTER) {
        tokenData.code_verifier = 'challenge';
      }

      // Platform-specific token exchange
      let response;
      if (platform === SocialPlatform.INSTAGRAM || platform === SocialPlatform.FACEBOOK) {
        // Facebook/Instagram use form data
        const formData = new URLSearchParams(tokenData);
        response = await axios.post(config.tokenUrl, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } else if (platform === SocialPlatform.REDDIT) {
        // Reddit uses basic auth
        const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
        const formData = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri || config.redirectUri,
        });
        response = await axios.post(config.tokenUrl, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
        });
      } else {
        // Standard OAuth2
        response = await axios.post(config.tokenUrl, tokenData, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return this.normalizeTokenResponse(platform, response.data);
    } catch (error) {
      throw new BadRequestException(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Refresh an access token
   */
  async refreshToken(platform: SocialPlatform, refreshToken: string): Promise<OAuthTokenResponse> {
    const config = this.configs.get(platform);
    if (!config) {
      throw new BadRequestException(`OAuth not configured for platform: ${platform}`);
    }

    try {
      const tokenData: any = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };

      let response;
      if (platform === SocialPlatform.REDDIT) {
        const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
        const formData = new URLSearchParams(tokenData);
        response = await axios.post(config.tokenUrl, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
        });
      } else {
        response = await axios.post(config.tokenUrl, tokenData, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return this.normalizeTokenResponse(platform, response.data);
    } catch (error) {
      throw new BadRequestException(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Normalize token response from different platforms
   */
  private normalizeTokenResponse(platform: SocialPlatform, data: any): OAuthTokenResponse {
    return {
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || data.refreshToken,
      expiresIn: data.expires_in || data.expiresIn,
      tokenType: data.token_type || data.tokenType || 'Bearer',
      scope: data.scope,
      userId: data.user_id || data.userId,
      accountId: data.account_id || data.accountId,
      metadata: {
        platform,
        raw: data,
      },
    };
  }

  /**
   * Check if platform OAuth is configured
   */
  isPlatformConfigured(platform: SocialPlatform): boolean {
    return this.configs.has(platform);
  }

  /**
   * Get configured platforms
   */
  getConfiguredPlatforms(): SocialPlatform[] {
    return Array.from(this.configs.keys());
  }
}
