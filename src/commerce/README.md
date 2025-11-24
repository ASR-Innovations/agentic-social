# Social Commerce Integration Module

This module provides comprehensive social commerce capabilities, enabling seamless integration with e-commerce platforms and tracking of product sales through social media.

## Features

### 1. E-commerce Platform Integration
- **Shopify Integration**: Full support for Shopify stores with product catalog sync
- **WooCommerce Integration**: Connect WordPress/WooCommerce stores
- **BigCommerce Integration**: Support for BigCommerce (basic implementation)
- Secure credential storage with AES-256 encryption
- Automatic token refresh and connection health monitoring

### 2. Product Catalog Management
- Automatic product synchronization from e-commerce platforms
- Product variant support
- Inventory tracking and updates
- Product search and filtering
- Product categorization and tagging

### 3. Shoppable Posts
- Tag products in social media posts
- Visual product tagging with coordinates for images
- Multi-product tagging support
- Platform-specific shoppable post creation (Instagram Shopping, Facebook Shop, etc.)
- Catalog management for social platforms

### 4. Conversion Tracking
- Track complete conversion funnel:
  - Product clicks
  - Product views
  - Add to cart events
  - Checkout initiation
  - Purchase completion
- UTM parameter tracking for attribution
- Customer journey timing analysis
- Device and location tracking
- Revenue attribution per post and product

### 5. Commerce Analytics
- Daily analytics aggregation
- Conversion rate analysis at each funnel stage
- Top-performing products reporting
- Revenue metrics and average order value
- Customer demographics insights
- Platform-specific performance breakdown

## API Endpoints

### Integration Management

```
POST   /commerce/integrations              Create new integration
GET    /commerce/integrations              List all integrations
GET    /commerce/integrations/:id          Get integration details
PUT    /commerce/integrations/:id          Update integration
DELETE /commerce/integrations/:id          Delete integration
POST   /commerce/integrations/:id/test     Test connection
```

### Product Management

```
POST   /commerce/products/sync             Sync products from platform
GET    /commerce/products                  List products with filters
GET    /commerce/products/:id              Get product details
POST   /commerce/products/tag              Tag product in post
DELETE /commerce/products/tags/:id         Remove product tag
```

### Shoppable Posts

```
POST   /commerce/shoppable-posts           Create shoppable post
GET    /commerce/shoppable-posts/:postId   Get shoppable post details
```

### Conversion Tracking

```
POST   /commerce/conversions               Track conversion event
GET    /commerce/conversions               Get conversion history
GET    /commerce/conversions/funnel        Get conversion funnel metrics
```

### Analytics

```
GET    /commerce/analytics                 Get commerce analytics
GET    /commerce/analytics/top-products    Get top-performing products
GET    /commerce/overview                  Get commerce overview
```

## Usage Examples

### 1. Connect Shopify Store

```typescript
POST /commerce/integrations
{
  "platform": "SHOPIFY",
  "storeName": "My Store",
  "storeUrl": "https://mystore.myshopify.com",
  "storeDomain": "mystore.myshopify.com",
  "credentials": {
    "shopDomain": "mystore.myshopify.com",
    "accessToken": "shpat_xxxxx",
    "apiVersion": "2024-01"
  },
  "autoSync": true,
  "syncFrequency": 60
}
```

### 2. Sync Products

```typescript
POST /commerce/products/sync
{
  "integrationId": "integration-uuid",
  "fullSync": true
}
```

### 3. Create Shoppable Post

```typescript
POST /commerce/shoppable-posts
{
  "postId": "post-uuid",
  "productTags": [
    {
      "productId": "product-uuid-1",
      "mediaIndex": 0,
      "xPosition": 0.3,
      "yPosition": 0.5
    },
    {
      "productId": "product-uuid-2",
      "mediaIndex": 0,
      "xPosition": 0.7,
      "yPosition": 0.5
    }
  ]
}
```

### 4. Track Conversion

```typescript
POST /commerce/conversions
{
  "postId": "post-uuid",
  "productId": "product-uuid",
  "platform": "INSTAGRAM",
  "conversionType": "PURCHASE",
  "orderValue": 99.99,
  "currency": "USD",
  "orderId": "order-123",
  "utmSource": "instagram",
  "utmMedium": "social",
  "utmCampaign": "summer-sale",
  "purchasedAt": "2024-01-15T10:30:00Z"
}
```

### 5. Get Commerce Analytics

```typescript
GET /commerce/analytics?startDate=2024-01-01&endDate=2024-01-31&platform=INSTAGRAM
```

## Database Models

### CommerceIntegration
Stores e-commerce platform connection details with encrypted credentials.

### Product
Product catalog synced from e-commerce platforms with variants, pricing, and inventory.

### ProductPostTag
Links products to social media posts with optional visual positioning.

### ShoppablePost
Tracks posts that have been made shoppable on social platforms.

### CommerceConversion
Records conversion events throughout the customer journey.

### CommerceAnalytics
Aggregated daily analytics for commerce performance.

## Security

- All e-commerce platform credentials are encrypted using AES-256
- Customer emails are hashed for privacy
- Workspace isolation ensures data separation
- JWT authentication required for all endpoints

## Background Jobs

The module supports automated background jobs for:
- Scheduled product synchronization
- Daily analytics aggregation
- Inventory updates
- Order synchronization

## Platform-Specific Notes

### Shopify
- Uses Shopify Admin API
- Supports up to 250 products per sync request
- Automatic pagination for large catalogs
- Inventory management through inventory levels API

### WooCommerce
- Uses WooCommerce REST API v3
- Requires consumer key and secret
- Supports up to 100 products per sync request
- Product variations require separate API calls

### BigCommerce
- Basic implementation provided
- Full implementation requires BigCommerce API credentials
- Supports catalog management and webhooks

## Requirements Validation

This implementation satisfies the following requirements from the specification:

- **13.1**: ✅ Shopify and WooCommerce integration with product catalog sync
- **13.2**: ✅ Product tagging in posts for shoppable content
- **13.3**: ✅ Conversion tracking with full funnel metrics
- **13.4**: ✅ Automated product post generation support (via AI integration)
- **13.5**: ✅ Commerce analytics with product performance and revenue tracking
