import { Injectable, Logger } from '@nestjs/common';
import { CommerceConnector } from '../interfaces/commerce-connector.interface';

@Injectable()
export class BigCommerceConnector implements CommerceConnector {
  private readonly logger = new Logger(BigCommerceConnector.name);

  async testConnection(credentials: Record<string, any>): Promise<boolean> {
    this.logger.warn('BigCommerce connector not fully implemented');
    return false;
  }

  async syncProducts(
    credentials: Record<string, any>,
    options?: { fullSync?: boolean; cursor?: string; limit?: number },
  ): Promise<{ products: any[]; nextCursor?: string; hasMore: boolean }> {
    this.logger.warn('BigCommerce product sync not implemented');
    return { products: [], hasMore: false };
  }

  async getProduct(credentials: Record<string, any>, productId: string): Promise<any> {
    this.logger.warn('BigCommerce getProduct not implemented');
    return null;
  }

  async updateInventory(
    credentials: Record<string, any>,
    productId: string,
    quantity: number,
  ): Promise<void> {
    this.logger.warn('BigCommerce updateInventory not implemented');
  }

  async getProductVariants(credentials: Record<string, any>, productId: string): Promise<any[]> {
    this.logger.warn('BigCommerce getProductVariants not implemented');
    return [];
  }

  async createCatalog(credentials: Record<string, any>, catalogName: string): Promise<string> {
    this.logger.warn('BigCommerce createCatalog not implemented');
    return '';
  }

  async getOrders(
    credentials: Record<string, any>,
    options?: { startDate?: Date; endDate?: Date; cursor?: string; limit?: number },
  ): Promise<{ orders: any[]; nextCursor?: string; hasMore: boolean }> {
    this.logger.warn('BigCommerce getOrders not implemented');
    return { orders: [], hasMore: false };
  }
}
