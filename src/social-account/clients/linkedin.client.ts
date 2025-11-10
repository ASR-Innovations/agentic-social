import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class LinkedInClient implements PlatformClient {
  private readonly baseUrl = 'https://api.linkedin.com/v2';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { id, localizedFirstName, localizedLastName } = response.data;

      return {
        accountId: id,
        displayName: `${localizedFirstName} ${localizedLastName}`,
        metadata: {
          firstName: localizedFirstName,
          lastName: localizedLastName,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch LinkedIn account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { author, text, mediaUrls } = content;

      const payload: any = {
        author: `urn:li:person:${author}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text,
            },
            shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      if (mediaUrls && mediaUrls.length > 0) {
        payload.specificContent['com.linkedin.ugc.ShareContent'].media = mediaUrls.map((url: string) => ({
          status: 'READY',
          originalUrl: url,
        }));
      }

      const response = await axios.post(`${this.baseUrl}/ugcPosts`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return {
        platform: 'linkedin',
        postId: response.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to LinkedIn: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/ugcPosts/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch LinkedIn post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/ugcPosts/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to delete LinkedIn post: ${error.message}`);
    }
  }
}
