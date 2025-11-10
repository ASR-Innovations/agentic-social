import { Injectable, BadRequestException } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class TikTokClient implements PlatformClient {
  private readonly baseUrl = 'https://open-api.tiktok.com';

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/info/`, {
        params: {
          fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data.data.user;

      return {
        accountId: user.open_id,
        displayName: user.display_name,
        metadata: {
          unionId: user.union_id,
          avatarUrl: user.avatar_url,
          followerCount: user.follower_count,
          followingCount: user.following_count,
          likesCount: user.likes_count,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch TikTok account info: ${error.message}`);
    }
  }

  async post(accessToken: string, content: any): Promise<any> {
    try {
      const { videoUrl, caption, privacyLevel = 'PUBLIC_TO_EVERYONE' } = content;

      // TikTok requires video upload in chunks, simplified here
      const payload = {
        video: {
          video_url: videoUrl,
        },
        post_info: {
          title: caption,
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
      };

      const response = await axios.post(`${this.baseUrl}/share/video/upload/`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        platform: 'tiktok',
        postId: response.data.data.share_id,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to post to TikTok: ${error.message}`);
    }
  }

  async getPost(accessToken: string, postId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/video/query/`, {
        params: {
          fields: 'id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count',
          filters: JSON.stringify({ video_ids: [postId] }),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data.videos[0];
    } catch (error) {
      throw new BadRequestException(`Failed to fetch TikTok post: ${error.message}`);
    }
  }

  async deletePost(accessToken: string, postId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/video/delete/`,
        { video_id: postId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      throw new BadRequestException(`Failed to delete TikTok post: ${error.message}`);
    }
  }
}
