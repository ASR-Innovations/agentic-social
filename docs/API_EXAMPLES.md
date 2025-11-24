# API Usage Examples

This document provides practical examples for common API operations.

## Table of Contents

- [Authentication](#authentication)
- [Content Publishing](#content-publishing)
- [AI Content Generation](#ai-content-generation)
- [Analytics](#analytics)
- [Social Listening](#social-listening)
- [Inbox Management](#inbox-management)
- [Webhooks](#webhooks)

## Authentication

### Login and Get Token

```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Refresh Token

```bash
curl -X POST https://api.example.com/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Content Publishing

### Create and Schedule a Post

```bash
curl -X POST https://api.example.com/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excited to announce our new product launch! 🚀 #innovation #tech",
    "platforms": ["instagram", "twitter", "linkedin"],
    "scheduledAt": "2024-01-15T10:00:00Z",
    "media": [
      {
        "url": "https://example.com/image.jpg",
        "type": "image"
      }
    ],
    "platformCustomizations": {
      "instagram": {
        "firstComment": "#startup #technology #business"
      },
      "twitter": {
        "content": "Excited to announce our new product launch! 🚀\n\nLearn more: https://example.com\n\n#innovation #tech"
      }
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "post_abc123",
    "content": "Excited to announce our new product launch! 🚀 #innovation #tech",
    "status": "scheduled",
    "scheduledAt": "2024-01-15T10:00:00Z",
    "platforms": [
      {
        "platform": "instagram",
        "status": "pending",
        "accountId": "acc_ig_123"
      },
      {
        "platform": "twitter",
        "status": "pending",
        "accountId": "acc_tw_456"
      },
      {
        "platform": "linkedin",
        "status": "pending",
        "accountId": "acc_li_789"
      }
    ],
    "createdAt": "2024-01-10T12:00:00Z"
  }
}
```

### Publish Immediately

```bash
curl -X POST https://api.example.com/api/v1/posts/post_abc123/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Post Status

```bash
curl -X GET https://api.example.com/api/v1/posts/post_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List All Posts

```bash
curl -X GET "https://api.example.com/api/v1/posts?status=published&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Scheduled Post

```bash
curl -X PUT https://api.example.com/api/v1/posts/post_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content with new information!",
    "scheduledAt": "2024-01-15T14:00:00Z"
  }'
```

### Delete Post

```bash
curl -X DELETE https://api.example.com/api/v1/posts/post_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bulk Schedule Posts

```bash
curl -X POST https://api.example.com/api/v1/posts/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      {
        "content": "Post 1 content",
        "platforms": ["instagram"],
        "scheduledAt": "2024-01-15T10:00:00Z"
      },
      {
        "content": "Post 2 content",
        "platforms": ["twitter"],
        "scheduledAt": "2024-01-15T14:00:00Z"
      }
    ]
  }'
```

## AI Content Generation

### Generate Content with AI

```bash
curl -X POST https://api.example.com/api/v1/ai/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a post about our new eco-friendly product line",
    "tone": "professional",
    "platforms": ["instagram", "linkedin"],
    "variations": 3,
    "includeHashtags": true,
    "brandVoiceId": "brand_voice_123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "variations": [
      {
        "content": "Introducing our new eco-friendly product line! 🌱 Sustainable, stylish, and designed with the planet in mind. #sustainability #ecofriendly #greenproducts",
        "platform": "instagram",
        "hashtags": ["sustainability", "ecofriendly", "greenproducts"],
        "score": 0.92
      },
      {
        "content": "We're excited to launch our eco-friendly product collection. Each item is crafted with sustainable materials and ethical practices. Join us in making a difference. #sustainability #ecofriendly",
        "platform": "linkedin",
        "hashtags": ["sustainability", "ecofriendly"],
        "score": 0.89
      }
    ],
    "metadata": {
      "model": "gpt-4o",
      "tokensUsed": 245,
      "cost": 0.0012
    }
  }
}
```

### Optimize Existing Content

```bash
curl -X POST https://api.example.com/api/v1/ai/optimize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out our new product",
    "platform": "instagram",
    "optimizationGoals": ["engagement", "reach"]
  }'
```

### Generate Hashtags

```bash
curl -X POST https://api.example.com/api/v1/ai/hashtags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Launching our new sustainable fashion line",
    "platform": "instagram",
    "count": 30
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "hashtags": [
      {
        "tag": "sustainablefashion",
        "category": "high-reach",
        "reach": 5000000,
        "competition": "high"
      },
      {
        "tag": "ecofashion",
        "category": "medium-reach",
        "reach": 500000,
        "competition": "medium"
      },
      {
        "tag": "ethicalfashion",
        "category": "niche",
        "reach": 50000,
        "competition": "low"
      }
    ]
  }
}
```

### Get AI Strategy Recommendations

```bash
curl -X POST https://api.example.com/api/v1/ai/strategy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goals": ["increase_engagement", "grow_followers"],
    "platforms": ["instagram", "twitter"],
    "timeframe": "30_days"
  }'
```

## Analytics

### Get Dashboard Overview

```bash
curl -X GET "https://api.example.com/api/v1/analytics/overview?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPosts": 45,
      "totalEngagement": 12500,
      "totalReach": 150000,
      "followerGrowth": 1250,
      "engagementRate": 4.2
    },
    "platformBreakdown": {
      "instagram": {
        "posts": 20,
        "engagement": 6000,
        "reach": 80000
      },
      "twitter": {
        "posts": 15,
        "engagement": 4000,
        "reach": 45000
      },
      "linkedin": {
        "posts": 10,
        "engagement": 2500,
        "reach": 25000
      }
    },
    "topPosts": [
      {
        "id": "post_123",
        "content": "Amazing product launch!",
        "engagement": 1500,
        "reach": 25000,
        "platform": "instagram"
      }
    ]
  }
}
```

### Get Post Performance

```bash
curl -X GET https://api.example.com/api/v1/analytics/posts/post_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Audience Demographics

```bash
curl -X GET https://api.example.com/api/v1/analytics/audience \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Custom Report

```bash
curl -X POST https://api.example.com/api/v1/analytics/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Performance Report",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "metrics": ["engagement", "reach", "follower_growth"],
    "platforms": ["instagram", "twitter"],
    "format": "pdf"
  }'
```

## Social Listening

### Create Listening Query

```bash
curl -X POST https://api.example.com/api/v1/listening/queries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brand Mentions",
    "keywords": ["@yourbrand", "your brand name"],
    "platforms": ["twitter", "instagram", "reddit"],
    "languages": ["en", "es"],
    "sentiment": ["positive", "neutral", "negative"]
  }'
```

### Get Mentions

```bash
curl -X GET "https://api.example.com/api/v1/listening/mentions?queryId=query_123&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "mention_abc",
      "content": "Just tried @yourbrand's new product and it's amazing!",
      "author": {
        "username": "happy_customer",
        "followers": 5000
      },
      "platform": "twitter",
      "sentiment": "positive",
      "sentimentScore": 0.85,
      "reach": 5000,
      "engagement": 150,
      "createdAt": "2024-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "cursor_xyz"
  }
}
```

### Get Sentiment Analysis

```bash
curl -X GET "https://api.example.com/api/v1/listening/sentiment?queryId=query_123&startDate=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Trending Topics

```bash
curl -X GET https://api.example.com/api/v1/listening/trends \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Inbox Management

### Get Inbox Messages

```bash
curl -X GET "https://api.example.com/api/v1/inbox/messages?status=open&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reply to Message

```bash
curl -X POST https://api.example.com/api/v1/inbox/messages/msg_123/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Thank you for reaching out! We'll get back to you shortly.",
    "useTemplate": false
  }'
```

### Assign Message to Team Member

```bash
curl -X PUT https://api.example.com/api/v1/inbox/messages/msg_123/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_456"
  }'
```

### Create Reply Template

```bash
curl -X POST https://api.example.com/api/v1/inbox/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Message",
    "content": "Hi {{name}}, thank you for contacting us! How can we help you today?",
    "category": "greeting"
  }'
```

## Webhooks

### Create Webhook

```bash
curl -X POST https://api.example.com/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/social-media",
    "events": ["post.published", "mention.created", "message.received"],
    "secret": "your_webhook_secret"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "webhook_123",
    "url": "https://your-app.com/webhooks/social-media",
    "events": ["post.published", "mention.created", "message.received"],
    "status": "active",
    "createdAt": "2024-01-10T12:00:00Z"
  }
}
```

### List Webhooks

```bash
curl -X GET https://api.example.com/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Webhook

```bash
curl -X POST https://api.example.com/api/v1/webhooks/webhook_123/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Webhook

```bash
curl -X DELETE https://api.example.com/api/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "platforms",
        "message": "At least one platform is required",
        "value": []
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-10T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid request parameters
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Best Practices

1. **Always handle rate limits**: Implement exponential backoff when receiving 429 responses
2. **Use webhooks for real-time updates**: More efficient than polling
3. **Cache responses**: Reduce API calls by caching non-critical data
4. **Batch operations**: Use bulk endpoints when possible
5. **Validate before sending**: Check data locally before making API calls
6. **Monitor API usage**: Track your usage to avoid hitting limits
7. **Keep tokens secure**: Never expose tokens in client-side code
8. **Use appropriate timeouts**: Set reasonable timeout values for API calls
