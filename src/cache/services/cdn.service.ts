import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CdnConfig, CdnPurgeOptions } from '../interfaces/cache.interface';

/**
 * Service for CDN integration and cache management
 */
@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);
  private readonly config: CdnConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      provider: this.configService.get('CDN_PROVIDER', 'cloudflare') as any,
      apiKey: this.configService.get('CDN_API_KEY'),
      zoneId: this.configService.get('CDN_ZONE_ID'),
      distributionId: this.configService.get('CDN_DISTRIBUTION_ID'),
      baseUrl: this.configService.get('CDN_BASE_URL', ''),
    };
  }

  /**
   * Purge CDN cache
   */
  async purgeCache(options: CdnPurgeOptions): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'cloudflare':
          return await this.purgeCloudflare(options);
        case 'cloudfront':
          return await this.purgeCloudFront(options);
        case 'fastly':
          return await this.purgeFastly(options);
        default:
          this.logger.warn(`Unsupported CDN provider: ${this.config.provider}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error purging CDN cache:', error);
      return false;
    }
  }

  /**
   * Purge Cloudflare cache
   */
  private async purgeCloudflare(options: CdnPurgeOptions): Promise<boolean> {
    if (!this.config.apiKey || !this.config.zoneId) {
      this.logger.warn('Cloudflare credentials not configured');
      return false;
    }

    try {
      const url = `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`;

      const payload: any = {};

      if (options.purgeEverything) {
        payload.purge_everything = true;
      } else if (options.urls && options.urls.length > 0) {
        payload.files = options.urls;
      } else if (options.tags && options.tags.length > 0) {
        payload.tags = options.tags;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        this.logger.log('Successfully purged Cloudflare cache');
        return true;
      } else {
        this.logger.error('Cloudflare purge failed:', response.data.errors);
        return false;
      }
    } catch (error) {
      this.logger.error('Error purging Cloudflare cache:', error);
      return false;
    }
  }

  /**
   * Purge CloudFront cache
   */
  private async purgeCloudFront(options: CdnPurgeOptions): Promise<boolean> {
    if (!this.config.distributionId) {
      this.logger.warn('CloudFront distribution ID not configured');
      return false;
    }

    try {
      // Note: This requires AWS SDK which should be installed separately
      // For now, we'll just log the intent
      this.logger.log('CloudFront cache purge requested');
      this.logger.warn('CloudFront purge requires AWS SDK implementation');
      return false;
    } catch (error) {
      this.logger.error('Error purging CloudFront cache:', error);
      return false;
    }
  }

  /**
   * Purge Fastly cache
   */
  private async purgeFastly(options: CdnPurgeOptions): Promise<boolean> {
    if (!this.config.apiKey) {
      this.logger.warn('Fastly API key not configured');
      return false;
    }

    try {
      if (options.purgeEverything) {
        // Purge all
        const url = `https://api.fastly.com/service/${this.config.zoneId}/purge_all`;
        await axios.post(url, {}, {
          headers: {
            'Fastly-Key': this.config.apiKey,
          },
        });
      } else if (options.urls && options.urls.length > 0) {
        // Purge specific URLs
        for (const url of options.urls) {
          await axios.post(`https://api.fastly.com/purge/${url}`, {}, {
            headers: {
              'Fastly-Key': this.config.apiKey,
            },
          });
        }
      }

      this.logger.log('Successfully purged Fastly cache');
      return true;
    } catch (error) {
      this.logger.error('Error purging Fastly cache:', error);
      return false;
    }
  }

  /**
   * Get CDN URL for an asset
   */
  getCdnUrl(path: string): string {
    if (!this.config.baseUrl) {
      return path;
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `${this.config.baseUrl}/${cleanPath}`;
  }

  /**
   * Purge media asset from CDN
   */
  async purgeMediaAsset(assetPath: string): Promise<boolean> {
    const cdnUrl = this.getCdnUrl(assetPath);
    return await this.purgeCache({ urls: [cdnUrl] });
  }

  /**
   * Purge multiple media assets from CDN
   */
  async purgeMediaAssets(assetPaths: string[]): Promise<boolean> {
    const cdnUrls = assetPaths.map((path) => this.getCdnUrl(path));
    return await this.purgeCache({ urls: cdnUrls });
  }

  /**
   * Purge by tag
   */
  async purgeByTag(tag: string): Promise<boolean> {
    return await this.purgeCache({ tags: [tag] });
  }

  /**
   * Purge by multiple tags
   */
  async purgeByTags(tags: string[]): Promise<boolean> {
    return await this.purgeCache({ tags });
  }

  /**
   * Purge everything (use with caution)
   */
  async purgeEverything(): Promise<boolean> {
    this.logger.warn('Purging entire CDN cache');
    return await this.purgeCache({ purgeEverything: true });
  }

  /**
   * Get cache headers for browser caching
   */
  getCacheHeaders(
    maxAge: number = 3600,
    sMaxAge?: number,
    staleWhileRevalidate?: number,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Cache-Control': `public, max-age=${maxAge}`,
    };

    if (sMaxAge !== undefined) {
      headers['Cache-Control'] += `, s-maxage=${sMaxAge}`;
    }

    if (staleWhileRevalidate !== undefined) {
      headers['Cache-Control'] += `, stale-while-revalidate=${staleWhileRevalidate}`;
    }

    // Add ETag for validation
    headers['ETag'] = `"${Date.now()}"`;

    return headers;
  }

  /**
   * Get cache headers for static assets
   */
  getStaticAssetHeaders(): Record<string, string> {
    return this.getCacheHeaders(
      31536000, // 1 year
      31536000, // 1 year
      86400, // 1 day stale-while-revalidate
    );
  }

  /**
   * Get cache headers for dynamic content
   */
  getDynamicContentHeaders(): Record<string, string> {
    return this.getCacheHeaders(
      300, // 5 minutes
      600, // 10 minutes
      60, // 1 minute stale-while-revalidate
    );
  }

  /**
   * Get cache headers for API responses
   */
  getApiCacheHeaders(): Record<string, string> {
    return this.getCacheHeaders(
      60, // 1 minute
      120, // 2 minutes
      30, // 30 seconds stale-while-revalidate
    );
  }

  /**
   * Get no-cache headers
   */
  getNoCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }
}
