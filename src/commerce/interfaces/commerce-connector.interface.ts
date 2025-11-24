export interface CommerceConnector {
  /**
   * Test the connection with the e-commerce platform
   */
  testConnection(credentials: Record<string, any>): Promise<boolean>;

  /**
   * Sync products from the e-commerce platform
   */
  syncProducts(
    credentials: Record<string, any>,
    options?: {
      fullSync?: boolean;
      cursor?: string;
      limit?: number;
    },
  ): Promise<{
    products: any[];
    nextCursor?: string;
    hasMore: boolean;
  }>;

  /**
   * Get a single product by ID
   */
  getProduct(
    credentials: Record<string, any>,
    productId: string,
  ): Promise<any>;

  /**
   * Update product inventory
   */
  updateInventory(
    credentials: Record<string, any>,
    productId: string,
    quantity: number,
  ): Promise<void>;

  /**
   * Get product variants
   */
  getProductVariants(
    credentials: Record<string, any>,
    productId: string,
  ): Promise<any[]>;

  /**
   * Create a product catalog for social platforms
   */
  createCatalog(
    credentials: Record<string, any>,
    catalogName: string,
  ): Promise<string>; // Returns catalog ID

  /**
   * Get orders/conversions
   */
  getOrders(
    credentials: Record<string, any>,
    options?: {
      startDate?: Date;
      endDate?: Date;
      cursor?: string;
      limit?: number;
    },
  ): Promise<{
    orders: any[];
    nextCursor?: string;
    hasMore: boolean;
  }>;
}
