import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class FacebookClient implements PlatformClient {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      // Get user info
      const userResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,name,accounts{id,name,category,followers_count}',
          access_token: accessToken,
        },
      });

      // If user has pages, use the first page
      const pages = userResponse.data.accounts?.data || [];
      const primaryAccount = pages[0] || userResponse.data;

      return {
        accountId: primaryAccount.id,
        displayName: primaryAccount.name,
        metadata: {
          type: pages.length > 0 ? 'page' : 'user',
          category: primaryAccount.category,
          followersCount: primaryAccount.followers_count,
          pages: pages.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
          })),
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Facebook account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { pageId, message, link, photoUrl } = content;

      const payload: any = {
        message,
        access_token: accessToken,
      };

      let endpoint = `${this.baseUrl}/${pageId}/feed`;

      if (photoUrl) {
        endpoint = `${this.baseUrl}/${pageId}/photos`;
        payload.url = photoUrl;
      } else if (link) {
        payload.link = link;
      }

      const response = await axios.post(endpoint, null, { params: payload });

      return {
        platform: 'facebook',
        postId: response.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Facebook: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'id,message,created_time,full_picture,permalink_url,shares,likes.summary(true),comments.summary(true)',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Facebook post: ${error.message}`);
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
      throw new BadRequestException(`Failed to delete Facebook post: ${error.message}`);
    }
  }
}
