# AI Social Media Management Platform - API Documentation

Welcome to the AI Social Media Management Platform API documentation. This comprehensive guide will help you integrate our platform into your applications.

## 📚 Documentation Index

### Getting Started

- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete onboarding guide (30 minutes)
- **[User Guide](./USER_GUIDE.md)** - Comprehensive feature documentation
- **[Video Tutorials](./VIDEO_TUTORIALS.md)** - Step-by-step video guides
- **[Best Practices](./BEST_PRACTICES.md)** - Proven strategies and tips
- **[FAQ](./FAQ.md)** - Frequently asked questions

### Developer Resources

- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Technical implementation guide
- **[API Overview](./API_OVERVIEW.md)** - Introduction to the API, authentication, and basic concepts
- **[API Examples](./API_EXAMPLES.md)** - Practical code examples for common operations
- **[API Versioning](./API_VERSIONING.md)** - Version management and migration guides
- **[Interactive API Docs](http://localhost:3001/api/docs)** - Swagger/OpenAPI interactive documentation (when server is running)

### Core Features

- **[Webhooks](./WEBHOOKS.md)** - Real-time event notifications and webhook setup
- **[Knowledge Base](./KNOWLEDGE_BASE.md)** - Searchable help articles

### SDKs

- **[SDK Overview](../sdk/README.md)** - Official SDKs for JavaScript/TypeScript and Python
- **[JavaScript SDK](../sdk/javascript/README.md)** - Node.js and browser SDK
- **[Python SDK](../sdk/python/README.md)** - Python 3.8+ SDK

### API Specifications

- **[OpenAPI JSON](./openapi.json)** - Machine-readable API specification (generated)
- **[OpenAPI YAML](./openapi.yaml)** - Human-readable API specification (generated)

## 🚀 Quick Start

### 1. Get Your API Key

Sign up at [https://app.example.com](https://app.example.com) and generate an API key from Settings > API Keys.

### 2. Make Your First Request

```bash
curl -X GET https://api.example.com/api/v1/posts \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. Use an SDK

**JavaScript:**
```bash
npm install @ai-social/sdk
```

```javascript
import AISocialSDK from '@ai-social/sdk';

const client = new AISocialSDK({ apiKey: 'YOUR_API_KEY' });
const posts = await client.listPosts();
```

**Python:**
```bash
pip install ai-social-sdk
```

```python
from ai_social import AISocialClient

client = AISocialClient(api_key='YOUR_API_KEY')
posts = client.list_posts()
```

## 📖 Key Concepts

### Authentication

All API requests require authentication using either:
- **API Keys** - For server-to-server integrations
- **JWT Tokens** - For user-specific operations

```bash
# API Key
curl -H "X-API-Key: YOUR_API_KEY" https://api.example.com/api/v1/posts

# JWT Token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.example.com/api/v1/posts
```

### Rate Limiting

API requests are rate-limited based on your subscription plan:

| Plan | Rate Limit |
|------|------------|
| Free | 100 req/hour |
| Starter | 1,000 req/hour |
| Professional | 10,000 req/hour |
| Enterprise | Unlimited |

### Pagination

List endpoints use cursor-based pagination:

```bash
GET /api/v1/posts?limit=20&cursor=eyJpZCI6InBvc3RfMTIzIn0
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6InBvc3RfMTQ0In0"
  }
}
```

### Error Handling

Errors return appropriate HTTP status codes with detailed messages:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [...]
  }
}
```

## 🎯 Common Use Cases

### Content Publishing

Schedule posts across multiple social platforms:

```javascript
const post = await client.createPost({
  content: 'Check out our new product! 🚀',
  platforms: ['instagram', 'twitter', 'linkedin'],
  scheduledAt: '2024-01-15T10:00:00Z'
});
```

### AI Content Generation

Generate optimized content with AI:

```javascript
const generated = await client.generateContent({
  prompt: 'Create a post about sustainable fashion',
  tone: 'professional',
  platforms: ['instagram'],
  variations: 3
});
```

### Social Listening

Monitor brand mentions in real-time:

```javascript
const query = await client.createListeningQuery({
  name: 'Brand Mentions',
  keywords: ['@yourbrand'],
  platforms: ['twitter', 'instagram']
});

const mentions = await client.getMentions(query.id);
```

### Analytics

Get comprehensive performance metrics:

```javascript
const analytics = await client.getAnalyticsOverview({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Inbox Management

Manage all social interactions in one place:

```javascript
const messages = await client.getInboxMessages({ status: 'open' });

await client.replyToMessage(
  messages.data[0].id,
  'Thank you for reaching out!'
);
```

## 🔔 Webhooks

Receive real-time notifications for events:

```javascript
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['post.published', 'mention.created', 'message.received']
});
```

See [Webhooks Documentation](./WEBHOOKS.md) for details.

## 📊 API Endpoints

### Content Publishing
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts` - List posts
- `GET /api/v1/posts/:id` - Get post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `POST /api/v1/posts/:id/publish` - Publish post
- `POST /api/v1/posts/bulk` - Bulk operations

