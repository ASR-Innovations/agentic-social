# API Reference - AI-Native Social Media Management Platform

## Overview

This document provides comprehensive API documentation for developers integrating with the platform.

**Base URL:** `https://api.platform.com/v1`

**Authentication:** Bearer token (JWT)

**Rate Limits:**
- Free: 100 requests/hour
- Starter: 1,000 requests/hour
- Professional: 10,000 requests/hour
- Enterprise: 100,000 requests/hour

---

## Table of Contents

1. [Authentication](#authentication)
2. [Posts API](#posts-api)
3. [Analytics API](#analytics-api)
4. [Social Accounts API](#social-accounts-api)
5. [Inbox API](#inbox-api)
6. [AI API](#ai-api)
7. [Campaigns API](#campaigns-api)
8. [Listening API](#listening-api)
9. [Media API](#media-api)
10. [Webhooks](#webhooks)
11. [Error Handling](#error-handling)
12. [SDKs](#sdks)

---

## Authentication

### Obtain Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "workspaceId": "ws_456"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using Access Token

Include the access token in the Authorization header:

```http
GET /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Posts API

### Create Post

```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": {
    "text": "Check out our new product! #innovation",
    "media": ["media_123", "media_456"],
    "hashtags": ["innovation", "tech"],
    "mentions": ["@partner"],
    "link": "https://example.com/product"
  },
  "platforms": [
    {
      "platform": "instagram",
      "accountId": "acc_789",
      "customContent": {
        "firstComment": "Link in bio!"
      }
    },
    {
      "platform": "twitter",
      "accountId": "acc_790"
    }
  ],
  "scheduledAt": "2024-01-15T14:00:00Z",
  "campaign": "campaign_123",
  "tags": ["product-launch"]
}
```

**Response:**
```json
{
  "id": "post_123",
  "workspaceId": "ws_456",
  "authorId": "user_123",
  "content": { ... },
  "platforms": [ ... ],
  "status": "scheduled",
  "scheduledAt": "2024-01-15T14:00:00Z",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

### List Posts

```http
GET /api/posts?status=scheduled&limit=20&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: Filter by status (draft, scheduled, published, failed)
- `platform`: Filter by platform
- `campaign`: Filter by campaign ID
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "post_123",
      "content": { ... },
      "status": "scheduled",
      "scheduledAt": "2024-01-15T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Post

```http
GET /api/posts/{postId}
Authorization: Bearer {token}
```

### Update Post

```http
PUT /api/posts/{postId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": {
    "text": "Updated content"
  },
  "scheduledAt": "2024-01-16T14:00:00Z"
}
```

### Delete Post

```http
DELETE /api/posts/{postId}
Authorization: Bearer {token}
```

### Publish Post Immediately

```http
POST /api/posts/{postId}/publish
Authorization: Bearer {token}
```

### Bulk Operations

```http
POST /api/posts/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "schedule",
  "posts": [
    {
      "content": { ... },
      "platforms": [ ... ],
      "scheduledAt": "2024-01-15T14:00:00Z"
    }
  ]
}
```

---

## Analytics API

### Get Overview Analytics

```http
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "metrics": {
    "followers": {
      "total": 15000,
      "growth": 500,
      "growthRate": 3.45
    },
    "engagement": {
      "total": 5000,
      "rate": 4.2,
      "likes": 3000,
      "comments": 1500,
      "shares": 500
    },
    "reach": {
      "total": 100000,
      "unique": 75000
    },
    "impressions": 150000,
    "posts": 45
  },
  "platformBreakdown": {
    "instagram": { ... },
    "facebook": { ... },
    "twitter": { ... }
  }
}
```

### Get Post Performance

```http
GET /api/analytics/posts/{postId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "postId": "post_123",
  "metrics": {
    "likes": 150,
    "comments": 25,
    "shares": 10,
    "saves": 5,
    "reach": 5000,
    "impressions": 7500,
    "engagementRate": 3.8,
    "clickThroughRate": 2.1
  },
  "timeline": [
    {
      "timestamp": "2024-01-15T14:00:00Z",
      "likes": 10,
      "comments": 2
    }
  ],
  "demographics": {
    "age": { ... },
    "gender": { ... },
    "location": { ... }
  }
}
```

### Get Account Analytics

```http
GET /api/analytics/accounts/{accountId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

### Get Competitive Analysis

```http
GET /api/analytics/competitors?competitors=comp_123,comp_456
Authorization: Bearer {token}
```

### Generate Report

```http
POST /api/analytics/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Monthly Performance Report",
  "type": "custom",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": ["engagement", "reach", "followers"],
  "platforms": ["instagram", "facebook"],
  "format": "pdf"
}
```

---

## Social Accounts API

### List Connected Accounts

```http
GET /api/social-accounts
Authorization: Bearer {token}
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_123",
      "platform": "instagram",
      "username": "brandname",
      "displayName": "Brand Name",
      "avatar": "https://...",
      "isActive": true,
      "tokenExpiry": "2024-12-31T23:59:59Z",
      "metadata": {
        "followers": 10000,
        "accountType": "business"
      }
    }
  ]
}
```

### Connect Account

```http
POST /api/social-accounts/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "platform": "instagram",
  "authCode": "auth_code_from_oauth"
}
```

### Disconnect Account

```http
DELETE /api/social-accounts/{accountId}
Authorization: Bearer {token}
```

### Refresh Account Token

```http
POST /api/social-accounts/{accountId}/refresh
Authorization: Bearer {token}
```

---

## Inbox API

### List Conversations

```http
GET /api/inbox/conversations?status=open&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: open, pending, resolved, archived
- `platform`: Filter by platform
- `priority`: low, medium, high, urgent
- `sentiment`: positive, neutral, negative
- `assignedTo`: Filter by team member
- `limit`: Number of results

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "platform": "instagram",
      "type": "comment",
      "participantName": "John Doe",
      "lastMessage": "Great product!",
      "status": "open",
      "priority": "medium",
      "sentiment": "positive",
      "unreadCount": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Conversation

```http
GET /api/inbox/conversations/{conversationId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "conv_123",
  "messages": [
    {
      "id": "msg_456",
      "direction": "inbound",
      "content": "Great product!",
      "sentiment": 0.8,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "msg_457",
      "direction": "outbound",
      "content": "Thank you! We're glad you like it.",
      "authorId": "user_123",
      "createdAt": "2024-01-15T10:05:00Z"
    }
  ],
  "participant": {
    "id": "ext_789",
    "name": "John Doe",
    "avatar": "https://..."
  }
}
```

### Reply to Conversation

```http
POST /api/inbox/conversations/{conversationId}/reply
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Thank you for your feedback!",
  "media": ["media_123"]
}
```

### Assign Conversation

```http
PUT /api/inbox/conversations/{conversationId}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignedTo": "user_456"
}
```

### Update Conversation Status

```http
PUT /api/inbox/conversations/{conversationId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "resolved"
}
```

### List Reply Templates

```http
GET /api/inbox/templates
Authorization: Bearer {token}
```

### Create Reply Template

```http
POST /api/inbox/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Thank You Response",
  "content": "Thank you {{name}} for reaching out!",
  "category": "greetings"
}
```

---

## AI API

### Generate Content

```http
POST /api/ai/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "Create a post about our new product launch",
  "tone": "professional",
  "platforms": ["instagram", "linkedin"],
  "variations": 3,
  "brandVoice": true
}
```

**Response:**
```json
{
  "variations": [
    {
      "content": "Excited to announce our latest innovation...",
      "hashtags": ["innovation", "tech", "newproduct"],
      "score": 0.92
    },
    {
      "content": "Introducing our game-changing solution...",
      "hashtags": ["innovation", "business", "launch"],
      "score": 0.88
    }
  ],
  "cost": 0.05
}
```

### Optimize Content

```http
POST /api/ai/optimize
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Check out our new product",
  "platform": "instagram",
  "goal": "engagement"
}
```

### Generate Hashtags

```http
POST /api/ai/hashtags
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Launching our new eco-friendly product line",
  "platform": "instagram",
  "count": 30
}
```

**Response:**
```json
{
  "hashtags": [
    {
      "tag": "ecofriendly",
      "reach": "high",
      "competition": "high",
      "relevance": 0.95
    },
    {
      "tag": "sustainable",
      "reach": "high",
      "competition": "medium",
      "relevance": 0.92
    }
  ]
}
```

### Analyze Sentiment

```http
POST /api/ai/sentiment
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "I love this product! Best purchase ever."
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "score": 0.95,
  "confidence": 0.98
}
```

### Train Brand Voice

```http
POST /api/ai/brand-voice/train
Authorization: Bearer {token}
Content-Type: application/json

{
  "examples": [
    "Example post 1...",
    "Example post 2...",
    "Example post 3..."
  ]
}
```

---

## Campaigns API

### Create Campaign

```http
POST /api/campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "description": "Promotional campaign for summer products",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "budget": 5000,
  "goals": [
    {
      "metric": "reach",
      "target": 100000
    },
    {
      "metric": "conversions",
      "target": 500
    }
  ],
  "utmParams": {
    "source": "social",
    "medium": "organic",
    "campaign": "summer-sale-2024"
  }
}
```

### List Campaigns

```http
GET /api/campaigns?status=active
Authorization: Bearer {token}
```

### Get Campaign

```http
GET /api/campaigns/{campaignId}
Authorization: Bearer {token}
```

### Get Campaign Analytics

```http
GET /api/campaigns/{campaignId}/analytics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "campaignId": "campaign_123",
  "metrics": {
    "reach": {
      "current": 75000,
      "target": 100000,
      "progress": 75
    },
    "engagement": 5000,
    "conversions": {
      "current": 350,
      "target": 500,
      "progress": 70
    },
    "roi": 2.5
  },
  "topPosts": [ ... ]
}
```

---

## Listening API

### Create Listening Query

```http
POST /api/listening/queries
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Brand Mentions",
  "keywords": ["brandname", "@brandhandle"],
  "booleanQuery": "brandname OR @brandhandle",
  "languages": ["en", "es"],
  "platforms": ["twitter", "instagram", "facebook"],
  "sentimentFilter": "all"
}
```

### List Mentions

```http
GET /api/listening/mentions?queryId=query_123&sentiment=negative&limit=50
Authorization: Bearer {token}
```

**Response:**
```json
{
  "mentions": [
    {
      "id": "mention_123",
      "platform": "twitter",
      "author": {
        "username": "johndoe",
        "name": "John Doe",
        "followers": 5000
      },
      "content": "Not happy with the service...",
      "sentiment": "negative",
      "sentimentScore": -0.7,
      "reach": 5000,
      "engagement": 50,
      "url": "https://twitter.com/...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Sentiment Analysis

```http
GET /api/listening/sentiment?queryId=query_123&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

### Get Trending Topics

```http
GET /api/listening/trends?limit=20
Authorization: Bearer {token}
```

### Configure Alerts

```http
POST /api/listening/alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "queryId": "query_123",
  "type": "sentiment_drop",
  "threshold": -0.5,
  "channels": ["email", "sms", "slack"]
}
```

---

## Media API

### Upload Media

```http
POST /api/media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
folder: "product-images"
tags: ["product", "summer"]
```

**Response:**
```json
{
  "id": "media_123",
  "type": "image",
  "url": "https://cdn.platform.com/media/...",
  "thumbnailUrl": "https://cdn.platform.com/media/thumb/...",
  "filename": "product.jpg",
  "size": 1024000,
  "dimensions": {
    "width": 1920,
    "height": 1080
  }
}
```

### List Media

```http
GET /api/media?folder=product-images&limit=50
Authorization: Bearer {token}
```

### Get Media

```http
GET /api/media/{mediaId}
Authorization: Bearer {token}
```

### Delete Media

```http
DELETE /api/media/{mediaId}
Authorization: Bearer {token}
```

---

## Webhooks

### Available Events

- `post.published` - Post successfully published
- `post.failed` - Post failed to publish
- `message.received` - New message received
- `mention.detected` - Brand mention detected
- `crisis.detected` - Crisis alert triggered
- `approval.requested` - Approval workflow triggered
- `campaign.completed` - Campaign ended

### Configure Webhook

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["post.published", "message.received"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload Example

```json
{
  "event": "post.published",
  "timestamp": "2024-01-15T14:00:00Z",
  "data": {
    "postId": "post_123",
    "platforms": [
      {
        "platform": "instagram",
        "platformPostId": "ig_789",
        "status": "published"
      }
    ]
  }
}
```

### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "content.text",
      "reason": "Text is required"
    }
  }
}
```

### Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

- `INVALID_REQUEST` - Request validation failed
- `UNAUTHORIZED` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PLATFORM_ERROR` - Social platform API error
- `INSUFFICIENT_CREDITS` - AI credits exhausted

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @platform/sdk
```

```javascript
import { PlatformClient } from '@platform/sdk';

const client = new PlatformClient({
  apiKey: 'your_api_key'
});

// Create a post
const post = await client.posts.create({
  content: {
    text: 'Hello world!',
    hashtags: ['hello', 'world']
  },
  platforms: ['instagram', 'twitter']
});

// Get analytics
const analytics = await client.analytics.getOverview({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Python

```bash
pip install platform-sdk
```

```python
from platform_sdk import PlatformClient

client = PlatformClient(api_key='your_api_key')

# Create a post
post = client.posts.create(
    content={
        'text': 'Hello world!',
        'hashtags': ['hello', 'world']
    },
    platforms=['instagram', 'twitter']
)

# Get analytics
analytics = client.analytics.get_overview(
    start_date='2024-01-01',
    end_date='2024-01-31'
)
```

---

## Rate Limiting

Rate limits are enforced per API key:

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

**429 Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "retryAfter": 3600
  }
}
```

---

## Pagination

List endpoints support cursor-based pagination:

```http
GET /api/posts?limit=20&cursor=eyJpZCI6InBvc3RfMTIzIn0
```

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "eyJpZCI6InBvc3RfMTQzIn0",
    "hasMore": true
  }
}
```

---

*For support, contact api-support@platform.com*
