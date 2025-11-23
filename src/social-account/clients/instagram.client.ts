import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class InstagramClient implements PlatformClient {
  private readonly baseUrl = 'https://graph.instagram.com';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      return {
        accountId: response.data.id,
        displayName: response.data.username,
        metadata: {
          accountType: response.data.account_type,
          mediaCount: response.data.media_count,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Instagram account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { accountId, caption, mediaUrl, mediaType = 'IMAGE' } = content;

      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${this.baseUrl}/${accountId}/media`,
        null,
        {
          params: {
            image_url: mediaType === 'IMAGE' ? mediaUrl : undefined,
            video_url: mediaType === 'VIDEO' ? mediaUrl : undefined,
            caption,
            access_token: accessToken,
          },
        },
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish media
      const publishResponse = await axios.post(
        `${this.baseUrl}/${accountId}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: accessToken,
          },
        },
      );

      return {
        platform: 'instagram',
        postId: publishResponse.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Instagram: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Instagram post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${postId}`, {
        params: {
          access_token: accessToken,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to delete Instagram post: ${error.message}`);
    }
  }
}