### AI
- `POST /api/v1/ai/generate` - Generate content
- `POST /api/v1/ai/optimize` - Optimize content
- `POST /api/v1/ai/hashtags` - Generate hashtags
- `POST /api/v1/ai/strategy` - Get strategy recommendations

### Analytics
- `GET /api/v1/analytics/overview` - Dashboard overview
- `GET /api/v1/analytics/posts/:id` - Post performance
- `GET /api/v1/analytics/audience` - Audience demographics
- `POST /api/v1/analytics/reports` - Generate report

### Social Listening
- `POST /api/v1/listening/queries` - Create query
- `GET /api/v1/listening/mentions` - Get mentions
- `GET /api/v1/listening/sentiment` - Sentiment analysis
- `GET /api/v1/listening/trends` - Trending topics

### Inbox
- `GET /api/v1/inbox/messages` - List messages
- `POST /api/v1/inbox/messages/:id/reply` - Reply to message
- `PUT /api/v1/inbox/messages/:id/assign` - Assign message
- `POST /api/v1/inbox/templates` - Create template

### Webhooks
- `POST /api/v1/webhooks` - Create webhook
- `GET /api/v1/webhooks` - List webhooks
- `POST /api/v1/webhooks/:id/test` - Test webhook
- `DELETE /api/v1/webhooks/:id` - Delete webhook

See [Interactive API Docs](http://localhost:3001/api/docs) for complete endpoint list.

## 🛠️ Development Tools

### Interactive API Explorer

When the server is running, access the interactive Swagger UI:

```
http://localhost:3001/api/docs
```

Features:
- Try API endpoints directly from browser
- View request/response schemas
- Test authentication
- Generate code snippets

### OpenAPI Specification

Download the OpenAPI specification for use with tools like Postman:

- **JSON**: `http://localhost:3001/api/docs-json`
- **YAML**: Available in `docs/openapi.yaml`

### Postman Collection

Import the OpenAPI spec into Postman:
1. Open Postman
2. Click Import
3. Select "Link" tab
4. Enter: `http://localhost:3001/api/docs-json`

## 📝 Best Practices

### 1. Always Specify API Version

```javascript
// ✅ Good
const response = await fetch('https://api.example.com/api/v1/posts');

// ❌ Bad
const response = await fetch('https://api.example.com/api/posts');
```

### 2. Handle Rate Limits

```javascript
try {
  await client.createPost(post);
} catch (error) {
  if (error.statusCode === 429) {
    // Wait and retry
    await sleep(error.retryAfter * 1000);
    await client.createPost(post);
  }
}
```

### 3. Use Webhooks Instead of Polling

```javascript
// ✅ Good - Use webhooks
await client.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['post.published']
});

// ❌ Bad - Polling
setInterval(async () => {
  const posts = await client.listPosts();
  // Check for new posts
}, 5000);
```

### 4. Implement Proper Error Handling

```javascript
try {
  const post = await client.createPost(postData);
} catch (error) {
  if (error.statusCode === 400) {
    // Validation error - fix data
  } else if (error.statusCode === 401) {
    // Authentication error - refresh token
  } else if (error.statusCode === 429) {
    // Rate limit - wait and retry
  } else {
    // Other errors - log and alert
  }
}
```

### 5. Cache Responses When Appropriate

```javascript
// Cache analytics data for 5 minutes
const cacheKey = `analytics:${startDate}:${endDate}`;
let analytics = cache.get(cacheKey);

if (!analytics) {
  analytics = await client.getAnalyticsOverview({ startDate, endDate });
  cache.set(cacheKey, analytics, 300); // 5 minutes
}
```

## 🔒 Security

### API Key Security

- Never expose API keys in client-side code
- Use environment variables for API keys
- Rotate API keys regularly
- Use different keys for development and production

### Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement replay attack protection
- Monitor webhook delivery failures

## 📞 Support

### Documentation
- API Docs: https://docs.example.com
- SDK Docs: https://docs.example.com/sdk
- Tutorials: https://docs.example.com/tutorials

### Community
- Forum: https://community.example.com
- Discord: https://discord.gg/example
- Stack Overflow: Tag `ai-social-platform`

### Direct Support
- Email: api-support@example.com
- Status Page: https://status.example.com
- GitHub Issues: https://github.com/example/api-issues

## 📄 License

The API and SDKs are provided under the MIT License.

## 🗺️ Roadmap

### Coming Soon
- GraphQL API support
- WebSocket real-time updates
- Advanced batch operations
- Enhanced AI capabilities
- Additional platform integrations

### In Development
- Go SDK
- Ruby SDK
- PHP SDK
- Mobile SDKs (iOS, Android)

## 📚 Additional Resources

- [Blog](https://blog.example.com) - Tutorials and best practices
- [Changelog](https://changelog.example.com) - API updates and changes
- [Status Page](https://status.example.com) - API uptime and incidents
- [GitHub](https://github.com/example) - Open source tools and examples

---

**Last Updated**: January 2024  
**API Version**: v1.0.0  
**Documentation Version**: 1.0.0
