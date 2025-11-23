import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class ThreadsClient implements PlatformClient {
  private readonly baseUrl = 'https://graph.threads.net/v1.0';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,name,threads_profile_picture_url,threads_biography',
          access_token: accessToken,
        },
      });

      return {
        accountId: response.data.id,
        displayName: response.data.name || response.data.username,
        metadata: {
          username: response.data.username,
          profilePictureUrl: response.data.threads_profile_picture_url,
          biography: response.data.threads_biography,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Threads account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { userId, text, mediaUrl, mediaType } = content;

      // Step 1: Create media container
      const containerPayload: any = {
        media_type: mediaType || 'TEXT',
        text,
        access_token: accessToken,
      };

      if (mediaUrl) {
        if (mediaType === 'IMAGE') {
          containerPayload.image_url = mediaUrl;
        } else if (mediaType === 'VIDEO') {
          containerPayload.video_url = mediaUrl;
        }
      }

      const containerResponse = await axios.post(
        `${this.baseUrl}/${userId}/threads`,
        null,
        { params: containerPayload },
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish thread
      const publishResponse = await axios.post(
        `${this.baseUrl}/${userId}/threads_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: accessToken,
          },
        },
      );

      return {
        platform: 'threads',
        postId: publishResponse.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Threads: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'id,text,media_type,media_url,permalink,timestamp,is_quote_post',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Threads post: ${error.message}`);
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
      throw new BadRequestException(`Failed to delete Threads post: ${error.message}`);
    }
  }
}
