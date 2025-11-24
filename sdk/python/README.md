# AI Social Media Platform - Python SDK

Official Python SDK for the AI Social Media Management Platform API.

## Installation

```bash
pip install ai-social-sdk
```

## Quick Start

```python
from ai_social import AISocialClient

# Initialize with API key
client = AISocialClient(
    api_key="your_api_key_here",
    base_url="https://api.example.com"  # optional
)

# Or initialize with access token
client = AISocialClient(
    access_token="your_access_token_here"
)
```

## Authentication

### Login with Email and Password

```python
auth_data = client.login("user@example.com", "password")
print(f"Access Token: {auth_data['accessToken']}")
print(f"User: {auth_data['user']}")
```

### Refresh Token

```python
new_auth_data = client.refresh_token("your_refresh_token")
```

## Content Publishing

### Create and Schedule a Post

```python
post = client.create_post({
    "content": "Excited to announce our new product launch! 🚀 #innovation",
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
        }
    }
})

print(f"Post created: {post['id']}")
```

### Publish Immediately

```python
published_post = client.publish_post("post_abc123")
print(f"Post published: {published_post}")
```

### List Posts

```python
result = client.list_posts(
    status="published",
    platform="instagram",
    limit=20
)

print(f"Posts: {result['data']}")
print(f"Has more: {result['pagination']['hasMore']}")
```

### Update Post

```python
updated_post = client.update_post("post_abc123", {
    "content": "Updated content!",
    "scheduledAt": "2024-01-15T14:00:00Z"
})
```

### Delete Post

```python
client.delete_post("post_abc123")
```

### Bulk Create Posts

```python
results = client.bulk_create_posts([
    {
        "content": "Post 1",
        "platforms": ["instagram"],
        "scheduledAt": "2024-01-15T10:00:00Z"
    },
    {
        "content": "Post 2",
        "platforms": ["twitter"],
        "scheduledAt": "2024-01-15T14:00:00Z"
    }
])
```

## AI Content Generation

### Generate Content

```python
generated = client.generate_content({
    "prompt": "Create a post about our new eco-friendly product line",
    "tone": "professional",
    "platforms": ["instagram", "linkedin"],
    "variations": 3,
    "includeHashtags": True,
    "brandVoiceId": "brand_voice_123"
})

print(f"Generated variations: {generated['variations']}")
```

### Optimize Content

```python
optimized = client.optimize_content(
    content="Check out our new product",
    platform="instagram",
    goals=["engagement", "reach"]
)

print(f"Optimized content: {optimized}")
```

### Generate Hashtags

```python
hashtags = client.generate_hashtags(
    content="Launching our new sustainable fashion line",
    platform="instagram",
    count=30
)

print(f"Suggested hashtags: {hashtags['hashtags']}")
```

### Get Strategy Recommendations

```python
strategy = client.get_strategy_recommendations(
    goals=["increase_engagement", "grow_followers"],
    platforms=["instagram", "twitter"],
    timeframe="30_days"
)

print(f"Strategy recommendations: {strategy}")
```

## Analytics

### Get Dashboard Overview

```python
analytics = client.get_analytics_overview({
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "platforms": ["instagram", "twitter"]
})

print(f"Summary: {analytics['summary']}")
print(f"Platform breakdown: {analytics['platformBreakdown']}")
```

### Get Post Analytics

```python
post_analytics = client.get_post_analytics("post_abc123")
print(f"Post performance: {post_analytics}")
```

### Get Audience Analytics

```python
audience = client.get_audience_analytics()
print(f"Audience demographics: {audience}")
```

### Generate Report

```python
report = client.generate_report({
    "name": "Monthly Performance Report",
    "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
    },
    "metrics": ["engagement", "reach", "follower_growth"],
    "platforms": ["instagram", "twitter"],
    "format": "pdf"
})

print(f"Report generated: {report}")
```

## Social Listening

### Create Listening Query

```python
query = client.create_listening_query({
    "name": "Brand Mentions",
    "keywords": ["@yourbrand", "your brand name"],
    "platforms": ["twitter", "instagram", "reddit"],
    "languages": ["en", "es"],
    "sentiment": ["positive", "neutral", "negative"]
})

print(f"Query created: {query['id']}")
```

### Get Mentions

```python
result = client.get_mentions("query_123", limit=50)
print(f"Mentions: {result['data']}")
```

### Get Sentiment Analysis

```python
sentiment = client.get_sentiment_analysis("query_123", start_date="2024-01-01")
print(f"Sentiment data: {sentiment}")
```

### Get Trending Topics

```python
trends = client.get_trending_topics()
print(f"Trending topics: {trends}")
```

## Inbox Management

### Get Inbox Messages

```python
result = client.get_inbox_messages(
    status="open",
    platform="instagram",
    limit=20
)

print(f"Messages: {result['data']}")
```

### Reply to Message

```python
reply = client.reply_to_message(
    message_id="msg_123",
    content="Thank you for reaching out! We'll get back to you shortly.",
    use_template=False
)

print(f"Reply sent: {reply}")
```

### Assign Message

```python
client.assign_message("msg_123", "user_456")
```

### Create Reply Template

```python
template = client.create_reply_template(
    name="Welcome Message",
    content="Hi {{name}}, thank you for contacting us!",
    category="greeting"
)

print(f"Template created: {template['id']}")
```

## Webhooks

### Create Webhook

```python
webhook = client.create_webhook({
    "url": "https://your-app.com/webhooks/social-media",
    "events": ["post.published", "mention.created", "message.received"],
    "secret": "your_webhook_secret"
})

print(f"Webhook created: {webhook['id']}")
```

### List Webhooks

```python
webhooks = client.list_webhooks()
print(f"Webhooks: {webhooks}")
```

### Test Webhook

```python
client.test_webhook("webhook_123")
```

### Delete Webhook

```python
client.delete_webhook("webhook_123")
```

## Social Accounts

### List Social Accounts

```python
accounts = client.list_social_accounts()
print(f"Connected accounts: {accounts}")
```

### Connect Social Account

```python
account = client.connect_social_account("instagram", "auth_code_here")
print(f"Account connected: {account}")
```

### Disconnect Social Account

```python
client.disconnect_social_account("account_123")
```

## Error Handling

```python
from ai_social import AISocialClient, AISocialError

client = AISocialClient(api_key="your_api_key")

try:
    post = client.create_post({
        "content": "Test post",
        "platforms": ["instagram"]
    })
except AISocialError as e:
    print(f"API Error: {e.message}")
    print(f"Status Code: {e.status_code}")
    print(f"Error Code: {e.code}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Type Hints

The SDK includes full type hints for better IDE support:

```python
from ai_social import AISocialClient, Post, AIGenerateRequest

client = AISocialClient(api_key="your_api_key")

# Full type safety
post: Post = {
    "content": "Hello world",
    "platforms": ["instagram"]
}

request: AIGenerateRequest = {
    "prompt": "Generate content",
    "tone": "professional",
    "variations": 3
}
```

## Configuration Options

```python
client = AISocialClient(
    # Required: Either api_key or access_token
    api_key="your_api_key",
    # OR
    access_token="your_access_token",
    
    # Optional
    base_url="https://api.example.com",  # Default: https://api.example.com
    timeout=30  # Default: 30 seconds
)
```

## Rate Limiting

The SDK automatically handles rate limiting. When a rate limit is exceeded, it will raise an `AISocialError` with status code 429.

## Support

- Documentation: https://docs.example.com
- GitHub Issues: https://github.com/example/ai-social-sdk-python/issues
- Email: sdk-support@example.com

## License

MIT
