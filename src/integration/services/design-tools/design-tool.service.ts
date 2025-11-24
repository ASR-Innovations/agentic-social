import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { S3Service } from '../../../media/s3.service';
import { CanvaService } from './canva.service';
import { AdobeService } from './adobe.service';
import { UnsplashService } from './unsplash.service';
import { PexelsService } from './pexels.service';
import {
  ConnectDesignToolDto,
  DesignToolProvider,
  CanvaDesignDto,
  CreateCanvaDesignDto,
  AdobeAssetDto,
  StockPhotoSearchDto,
  DownloadStockPhotoDto,
  ImportAssetDto,
} from '../../dto/design-tool.dto';

@Injectable()
export class DesignToolService {
  private readonly logger = new Logger(DesignToolService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private canvaService: CanvaService,
    private adobeService: AdobeService,
    private unsplashService: UnsplashService,
    private pexelsService: PexelsService,
  ) {}

  /**
   * Connect a design tool integration
   */
  async connectDesignTool(workspaceId: string, userId: string, dto: ConnectDesignToolDto) {
    // Validate credentials
    const isValid = await this.validateCredentials(dto);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials for design tool');
    }

    // Check if integration already exists
    const existing = await this.prisma.integration.findFirst({
      where: {
        workspaceId,
        provider: dto.provider,
        type: 'DESIGN_TOOL',
      },
    });

