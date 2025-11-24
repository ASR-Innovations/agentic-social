# Design Tool Integration

This module provides seamless integration with popular design tools and stock photo services, enabling users to create, edit, and import assets directly into the social media management platform.

## Supported Providers

### 1. Canva
- **Features**: Create designs, export designs, direct editing
- **Authentication**: OAuth 2.0 access token
- **Use Cases**: Social media graphics, presentations, marketing materials

### 2. Adobe Creative Cloud
- **Features**: Access assets, download files, Adobe Stock search
- **Authentication**: OAuth 2.0 access token + API key
- **Use Cases**: Professional design assets, brand materials

### 3. Unsplash
- **Features**: Search photos, download high-quality images
- **Authentication**: API access key
- **Use Cases**: Free stock photography, background images

### 4. Pexels
- **Features**: Search photos and videos, download media
- **Authentication**: API key
- **Use Cases**: Free stock photos and videos

## API Endpoints

### Connect Design Tool

```http
POST /api/integrations/design-tools/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "provider": "CANVA",
  "accessToken": "your-access-token",
  "config": {}
}
```

**Response:**
```json
{
  "id": "integration-id",
  "name": "Canva",
  "provider": "CANVA",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Connected Tools

```http
GET /api/integrations/design-tools/connected
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "integration-id",
    "name": "Canva",
    "provider": "CANVA",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Disconnect Design Tool

```http
DELETE /api/integrations/design-tools/{integrationId}
Authorization: Bearer {token}
```

## Canva Integration

### Create Design

```http
POST /api/integrations/design-tools/canva/designs
Authorization: Bearer {token}
Content-Type: application/json

{
  "templateType": "instagram-post",
  "title": "My Social Post",
  "content": {}
}
```

### List Designs

```http
GET /api/integrations/design-tools/canva/designs?page=1&perPage=20
Authorization: Bearer {token}
```

### Export Design

```http
POST /api/integrations/design-tools/canva/designs/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "designId": "canva-design-id",
  "format": "png",
  "quality": "high"
}
```

**Response:**
```json
{
  "url": "https://export-url.com/design.png",
  "format": "png",
  "size": 0
}
```

### Get Edit URL

```http
GET /api/integrations/design-tools/canva/designs/{designId}/edit-url
Authorization: Bearer {token}
```

**Response:**
```json
{
  "url": "https://www.canva.com/design/edit/..."
}
```

## Adobe Creative Cloud Integration

### List Assets

```http
GET /api/integrations/design-tools/adobe/assets?page=1&perPage=20&assetType=image
Authorization: Bearer {token}
```

### Get Asset

```http
POST /api/integrations/design-tools/adobe/assets/get
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetId": "adobe-asset-id",
  "assetType": "image"
}
```

## Stock Photo Integration

### Search Photos

```http
POST /api/integrations/design-tools/stock-photos/search?provider=UNSPLASH
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "nature landscape",
  "page": 1,
  "perPage": 20,
  "orientation": "landscape",
  "color": "green"
}
```

**Response:**
```json
{
  "photos": [
    {
      "id": "photo-id",
      "description": "Beautiful landscape",
      "urls": {
        "raw": "https://...",
        "full": "https://...",
        "regular": "https://...",
        "small": "https://...",
        "thumb": "https://..."
      },
      "width": 4000,
      "height": 3000,
      "user": {
        "username": "photographer",
        "name": "John Doe"
      }
    }
  ],
  "total": 1000
}
```

### Download Stock Photo

```http
POST /api/integrations/design-tools/stock-photos/download
Authorization: Bearer {token}
Content-Type: application/json

{
  "photoId": "photo-id",
  "provider": "UNSPLASH",
  "size": "regular"
}
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "cdnUrl": "https://cdn.example.com/...",
  "s3Key": "workspace-id/stock-photos/unsplash-photo-id.jpg",
  "provider": "UNSPLASH",
  "photoId": "photo-id"
}
```

## Import Asset from Design Tool

```http
POST /api/integrations/design-tools/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetUrl": "https://design-tool.com/asset.png",
  "provider": "CANVA",
  "folder": "imported-designs",
  "metadata": {
    "designId": "canva-design-id",
    "title": "My Design"
  }
}
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "cdnUrl": "https://cdn.example.com/...",
  "s3Key": "workspace-id/imported-designs/asset.png",
  "provider": "CANVA",
  "metadata": {
    "designId": "canva-design-id",
    "title": "My Design"
  }
}
```

## Setup Instructions

### 1. Canva Integration

1. Create a Canva app at https://www.canva.com/developers
2. Configure OAuth 2.0 redirect URI
3. Obtain client ID and client secret
4. Implement OAuth flow to get access token
5. Connect using the access token

### 2. Adobe Creative Cloud Integration

1. Create an Adobe Developer account
2. Create a new project at https://developer.adobe.com
3. Add Creative Cloud API
4. Obtain API key and implement OAuth 2.0
5. Connect using access token and API key

### 3. Unsplash Integration

1. Create an Unsplash developer account at https://unsplash.com/developers
2. Create a new application
3. Obtain access key
4. Connect using the access key

### 4. Pexels Integration

1. Create a Pexels account at https://www.pexels.com
2. Generate API key at https://www.pexels.com/api
3. Connect using the API key

## Environment Variables

Add these to your `.env` file:

```env
# Encryption key for storing credentials (32 characters)
ENCRYPTION_KEY=your-32-character-encryption-key

# AWS S3 for storing imported assets
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain
```

## Usage Examples

### Frontend Integration

```typescript
// Connect Canva
const connectCanva = async (accessToken: string) => {
  const response = await fetch('/api/integrations/design-tools/connect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'CANVA',
      accessToken,
    }),
  });
  return response.json();
};

// Search Unsplash photos
const searchPhotos = async (query: string) => {
  const response = await fetch(
    '/api/integrations/design-tools/stock-photos/search?provider=UNSPLASH',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        perPage: 20,
        orientation: 'landscape',
      }),
    }
  );
  return response.json();
};

// Download and import photo
const importPhoto = async (photoId: string, provider: string) => {
  const response = await fetch(
    '/api/integrations/design-tools/stock-photos/download',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoId,
        provider,
        size: 'regular',
      }),
    }
  );
  return response.json();
};
```

## Security Considerations

1. **Credential Encryption**: All API keys and access tokens are encrypted using AES-256-GCM before storage
2. **Token Refresh**: Implement automatic token refresh for OAuth providers
3. **Rate Limiting**: Respect API rate limits for each provider
4. **Access Control**: Ensure workspace isolation for all operations
5. **Audit Logging**: All import operations are logged for compliance

## Error Handling

Common error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid credentials for design tool",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 404,
  "message": "CANVA integration not found. Please connect it first.",
  "error": "Not Found"
}
```

## Best Practices

1. **Cache Results**: Cache stock photo search results to reduce API calls
2. **Lazy Loading**: Load design tool assets on demand
3. **Thumbnail Previews**: Use thumbnail URLs for previews before downloading full images
4. **Batch Operations**: Group multiple asset imports when possible
5. **Error Recovery**: Implement retry logic for failed downloads
6. **User Feedback**: Show progress indicators for long-running operations

## Limitations

- **Canva**: Rate limits apply based on your Canva plan
- **Adobe**: Requires active Creative Cloud subscription
- **Unsplash**: 50 requests per hour for free tier
- **Pexels**: 200 requests per hour for free tier

## Support

For issues or questions:
- Check API documentation for each provider
- Review error logs in the integration logs table
- Contact support with integration ID and error details
