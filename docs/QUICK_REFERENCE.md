# API Quick Reference

Quick reference guide for the AI Social Media Management Platform API.

## Base URL

```
https://api.example.com/api/v1
```

## Authentication

```bash
# API Key
curl -H "X-API-Key: YOUR_API_KEY" https://api.example.com/api/v1/posts

# JWT Token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.example.com/api/v1/posts
```

## Common Endpoints

### Posts

```bash
# List posts
GET /api/v1/posts

# Create post
POST /api/v1/posts
{
  "content": "Hello world",
  "platforms": ["instagram", "twitter"]
}

# Get post
GET /api/v1/posts/:id

# Update post
PUT /api/v1/posts/:id

# Delete post
DELETE /api/v1/posts/:id

# Publish post
POST /api/v1/posts/:id/publish
```

### AI

```bash
# Generate content
POST /api/v1/ai/generate
{
  "prompt": "Create a post about...",
  "tone": "professional",
  "platforms": ["instagram"]
}

# Optimize content
POST /api/v1/ai/optimize
{
  "content": "...",
  "platform": "instagram"
}

# Generate hashtags
POST /api/v1/ai/hashtags
{
  "content": "...",
  "platform": "instagram",
  "count": 30
}
```

### Analytics

```bash
# Get overview
GET /api/v1/analytics/overview?startDate=2024-01-01&endDate=2024-01-31

# Get post analytics
GET /api/v1/analytics/posts/:id

# Get audience analytics
GET /api/v1/analytics/audience

# Generate report
POST /api/v1/analytics/reports
{
  "name": "Monthly Report",
  "dateRange": { "start": "2024-01-01", "end": "2024-01-31" },
  "format": "pdf"
}
```

### Social Listening

```bash
# Create query
POST /api/v1/listening/queries
{
  "name": "Brand Mentions",
  "keywords": ["@yourbrand"],
  "platforms": ["twitter", "instagram"]
}

# Get mentions
GET /api/v1/listening/mentions?queryId=query_123

# Get sentiment
GET /api/v1/listening/sentiment?queryId=query_123

# Get trends
GET /api/v1/listening/trends
```

### Inbox

```bash
# List messages
GET /api/v1/inbox/messages?status=open

# Reply to message
POST /api/v1/inbox/messages/:id/reply
{
  "content": "Thank you for reaching out!"
}

# Assign message
PUT /api/v1/inbox/messages/:id/assign
{
  "userId": "user_123"
}
```

### Webhooks

```bash
# Create webhook
POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhooks",
  "events": ["post.published", "mention.created"]
}

# List webhooks
GET /api/v1/webhooks

# Test webhook
POST /api/v1/webhooks/:id/test

# Delete webhook
DELETE /api/v1/webhooks/:id
```

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-10T12:00:00Z"
  }
}
```

### Error

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

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limits

| Plan | Limit |
|------|-------|
| Free | 100/hour |
| Starter | 1,000/hour |
| Professional | 10,000/hour |
| Enterprise | Unlimited |

## Pagination

```bash
GET /api/v1/posts?limit=20&cursor=eyJpZCI6InBvc3RfMTIzIn0
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6InBvc3RfMTQ0In0"
  }
}
```

## SDKs

### JavaScript

```bash
npm install @ai-social/sdk
```

```javascript
import AISocialSDK from '@ai-social/sdk';

const client = new AISocialSDK({ apiKey: 'YOUR_KEY' });
const posts = await client.listPosts();
```

### Python

```bash
pip install ai-social-sdk
```

```python
from ai_social import AISocialClient

client = AISocialClient(api_key='YOUR_KEY')
posts = client.list_posts()
```

## Resources

- **Interactive Docs**: http://localhost:3001/api/docs
- **Full Documentation**: [docs/README.md](./README.md)
- **Examples**: [docs/API_EXAMPLES.md](./API_EXAMPLES.md)
- **Webhooks**: [docs/WEBHOOKS.md](./WEBHOOKS.md)
- **Versioning**: [docs/API_VERSIONING.md](./API_VERSIONING.md)

## Support

- **Email**: api-support@example.com
- **Status**: https://status.example.com
- **Community**: https://community.example.com
