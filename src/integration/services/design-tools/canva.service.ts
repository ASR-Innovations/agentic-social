import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CanvaDesignDto, CreateCanvaDesignDto } from '../../dto/design-tool.dto';

export interface CanvaDesign {
  id: string;
  title: string;
  thumbnail: string;
  urls: {
    editUrl: string;
    viewUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvaExportResult {
  url: string;
  format: string;
  size: number;
}

@Injectable()
export class CanvaService {
  private readonly logger = new Logger(CanvaService.name);
  private readonly baseUrl = 'https://api.canva.com/v1';
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
   * Initialize Canva API client with access token
   */
  setAccessToken(accessToken: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  /**
   * Create a new Canva design from template
   */
  async createDesign(dto: CreateCanvaDesignDto): Promise<CanvaDesign> {
    try {
      const response = await this.axiosInstance.post('/designs', {
        design_type: dto.templateType,
        title: dto.title || 'Untitled Design',
        content: dto.content,
      });

      return this.mapCanvaDesign(response.data);
    } catch (error) {
      this.logger.error('Failed to create Canva design', error);
      throw new BadRequestException('Failed to create Canva design');
    }
  }

  /**
   * Get design details
   */
  async getDesign(designId: string): Promise<CanvaDesign> {
    try {
      const response = await this.axiosInstance.get(`/designs/${designId}`);
      return this.mapCanvaDesign(response.data);
    } catch (error) {
      this.logger.error(`Failed to get Canva design ${designId}`, error);
      throw new BadRequestException('Failed to get Canva design');
    }
  }

  /**
   * List user's Canva designs
   */
  async listDesigns(page: number = 1, perPage: number = 20): Promise<{ designs: CanvaDesign[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/designs', {
        params: {
          page,
          per_page: perPage,
        },
      });

      return {
        designs: response.data.items.map((item: any) => this.mapCanvaDesign(item)),
        total: response.data.total || 0,
      };
    } catch (error) {
      this.logger.error('Failed to list Canva designs', error);
      throw new BadRequestException('Failed to list Canva designs');
    }
  }

  /**
   * Export Canva design to image/video
   */
  async exportDesign(dto: CanvaDesignDto): Promise<CanvaExportResult> {
    try {
      const response = await this.axiosInstance.post(`/designs/${dto.designId}/export`, {
        format: dto.format || 'png',
        quality: dto.quality || 'high',
      });

      // Poll for export completion
      const exportId = response.data.export_id;
      const exportUrl = await this.pollExportStatus(exportId);

      return {
        url: exportUrl,
        format: dto.format || 'png',
        size: 0, // Size will be determined when downloaded
      };
    } catch (error) {
      this.logger.error(`Failed to export Canva design ${dto.designId}`, error);
      throw new BadRequestException('Failed to export Canva design');
    }
  }

  /**
   * Get edit URL for Canva design
   */
  async getEditUrl(designId: string): Promise<string> {
    try {
      const response = await this.axiosInstance.get(`/designs/${designId}/edit-url`);
      return response.data.url;
    } catch (error) {
      this.logger.error(`Failed to get edit URL for design ${designId}`, error);
      throw new BadRequestException('Failed to get edit URL');
    }
  }

  /**
   * Poll export status until complete
   */
  private async pollExportStatus(exportId: string, maxAttempts: number = 30): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.axiosInstance.get(`/exports/${exportId}`);
        
        if (response.data.status === 'completed') {
          return response.data.url;
        } else if (response.data.status === 'failed') {
          throw new Error('Export failed');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new BadRequestException('Export timeout');
  }

  /**
   * Map Canva API response to internal format
   */
  private mapCanvaDesign(data: any): CanvaDesign {
    return {
      id: data.id,
      title: data.title || 'Untitled',
      thumbnail: data.thumbnail?.url || '',
      urls: {
        editUrl: data.urls?.edit_url || '',
        viewUrl: data.urls?.view_url || '',
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Validate Canva API credentials
   */
  async validateCredentials(accessToken: string): Promise<boolean> {
    try {
      this.setAccessToken(accessToken);
      await this.axiosInstance.get('/user/profile');
      return true;
    } catch (error) {
      this.logger.error('Invalid Canva credentials', error);
      return false;
    }
  }
}
