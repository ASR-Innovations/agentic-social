import { Injectable, Logger } from '@nestjs/common';
import { CommerceConnector } from '../interfaces/commerce-connector.interface';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ShopifyConnector implements CommerceConnector {
  private readonly logger = new Logger(ShopifyConnector.name);

  private createClient(credentials: Record<string, any>): AxiosInstance {
    const { shopDomain, accessToken, apiVersion = '2024-01' } = credentials;

    return axios.create({
      baseURL: `https://${shopDomain}/admin/api/${apiVersion}`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(credentials: Record<string, any>): Promise<boolean> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get('/shop.json');
      return response.status === 200;
    } catch (error) {
      this.logger.error('Shopify connection test failed', error);
      return false;
    }
  }

  async syncProducts(
    credentials: Record<string, any>,
    options?: { fullSync?: boolean; cursor?: string; limit?: number },
  ): Promise<{ products: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      const client = this.createClient(credentials);
      const limit = options?.limit || 250; // Shopify max is 250

      let url = `/products.json?limit=${limit}`;
      if (options?.cursor) {
        url += `&page_info=${options.cursor}`;
      }

      const response = await client.get(url);
      const products = response.data.products;

      // Extract pagination info from Link header
      const linkHeader = response.headers.link;
      let nextCursor: string | undefined;
      let hasMore = false;

      if (linkHeader) {
        const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
        if (nextMatch) {
          nextCursor = nextMatch[1];
          hasMore = true;
        }
      }

      // Transform Shopify products to our format
      const transformedProducts = products.map((product: any) => ({
        platformProductId: product.id.toString(),
        name: product.title,
        description: product.body_html,
        price: parseFloat(product.variants[0]?.price || '0'),
        compareAtPrice: product.variants[0]?.compare_at_price
          ? parseFloat(product.variants[0].compare_at_price)
          : null,
        currency: 'USD', // Shopify uses shop currency
        inStock: product.variants.some((v: any) => v.inventory_quantity > 0),
        stockQuantity: product.variants.reduce(
          (sum: number, v: any) => sum + (v.inventory_quantity || 0),
          0,
        ),
        trackInventory: product.variants[0]?.inventory_management === 'shopify',
        images: product.images.map((img: any) => img.src),
        primaryImage: product.image?.src,
        category: product.product_type,
        tags: product.tags.split(',').map((t: string) => t.trim()),
        collections: [], // Would need separate API call
        brand: product.vendor,
        handle: product.handle,
        hasVariants: product.variants.length > 1,
        variants: product.variants.map((variant: any) => ({
          platformVariantId: variant.id.toString(),
          sku: variant.sku,
          title: variant.title,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
          price: parseFloat(variant.price),
          compareAtPrice: variant.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          inStock: variant.inventory_quantity > 0,
          stockQuantity: variant.inventory_quantity,
          image: variant.image_id ? product.images.find((img: any) => img.id === variant.image_id)?.src : null,
          weight: variant.weight,
          barcode: variant.barcode,
        })),
        isActive: product.status === 'active',
        isPublished: product.published_at !== null,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        metadata: {
          shopifyId: product.id,
          adminGraphqlApiId: product.admin_graphql_api_id,
        },
      }));

      return {
        products: transformedProducts,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Failed to sync Shopify products', error);
      throw error;
    }
  }

  async getProduct(credentials: Record<string, any>, productId: string): Promise<any> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get(`/products/${productId}.json`);
      return response.data.product;
    } catch (error) {
      this.logger.error(`Failed to get Shopify product ${productId}`, error);
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
      
      // Get inventory item ID
      const product = await this.getProduct(credentials, productId);
      const inventoryItemId = product.variants[0].inventory_item_id;
      
      // Get inventory levels
      const levelsResponse = await client.get(
        `/inventory_levels.json?inventory_item_ids=${inventoryItemId}`,
      );
      const locationId = levelsResponse.data.inventory_levels[0].location_id;

      // Update inventory
      await client.post('/inventory_levels/set.json', {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity,
      });
    } catch (error) {
      this.logger.error(`Failed to update Shopify inventory for product ${productId}`, error);
      throw error;
    }
  }

  async getProductVariants(credentials: Record<string, any>, productId: string): Promise<any[]> {
    try {
      const client = this.createClient(credentials);
      const response = await client.get(`/products/${productId}/variants.json`);
      return response.data.variants;
    } catch (error) {
      this.logger.error(`Failed to get Shopify product variants for ${productId}`, error);
      throw error;
    }
  }

  async createCatalog(credentials: Record<string, any>, catalogName: string): Promise<string> {
    // Shopify doesn't have a separate catalog concept
    // Products are automatically available for social commerce
    // Return shop domain as catalog ID
    return credentials.shopDomain;
  }

  async getOrders(
    credentials: Record<string, any>,
    options?: { startDate?: Date; endDate?: Date; cursor?: string; limit?: number },
  ): Promise<{ orders: any[]; nextCursor?: string; hasMore: boolean }> {
    try {
      const client = this.createClient(credentials);
      const limit = options?.limit || 250;

      let url = `/orders.json?limit=${limit}&status=any`;
      
      if (options?.startDate) {
        url += `&created_at_min=${options.startDate.toISOString()}`;
      }
      if (options?.endDate) {
        url += `&created_at_max=${options.endDate.toISOString()}`;
      }
      if (options?.cursor) {
        url += `&page_info=${options.cursor}`;
      }

      const response = await client.get(url);
      const orders = response.data.orders;

      // Extract pagination info
      const linkHeader = response.headers.link;
      let nextCursor: string | undefined;
      let hasMore = false;

      if (linkHeader) {
        const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
        if (nextMatch) {
          nextCursor = nextMatch[1];
          hasMore = true;
        }
      }

      return {
        orders,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      this.logger.error('Failed to get Shopify orders', error);
      throw error;
    }
  }
}
