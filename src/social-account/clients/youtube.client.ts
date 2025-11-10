import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class YouTubeClient implements PlatformClient {
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const channel = response.data.items[0];

      return {
        accountId: channel.id,
        displayName: channel.snippet.title,
        metadata: {
          description: channel.snippet.description,
          customUrl: channel.snippet.customUrl,
          thumbnails: channel.snippet.thumbnails,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch YouTube account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { title, description, videoUrl, privacyStatus = 'private', tags = [] } = content;

      // Step 1: Initialize upload
      const metadata = {
        snippet: {
          title,
          description,
          tags,
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/videos`,
        metadata,
        {
          params: {
            part: 'snippet,status',
            uploadType: 'resumable',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        platform: 'youtube',
        postId: response.data.id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to YouTube: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics,status',
          id: postId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.items[0];
    } catch (error) {
      throw new BadRequestException(`Failed to fetch YouTube post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/videos`, {
        params: {
          id: postId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to delete YouTube post: ${error.message}`);
    }
  }
}
