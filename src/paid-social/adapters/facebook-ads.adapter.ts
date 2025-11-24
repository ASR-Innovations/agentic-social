import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface FacebookAdCampaignConfig {
  name: string;
  objective: string;
  status: string;
  special_ad_categories?: string[];
}

export interface FacebookAdSetConfig {
  name: string;
  campaign_id: string;
  billing_event: string;
  optimization_goal: string;
  bid_amount?: number;
  daily_budget?: number;
  lifetime_budget?: number;
  targeting: any;
  start_time?: string;
  end_time?: string;
}

export interface FacebookAdCreativeConfig {
  name: string;
  object_story_spec?: any;
  degrees_of_freedom_spec?: any;
}

export interface FacebookAdConfig {
  name: string;
  adset_id: string;
  creative: {
    creative_id: string;
  };
  status: string;
}

@Injectable()
export class FacebookAdsAdapter {
  private readonly logger = new Logger(FacebookAdsAdapter.name);
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Create a Facebook ad campaign
   */
  async createCampaign(
    adAccountId: string,
    accessToken: string,
    config: FacebookAdCampaignConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating Facebook campaign: ${config.name}`);

      const response = await this.client.post(
        `/act_${adAccountId}/campaigns`,
        {
          ...config,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create Facebook campaign: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a Facebook ad set
   */
  async createAdSet(
    adAccountId: string,
    accessToken: string,
    config: FacebookAdSetConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating Facebook ad set: ${config.name}`);

      const response = await this.client.post(
        `/act_${adAccountId}/adsets`,
        {
          ...config,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create Facebook ad set: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a Facebook ad creative
   */
  async createAdCreative(
    adAccountId: string,
    accessToken: string,
    config: FacebookAdCreativeConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating Facebook ad creative: ${config.name}`);

      const response = await this.client.post(
        `/act_${adAccountId}/adcreatives`,
        {
          ...config,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create Facebook ad creative: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a Facebook ad
   */
  async createAd(
    adAccountId: string,
    accessToken: string,
    config: FacebookAdConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating Facebook ad: ${config.name}`);

      const response = await this.client.post(
        `/act_${adAccountId}/ads`,
        {
          ...config,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create Facebook ad: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(
    campaignId: string,
    accessToken: string,
    status: string,
  ): Promise<any> {
    try {
      this.logger.log(`Updating Facebook campaign ${campaignId} status to ${status}`);

      const response = await this.client.post(
        `/${campaignId}`,
        {
          status,
          access_token: accessToken,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to update Facebook campaign status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get campaign insights/performance
   */
  async getCampaignInsights(
    campaignId: string,
    accessToken: string,
    datePreset: string = 'last_7d',
  ): Promise<any> {
    try {
      this.logger.log(`Fetching Facebook campaign insights for ${campaignId}`);

      const response = await this.client.get(
        `/${campaignId}/insights`,
        {
          params: {
            access_token: accessToken,
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,reach,actions,action_values,cpc,cpm,ctr',
          },
        },
      );

      return response.data.data[0] || {};
    } catch (error: any) {
      this.logger.error(`Failed to fetch Facebook campaign insights: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ad set insights/performance
   */
  async getAdSetInsights(
    adSetId: string,
    accessToken: string,
    datePreset: string = 'last_7d',
  ): Promise<any> {
    try {
      this.logger.log(`Fetching Facebook ad set insights for ${adSetId}`);

      const response = await this.client.get(
        `/${adSetId}/insights`,
        {
          params: {
            access_token: accessToken,
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,reach,actions,action_values,cpc,cpm,ctr',
          },
        },
      );

      return response.data.data[0] || {};
    } catch (error: any) {
      this.logger.error(`Failed to fetch Facebook ad set insights: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ad insights/performance
   */
  async getAdInsights(
    adId: string,
    accessToken: string,
    datePreset: string = 'last_7d',
  ): Promise<any> {
    try {
      this.logger.log(`Fetching Facebook ad insights for ${adId}`);

      const response = await this.client.get(
        `/${adId}/insights`,
        {
          params: {
            access_token: accessToken,
            date_preset: datePreset,
            fields: 'impressions,clicks,spend,reach,actions,action_values,cpc,cpm,ctr',
          },
        },
      );

      return response.data.data[0] || {};
    } catch (error: any) {
      this.logger.error(`Failed to fetch Facebook ad insights: ${error.message}`);
      throw error;
    }
  }

  /**
   * Boost an existing post
   */
  async boostPost(
    adAccountId: string,
    accessToken: string,
    postId: string,
    budget: number,
    duration: number,
    targeting: any,
  ): Promise<any> {
    try {
      this.logger.log(`Boosting Facebook post: ${postId}`);

      // Create campaign for boosted post
      const campaign = await this.createCampaign(adAccountId, accessToken, {
        name: `Boosted Post - ${postId}`,
        objective: 'POST_ENGAGEMENT',
        status: 'PAUSED',
      });

      // Create ad set
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + (duration || 7));

      const adSet = await this.createAdSet(adAccountId, accessToken, {
        name: `Boosted Post Ad Set - ${postId}`,
        campaign_id: campaign.id,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'POST_ENGAGEMENT',
        lifetime_budget: Math.round(budget * 100), // Convert to cents
        targeting,
        end_time: endTime.toISOString(),
      });

      // Create ad creative from post
      const creative = await this.createAdCreative(adAccountId, accessToken, {
        name: `Boosted Post Creative - ${postId}`,
        object_story_spec: {
          page_id: postId.split('_')[0],
          instagram_actor_id: postId.split('_')[0],
        },
      });

      // Create ad
      const ad = await this.createAd(adAccountId, accessToken, {
        name: `Boosted Post Ad - ${postId}`,
        adset_id: adSet.id,
        creative: {
          creative_id: creative.id,
        },
        status: 'ACTIVE',
      });

      return {
        campaign,
        adSet,
        creative,
        ad,
      };
    } catch (error: any) {
      this.logger.error(`Failed to boost Facebook post: ${error.message}`);
      throw error;
    }
  }
}
