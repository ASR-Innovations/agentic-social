# AI Social Media Platform - JavaScript/TypeScript SDK

Official JavaScript/TypeScript SDK for the AI Social Media Management Platform API.

## Installation

```bash
npm install @ai-social/sdk
```

or with yarn:

```bash
yarn add @ai-social/sdk
```

## Quick Start

```typescript
import AISocialSDK from '@ai-social/sdk';

// Initialize with API key
const client = new AISocialSDK({
  apiKey: 'your_api_key_here',
  baseURL: 'https://api.example.com', // optional
});

// Or initialize with access token
const client = new AISocialSDK({
  accessToken: 'your_access_token_here',
});
```

## Authentication

### Login with Email and Password

```typescript
const authData = await client.login('user@example.com', 'password');
console.log('Access Token:', authData.accessToken);
console.log('User:', authData.user);
```

### Refresh Token

```typescript
const newAuthData = await client.refreshToken('your_refresh_token');
```

## Content Publishing

### Create and Schedule a Post

```typescript
const post = await client.createPost({
  content: 'Excited to announce our new product launch! 🚀 #innovation',
  platforms: ['instagram', 'twitter', 'linkedin'],
  scheduledAt: '2024-01-15T10:00:00Z',
  media: [
    {
      url: 'https://example.com/image.jpg',
      type: 'image',
    },
  ],
  platformCustomizations: {
    instagram: {
      firstComment: '#startup #technology #business',
    },
  },
});

console.log('Post created:', post.id);
```

### Publish Immediately

```typescript
const publishedPost = await client.publishPost('post_abc123');
console.log('Post published:', publishedPost);
```

### List Posts

```typescript
const { data, pagination } = await client.listPosts({
  status: 'published',
  platform: 'instagram',
  limit: 20,
});

console.log('Posts:', data);
console.log('Has more:', pagination.hasMore);
```

### Update Post

```typescript
const updatedPost = await client.updatePost('post_abc123', {
  content: 'Updated content!',
  scheduledAt: '2024-01-15T14:00:00Z',
});
```

### Delete Post

```typescript
await client.deletePost('post_abc123');
```

### Bulk Create Posts

```typescript
const results = await client.bulkCreatePosts([
  {
    content: 'Post 1',
    platforms: ['instagram'],
    scheduledAt: '2024-01-15T10:00:00Z',
  },
  {
    content: 'Post 2',
    platforms: ['twitter'],
    scheduledAt: '2024-01-15T14:00:00Z',
  },
]);
```

## AI Content Generation

### Generate Content

```typescript
const generated = await client.generateContent({
  prompt: 'Create a post about our new eco-friendly product line',
  tone: 'professional',
  platforms: ['instagram', 'linkedin'],
  variations: 3,
  includeHashtags: true,
  brandVoiceId: 'brand_voice_123',
});

console.log('Generated variations:', generated.variations);
```

### Optimize Content

```typescript
const optimized = await client.optimizeContent(
  'Check out our new product',
  'instagram',
  ['engagement', 'reach']
);

console.log('Optimized content:', optimized);
```

### Generate Hashtags

```typescript
const hashtags = await client.generateHashtags(
  'Launching our new sustainable fashion line',
  'instagram',
  30
);

console.log('Suggested hashtags:', hashtags.hashtags);
```

### Get Strategy Recommendations

```typescript
const strategy = await client.getStrategyRecommendations(
  ['increase_engagement', 'grow_followers'],
  ['instagram', 'twitter'],
  '30_days'
);

console.log('Strategy recommendations:', strategy);
```

## Analytics

### Get Dashboard Overview

```typescript
const analytics = await client.getAnalyticsOverview({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  platforms: ['instagram', 'twitter'],
});

console.log('Summary:', analytics.summary);
console.log('Platform breakdown:', analytics.platformBreakdown);
```

### Get Post Analytics

```typescript
const postAnalytics = await client.getPostAnalytics('post_abc123');
console.log('Post performance:', postAnalytics);
```

### Get Audience Analytics

```typescript
const audience = await client.getAudienceAnalytics();
console.log('Audience demographics:', audience);
```

### Generate Report

