import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { StockPhotoSearchDto } from '../../dto/design-tool.dto';

export interface UnsplashPhoto {
  id: string;
  description: string;
  altDescription: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  color: string;
  user: {
    id: string;
    username: string;
    name: string;
    profileImage: string;
  };
  downloads: number;
  likes: number;
}

@Injectable()
export class UnsplashService {
  private readonly logger = new Logger(UnsplashService.name);
  private readonly baseUrl = 'https://api.unsplash.com';
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
   * Initialize Unsplash API client with access key
   */
  setAccessKey(accessKey: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Client-ID ${accessKey}`;
  }

  /**
   * Search Unsplash photos
   */
  async searchPhotos(dto: StockPhotoSearchDto): Promise<{ photos: UnsplashPhoto[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/search/photos', {
        params: {
          query: dto.query,
          page: dto.page || 1,
          per_page: dto.perPage || 20,
          orientation: dto.orientation,
          color: dto.color,
        },
      });

      return {
        photos: response.data.results.map((photo: any) => this.mapUnsplashPhoto(photo)),
        total: response.data.total || 0,
      };
    } catch (error) {
      this.logger.error('Failed to search Unsplash photos', error);
      throw new BadRequestException('Failed to search Unsplash photos');
    }
  }

  /**
   * Get photo details
   */
  async getPhoto(photoId: string): Promise<UnsplashPhoto> {
    try {
      const response = await this.axiosInstance.get(`/photos/${photoId}`);
      return this.mapUnsplashPhoto(response.data);
    } catch (error) {
      this.logger.error(`Failed to get Unsplash photo ${photoId}`, error);
      throw new BadRequestException('Failed to get Unsplash photo');
    }
  }

  /**
   * Download photo (triggers download tracking)
   */
  async downloadPhoto(photoId: string, size: string = 'regular'): Promise<{ url: string; buffer: Buffer }> {
    try {
      // Get photo details
      const photo = await this.getPhoto(photoId);

      // Trigger download tracking
      await this.axiosInstance.get(`/photos/${photoId}/download`);

      // Get the appropriate URL based on size
      const downloadUrl = this.getPhotoUrl(photo, size);

      // Download the image
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
      });

      return {
        url: downloadUrl,
        buffer: Buffer.from(response.data),
      };
    } catch (error) {
      this.logger.error(`Failed to download Unsplash photo ${photoId}`, error);
      throw new BadRequestException('Failed to download Unsplash photo');
    }
  }

  /**
   * Get random photos
   */
  async getRandomPhotos(count: number = 10, query?: string): Promise<UnsplashPhoto[]> {
    try {
      const response = await this.axiosInstance.get('/photos/random', {
        params: {
          count,
          query,
        },
      });

      const photos = Array.isArray(response.data) ? response.data : [response.data];
      return photos.map((photo: any) => this.mapUnsplashPhoto(photo));
    } catch (error) {
      this.logger.error('Failed to get random Unsplash photos', error);
      throw new BadRequestException('Failed to get random Unsplash photos');
    }
  }

  /**
   * Get curated photos
   */
  async getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<{ photos: UnsplashPhoto[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/photos', {
        params: {
          page,
          per_page: perPage,
          order_by: 'popular',
        },
      });

      return {
        photos: response.data.map((photo: any) => this.mapUnsplashPhoto(photo)),
        total: response.headers['x-total'] || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get curated Unsplash photos', error);
      throw new BadRequestException('Failed to get curated Unsplash photos');
    }
  }

  /**
   * Map Unsplash API response to internal format
   */
  private mapUnsplashPhoto(data: any): UnsplashPhoto {
    return {
      id: data.id,
      description: data.description || '',
      altDescription: data.alt_description || '',
      urls: {
        raw: data.urls.raw,
        full: data.urls.full,
        regular: data.urls.regular,
        small: data.urls.small,
        thumb: data.urls.thumb,
      },
      width: data.width,
      height: data.height,
      color: data.color,
      user: {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        profileImage: data.user.profile_image?.medium || '',
      },
      downloads: data.downloads || 0,
      likes: data.likes || 0,
    };
  }

  /**
   * Get photo URL based on size
   */
  private getPhotoUrl(photo: UnsplashPhoto, size: string): string {
    switch (size) {
      case 'small':
        return photo.urls.small;
      case 'regular':
        return photo.urls.regular;
      case 'large':
        return photo.urls.full;
      case 'original':
        return photo.urls.raw;
      default:
        return photo.urls.regular;
    }
  }

  /**
   * Validate Unsplash API credentials
   */
  async validateCredentials(accessKey: string): Promise<boolean> {
    try {
      this.setAccessKey(accessKey);
      await this.axiosInstance.get('/photos', { params: { per_page: 1 } });
      return true;
    } catch (error) {
      this.logger.error('Invalid Unsplash credentials', error);
      return false;
    }
  }
}
