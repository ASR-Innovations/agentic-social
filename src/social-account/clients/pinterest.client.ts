import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class PinterestClient implements PlatformClient {
  private readonly baseUrl = 'https://api.pinterest.com/v5';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/user_account`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data;

      return {
        accountId: user.username,
        displayName: user.username,
        metadata: {
          accountType: user.account_type,
          profileImage: user.profile_image,
          websiteUrl: user.website_url,
          followerCount: user.follower_count,
          followingCount: user.following_count,
          boardCount: user.board_count,
          pinCount: user.pin_count,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Pinterest account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { boardId, title, description, link, mediaUrl } = content;

      const payload: any = {
        board_id: boardId,
        title,
        description,
        link,
        media_source: {
          source_type: 'image_url',
          url: mediaUrl,
        },
      };

      const response = await axios.post(`${this.baseUrl}/pins`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        platform: 'pinterest',
        postId: response.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Pinterest: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/pins/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Pinterest post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/pins/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to delete Pinterest post: ${error.message}`);
    }
  }

  async getBoards(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/boards`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.items;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Pinterest boards: ${error.message}`);
    }
  }
}
