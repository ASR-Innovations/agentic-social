import { Injectable, Logger } from '@nestjs/common';
import { CommerceConnector } from '../interfaces/commerce-connector.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WooCommerceConnector implements CommerceConnector {
  private readonly logger = new Logger(WooCommerceConnector.name);

  private createClient(credentials: Record<string, any>): AxiosInstance {
    const { storeUrl, consumerKey, consumerSecret } = credentials;

    return axios.create({
      baseURL: `${storeUrl}/wp-json/wc/v3`,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(credentials: Record<string, any>): Promise<boolean> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get('/system_status');
      return response.status === 200;
    } catch (error) {
      this.logger.error('WooCommerce connection test failed', error);
      return false;
    }
  }

  async syncProducts(
    credentials: Record<string, any>,
    options?: { fullSync?: boolean; cursor?: string; limit?: number },
  ): Promise<{ products: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      const client = this.createClient(credentials);
      const perPage = options?.limit || 100; // WooCommerce max is 100
      const page = options?.cursor ? parseInt(options.cursor) : 1;

      const response = await client.get('/products', {
        params: {
          per_page: perPage,
          page,
          status: 'publish',
        },
      });

      const products = response.data;
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1');
      const hasMore = page < totalPages;
      const nextCursor = hasMore ? (page + 1).toString() : undefined;

      // Transform WooCommerce products to our format
      const transformedProducts = products.map((product: any) => ({
        platformProductId: product.id.toString(),
        name: product.name,
        description: product.description,
        shortDescription: product.short_description,
        price: parseFloat(product.price || '0'),
        compareAtPrice: product.regular_price && product.sale_price
          ? parseFloat(product.regular_price)
          : null,
        currency: 'USD', // WooCommerce uses shop currency
        inStock: product.stock_status === 'instock',
        stockQuantity: product.stock_quantity,
        trackInventory: product.manage_stock,
        images: product.images.map((img: any) => img.src),
        primaryImage: product.images[0]?.src,
        category: product.categories[0]?.name,
        tags: product.tags.map((t: any) => t.name),
        collections: product.categories.map((c: any) => c.name),
        brand: product.attributes.find((a: any) => a.name === 'Brand')?.options[0],
        weight: product.weight ? parseFloat(product.weight) : null,
        dimensions: product.dimensions
          ? {
              length: parseFloat(product.dimensions.length),
              width: parseFloat(product.dimensions.width),
              height: parseFloat(product.dimensions.height),
            }
          : null,
        handle: product.slug,
        hasVariants: product.variations && product.variations.length > 0,
        variants: [], // Would need separate API calls for variations
        isActive: product.status === 'publish',
        isPublished: product.status === 'publish',
        publishedAt: product.date_created ? new Date(product.date_created) : null,
        seoTitle: product.meta_data?.find((m: any) => m.key === '_yoast_wpseo_title')?.value,
        seoDescription: product.meta_data?.find((m: any) => m.key === '_yoast_wpseo_metadesc')?.value,
        metadata: {
          woocommerceId: product.id,
          permalink: product.permalink,
        },
      }));

      return {
        products: transformedProducts,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Failed to sync WooCommerce products', error);
      throw error;
    }
  }

  async getProduct(credentials: Record<string, any>, productId: string): Promise<any> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get WooCommerce product ${productId}`, error);
      throw error;
    }
  }

  async updateInventory(
    credentials: Record<string, any>,
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      const client = this.createClient(credentials);
      await client.put(`/products/${productId}`, {
        stock_quantity: quantity,
      });
    } catch (error) {
      this.logger.error(`Failed to update WooCommerce inventory for product ${productId}`, error);
      throw error;
    }
  }

  async getProductVariants(credentials: Record<string, any>, productId: string): Promise<any[]> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get(`/products/${productId}/variations`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get WooCommerce product variants for ${productId}`, error);
      throw error;
    }
  }

  async createCatalog(credentials: Record<string, any>, catalogName: string): Promise<string> {
    // WooCommerce doesn't have a separate catalog concept
    // Return store URL as catalog ID
    return credentials.storeUrl;
  }

  async getOrders(
    credentials: Record<string, any>,
    options?: { startDate?: Date; endDate?: Date; cursor?: string; limit?: number },
  ): Promise<{ orders: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      const client = this.createClient(credentials);
      const perPage = options?.limit || 100;
      const page = options?.cursor ? parseInt(options.cursor) : 1;

      const params: any = {
        per_page: perPage,
        page,
      };

      if (options?.startDate) {
        params.after = options.startDate.toISOString();
      }
      if (options?.endDate) {
        params.before = options.endDate.toISOString();
      }

      const response = await client.get('/orders', { params });
      const orders = response.data;
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1');
      const hasMore = page < totalPages;
      const nextCursor = hasMore ? (page + 1).toString() : undefined;

      return {
        orders,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Failed to get WooCommerce orders', error);
      throw error;
    }
  }
}
