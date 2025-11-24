import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface LinkedInCampaignConfig {
  name: string;
  account: string;
  type: string;
  costType: string;
  objectiveType: string;
  status: string;
  dailyBudget?: {
    amount: string;
    currencyCode: string;
  };
  totalBudget?: {
    amount: string;
    currencyCode: string;
  };
  runSchedule?: {
    start: number;
    end?: number;
  };
}

export interface LinkedInCreativeConfig {
  campaign: string;
  variables: {
    data: {
      'com.linkedin.ads.SponsoredUpdateCreativeVariables': {
        activity: string;
        shareCommentary?: {
          text: string;
        };
      };
    };
  };
}

@Injectable()
export class LinkedInAdsAdapter {
  private readonly logger = new Logger(LinkedInAdsAdapter.name);
  private readonly baseUrl = 'https://api.linkedin.com/v2';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
  }

  /**
   * Create a LinkedIn ad campaign
   */
  async createCampaign(
    accessToken: string,
    config: LinkedInCampaignConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating LinkedIn campaign: ${config.name}`);

      const response = await this.client.post(
        '/adCampaignsV2',
        config,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create LinkedIn campaign: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a LinkedIn ad creative
   */
  async createCreative(
    accessToken: string,
    config: LinkedInCreativeConfig,
  ): Promise<any> {
    try {
      this.logger.log(`Creating LinkedIn creative for campaign: ${config.campaign}`);

      const response = await this.client.post(
        '/adCreativesV2',
        config,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to create LinkedIn creative: ${error.message}`);
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
      this.logger.log(`Updating LinkedIn campaign ${campaignId} status to ${status}`);

      const response = await this.client.post(
        `/adCampaignsV2/${campaignId}`,
        {
          patch: {
            $set: {
              status,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to update LinkedIn campaign status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(
    campaignId: string,
    accessToken: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching LinkedIn campaign analytics for ${campaignId}`);

      const response = await this.client.get(
        '/adAnalyticsV2',
        {
          params: {
            q: 'analytics',
            pivot: 'CAMPAIGN',
            campaigns: `urn:li:sponsoredCampaign:${campaignId}`,
            dateRange: {
              start: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
              },
              end: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
              },
            },
            fields: 'impressions,clicks,costInLocalCurrency,externalWebsiteConversions,externalWebsitePostClickConversions',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.elements[0] || {};
    } catch (error: any) {
      this.logger.error(`Failed to fetch LinkedIn campaign analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get creative analytics
   */
  async getCreativeAnalytics(
    creativeId: string,
    accessToken: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching LinkedIn creative analytics for ${creativeId}`);

      const response = await this.client.get(
        '/adAnalyticsV2',
        {
          params: {
            q: 'analytics',
            pivot: 'CREATIVE',
            creatives: `urn:li:sponsoredCreative:${creativeId}`,
            dateRange: {
              start: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
              },
              end: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
              },
            },
            fields: 'impressions,clicks,costInLocalCurrency,externalWebsiteConversions,externalWebsitePostClickConversions',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.elements[0] || {};
    } catch (error: any) {
      this.logger.error(`Failed to fetch LinkedIn creative analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Boost an existing LinkedIn post
   */
  async boostPost(
    adAccountId: string,
    accessToken: string,
    postUrn: string,
    budget: number,
    duration: number,
  ): Promise<any> {
    try {
      this.logger.log(`Boosting LinkedIn post: ${postUrn}`);

      const endTime = new Date();
      endTime.setDate(endTime.getDate() + (duration || 7));

      // Create campaign
      const campaign = await this.createCampaign(accessToken, {
        name: `Boosted Post - ${postUrn}`,
        account: `urn:li:sponsoredAccount:${adAccountId}`,
        type: 'SPONSORED_UPDATES',
        costType: 'CPM',
        objectiveType: 'ENGAGEMENT',
        status: 'PAUSED',
        totalBudget: {
          amount: budget.toString(),
          currencyCode: 'USD',
        },
        runSchedule: {
          start: Date.now(),
          end: endTime.getTime(),
        },
      });

      // Create creative from post
      const creative = await this.createCreative(accessToken, {
        campaign: campaign.id,
        variables: {
          data: {
            'com.linkedin.ads.SponsoredUpdateCreativeVariables': {
              activity: postUrn,
            },
          },
        },
      });

      // Activate campaign
      await this.updateCampaignStatus(campaign.id, accessToken, 'ACTIVE');

      return {
        campaign,
        creative,
      };
    } catch (error: any) {
      this.logger.error(`Failed to boost LinkedIn post: ${error.message}`);
      throw error;
    }
  }
}
