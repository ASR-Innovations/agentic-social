# API Reference Documentation

## Overview

This document provides a complete reference for all API endpoints exposed by the Agentic Social backend. All endpoints are prefixed with `/api/v1`.

**Base URL**: `https://api.yourdomain.com/api/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Social Accounts](#social-accounts)
3. [Posts](#posts)
4. [AI & Content Generation](#ai--content-generation)
5. [Analytics](#analytics)
6. [Media](#media)
7. [Tenants](#tenants)
8. [Users](#users)
9. [Error Responses](#error-responses)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### Register

Create a new tenant and admin user.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "Acme Corporation",
  "planTier": "free"
}
```

**Field Descriptions**:
- `email` (required): Valid email address
- `password` (required): Minimum 8 characters
- `firstName` (optional): User's first name
- `lastName` (optional): User's last name
- `tenantName` (required): Company/organization name
- `planTier` (optional): `free`, `starter`, `professional`, `enterprise` (default: `free`)

**Success Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "tenantId": "uuid",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation",
    "planTier": "free",
    "isActive": true
  }
}
```

### Login

Authenticate existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "tenantId": "uuid"
  },
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation",
    "planTier": "free"
  }
}
```

**Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Get Profile

Get current user's profile.

**Endpoint**: `GET /auth/profile`

**Authentication**: Required

**Success Response** (200):
```json
{
  "id": "uuid",
  "email": "admin@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "tenantId": "uuid",
  "isActive": true,
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation",
    "planTier": "professional"
  }
}
```

---

## Social Accounts

Manage connected social media accounts.

### Get Authorization URL

Get OAuth authorization URL for connecting a social account.

**Endpoint**: `GET /social-accounts/auth-url/:platform`

**Authentication**: Required

**Path Parameters**:
- `platform`: One of `instagram`, `twitter`, `linkedin`, `facebook`, `tiktok`, `youtube`, `pinterest`, `threads`, `reddit`

**Success Response** (200):
```json
{
  "url": "https://twitter.com/i/oauth2/authorize?client_id=...",
  "state": "random_state_string"
}
```

**Usage**:
1. Redirect user to the returned URL
2. User authorizes on the platform
3. Platform redirects back with `code` and `state`
4. Use the Connect Account endpoint with the code

### Connect Account

Connect a social media account after OAuth authorization.

**Endpoint**: `POST /social-accounts/connect`

**Authentication**: Required

**Request Body**:
```json
{
  "platform": "twitter",
  "code": "authorization_code_from_oauth",
  "redirectUri": "https://yourapp.com/auth/twitter/callback",
  "metadata": {
    "custom": "data"
  }
}
```

**Success Response** (201):
```json
{
  "id": "uuid",
  "platform": "twitter",
  "accountId": "platform_user_id",
  "displayName": "John Doe",
  "isActive": true,
  "metadata": {
    "username": "@johndoe",
    "verified": true,
    "followersCount": 1500
  },
  "connectedAt": "2024-01-15T10:30:00Z"
}
```

### List Connected Accounts

Get all connected social accounts for the tenant.

**Endpoint**: `GET /social-accounts`

**Authentication**: Required

**Query Parameters**:
- `platform` (optional): Filter by platform
- `isActive` (optional): Filter by active status (true/false)

**Success Response** (200):
```json
{
  "accounts": [
    {
      "id": "uuid",
      "platform": "twitter",
      "accountId": "platform_user_id",
      "displayName": "John Doe",
      "isActive": true,
      "metadata": {
        "username": "@johndoe",
        "followersCount": 1500
      },
      "connectedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "platform": "linkedin",
      "accountId": "platform_user_id",
      "displayName": "John Doe",
      "isActive": true,
      "connectedAt": "2024-01-14T09:00:00Z"
    }
  ],
  "total": 2
}
```

### Get Single Account

Get details of a specific connected account.

**Endpoint**: `GET /social-accounts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Social account UUID

**Success Response** (200):
```json
{
  "id": "uuid",
  "platform": "instagram",
  "accountId": "platform_user_id",
  "displayName": "John Doe",
  "isActive": true,
  "metadata": {
    "username": "johndoe",
    "accountType": "BUSINESS",
    "mediaCount": 150
  },
  "connectedAt": "2024-01-15T10:30:00Z",
  "lastUsedAt": "2024-01-20T15:45:00Z"
}
```

### Disconnect Account

Disconnect and remove a social account.

**Endpoint**: `DELETE /social-accounts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Social account UUID