    if (existing) {
      // Update existing integration
      return this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          credentials: this.encryptCredentials({
            apiKey: dto.apiKey,
            accessToken: dto.accessToken,
            refreshToken: dto.refreshToken,
          }),
          config: dto.config,
          status: 'ACTIVE',
        },
      });
    }

    // Create new integration
    return this.prisma.integration.create({
      data: {
        workspaceId,
        name: this.getProviderName(dto.provider),
        type: 'DESIGN_TOOL',
        provider: dto.provider,
        description: `${this.getProviderName(dto.provider)} integration for design and stock photos`,
        credentials: this.encryptCredentials({
          apiKey: dto.apiKey,
          accessToken: dto.accessToken,
          refreshToken: dto.refreshToken,
        }),
        config: dto.config,
        status: 'ACTIVE',
        createdBy: userId,
      },
    });
  }

  /**
   * Get connected design tools for workspace
   */
  async getConnectedTools(workspaceId: string) {
    return this.prisma.integration.findMany({
      where: {
        workspaceId,
        type: 'DESIGN_TOOL',
      },
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Disconnect design tool
   */
  async disconnectDesignTool(workspaceId: string, integrationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        id: integrationId,
        workspaceId,
        type: 'DESIGN_TOOL',
      },
    });

    if (!integration) {
      throw new NotFoundException('Design tool integration not found');
    }

    await this.prisma.integration.delete({
      where: { id: integrationId },
    });

    return { message: 'Design tool disconnected successfully' };
  }

  /**
   * Create Canva design
   */
  async createCanvaDesign(workspaceId: string, dto: CreateCanvaDesignDto) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.CANVA);
    this.canvaService.setAccessToken(credentials.accessToken);
    return this.canvaService.createDesign(dto);
  }

  /**
   * Export Canva design
   */
  async exportCanvaDesign(workspaceId: string, dto: CanvaDesignDto) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.CANVA);
    this.canvaService.setAccessToken(credentials.accessToken);
    return this.canvaService.exportDesign(dto);
  }

  /**
   * Get Canva edit URL
   */
  async getCanvaEditUrl(workspaceId: string, designId: string) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.CANVA);
    this.canvaService.setAccessToken(credentials.accessToken);
    return this.canvaService.getEditUrl(designId);
  }

  /**
   * List Canva designs
   */
  async listCanvaDesigns(workspaceId: string, page: number = 1, perPage: number = 20) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.CANVA);
    this.canvaService.setAccessToken(credentials.accessToken);
    return this.canvaService.listDesigns(page, perPage);
  }

  /**
   * Get Adobe asset
   */
  async getAdobeAsset(workspaceId: string, dto: AdobeAssetDto) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.ADOBE_CREATIVE_CLOUD);
    this.adobeService.setAccessToken(credentials.accessToken, credentials.apiKey);
    return this.adobeService.getAsset(dto);
  }

  /**
   * List Adobe assets
   */
  async listAdobeAssets(workspaceId: string, page: number = 1, perPage: number = 20, assetType?: string) {
    const credentials = await this.getCredentials(workspaceId, DesignToolProvider.ADOBE_CREATIVE_CLOUD);
    this.adobeService.setAccessToken(credentials.accessToken, credentials.apiKey);
    return this.adobeService.listAssets(page, perPage, assetType);
  }

  /**
   * Search stock photos
   */
  async searchStockPhotos(workspaceId: string, provider: DesignToolProvider, dto: StockPhotoSearchDto) {
    if (provider === DesignToolProvider.UNSPLASH) {
      const credentials = await this.getCredentials(workspaceId, DesignToolProvider.UNSPLASH);
      this.unsplashService.setAccessKey(credentials.apiKey);
      return this.unsplashService.searchPhotos(dto);
    } else if (provider === DesignToolProvider.PEXELS) {
      const credentials = await this.getCredentials(workspaceId, DesignToolProvider.PEXELS);
      this.pexelsService.setApiKey(credentials.apiKey);
      return this.pexelsService.searchPhotos(dto);
    }

    throw new BadRequestException('Invalid stock photo provider');
  }

  /**
   * Download and import stock photo
   */
  async downloadStockPhoto(workspaceId: string, dto: DownloadStockPhotoDto) {
    let downloadResult: { url: string; buffer: Buffer };

    if (dto.provider === DesignToolProvider.UNSPLASH) {
      const credentials = await this.getCredentials(workspaceId, DesignToolProvider.UNSPLASH);
      this.unsplashService.setAccessKey(credentials.apiKey);
      downloadResult = await this.unsplashService.downloadPhoto(dto.photoId, dto.size);
    } else if (dto.provider === DesignToolProvider.PEXELS) {
      const credentials = await this.getCredentials(workspaceId, DesignToolProvider.PEXELS);
      this.pexelsService.setApiKey(credentials.apiKey);
      downloadResult = await this.pexelsService.downloadPhoto(dto.photoId, dto.size);
    } else {
      throw new BadRequestException('Invalid stock photo provider');
    }

    // Upload to S3
    const fileName = `${dto.provider.toLowerCase()}-${dto.photoId}.jpg`;
    const uploadResult = await this.s3Service.uploadBuffer(
      downloadResult.buffer,
      fileName,
      'image/jpeg',
      workspaceId,
      'stock-photos',
    );

    return {
      url: uploadResult.url,
      cdnUrl: uploadResult.cdnUrl,
      s3Key: uploadResult.key,
      provider: dto.provider,
      photoId: dto.photoId,
    };
  }

  /**
   * Import asset from design tool
   */
  async importAsset(workspaceId: string, dto: ImportAssetDto) {
    try {
      // Download asset from URL
      const axios = require('axios');
      const response = await axios.get(dto.assetUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const fileName = dto.assetUrl.split('/').pop() || 'imported-asset';

      // Upload to S3
      const uploadResult = await this.s3Service.uploadBuffer(
        buffer,
        fileName,
        contentType,
        workspaceId,
        dto.folder || 'imported',
      );

      // Log the import
      await this.logImport(workspaceId, dto.provider, dto.assetUrl, uploadResult.key);

      return {
        url: uploadResult.url,
        cdnUrl: uploadResult.cdnUrl,
        s3Key: uploadResult.key,
        provider: dto.provider,
        metadata: dto.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to import asset', error);
      throw new BadRequestException('Failed to import asset from design tool');
    }
  }

  /**
   * Get credentials for a design tool provider
   */
  private async getCredentials(workspaceId: string, provider: DesignToolProvider): Promise<any> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        workspaceId,
        provider,
        type: 'DESIGN_TOOL',
        status: 'ACTIVE',
      },
    });

    if (!integration) {
      throw new NotFoundException(`${provider} integration not found. Please connect it first.`);
    }

    return this.decryptCredentials(integration.credentials as any);
  }

  /**
   * Validate credentials for a design tool
   */
  private async validateCredentials(dto: ConnectDesignToolDto): Promise<boolean> {
    try {
      switch (dto.provider) {
        case DesignToolProvider.CANVA:
          if (!dto.accessToken) return false;
          return this.canvaService.validateCredentials(dto.accessToken);

        case DesignToolProvider.ADOBE_CREATIVE_CLOUD:
          if (!dto.accessToken || !dto.apiKey) return false;
          return this.adobeService.validateCredentials(dto.accessToken, dto.apiKey);

        case DesignToolProvider.UNSPLASH:
          if (!dto.apiKey) return false;
          return this.unsplashService.validateCredentials(dto.apiKey);

        case DesignToolProvider.PEXELS:
          if (!dto.apiKey) return false;
          return this.pexelsService.validateCredentials(dto.apiKey);

        default:
          return false;
      }
    } catch (error) {
      this.logger.error('Credential validation failed', error);
      return false;
    }
  }

  /**
   * Get provider display name
   */
  private getProviderName(provider: DesignToolProvider): string {
    const names = {
      [DesignToolProvider.CANVA]: 'Canva',
      [DesignToolProvider.ADOBE_CREATIVE_CLOUD]: 'Adobe Creative Cloud',
      [DesignToolProvider.UNSPLASH]: 'Unsplash',
      [DesignToolProvider.PEXELS]: 'Pexels',
    };
    return names[provider] || provider;
  }

  /**
   * Log asset import
   */
  private async logImport(workspaceId: string, provider: string, sourceUrl: string, s3Key: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { workspaceId, provider, type: 'DESIGN_TOOL' },
    });

    if (integration) {
      await this.prisma.integrationLog.create({
        data: {
          integrationId: integration.id,
          action: 'IMPORT_ASSET',
          status: 'SUCCESS',
          request: { sourceUrl },
          response: { s3Key },
        },
      });
    }
  }

  /**
   * Encrypt credentials
   */
  private encryptCredentials(credentials: any): any {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt credentials
   */
  private decryptCredentials(encryptedData: any): any {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);

    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedData.iv, 'hex'));

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
