import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class RedditClient implements PlatformClient {
  private readonly baseUrl = 'https://oauth.reddit.com';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AgenticSocial/1.0',
        },
      });

      const user = response.data;

      return {
        accountId: user.id,
        displayName: user.name,
        metadata: {
          iconImg: user.icon_img,
          linkKarma: user.link_karma,
          commentKarma: user.comment_karma,
          totalKarma: user.total_karma,
          createdUtc: user.created_utc,
          verified: user.verified,
          hasVerifiedEmail: user.has_verified_email,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Reddit account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { subreddit, title, text, url, kind = 'self' } = content;

      const payload: any = {
        sr: subreddit,
        title,
        kind, // 'self', 'link', 'image', 'video'
        sendreplies: true,
      };

      if (kind === 'self') {
        payload.text = text;
      } else if (kind === 'link') {
        payload.url = url;
      }

      const response = await axios.post(`${this.baseUrl}/api/submit`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AgenticSocial/1.0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        platform: 'reddit',
        postId: response.data.json.data.name,
        success: true,
        url: response.data.json.data.url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to Reddit: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      // Reddit post IDs include prefix like 't3_'
      const response = await axios.get(`${this.baseUrl}/api/info`, {
        params: {
          id: postId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AgenticSocial/1.0',
        },
      });

      return response.data.data.children[0]?.data;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Reddit post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/del`,
        { id: postId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'AgenticSocial/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (error) {
      throw new BadRequestException(`Failed to delete Reddit post: ${error.message}`);
    }
  }

  async getSubreddits(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/subreddits/mine/subscriber`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AgenticSocial/1.0',
        },
      });

      return response.data.data.children.map((child: any) => child.data);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch Reddit subreddits: ${error.message}`);
    }
  }
}