**Success Response** (200):
```json
{
  "message": "Account disconnected successfully",
  "accountId": "uuid"
}
```

### Refresh Account Token

Manually refresh an account's access token.

**Endpoint**: `POST /social-accounts/:id/refresh`

**Authentication**: Required

**Path Parameters**:
- `id`: Social account UUID

**Success Response** (200):
```json
{
  "message": "Token refreshed successfully",
  "expiresAt": "2024-02-15T10:30:00Z"
}
```

---

## Posts

Manage social media posts across multiple platforms.

### Create Post

Create a new post (draft or scheduled).

**Endpoint**: `POST /posts`

**Authentication**: Required

**Request Body**:
```json
{
  "title": "My First Post",
  "content": "This is the post content that will be published.",
  "type": "text",
  "socialAccountIds": ["account-uuid-1", "account-uuid-2"],
  "scheduledAt": "2024-01-20T15:00:00Z",
  "metadata": {
    "tags": ["marketing", "announcement"],
    "campaign": "Q1 Launch"
  },
  "platformSpecific": {
    "twitter": {
      "text": "Custom tweet text"
    },
    "instagram": {
      "caption": "Custom Instagram caption",
      "mediaUrl": "https://cdn.example.com/image.jpg"
    }
  }
}
```

**Field Descriptions**:
- `title` (required): Post title for internal reference
- `content` (required): Main post content
- `type` (optional): `text`, `image`, `video`, `link` (default: `text`)
- `socialAccountIds` (required): Array of connected account UUIDs to post to
- `scheduledAt` (optional): ISO 8601 timestamp for scheduled posting
- `metadata` (optional): Custom metadata for organization
- `platformSpecific` (optional): Platform-specific overrides

**Success Response** (201):
```json
{
  "id": "uuid",
  "title": "My First Post",
  "content": "This is the post content...",
  "type": "text",
  "status": "scheduled",
  "scheduledAt": "2024-01-20T15:00:00Z",
  "platforms": [
    {
      "socialAccountId": "account-uuid-1",
      "platform": "twitter",
      "status": "pending"
    },
    {
      "socialAccountId": "account-uuid-2",
      "platform": "linkedin",
      "status": "pending"
    }
  ],
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### List Posts

Get all posts for the tenant with filtering and pagination.

**Endpoint**: `GET /posts`

**Authentication**: Required

**Query Parameters**:
- `status` (optional): `draft`, `scheduled`, `published`, `failed`, `cancelled`
- `platform` (optional): Filter by platform
- `startDate` (optional): Filter posts after this date (ISO 8601)
- `endDate` (optional): Filter posts before this date (ISO 8601)
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): `createdAt`, `scheduledAt`, `publishedAt` (default: `createdAt`)
- `sortOrder` (optional): `asc`, `desc` (default: `desc`)

**Example**: `GET /posts?status=published&limit=10&offset=0`

**Success Response** (200):
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "My First Post",
      "content": "This is the post content...",
      "type": "text",
      "status": "published",
      "scheduledAt": "2024-01-20T15:00:00Z",
      "publishedAt": "2024-01-20T15:00:05Z",
      "platforms": [
        {
          "platform": "twitter",
          "status": "published",
          "platformPostId": "tweet-id-123",
          "url": "https://twitter.com/user/status/123"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

### Get Single Post

Get details of a specific post.

**Endpoint**: `GET /posts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (200):
```json
{
  "id": "uuid",
  "title": "My First Post",
  "content": "This is the post content that will be published.",
  "type": "text",
  "status": "published",
  "scheduledAt": "2024-01-20T15:00:00Z",
  "publishedAt": "2024-01-20T15:00:05Z",
  "platforms": [
    {
      "id": "platform-uuid",
      "socialAccountId": "account-uuid",
      "platform": "twitter",
      "status": "published",
      "platformPostId": "tweet-id-123",
      "url": "https://twitter.com/user/status/123",
      "publishedAt": "2024-01-20T15:00:05Z",
      "metrics": {
        "likes": 45,
        "comments": 12,
        "shares": 8,
        "impressions": 1250
      }
    }
  ],
  "metadata": {
    "tags": ["marketing"],
    "campaign": "Q1 Launch"
  },
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:00:05Z"
}
```

