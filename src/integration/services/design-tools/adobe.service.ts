import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AdobeAssetDto } from '../../dto/design-tool.dto';

export interface AdobeAsset {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  downloadUrl: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
  createdAt: Date;
  modifiedAt: Date;
}

@Injectable()
export class AdobeService {
  private readonly logger = new Logger(AdobeService.name);
  private readonly baseUrl = 'https://cc-api-storage.adobe.io/v1';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize Adobe API client with access token
   */
  setAccessToken(accessToken: string, apiKey: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    this.axiosInstance.defaults.headers.common['x-api-key'] = apiKey;
  }

  /**
   * Get Adobe Creative Cloud asset
   */
  async getAsset(dto: AdobeAssetDto): Promise<AdobeAsset> {
    try {
      const response = await this.axiosInstance.get(`/assets/${dto.assetId}`);
      return this.mapAdobeAsset(response.data);
    } catch (error) {
      this.logger.error(`Failed to get Adobe asset ${dto.assetId}`, error);
      throw new BadRequestException('Failed to get Adobe asset');
    }
  }

  /**
   * List user's Adobe Creative Cloud assets
   */
  async listAssets(
    page: number = 1,
    perPage: number = 20,
    assetType?: string,
  ): Promise<{ assets: AdobeAsset[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/assets', {
        params: {
          page,
          limit: perPage,
          type: assetType,
        },
      });

      return {
        assets: response.data.items.map((item: any) => this.mapAdobeAsset(item)),
        total: response.data.total || 0,
      };
    } catch (error) {
      this.logger.error('Failed to list Adobe assets', error);
      throw new BadRequestException('Failed to list Adobe assets');
    }
  }

  /**
   * Get download URL for Adobe asset
   */
  async getDownloadUrl(assetId: string): Promise<string> {
    try {
      const response = await this.axiosInstance.get(`/assets/${assetId}/renditions/download`);
      return response.data.url;
    } catch (error) {
      this.logger.error(`Failed to get download URL for asset ${assetId}`, error);
      throw new BadRequestException('Failed to get download URL');
    }
  }

  /**
   * Download Adobe asset
   */
  async downloadAsset(assetId: string): Promise<Buffer> {
    try {
      const downloadUrl = await this.getDownloadUrl(assetId);
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download Adobe asset ${assetId}`, error);
      throw new BadRequestException('Failed to download Adobe asset');
    }
  }

  /**
   * Search Adobe Stock
   */
  async searchStock(
    query: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<{ results: any[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('https://stock.adobe.io/Rest/Media/1/Search/Files', {
        params: {
          'search_parameters[words]': query,
          'search_parameters[limit]': perPage,
          'search_parameters[offset]': (page - 1) * perPage,
        },
      });

      return {
        results: response.data.files || [],
        total: response.data.nb_results || 0,
      };
    } catch (error) {
      this.logger.error('Failed to search Adobe Stock', error);
      throw new BadRequestException('Failed to search Adobe Stock');
    }
  }

  /**
   * Map Adobe API response to internal format
   */
  private mapAdobeAsset(data: any): AdobeAsset {
    return {
      id: data.id,
      name: data.name || 'Untitled',
      type: data.type || 'unknown',
      thumbnail: data.thumbnail?.url || '',
      downloadUrl: data.download_url || '',
      metadata: {
        width: data.metadata?.width,
        height: data.metadata?.height,
        format: data.metadata?.format,
        size: data.metadata?.size,
      },
      createdAt: new Date(data.created),
      modifiedAt: new Date(data.modified),
    };
  }

  /**
   * Validate Adobe API credentials
   */
  async validateCredentials(accessToken: string, apiKey: string): Promise<boolean> {
    try {
      this.setAccessToken(accessToken, apiKey);
      await this.axiosInstance.get('/user/profile');
      return true;
    } catch (error) {
      this.logger.error('Invalid Adobe credentials', error);
      return false;
    }
  }
}
