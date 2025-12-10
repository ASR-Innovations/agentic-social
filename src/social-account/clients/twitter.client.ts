import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PlatformClient } from '../services/platform-client.factory';
import axios from 'axios';

@Injectable()
export class TwitterClient implements PlatformClient {
  private readonly logger = new Logger(TwitterClient.name);
  private readonly baseUrl = 'https://api.twitter.com/2';
  private readonly TWITTER_CHAR_LIMIT = 280;

  async getAccountInfo(accessToken: string): Promise<{
    accountId: string;
    displayName: string;
    metadata?: Record<string, any>;
  }> {
    try {
      this.logger.log('[TwitterClient] Fetching account info...');
      
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        params: {
          'user.fields': 'id,name,username,public_metrics,verified',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = response.data.data;

      this.logger.log(`[TwitterClient] Account info fetched: id=${user.id}, username=${user.username}`);

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
      this.logger.error(`[TwitterClient] Failed to fetch account info: ${error.response?.data?.detail || error.message}`);
      throw new BadRequestException(`Failed to fetch Twitter account info: ${error.message}`);
    }
  }

  /**
   * Trim text to Twitter's character limit, preserving word boundaries when possible
   */
  private trimToLimit(text: string): string {
    if (!text || text.length <= this.TWITTER_CHAR_LIMIT) {
      return text;
    }

    this.logger.warn(`[TwitterClient] Text exceeds ${this.TWITTER_CHAR_LIMIT} chars (${text.length}), trimming...`);
    
    // Try to trim at word boundary
    let trimmed = text.substring(0, this.TWITTER_CHAR_LIMIT - 3); // Leave room for "..."
    const lastSpace = trimmed.lastIndexOf(' ');
    
    if (lastSpace > this.TWITTER_CHAR_LIMIT - 50) {
      // If there's a space reasonably close to the end, trim there
      trimmed = trimmed.substring(0, lastSpace);
    }
    
    const result = trimmed + '...';
    this.logger.log(`[TwitterClient] Trimmed text from ${text.length} to ${result.length} chars`);
    return result;
  }

  async post(accessToken: string, content: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      let { text, mediaIds } = content;

      this.logger.log(`[TwitterClient] ========== POST REQUEST START ==========`);
      this.logger.log(`[TwitterClient] Timestamp: ${new Date().toISOString()}`);
      this.logger.log(`[TwitterClient] Original text length: ${text?.length || 0}`);
      this.logger.log(`[TwitterClient] Has media: ${!!mediaIds?.length}`);
      this.logger.log(`[TwitterClient] Token preview: ${accessToken?.substring(0, 20)}...`);

      // Validate and trim content if needed
      if (text) {
        text = text.trim(); // Remove leading/trailing whitespace
        
        if (text.length > this.TWITTER_CHAR_LIMIT) {
          text = this.trimToLimit(text);
        }
      }

      if (!text || text.length === 0) {
        throw new BadRequestException('Tweet text cannot be empty');
      }

      const payload: any = { text };

      if (mediaIds && mediaIds.length > 0) {
        payload.media = { media_ids: mediaIds };
      }

      this.logger.log(`[TwitterClient] Final payload: ${JSON.stringify({ textLength: text.length, text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), hasMedia: !!mediaIds?.length })}`);

      const response = await axios.post(`${this.baseUrl}/tweets`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const elapsed = Date.now() - startTime;
      this.logger.log(`[TwitterClient] Tweet posted successfully in ${elapsed}ms`);
      this.logger.log(`[TwitterClient] Response: ${JSON.stringify(response.data)}`);
      this.logger.log(`[TwitterClient] ========== POST REQUEST SUCCESS ==========`);

      return {
        platform: 'twitter',
        postId: response.data.data.id,
        url: `https://twitter.com/i/web/status/${response.data.data.id}`,
        success: true,
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      
      // Enhanced error logging
      const errorDetails = error.response?.data || {};
      this.logger.error(`[TwitterClient] ========== POST REQUEST FAILED ==========`);
      this.logger.error(`[TwitterClient] Failed after ${elapsed}ms`);
      this.logger.error(`[TwitterClient] Status: ${error.response?.status}`);
      this.logger.error(`[TwitterClient] Status Text: ${error.response?.statusText}`);
      this.logger.error(`[TwitterClient] Error Data: ${JSON.stringify(errorDetails)}`);
      this.logger.error(`[TwitterClient] Error Message: ${error.message}`);
      this.logger.error(`[TwitterClient] ==========================================`);

      // Provide more specific error messages
      if (error.response?.status === 403) {
        const detail = errorDetails.detail || errorDetails.errors?.[0]?.message || errorDetails.title || '';
        const reason = errorDetails.reason || '';
        
        this.logger.error(`[TwitterClient] 403 Error - Detail: ${detail}, Reason: ${reason}`);
        
        if (detail.toLowerCase().includes('duplicate') || reason.includes('duplicate')) {
          throw new BadRequestException('Twitter rejected: Duplicate content. Try posting different text.');
        }
        if (detail.toLowerCase().includes('suspended')) {
          throw new BadRequestException('Twitter account is suspended.');
        }
        if (detail.toLowerCase().includes('client-not-enrolled') || reason.includes('client-not-enrolled')) {
          throw new BadRequestException('Twitter API: Your app is not enrolled for this endpoint. Check your Twitter Developer Portal settings.');
        }
        
        throw new BadRequestException(
          `Twitter API permission denied (403). Details: ${detail || reason || 'No additional details'}`
        );
      }

      if (error.response?.status === 401) {
        throw new BadRequestException('Twitter authentication failed. Please reconnect your Twitter account.');
      }

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