### Update Post

Update a post (only drafts and scheduled posts can be updated).

**Endpoint**: `PATCH /posts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "scheduledAt": "2024-01-21T15:00:00Z",
  "socialAccountIds": ["account-uuid-1", "account-uuid-3"],
  "metadata": {
    "tags": ["updated-tag"]
  }
}
```

**Success Response** (200):
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content",
  "status": "scheduled",
  "scheduledAt": "2024-01-21T15:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### Delete Post

Delete a post. Published posts will be deleted from platforms.

**Endpoint**: `DELETE /posts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (200):
```json
{
  "message": "Post deleted successfully",
  "postId": "uuid",
  "deletedFromPlatforms": ["twitter", "linkedin"]
}
```

### Publish Post Now

Immediately publish a draft or scheduled post.

**Endpoint**: `POST /posts/:id/publish`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (200):
```json
{
  "id": "uuid",
  "status": "publishing",
  "message": "Post is being published to connected platforms",
  "platforms": [
    {
      "platform": "twitter",
      "status": "publishing"
    }
  ]
}
```

### Duplicate Post

Create a copy of an existing post as a draft.

**Endpoint**: `POST /posts/:id/duplicate`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (201):
```json
{
  "id": "new-uuid",
  "title": "My First Post (Copy)",
  "content": "This is the post content...",
  "status": "draft",
  "originalPostId": "original-uuid",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

### Cancel Scheduled Post

Cancel a scheduled post before it publishes.

**Endpoint**: `POST /posts/:id/cancel`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (200):
```json
{
  "id": "uuid",
  "status": "cancelled",
  "message": "Post cancelled successfully"
}
```

### Get Post Calendar

Get posts organized by date for calendar view.

**Endpoint**: `GET /posts/calendar`

**Authentication**: Required

**Query Parameters**:
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date

**Example**: `GET /posts/calendar?startDate=2024-01-01&endDate=2024-01-31`

**Success Response** (200):
```json
{
  "posts": [
    {
      "date": "2024-01-20",
      "posts": [
        {
          "id": "uuid",
          "title": "Morning Post",
          "scheduledAt": "2024-01-20T09:00:00Z",
          "status": "scheduled"
        },
        {
          "id": "uuid",
          "title": "Evening Post",
          "scheduledAt": "2024-01-20T18:00:00Z",
          "status": "scheduled"
        }
      ]
    },
    {
      "date": "2024-01-21",
      "posts": [...]
    }
  ]
}
```

---

## AI & Content Generation

AI-powered content generation using GPT-4, Claude, and DALL-E.

### Generate Caption

Generate AI-powered captions for social media posts.

**Endpoint**: `POST /ai/generate/caption`

**Authentication**: Required

**Request Body**:
```json
{
  "topic": "New product launch",
  "platform": "instagram",
  "tone": "professional",
  "length": "medium",
  "hashtags": true,
  "emojis": true,
  "keywords": ["innovation", "technology"],
  "targetAudience": "business professionals",
  "count": 3
}
```

**Field Descriptions**:
- `topic` (required): Topic or description
- `platform` (optional): Target platform for optimization
- `tone` (optional): `professional`, `casual`, `funny`, `inspirational`
- `length` (optional): `short`, `medium`, `long`
- `hashtags` (optional): Include hashtags (default: false)
- `emojis` (optional): Include emojis (default: false)
- `keywords` (optional): Keywords to include
- `targetAudience` (optional): Target audience description
- `count` (optional): Number of variations (1-5, default: 1)

**Success Response** (200):
```json
{
  "captions": [
    "🚀 Excited to announce our latest innovation! Discover how our cutting-edge technology transforms the way business professionals work. #Innovation #Technology #BusinessGrowth",
    "Revolutionary technology meets professional excellence. Our new product is here to empower your business journey. Learn more today! #Innovation #Technology",
    "Innovation that matters. Technology that delivers. Introducing our newest solution for forward-thinking professionals. #Innovation #Technology"
  ],
  "metadata": {
    "model": "gpt-4",
    "tokensUsed": 250,
    "cost": 0.005
  },
  "requestId": "uuid"
}
```

### Generate Content

Generate long-form content for posts.

**Endpoint**: `POST /ai/generate/content`

**Authentication**: Required

**Request Body**:
```json
{
  "topic": "Benefits of AI in marketing",
  "platform": "linkedin",
  "tone": "professional",
  "length": "long",
  "format": "article",
  "outline": [
    "Introduction",
    "AI applications in marketing",
    "Real-world examples",
    "Conclusion"
  ]
}
```

**Success Response** (200):
```json
{
  "content": "# The Transformative Power of AI in Modern Marketing\n\n## Introduction\n\nArtificial Intelligence is revolutionizing...",
  "wordCount": 850,
  "readingTime": "4 min",
  "metadata": {
    "model": "claude-3-5-sonnet",
    "tokensUsed": 1200,
    "cost": 0.018
  },
  "requestId": "uuid"
}
```

### Generate Image

Generate AI images using DALL-E 3.

**Endpoint**: `POST /ai/generate/image`

**Authentication**: Required

**Request Body**:
```json
{
  "prompt": "A futuristic office space with diverse professionals collaborating",
  "style": "photorealistic",
  "size": "1024x1024",
  "quality": "hd",
  "count": 2
}
```

**Field Descriptions**:
- `prompt` (required): Image description
- `style` (optional): `photorealistic`, `artistic`, `minimalist`
- `size` (optional): `1024x1024`, `1024x1792`, `1792x1024`
- `quality` (optional): `standard`, `hd`
- `count` (optional): Number of images (1-4)

**Success Response** (200):
```json
{
  "images": [
    {
      "url": "https://cdn.openai.com/generated/image1.png",
      "revisedPrompt": "A modern, futuristic office space featuring diverse professionals..."
    },
    {
      "url": "https://cdn.openai.com/generated/image2.png",
      "revisedPrompt": "A contemporary workspace with a diverse team..."
    }
  ],
  "metadata": {
    "model": "dall-e-3",
    "cost": 0.08
  },
  "requestId": "uuid"
}
```

### Generate Hashtags

Generate relevant hashtags for content.

**Endpoint**: `POST /ai/generate/hashtags`

**Authentication**: Required

**Request Body**:
```json
{
  "content": "Launching our new eco-friendly product line",
  "platform": "instagram",
  "count": 10,
  "trending": true
}
```

**Success Response** (200):
```json
{
  "hashtags": [
    "#EcoFriendly",
    "#Sustainability",
    "#GreenLiving",
    "#EcoConscious",
    "#SustainableProducts",
    "#GoGreen",
    "#EcoWarrior",
    "#ZeroWaste",
    "#GreenTech",
    "#ClimateAction"
  ],
  "metadata": {
    "model": "gpt-4",
    "cost": 0.002
  },
  "requestId": "uuid"
}
```

### Improve Content

Get AI suggestions to improve existing content.

**Endpoint**: `POST /ai/improve`

**Authentication**: Required

**Request Body**:
```json
{
  "content": "Check out our new product. Its really good.",
  "platform": "linkedin",
  "improvementType": "grammar_and_engagement"
}
```

**Success Response** (200):
```json
{
  "improvedContent": "Discover our latest innovation! We're thrilled to introduce a product that's transforming the industry with its cutting-edge features and exceptional performance.",
  "suggestions": [
    "Consider adding specific product benefits",
    "Include a call-to-action",
    "Add relevant hashtags for better reach"
  ],
  "changes": [
    {
      "type": "grammar",
      "original": "Its",
      "improved": "it's"
    },
    {
      "type": "engagement",
      "suggestion": "More compelling opening"
    }
  ],
  "metadata": {
    "model": "gpt-4",
    "cost": 0.003
  }
}
```

### Get AI Usage Statistics

Get AI usage and costs for the tenant.

**Endpoint**: `GET /ai/usage`

**Authentication**: Required

**Query Parameters**:
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Success Response** (200):
```json
{
  "currentBudget": 100.00,
  "usedBudget": 23.45,
  "remainingBudget": 76.55,
  "requests": {
    "total": 156,
    "byType": {
      "caption": 89,
      "content": 34,
      "image": 21,
      "hashtags": 12
    }
  },
  "costs": {
    "total": 23.45,
    "byModel": {
      "gpt-4": 15.30,
      "claude-3-5-sonnet": 6.50,
      "dall-e-3": 1.65
    }
  },
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

## Analytics

Track and analyze social media performance.

### Get Post Analytics

Get analytics for a specific post across all platforms.

**Endpoint**: `GET /analytics/posts/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Post UUID

**Success Response** (200):
```json
{
  "postId": "uuid",
  "title": "My First Post",
  "publishedAt": "2024-01-20T15:00:00Z",
  "overall": {
    "impressions": 5420,
    "engagements": 387,
    "engagementRate": 7.14,
    "clicks": 89,
    "shares": 45,
    "comments": 23,
    "likes": 230
  },
  "byPlatform": [
    {
      "platform": "twitter",
      "impressions": 3200,
      "engagements": 245,
      "engagementRate": 7.66,
      "likes": 180,
      "retweets": 32,
      "replies": 15,
      "clicks": 54
    },
    {
      "platform": "linkedin",
      "impressions": 2220,
      "engagements": 142,
      "engagementRate": 6.40,
      "likes": 50,
      "comments": 8,
      "shares": 13,
      "clicks": 35
    }
  ],
  "timeline": [
    {
      "timestamp": "2024-01-20T15:00:00Z",
      "impressions": 150,
      "engagements": 12
    },
    {
      "timestamp": "2024-01-20T16:00:00Z",
      "impressions": 420,
      "engagements": 35
    }
  ]
}
```

### Get Tenant Analytics

Get overall analytics for the tenant.

**Endpoint**: `GET /analytics/tenant`

**Authentication**: Required

**Query Parameters**:
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date
- `groupBy` (optional): `day`, `week`, `month` (default: `day`)

**Example**: `GET /analytics/tenant?startDate=2024-01-01&endDate=2024-01-31&groupBy=day`

**Success Response** (200):
```json
{
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "summary": {
    "totalPosts": 45,
    "totalImpressions": 125000,
    "totalEngagements": 8750,
    "averageEngagementRate": 7.0,
    "totalClicks": 3200,
    "totalShares": 890,
    "totalComments": 450,
    "totalLikes": 5400
  },
  "byPlatform": [
    {
      "platform": "twitter",
      "posts": 20,
      "impressions": 65000,
      "engagements": 4800,
      "engagementRate": 7.38
    },
    {
      "platform": "linkedin",
      "posts": 15,
      "impressions": 38000,
      "engagements": 2600,
      "engagementRate": 6.84
    },
    {
      "platform": "instagram",
      "posts": 10,
      "impressions": 22000,
      "engagements": 1350,
      "engagementRate": 6.14
    }
  ],
  "timeline": [
    {
      "date": "2024-01-01",
      "posts": 2,
      "impressions": 4500,
      "engagements": 320,
      "engagementRate": 7.11
    },
    {
      "date": "2024-01-02",
      "posts": 1,
      "impressions": 3200,
      "engagements": 245,
      "engagementRate": 7.66
    }
  ],
  "topPosts": [
    {
      "id": "uuid",
      "title": "Best Performing Post",
      "engagementRate": 12.5,
      "impressions": 8900,
      "engagements": 1112
    }
  ]
}
```

### Get Platform Analytics

Get analytics for a specific platform.

**Endpoint**: `GET /analytics/platforms/:platform`

**Authentication**: Required

**Path Parameters**:
- `platform`: Platform name (e.g., `twitter`, `instagram`)

**Query Parameters**:
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date

**Success Response** (200):
```json
{
  "platform": "twitter",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "summary": {
    "posts": 20,
    "impressions": 65000,
    "engagements": 4800,
    "engagementRate": 7.38,
    "likes": 3200,
    "retweets": 890,
    "replies": 450,
    "clicks": 1800
  },
  "accounts": [
    {
      "accountId": "uuid",
      "displayName": "@johndoe",
      "posts": 12,
      "impressions": 42000,
      "engagements": 3100
    },
    {
      "accountId": "uuid",
      "displayName": "@company",
      "posts": 8,
      "impressions": 23000,
      "engagements": 1700
    }
  ]
}
```

### Record Analytics Event

Manually record an analytics event (usually called by webhooks or scheduled jobs).

**Endpoint**: `POST /analytics/events`

**Authentication**: Required

**Request Body**:
```json
{
  "postId": "uuid",
  "platform": "twitter",
  "eventType": "impression",
  "metrics": {
    "likes": 45,
    "retweets": 12,
    "replies": 3,
    "impressions": 1250
  },
  "timestamp": "2024-01-20T16:00:00Z"
}
```

**Success Response** (201):
```json
{
  "id": "uuid",
  "message": "Analytics event recorded successfully"
}
```

---

## Media

Upload and manage media files for posts.

### Upload Media

Upload a media file (image or video).

**Endpoint**: `POST /media/upload`

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Media file (required)
- `type`: `image` or `video` (optional, auto-detected)
- `metadata`: JSON string with additional data (optional)

**Example** (using curl):
```bash
curl -X POST https://api.yourdomain.com/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image" \
  -F "metadata={\"caption\":\"My image\"}"
```

**Success Response** (201):
```json
{
  "id": "uuid",
  "url": "https://cdn.yourdomain.com/media/uuid.jpg",
  "thumbnailUrl": "https://cdn.yourdomain.com/media/uuid_thumb.jpg",
  "type": "image",
  "mimeType": "image/jpeg",
  "size": 1024567,
  "dimensions": {
    "width": 1920,
    "height": 1080
  },
  "metadata": {
    "caption": "My image"
  },
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

### List Media

Get all media files for the tenant.

**Endpoint**: `GET /media`

**Authentication**: Required

**Query Parameters**:
- `type` (optional): Filter by type (`image`, `video`)
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Success Response** (200):
```json
{
  "media": [
    {
      "id": "uuid",
      "url": "https://cdn.yourdomain.com/media/uuid.jpg",
      "thumbnailUrl": "https://cdn.yourdomain.com/media/uuid_thumb.jpg",
      "type": "image",
      "size": 1024567,
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

### Get Media Details

Get details of a specific media file.

**Endpoint**: `GET /media/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Media UUID

**Success Response** (200):
```json
{
  "id": "uuid",
  "url": "https://cdn.yourdomain.com/media/uuid.jpg",
  "thumbnailUrl": "https://cdn.yourdomain.com/media/uuid_thumb.jpg",
  "type": "image",
  "mimeType": "image/jpeg",
  "size": 1024567,
  "dimensions": {
    "width": 1920,
    "height": 1080
  },
  "metadata": {
    "caption": "My image",
    "tags": ["marketing", "product"]
  },
  "usedInPosts": [
    {
      "postId": "uuid",
      "title": "Product Launch"
    }
  ],
  "uploadedBy": "user-uuid",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

### Delete Media

Delete a media file.

**Endpoint**: `DELETE /media/:id`

**Authentication**: Required

**Path Parameters**:
- `id`: Media UUID

**Success Response** (200):
```json
{
  "message": "Media deleted successfully",
  "mediaId": "uuid"
}
```

---

## Tenants

Manage tenant (organization) settings.

### Get Tenant

Get current tenant information.

**Endpoint**: `GET /tenants/current`

**Authentication**: Required

**Success Response** (200):
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "planTier": "professional",
  "isActive": true,
  "settings": {
    "timezone": "America/New_York",
    "defaultPublishTime": "09:00",
    "brandColors": ["#FF5733", "#3357FF"]
  },
  "limits": {
    "posts": 1000,
    "socialAccounts": 20,
    "users": 10,
    "aiRequestsPerMonth": 500
  },
  "usage": {
    "posts": 456,
    "socialAccounts": 8,
    "users": 5,
    "aiRequestsThisMonth": 123
  },
  "aiBudget": {
    "limit": 100.00,
    "current": 23.45,
    "resetDate": "2024-02-01"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Update Tenant

Update tenant settings.

**Endpoint**: `PATCH /tenants/current`

**Authentication**: Required (Admin only)

**Request Body** (all fields optional):
```json
{
  "name": "New Company Name",
  "settings": {
    "timezone": "Europe/London",
    "defaultPublishTime": "10:00",
    "brandColors": ["#FF5733", "#3357FF", "#33FF57"]
  }
}
```

**Success Response** (200):
```json
{
  "id": "uuid",
  "name": "New Company Name",
  "settings": {
    "timezone": "Europe/London",
    "defaultPublishTime": "10:00",
    "brandColors": ["#FF5733", "#3357FF", "#33FF57"]
  },
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### Get Tenant Users

Get all users in the tenant.

**Endpoint**: `GET /tenants/users`

**Authentication**: Required (Admin or Manager)

**Success Response** (200):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "email": "editor@company.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "editor",
      "isActive": true,
      "lastLoginAt": "2024-01-15T09:00:00Z",
      "createdAt": "2024-01-05T00:00:00Z"
    }
  ],
  "total": 5
}
```

---

## Users

Manage users within the tenant.

### Invite User

Invite a new user to the tenant.

**Endpoint**: `POST /users/invite`

**Authentication**: Required (Admin or Manager)

**Request Body**:
```json
{
  "email": "newuser@company.com",
  "role": "editor",
  "firstName": "New",
  "lastName": "User"
}
```

**Field Descriptions**:
- `email` (required): User email
- `role` (required): `admin`, `manager`, `editor`, `viewer`
- `firstName` (optional): User's first name
- `lastName` (optional): User's last name

**Success Response** (201):
```json
{
  "id": "uuid",
  "email": "newuser@company.com",
  "role": "editor",
  "inviteToken": "random_token",
  "inviteExpiry": "2024-01-22T10:30:00Z",
  "message": "Invitation sent successfully"
}
```

### Accept Invitation

Accept a user invitation and set password.

**Endpoint**: `POST /users/accept-invite`

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "invitation_token",
  "password": "SecurePass123!",
  "firstName": "New",
  "lastName": "User"
}
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "newuser@company.com",
    "role": "editor",
    "tenantId": "uuid"
  }
}
```

### Update User

Update user information.

**Endpoint**: `PATCH /users/:id`

**Authentication**: Required (Admin or self)

**Path Parameters**:
- `id`: User UUID

**Request Body** (all fields optional):
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "manager",
  "isActive": false
}
```

**Success Response** (200):
```json
{
  "id": "uuid",
  "email": "user@company.com",
  "firstName": "Updated",
  "lastName": "Name",
  "role": "manager",
  "isActive": false,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### Delete User

Remove a user from the tenant.

**Endpoint**: `DELETE /users/:id`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: User UUID

**Success Response** (200):
```json
{
  "message": "User deleted successfully",
  "userId": "uuid"
}
```

---

## Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Error Scenarios

#### Authentication Error (401)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be an email"
    },
    {
      "field": "password",
      "message": "password must be longer than or equal to 8 characters"
    }
  ]
}
```

#### Not Found Error (404)
```json
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

#### Permission Error (403)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to perform this action",
  "error": "Forbidden"
}
```

#### Rate Limit Error (429)
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

#### Platform Error (400)
```json
{
  "statusCode": 400,
  "message": "Failed to publish to platform",
  "error": "Bad Request",
  "details": {
    "platform": "twitter",
    "platformError": "Tweet text exceeds 280 characters"
  }
}
```

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default**: 100 requests per minute per user
- **Authenticated endpoints**: 100 requests per minute
- **AI endpoints**: 50 requests per hour
- **Media upload**: 20 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320600
```

When rate limit is exceeded, you'll receive a 429 error with a `Retry-After` header indicating when you can retry.

---

## Pagination

List endpoints support pagination with these query parameters:

- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip (default: 0)

Response format:
```json
{
  "items": [...],
  "total": 156,
  "limit": 20,
  "offset": 40,
  "hasMore": true
}
```

---

## Webhooks (Future Feature)

Webhooks will allow you to receive real-time notifications about events:

- Post published successfully
- Post failed to publish
- Analytics updated
- Social account disconnected
- Budget limit reached

Configure webhooks in your tenant settings to receive POST requests at your specified URL.

---

## SDK & Client Libraries

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- PHP
- Ruby

For now, you can use any HTTP client to interact with the API.

---

## Support

For API support:
- Documentation: https://docs.yourdomain.com
- Email: api-support@yourdomain.com
- Status Page: https://status.yourdomain.com

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Support for 9 social media platforms
- AI content generation
- Analytics tracking
- Multi-tenant architecture
- Role-based access control
