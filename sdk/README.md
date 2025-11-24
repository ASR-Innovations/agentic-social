# AI Social Media Platform SDKs

Official SDKs for the AI Social Media Management Platform API.

## Available SDKs

### JavaScript/TypeScript SDK

Full-featured SDK for Node.js and browser environments with TypeScript support.

- **Package**: `@ai-social/sdk`
- **Documentation**: [JavaScript SDK Docs](./javascript/README.md)
- **Installation**: `npm install @ai-social/sdk`
- **Repository**: https://github.com/example/ai-social-sdk-js

### Python SDK

Comprehensive Python SDK with type hints and async support.

- **Package**: `ai-social-sdk`
- **Documentation**: [Python SDK Docs](./python/README.md)
- **Installation**: `pip install ai-social-sdk`
- **Repository**: https://github.com/example/ai-social-sdk-python

## Quick Start

### JavaScript/TypeScript

```javascript
import AISocialSDK from '@ai-social/sdk';

const client = new AISocialSDK({
  apiKey: 'your_api_key_here'
});

// Create a post
const post = await client.createPost({
  content: 'Hello from the SDK!',
  platforms: ['instagram', 'twitter']
});

console.log('Post created:', post.id);
```

### Python

```python
from ai_social import AISocialClient

client = AISocialClient(api_key='your_api_key_here')

# Create a post
post = client.create_post({
    'content': 'Hello from the SDK!',
    'platforms': ['instagram', 'twitter']
})

print(f'Post created: {post["id"]}')
```

## Features

All SDKs provide:

✅ **Full API Coverage**
- Content publishing and scheduling
- AI content generation
- Analytics and reporting
- Social listening
- Inbox management
- Webhooks
- Campaign management
- And more...

✅ **Type Safety**
- TypeScript definitions (JavaScript SDK)
- Type hints (Python SDK)
- IDE autocomplete support

✅ **Error Handling**
- Automatic retry logic
- Detailed error messages
- Rate limit handling

✅ **Authentication**
- API key support
- JWT token support
- Automatic token refresh

✅ **Developer Experience**
- Comprehensive documentation
- Code examples
- Active maintenance

## SDK Comparison

| Feature | JavaScript/TypeScript | Python |
|---------|----------------------|--------|
| API Coverage | ✅ Full | ✅ Full |
| Type Safety | ✅ TypeScript | ✅ Type Hints |
| Async/Await | ✅ Yes | ✅ Yes |
| Browser Support | ✅ Yes | ❌ No |
| Node.js Support | ✅ Yes | N/A |
| Python 3.8+ | N/A | ✅ Yes |
| Webhook Helpers | ✅ Yes | ✅ Yes |
| Rate Limit Handling | ✅ Automatic | ✅ Automatic |
| Retry Logic | ✅ Built-in | ✅ Built-in |

## Installation

### JavaScript/TypeScript

```bash
# npm
npm install @ai-social/sdk

# yarn
yarn add @ai-social/sdk

# pnpm
pnpm add @ai-social/sdk
```

### Python

```bash
# pip
pip install ai-social-sdk

# poetry
poetry add ai-social-sdk

# pipenv
pipenv install ai-social-sdk
```

## Authentication

### API Key (Recommended for Server-Side)

```javascript
// JavaScript
const client = new AISocialSDK({
  apiKey: process.env.AI_SOCIAL_API_KEY
});
```

```python
# Python
import os
client = AISocialClient(api_key=os.getenv('AI_SOCIAL_API_KEY'))
```

### Access Token (For User-Specific Operations)

```javascript
// JavaScript
const client = new AISocialSDK({
  accessToken: userAccessToken
});
```

```python
# Python
client = AISocialClient(access_token=user_access_token)
```

## Common Use Cases

### 1. Schedule Posts Across Multiple Platforms

```javascript
// JavaScript
const post = await client.createPost({
  content: 'Check out our new product! 🚀',
  platforms: ['instagram', 'twitter', 'linkedin'],
  scheduledAt: '2024-01-15T10:00:00Z',
  media: [{
    url: 'https://example.com/product.jpg',
    type: 'image'
  }]
});
```

```python
# Python
post = client.create_post({
    'content': 'Check out our new product! 🚀',
    'platforms': ['instagram', 'twitter', 'linkedin'],
    'scheduledAt': '2024-01-15T10:00:00Z',
    'media': [{
        'url': 'https://example.com/product.jpg',
        'type': 'image'
    }]
})
```

### 2. Generate AI Content

```javascript
// JavaScript
const generated = await client.generateContent({
  prompt: 'Create a post about sustainable fashion',
  tone: 'professional',
  platforms: ['instagram'],
  variations: 3
});

console.log(generated.variations);
```

