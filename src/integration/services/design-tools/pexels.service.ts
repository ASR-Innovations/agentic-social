import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { StockPhotoSearchDto } from '../../dto/design-tool.dto';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  photographerId: number;
  avgColor: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  user: {
    id: number;
    name: string;
    url: string;
  };
  videoFiles: Array<{
    id: number;
    quality: string;
    fileType: string;
    width: number;
    height: number;
    link: string;
  }>;
}

@Injectable()
export class PexelsService {
  private readonly logger = new Logger(PexelsService.name);
  private readonly baseUrl = 'https://api.pexels.com/v1';
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
   * Initialize Pexels API client with API key
   */
  setApiKey(apiKey: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = apiKey;
  }

  /**
   * Search Pexels photos
   */
  async searchPhotos(dto: StockPhotoSearchDto): Promise<{ photos: PexelsPhoto[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/search', {
        params: {
          query: dto.query,
          page: dto.page || 1,
          per_page: dto.perPage || 20,
          orientation: dto.orientation,
          color: dto.color,
        },
      });

      return {
        photos: response.data.photos.map((photo: any) => this.mapPexelsPhoto(photo)),
        total: response.data.total_results || 0,
      };
    } catch (error) {
      this.logger.error('Failed to search Pexels photos', error);
      throw new BadRequestException('Failed to search Pexels photos');
    }
  }

  /**
   * Get photo details
   */
  async getPhoto(photoId: string): Promise<PexelsPhoto> {
    try {
      const response = await this.axiosInstance.get(`/photos/${photoId}`);
      return this.mapPexelsPhoto(response.data);
    } catch (error) {
      this.logger.error(`Failed to get Pexels photo ${photoId}`, error);
      throw new BadRequestException('Failed to get Pexels photo');
    }
  }

  /**
   * Download photo
   */
  async downloadPhoto(photoId: string, size: string = 'large'): Promise<{ url: string; buffer: Buffer }> {
    try {
      // Get photo details
      const photo = await this.getPhoto(photoId);

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
      this.logger.error(`Failed to download Pexels photo ${photoId}`, error);
      throw new BadRequestException('Failed to download Pexels photo');
    }
  }

  /**
   * Get curated photos
   */
  async getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<{ photos: PexelsPhoto[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/curated', {
        params: {
          page,
          per_page: perPage,
        },
      });

      return {
        photos: response.data.photos.map((photo: any) => this.mapPexelsPhoto(photo)),
        total: response.data.total_results || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get curated Pexels photos', error);
      throw new BadRequestException('Failed to get curated Pexels photos');
    }
  }

  /**
   * Search Pexels videos
   */
  async searchVideos(
    query: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<{ videos: PexelsVideo[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/videos/search', {
        params: {
          query,
          page,
          per_page: perPage,
        },
      });

      return {
        videos: response.data.videos.map((video: any) => this.mapPexelsVideo(video)),
        total: response.data.total_results || 0,
      };
    } catch (error) {
      this.logger.error('Failed to search Pexels videos', error);
      throw new BadRequestException('Failed to search Pexels videos');
    }
  }

  /**
   * Get popular videos
   */
  async getPopularVideos(page: number = 1, perPage: number = 20): Promise<{ videos: PexelsVideo[]; total: number }> {
    try {
      const response = await this.axiosInstance.get('/videos/popular', {
        params: {
          page,
          per_page: perPage,
        },
      });

      return {
        videos: response.data.videos.map((video: any) => this.mapPexelsVideo(video)),
        total: response.data.total_results || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get popular Pexels videos', error);
      throw new BadRequestException('Failed to get popular Pexels videos');
    }
  }

  /**
   * Map Pexels photo API response to internal format
   */
  private mapPexelsPhoto(data: any): PexelsPhoto {
    return {
      id: data.id,
      width: data.width,
      height: data.height,
      url: data.url,
      photographer: data.photographer,
      photographerUrl: data.photographer_url,
      photographerId: data.photographer_id,
      avgColor: data.avg_color,
      src: {
        original: data.src.original,
        large2x: data.src.large2x,
        large: data.src.large,
        medium: data.src.medium,
        small: data.src.small,
        portrait: data.src.portrait,
        landscape: data.src.landscape,
        tiny: data.src.tiny,
      },
      alt: data.alt || '',
    };
  }

  /**
   * Map Pexels video API response to internal format
   */
  private mapPexelsVideo(data: any): PexelsVideo {
    return {
      id: data.id,
      width: data.width,
      height: data.height,
      duration: data.duration,
      url: data.url,
      image: data.image,
      user: {
        id: data.user.id,
        name: data.user.name,
        url: data.user.url,
      },
      videoFiles: data.video_files.map((file: any) => ({
        id: file.id,
        quality: file.quality,
        fileType: file.file_type,
        width: file.width,
        height: file.height,
        link: file.link,
      })),
    };
  }

  /**
   * Get photo URL based on size
   */
  private getPhotoUrl(photo: PexelsPhoto, size: string): string {
    switch (size) {
      case 'small':
        return photo.src.small;
      case 'medium':
        return photo.src.medium;
      case 'large':
        return photo.src.large;
      case 'original':
        return photo.src.original;
      default:
        return photo.src.large;
    }
  }

  /**
   * Validate Pexels API credentials
   */
  async validateCredentials(apiKey: string): Promise<boolean> {
    try {
      this.setApiKey(apiKey);
      await this.axiosInstance.get('/curated', { params: { per_page: 1 } });
      return true;
    } catch (error) {
      this.logger.error('Invalid Pexels credentials', error);
      return false;
    }
  }
}
