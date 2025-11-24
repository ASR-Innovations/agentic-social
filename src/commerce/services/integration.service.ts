import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommercePlatform } from '@prisma/client';
import { ShopifyConnector } from '../connectors/shopify.connector';
import { WooCommerceConnector } from '../connectors/woocommerce.connector';
import { BigCommerceConnector } from '../connectors/bigcommerce.connector';
import { CommerceConnector } from '../interfaces/commerce-connector.interface';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private readonly encryptionKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopifyConnector: ShopifyConnector,
    private readonly woocommerceConnector: WooCommerceConnector,
    private readonly bigcommerceConnector: BigCommerceConnector,
  ) {
    // In production, this should come from environment variables
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  private getConnector(platform: CommercePlatform): CommerceConnector {
    switch (platform) {
      case CommercePlatform.SHOPIFY:
        return this.shopifyConnector;
      case CommercePlatform.WOOCOMMERCE:
        return this.woocommerceConnector;
      case CommercePlatform.BIGCOMMERCE:
        return this.bigcommerceConnector;
      default:
        throw new BadRequestException(`Unsupported platform: ${platform}`);
    }
  }

  private encryptCredentials(credentials: Record<string, any>): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptCredentials(encryptedData: string): Record<string, any> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  async createIntegration(
    workspaceId: string,
    data: {
      platform: CommercePlatform;
      storeName: string;
      storeUrl?: string;
      storeDomain?: string;
      credentials: Record<string, any>;
      autoSync?: boolean;
      syncFrequency?: number;
    },
  ) {
    // Test connection first
    const connector = this.getConnector(data.platform);
    const isConnected = await connector.testConnection(data.credentials);

    if (!isConnected) {
      throw new BadRequestException('Failed to connect to e-commerce platform. Please check your credentials.');
    }

    // Encrypt credentials
    const encryptedCredentials = this.encryptCredentials(data.credentials);

    // Create integration
    const integration = await this.prisma.commerceIntegration.create({
      data: {
        workspaceId,
        platform: data.platform,
        storeName: data.storeName,
        storeUrl: data.storeUrl,
        storeDomain: data.storeDomain,
        credentials: encryptedCredentials as any,
        autoSync: data.autoSync ?? true,
        syncFrequency: data.syncFrequency ?? 60,
        isActive: true,
      },
    });

    this.logger.log(`Created ${data.platform} integration for workspace ${workspaceId}`);

    return integration;
  }

  async getIntegrations(workspaceId: string) {
    return this.prisma.commerceIntegration.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async getIntegration(integrationId: string, workspaceId: string) {
    const integration = await this.prisma.commerceIntegration.findFirst({
      where: {
        id: integrationId,
        workspaceId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async getDecryptedCredentials(integrationId: string, workspaceId: string): Promise<Record<string, any>> {
    const integration = await this.getIntegration(integrationId, workspaceId);
    return this.decryptCredentials(integration.credentials as any);
  }

  async updateIntegration(
    integrationId: string,
    workspaceId: string,
    data: {
      storeName?: string;
      storeUrl?: string;
      storeDomain?: string;
      credentials?: Record<string, any>;
      autoSync?: boolean;
      syncFrequency?: number;
      isActive?: boolean;
    },
  ) {
    const integration = await this.getIntegration(integrationId, workspaceId);

    const updateData: any = {};

    if (data.storeName) updateData.storeName = data.storeName;
    if (data.storeUrl) updateData.storeUrl = data.storeUrl;
    if (data.storeDomain) updateData.storeDomain = data.storeDomain;
    if (data.autoSync !== undefined) updateData.autoSync = data.autoSync;
    if (data.syncFrequency) updateData.syncFrequency = data.syncFrequency;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.credentials) {
      // Test new credentials
      const connector = this.getConnector(integration.platform);
      const isConnected = await connector.testConnection(data.credentials);

      if (!isConnected) {
        throw new BadRequestException('Failed to connect with new credentials');
      }

      updateData.credentials = this.encryptCredentials(data.credentials);
    }

    return this.prisma.commerceIntegration.update({
      where: { id: integrationId },
      data: updateData,
    });
  }

  async deleteIntegration(integrationId: string, workspaceId: string) {
    await this.getIntegration(integrationId, workspaceId);

    await this.prisma.commerceIntegration.delete({
      where: { id: integrationId },
    });

    this.logger.log(`Deleted integration ${integrationId}`);
  }

  async testIntegrationConnection(integrationId: string, workspaceId: string): Promise<boolean> {
    const integration = await this.getIntegration(integrationId, workspaceId);
    const credentials = this.decryptCredentials(integration.credentials as any);
    const connector = this.getConnector(integration.platform);

    return connector.testConnection(credentials);
  }
}