```python
# Python
generated = client.generate_content({
    'prompt': 'Create a post about sustainable fashion',
    'tone': 'professional',
    'platforms': ['instagram'],
    'variations': 3
})

print(generated['variations'])
```

### 3. Monitor Brand Mentions

```javascript
// JavaScript
const query = await client.createListeningQuery({
  name: 'Brand Mentions',
  keywords: ['@yourbrand', 'your brand name'],
  platforms: ['twitter', 'instagram']
});

const mentions = await client.getMentions(query.id);
```

```python
# Python
query = client.create_listening_query({
    'name': 'Brand Mentions',
    'keywords': ['@yourbrand', 'your brand name'],
    'platforms': ['twitter', 'instagram']
})

mentions = client.get_mentions(query['id'])
```

### 4. Get Analytics

```javascript
// JavaScript
const analytics = await client.getAnalyticsOverview({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  platforms: ['instagram', 'twitter']
});

console.log(analytics.summary);
```

```python
# Python
analytics = client.get_analytics_overview({
    'startDate': '2024-01-01',
    'endDate': '2024-01-31',
    'platforms': ['instagram', 'twitter']
})

print(analytics['summary'])
```

### 5. Manage Inbox

```javascript
// JavaScript
const messages = await client.getInboxMessages({
  status: 'open',
  limit: 20
});

// Reply to a message
await client.replyToMessage(
  messages.data[0].id,
  'Thank you for reaching out!'
);
```

```python
# Python
messages = client.get_inbox_messages({
    'status': 'open',
    'limit': 20
})

# Reply to a message
client.reply_to_message(
    messages['data'][0]['id'],
    'Thank you for reaching out!'
)
```

## Error Handling

### JavaScript

```javascript
import AISocialSDK, { AISocialError } from '@ai-social/sdk';

try {
  const post = await client.createPost(postData);
} catch (error) {
  if (error instanceof AISocialError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Python

```python
from ai_social import AISocialClient, AISocialError

try:
    post = client.create_post(post_data)
except AISocialError as e:
    print(f'API Error: {e.message}')
    print(f'Status: {e.status_code}')
    print(f'Code: {e.code}')
except Exception as e:
    print(f'Unexpected error: {e}')
```

## Rate Limiting

Both SDKs automatically handle rate limiting:

- Respect rate limit headers
- Automatic retry with exponential backoff
- Clear error messages when limits exceeded

```javascript
// JavaScript - Rate limit info in error
try {
  await client.createPost(post);
} catch (error) {
  if (error.statusCode === 429) {
    console.log('Rate limited. Retry after:', error.retryAfter);
  }
}
```

## Webhooks

Both SDKs include webhook helpers:

```javascript
// JavaScript
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['post.published', 'mention.created'],
  secret: 'your_secret'
});
```

```python
# Python
webhook = client.create_webhook({
    'url': 'https://your-app.com/webhooks',
    'events': ['post.published', 'mention.created'],
    'secret': 'your_secret'
})
```

## Testing

### JavaScript

```bash
cd javascript
npm test
```

### Python

```bash
cd python
pytest
```

## Contributing

We welcome contributions! Please see our contributing guidelines:

- JavaScript SDK: [CONTRIBUTING.md](./javascript/CONTRIBUTING.md)
- Python SDK: [CONTRIBUTING.md](./python/CONTRIBUTING.md)

## Support

- **Documentation**: https://docs.example.com/sdk
- **API Reference**: https://docs.example.com/api
- **GitHub Issues**: 
  - JavaScript: https://github.com/example/ai-social-sdk-js/issues
  - Python: https://github.com/example/ai-social-sdk-python/issues
- **Email**: sdk-support@example.com
- **Community**: https://community.example.com

## Changelog

See individual SDK changelogs:
- [JavaScript Changelog](./javascript/CHANGELOG.md)
- [Python Changelog](./python/CHANGELOG.md)

## License

MIT License - see individual SDK LICENSE files for details.

## Roadmap

### Upcoming Features

- [ ] Go SDK
- [ ] Ruby SDK
- [ ] PHP SDK
- [ ] Webhook signature verification helpers
- [ ] Batch operation helpers
- [ ] Advanced retry strategies
- [ ] Request/response logging
- [ ] Metrics collection

## Community SDKs

Community-maintained SDKs (not officially supported):

- **Ruby**: https://github.com/community/ai-social-ruby
- **PHP**: https://github.com/community/ai-social-php
- **Go**: https://github.com/community/ai-social-go

Want to create an SDK for another language? Contact us at sdk-support@example.com