```typescript
const report = await client.generateReport({
  name: 'Monthly Performance Report',
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31',
  },
  metrics: ['engagement', 'reach', 'follower_growth'],
  platforms: ['instagram', 'twitter'],
  format: 'pdf',
});

console.log('Report generated:', report);
```

## Social Listening

### Create Listening Query

```typescript
const query = await client.createListeningQuery({
  name: 'Brand Mentions',
  keywords: ['@yourbrand', 'your brand name'],
  platforms: ['twitter', 'instagram', 'reddit'],
  languages: ['en', 'es'],
  sentiment: ['positive', 'neutral', 'negative'],
});

console.log('Query created:', query.id);
```

### Get Mentions

```typescript
const { data: mentions, pagination } = await client.getMentions('query_123', {
  limit: 50,
});

console.log('Mentions:', mentions);
```

### Get Sentiment Analysis

```typescript
const sentiment = await client.getSentimentAnalysis('query_123', '2024-01-01');
console.log('Sentiment data:', sentiment);
```

### Get Trending Topics

```typescript
const trends = await client.getTrendingTopics();
console.log('Trending topics:', trends);
```

## Inbox Management

### Get Inbox Messages

```typescript
const { data: messages, pagination } = await client.getInboxMessages({
  status: 'open',
  platform: 'instagram',
  limit: 20,
});

console.log('Messages:', messages);
```

### Reply to Message

```typescript
const reply = await client.replyToMessage(
  'msg_123',
  'Thank you for reaching out! We'll get back to you shortly.',
  false
);

console.log('Reply sent:', reply);
```

### Assign Message

```typescript
await client.assignMessage('msg_123', 'user_456');
```

### Create Reply Template

```typescript
const template = await client.createReplyTemplate(
  'Welcome Message',
  'Hi {{name}}, thank you for contacting us!',
  'greeting'
);

console.log('Template created:', template.id);
```

## Webhooks

### Create Webhook

```typescript
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhooks/social-media',
  events: ['post.published', 'mention.created', 'message.received'],
  secret: 'your_webhook_secret',
});

console.log('Webhook created:', webhook.id);
```

### List Webhooks

```typescript
const webhooks = await client.listWebhooks();
console.log('Webhooks:', webhooks);
```

### Test Webhook

```typescript
await client.testWebhook('webhook_123');
```

### Delete Webhook

```typescript
await client.deleteWebhook('webhook_123');
```

## Social Accounts

### List Social Accounts

```typescript
const accounts = await client.listSocialAccounts();
console.log('Connected accounts:', accounts);
```

### Connect Social Account

```typescript
const account = await client.connectSocialAccount('instagram', 'auth_code_here');
console.log('Account connected:', account);
```

### Disconnect Social Account

```typescript
await client.disconnectSocialAccount('account_123');
```

## Error Handling

```typescript
import AISocialSDK, { AISocialError } from '@ai-social/sdk';

try {
  const post = await client.createPost({
    content: 'Test post',
    platforms: ['instagram'],
  });
} catch (error) {
  if (error instanceof AISocialError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import AISocialSDK, { Post, AIGenerateRequest, AnalyticsQuery } from '@ai-social/sdk';

const client = new AISocialSDK({ apiKey: 'your_api_key' });

// Full type safety
const post: Post = {
  content: 'Hello world',
  platforms: ['instagram'],
};

const request: AIGenerateRequest = {
  prompt: 'Generate content',
  tone: 'professional',
  variations: 3,
};
```

## Configuration Options

```typescript
const client = new AISocialSDK({
  // Required: Either apiKey or accessToken
  apiKey: 'your_api_key',
  // OR
  accessToken: 'your_access_token',

  // Optional
  baseURL: 'https://api.example.com', // Default: https://api.example.com
  timeout: 30000, // Default: 30000ms (30 seconds)
});
```

## Rate Limiting

The SDK automatically handles rate limiting. When a rate limit is exceeded, it will throw an `AISocialError` with status code 429.

## Support

- Documentation: https://docs.example.com
- GitHub Issues: https://github.com/example/ai-social-sdk-js/issues
- Email: sdk-support@example.com

## License

MIT
