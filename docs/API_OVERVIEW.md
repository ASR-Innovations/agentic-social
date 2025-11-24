# AI Social Media Management Platform API

## Overview

The AI Social Media Management Platform API is a comprehensive REST API that enables developers to integrate social media management capabilities into their applications. Built with enterprise-grade security and scalability, the API provides access to all platform features including content publishing, analytics, AI-powered content generation, social listening, and more.

## Base URLs

- **Production**: `https://api.example.com`
- **Staging**: `https://api-staging.example.com`
- **Local Development**: `http://localhost:3001`

## API Versioning

The API uses URI-based versioning. All endpoints are prefixed with `/api/v{version}` where `{version}` is the API version number.

Current version: **v1**

Example: `https://api.example.com/api/v1/posts`

### Version Support Policy

- Each major version is supported for at least 12 months after the next version is released
- Deprecated endpoints will show warnings 6 months before removal
- Breaking changes will only occur in major version updates

## Authentication

### JWT Bearer Token

All API requests require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Keys

For server-to-server integrations, you can use API keys:

```
X-API-Key: <your_api_key>
```

### Obtaining Tokens

1. **User Authentication**: POST to `/api/v1/auth/login` with credentials
2. **API Keys**: Generate in the dashboard under Settings > API Keys

## Rate Limiting

API requests are rate-limited based on your subscription plan:

| Plan | Rate Limit | Burst Limit |
|------|------------|-------------|
| Free | 100 req/hour | 10 req/minute |
| Starter | 1,000 req/hour | 50 req/minute |
| Professional | 10,000 req/hour | 200 req/minute |
| Enterprise | Unlimited | 1,000 req/minute |

### Rate Limit Headers

Every API response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Handling Rate Limits

When rate limited, the API returns a `429 Too Many Requests` status with a `Retry-After` header indicating when to retry.

## Request Format

### Content Type

All POST, PUT, and PATCH requests must include:

```
Content-Type: application/json
```

### Request Body

Request bodies must be valid JSON:

```json
{
  "content": "Check out our new product!",
  "platforms": ["instagram", "twitter"],
  "scheduledAt": "2024-01-15T10:00:00Z"
}
```

## Response Format

### Success Response

Successful requests return a 2xx status code with JSON response:

```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "content": "Check out our new product!",
    "status": "scheduled"
  },
  "meta": {
    "timestamp": "2024-01-10T12:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response

Failed requests return appropriate status codes with error details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "platforms",
        "message": "At least one platform is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-10T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded with no response body |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Temporary service issue |

## Pagination

List endpoints support cursor-based pagination:

### Request Parameters

```
GET /api/v1/posts?limit=20&cursor=eyJpZCI6InBvc3RfMTIzIn0
```

- `limit`: Number of items per page (default: 20, max: 100)
- `cursor`: Pagination cursor from previous response

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6InBvc3RfMTQ0In0",
    "total": 1500
  }
}
```

## Filtering and Sorting

### Filtering

Use query parameters to filter results:

```
GET /api/v1/posts?status=published&platform=instagram&startDate=2024-01-01
```

### Sorting

Use the `sort` parameter:

```
GET /api/v1/posts?sort=-createdAt,title
```

- Prefix with `-` for descending order
- Multiple fields separated by commas

## Webhooks

Configure webhooks to receive real-time notifications for events.

### Supported Events

- `post.published` - Post successfully published
- `post.failed` - Post publishing failed
- `mention.created` - New brand mention detected
- `message.received` - New inbox message
- `analytics.updated` - Analytics data updated
- `crisis.detected` - Potential crisis detected

### Webhook Payload

```json
{
  "event": "post.published",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "postId": "post_123",
    "platform": "instagram",
    "platformPostId": "ig_456"
  },
  "workspaceId": "ws_789"
}
```

### Webhook Security

All webhook requests include a signature header for verification:

```
X-Webhook-Signature: sha256=abc123...
```

## SDKs

Official SDKs are available for popular programming languages:

- **JavaScript/TypeScript**: `npm install @ai-social/sdk`
- **Python**: `pip install ai-social-sdk`

See SDK documentation for detailed usage examples.

## Support

- **Documentation**: https://docs.example.com
- **API Status**: https://status.example.com
- **Support Email**: api-support@example.com
- **Community Forum**: https://community.example.com

## Changelog

### Version 1.0.0 (Current)

- Initial API release
- Full CRUD operations for posts, analytics, and social accounts
- AI content generation endpoints
- Social listening and monitoring
- Unified inbox management
- Webhook support
