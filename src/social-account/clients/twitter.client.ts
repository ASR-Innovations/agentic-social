import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class TwitterClient implements PlatformClient {
  private readonly baseUrl = 'https://api.twitter.com/2';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        params: {
          'user.fields': 'id,name,username,public_metrics,verified',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data.data;

      return {
        accountId: user.id,
        displayName: user.name,
        metadata: {
          username: user.username,
          verified: user.verified,
          followersCount: user.public_metrics?.followers_count,
          followingCount: user.public_metrics?.following_count,
          tweetCount: user.public_metrics?.tweet_count,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Twitter account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { text, mediaIds } = content;

      const payload: any = { text };

      if (mediaIds && mediaIds.length > 0) {
        payload.media = { media_ids: mediaIds };
      }

      const response = await axios.post(`${this.baseUrl}/tweets`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        platform: 'twitter',
        postId: response.data.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Twitter: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/tweets/${postId}`, {
        params: {
          'tweet.fields': 'created_at,public_metrics,attachments',
          expansions: 'attachments.media_keys',
          'media.fields': 'url,preview_image_url',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Twitter post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/tweets/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to delete Twitter post: ${error.message}`);
    }
  }

  async uploadMedia(accessToken: string, mediaData: Buffer, mediaType: string): Promise<string> {
    try {
      // Twitter requires media upload via v1.1 API
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

      const response = await axios.post(uploadUrl, mediaData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mediaType,
        },
      });

      return response.data.media_id_string;
    } catch (error) {
      throw new BadRequestException(`Failed to upload media to Twitter: ${error.message}`);
    }
  }
}
