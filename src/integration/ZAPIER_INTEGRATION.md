# Zapier Integration Documentation

Complete guide for integrating the AI Social Media Management Platform with Zapier, enabling 5000+ app connections.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Triggers](#triggers)
4. [Actions](#actions)
5. [Data Mapping](#data-mapping)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Examples](#examples)

## Overview

The Zapier integration allows users to connect the AI Social Media Platform with thousands of other apps, creating powerful automation workflows. Users can:

- **Trigger Zaps** when events occur in the platform (e.g., post published, mention received)
- **Perform Actions** in the platform from other apps (e.g., create posts, schedule content)
- **Build Complex Workflows** combining multiple apps and services

### Key Features

- ✅ REST Hook-based triggers for real-time updates
- ✅ API key authentication
- ✅ 7 pre-built triggers
- ✅ 2 pre-built actions
- ✅ Comprehensive data mapping
- ✅ Error handling and retry logic
- ✅ Sample data for testing

## Authentication

### Authentication Type

The integration uses **API Key Authentication** with the key passed in the `X-API-Key` header.

### Setting Up Authentication

1. **Generate API Key** in the platform:
   ```http
   POST /api/integrations/api-keys
   Authorization: Bearer <jwt_token>
   Content-Type: application/json

   {
     "name": "Zapier Integration",
     "scopes": ["posts:read", "posts:write", "mentions:read", "messages:read"],
     "rateLimitPerHour": 1000,
     "rateLimitPerDay": 10000
   }
   ```

2. **Test Authentication** endpoint:
   ```http
   POST /api/zapier/auth/test
   X-API-Key: <your_api_key>
   ```

   Response:
   ```json
   {
     "success": true,
     "workspace": {
       "id": "workspace_123",
       "name": "My Workspace",
       "slug": "my-workspace"
     }
   }
   ```

### Zapier Platform Configuration

```javascript
// authentication.js
module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText: 'Get your API key from Settings > Integrations > API Keys'
    }
  ],
  test: {
    url: 'https://api.yourdomain.com/api/zapier/auth/test',
    method: 'POST',
    headers: {
      'X-API-Key': '{{bundle.authData.apiKey}}'
    }
  },
  connectionLabel: '{{workspace.name}}'
};
```

## Triggers

Triggers send data to Zapier when specific events occur in the platform.

### Available Triggers

#### 1. Post Published

**Trigger Key:** `post_published`

Fires when a post is successfully published to social media.

**Sample Data:**
```json
{
  "id": "post_123",
  "content": "Check out our new product launch! 🚀",
  "platforms": ["INSTAGRAM", "FACEBOOK"],
  "publishedAt": "2024-01-13T12:00:00Z",
  "author": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "campaign": {
    "id": "campaign_123",
    "name": "Product Launch 2024"
  },
  "analytics": {
    "likes": 150,
    "comments": 25,
    "shares": 10
  }
}
```

**Use Cases:**
- Send Slack notification when post is published
- Log published posts to Google Sheets
- Create task in project management tool for engagement monitoring

#### 2. Post Scheduled

**Trigger Key:** `post_scheduled`

Fires when a post is scheduled for future publishing.

**Sample Data:**
```json
{
  "id": "post_456",
  "content": "Coming soon: Our biggest sale of the year! 🎉",
  "platforms": ["INSTAGRAM", "FACEBOOK", "TWITTER"],
  "scheduledAt": "2024-01-14T12:00:00Z",
  "author": {
    "id": "user_123",
    "name": "Marketing Team"
  }
}
```

#### 3. Mention Received

**Trigger Key:** `mention_received`

Fires when your brand is mentioned on social media.

**Sample Data:**
```json
{
  "id": "mention_123",
  "platform": "TWITTER",
  "author": {
    "username": "customer123",
    "name": "Happy Customer",
    "followers": 1500
  },
  "content": "Love this product! @yourbrand",
  "sentiment": "POSITIVE",
  "sentimentScore": 0.85,
  "url": "https://twitter.com/customer123/status/123",
  "publishedAt": "2024-01-13T12:00:00Z"
}
```

**Use Cases:**
- Send email alert for negative mentions
- Add positive mentions to CRM
- Create support ticket for questions

#### 4. Message Received

**Trigger Key:** `message_received`

Fires when a new message or comment is received.

**Sample Data:**
```json
{
  "id": "message_123",
  "platform": "INSTAGRAM",
  "type": "DM",
  "from": {
    "username": "customer456",
    "name": "Potential Customer"
  },
  "content": "Hi, I have a question about your product...",
  "sentiment": "NEUTRAL",
  "priority": "MEDIUM",
  "receivedAt": "2024-01-13T12:00:00Z"
}
```

#### 5. Alert Triggered

**Trigger Key:** `alert_triggered`

Fires when a listening alert is activated.

**Sample Data:**
```json
{
  "id": "alert_123",
  "type": "SENTIMENT_SHIFT",
  "severity": "HIGH",
  "title": "Negative sentiment spike detected",
  "description": "Sentiment has dropped by 30% in the last hour",
  "mentionCount": 45,
  "sentimentShift": -0.3,
  "triggeredAt": "2024-01-13T12:00:00Z"
}
```

#### 6. Campaign Started

**Trigger Key:** `campaign_started`

Fires when a campaign is activated.

#### 7. Campaign Completed

**Trigger Key:** `campaign_completed`

Fires when a campaign ends.

### Implementing Triggers

#### Subscribe to Trigger

```http
POST /api/zapier/triggers/:triggerKey/subscribe
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "targetUrl": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
  "subscriptionId": "sub_abc123"
}
```

#### Unsubscribe from Trigger

```http
DELETE /api/zapier/triggers/:triggerKey/unsubscribe?subscriptionId=sub_abc123
Authorization: Bearer <jwt_token>
```

#### Get Sample Data

```http
GET /api/zapier/triggers/:triggerKey/sample
Authorization: Bearer <jwt_token>
```

### Zapier Platform Configuration

```javascript
// triggers/post_published.js
module.exports = {
  key: 'post_published',
  noun: 'Post',
  display: {
    label: 'Post Published',
    description: 'Triggers when a post is successfully published to social media.',
    important: true
  },
  operation: {
    type: 'hook',
    
    // Subscribe
    performSubscribe: {
      url: 'https://api.yourdomain.com/api/zapier/triggers/post_published/subscribe',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer {{bundle.authData.apiKey}}'
      },
      body: {
        targetUrl: '{{bundle.targetUrl}}',
        subscriptionId: '{{bundle.subscriptionData.id}}'
      }
    },
    
    // Unsubscribe
    performUnsubscribe: {
      url: 'https://api.yourdomain.com/api/zapier/triggers/post_published/unsubscribe',
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer {{bundle.authData.apiKey}}'
      },
      params: {
        subscriptionId: '{{bundle.subscribeData.id}}'
      }
    },
    
    // Sample data
    perform: {
      url: 'https://api.yourdomain.com/api/zapier/triggers/post_published/sample',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {{bundle.authData.apiKey}}'
      }
    },
    
    // Output fields
    outputFields: [
      { key: 'id', label: 'Post ID', type: 'string' },
      { key: 'content', label: 'Content', type: 'text' },
      { key: 'platforms', label: 'Platforms', type: 'string', list: true },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'author__id', label: 'Author ID', type: 'string' },
      { key: 'author__name', label: 'Author Name', type: 'string' },
      { key: 'author__email', label: 'Author Email', type: 'string' }
    ]
  }
};
```

## Actions

Actions allow Zapier to perform operations in the platform.

### Available Actions

#### 1. Create Post

**Action Key:** `create_post`

Creates and optionally publishes a social media post.

**Input Fields:**
- `content` (required): Post content/text
- `platforms` (required): Array of platforms (INSTAGRAM, FACEBOOK, TWITTER, etc.)
- `hashtags` (optional): Array of hashtags without # symbol
- `mentions` (optional): Array of mentions without @ symbol
- `link` (optional): URL to include
- `firstComment` (optional): First comment for Instagram
- `mediaUrls` (optional): Array of media URLs
- `tags` (optional): Array of tags for categorization
- `publishNow` (optional): Whether to publish immediately (default: false)
- `scheduledAt` (optional): ISO 8601 datetime for scheduling
- `accountIds` (optional): Map of platform to account ID

**Example Request:**
```http
POST /api/zapier/actions/create-post
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "content": "Check out our new product! 🚀",
  "platforms": ["INSTAGRAM", "FACEBOOK"],
  "hashtags": ["newproduct", "innovation", "tech"],
  "link": "https://example.com/product",
  "publishNow": false,
  "scheduledAt": "2024-01-14T12:00:00Z"
}
```

**Response:**
```json
{
  "id": "post_789",
  "status": "SCHEDULED",
  "scheduledAt": "2024-01-14T12:00:00Z",
  "createdAt": "2024-01-13T12:00:00Z"
}
```

#### 2. Schedule Post

**Action Key:** `schedule_post`

Schedules a post for future publishing (same as Create Post but requires `scheduledAt`).

### Implementing Actions

#### Zapier Platform Configuration

```javascript
// actions/create_post.js
module.exports = {
  key: 'create_post',
  noun: 'Post',
  display: {
    label: 'Create Post',
    description: 'Creates and optionally publishes a social media post.',
    important: true
  },
  operation: {
    inputFields: [
      {
        key: 'content',
        label: 'Content',
        type: 'text',
        required: true,
        helpText: 'The text content of your post'
      },
      {
        key: 'platforms',
        label: 'Platforms',
        type: 'string',
        list: true,
        required: true,
        choices: ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'TIKTOK'],
        helpText: 'Select which platforms to post to'
      },
      {
        key: 'hashtags',
        label: 'Hashtags',
        type: 'string',
        list: true,
        helpText: 'Hashtags without the # symbol'
      },
      {
        key: 'link',
        label: 'Link',
        type: 'string',
        helpText: 'URL to include in the post'
      },
      {
        key: 'publishNow',
        label: 'Publish Immediately',
        type: 'boolean',
        default: 'false',
        helpText: 'Publish now or save as draft'
      },
      {
        key: 'scheduledAt',
        label: 'Schedule For',
        type: 'datetime',
        helpText: 'When to publish the post (leave empty for draft)'
      }
    ],
    perform: {
      url: 'https://api.yourdomain.com/api/zapier/actions/create-post',
      method: 'POST',
      headers: {
        'X-API-Key': '{{bundle.authData.apiKey}}',
        'Content-Type': 'application/json'
      },
      body: {
        content: '{{bundle.inputData.content}}',
        platforms: '{{bundle.inputData.platforms}}',
        hashtags: '{{bundle.inputData.hashtags}}',
        link: '{{bundle.inputData.link}}',
        publishNow: '{{bundle.inputData.publishNow}}',
        scheduledAt: '{{bundle.inputData.scheduledAt}}'
      }
    },
    outputFields: [
      { key: 'id', label: 'Post ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' }
    ]
  }
};
```

## Data Mapping

### Internal Events to Zapier Triggers

The platform automatically maps internal events to Zapier-friendly data structures:

```typescript
// Example: POST_PUBLISHED event
{
  // Internal event data
  id: 'post_123',
  content: { text: 'Hello', hashtags: ['test'] },
  platformPosts: [{ platform: 'INSTAGRAM' }],
  author: { id: 'user_123', name: 'John' }
}

// Mapped to Zapier trigger data
{
  id: 'post_123',
  content: 'Hello',
  platforms: ['INSTAGRAM'],
  publishedAt: '2024-01-13T12:00:00Z',
  author: {
    id: 'user_123',
    name: 'John',
    email: 'john@example.com'
  }
}
```

### Zapier Actions to Internal Format

```typescript
// Zapier action input
{
  content: 'Hello World',
  platforms: ['INSTAGRAM', 'FACEBOOK'],
  hashtags: ['test', 'demo']
}

// Mapped to internal post format
{
  workspaceId: 'workspace_123',
  authorId: 'zapier',
  content: {
    text: 'Hello World',
    hashtags: ['test', 'demo'],
    media: []
  },
  platforms: [
    { platform: 'INSTAGRAM', accountId: null },
    { platform: 'FACEBOOK', accountId: null }
  ],
  status: 'DRAFT'
}
```

## Testing

### Local Testing

1. **Start the development server:**
   ```bash
   npm run start:dev
   ```

2. **Use ngrok to expose your local server:**
   ```bash
   ngrok http 3000
   ```

3. **Test authentication:**
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/zapier/auth/test \
     -H "X-API-Key: your_api_key"
   ```

4. **Test trigger subscription:**
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/zapier/triggers/post_published/subscribe \
     -H "Authorization: Bearer your_jwt_token" \
     -H "Content-Type: application/json" \
     -d '{
       "targetUrl": "https://hooks.zapier.com/hooks/catch/123/abc/",
       "subscriptionId": "test_sub_123"
     }'
   ```

5. **Test action:**
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/zapier/actions/create-post \
     -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "content": "Test post from Zapier",
       "platforms": ["INSTAGRAM"]
     }'
   ```

### Zapier Platform Testing

1. **Install Zapier CLI:**
   ```bash
   npm install -g zapier-platform-cli
   ```

2. **Initialize Zapier app:**
   ```bash
   zapier init ai-social-media-platform
   cd ai-social-media-platform
   ```

3. **Test locally:**
   ```bash
   zapier test
   ```

4. **Push to Zapier:**
   ```bash
   zapier push
   ```

## Deployment

### Production Checklist

- [ ] API keys are properly secured
- [ ] Rate limiting is configured
- [ ] Webhook signatures are verified
- [ ] Error handling is comprehensive
- [ ] Logging is enabled for debugging
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Documentation is complete

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your-32-char-encryption-key

# Optional
ZAPIER_CLIENT_ID=your_zapier_client_id
ZAPIER_CLIENT_SECRET=your_zapier_client_secret
```

## Examples

### Example 1: Post to Social Media from Google Sheets

**Trigger:** New row in Google Sheets
**Action:** Create Post

**Setup:**
1. Connect Google Sheets as trigger
2. Map columns to post fields:
   - Column A → Content
   - Column B → Platforms (comma-separated)
   - Column C → Scheduled Date
3. Connect AI Social Media Platform
4. Map fields to Create Post action

### Example 2: Alert Team on Negative Mentions

**Trigger:** Mention Received
**Filter:** Sentiment is "NEGATIVE"
**Action:** Send Slack Message

**Setup:**
1. Connect AI Social Media Platform trigger: Mention Received
2. Add filter: Sentiment equals "NEGATIVE"
3. Connect Slack action: Send Channel Message
4. Map mention data to Slack message

### Example 3: Log Published Posts to Airtable

**Trigger:** Post Published
**Action:** Create Airtable Record

**Setup:**
1. Connect AI Social Media Platform trigger: Post Published
2. Connect Airtable action: Create Record
3. Map post fields to Airtable columns

## Support

For issues or questions:
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com/zapier
- Zapier Support: https://zapier.com/app/support

## Changelog

### Version 1.0.0 (2024-01-13)
- Initial release
- 7 triggers implemented
- 2 actions implemented
- API key authentication
- Comprehensive documentation
