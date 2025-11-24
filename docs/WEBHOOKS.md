# Webhooks Documentation

Webhooks allow you to receive real-time notifications when events occur in your AI Social Media Platform account. Instead of polling the API for changes, webhooks push data to your application as events happen.

## Overview

When an event occurs (e.g., a post is published, a mention is detected), the platform sends an HTTP POST request to the URL you've configured. Your application can then process this data in real-time.

## Setting Up Webhooks

### 1. Create a Webhook Endpoint

First, create an endpoint in your application to receive webhook events:

```javascript
// Express.js example
app.post('/webhooks/social-media', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'];
  if (!verifySignature(signature, req.body, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the event
  console.log('Received event:', event.event);
  console.log('Event data:', event.data);
  
  // Respond quickly to acknowledge receipt
  res.status(200).send('OK');
  
  // Process event asynchronously
  processEvent(event);
});
```

```python
# Flask example
@app.route('/webhooks/social-media', methods=['POST'])
def webhook():
    event = request.json
    
    # Verify webhook signature
    signature = request.headers.get('X-Webhook-Signature')
    if not verify_signature(signature, request.data, WEBHOOK_SECRET):
        return 'Invalid signature', 401
    
    # Process the event
    print(f"Received event: {event['event']}")
    print(f"Event data: {event['data']}")
    
    # Respond quickly to acknowledge receipt
    response = make_response('OK', 200)
    
    # Process event asynchronously
    process_event_async(event)
    
    return response
```

### 2. Register Your Webhook

Use the API or SDK to register your webhook endpoint:

```bash
curl -X POST https://api.example.com/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/social-media",
    "events": ["post.published", "mention.created", "message.received"],
    "secret": "your_webhook_secret_key"
  }'
```

```javascript
// JavaScript SDK
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhooks/social-media',
  events: ['post.published', 'mention.created', 'message.received'],
  secret: 'your_webhook_secret_key',
});
```

```python
# Python SDK
webhook = client.create_webhook({
    "url": "https://your-app.com/webhooks/social-media",
    "events": ["post.published", "mention.created", "message.received"],
    "secret": "your_webhook_secret_key"
})
```

## Supported Events

### Content Publishing Events

#### `post.created`
Triggered when a new post is created.

```json
{
  "event": "post.created",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "postId": "post_123",
    "content": "Check out our new product!",
    "platforms": ["instagram", "twitter"],
    "status": "draft"
  },
  "workspaceId": "ws_789"
}
```

#### `post.scheduled`
Triggered when a post is scheduled for publishing.

```json
{
  "event": "post.scheduled",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "postId": "post_123",
    "scheduledAt": "2024-01-15T10:00:00Z",
    "platforms": ["instagram", "twitter"]
  },
  "workspaceId": "ws_789"
}
```

#### `post.published`
Triggered when a post is successfully published to a platform.

```json
{
  "event": "post.published",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "postId": "post_123",
    "platform": "instagram",
    "platformPostId": "ig_456",
    "publishedAt": "2024-01-15T10:00:00Z"
  },
  "workspaceId": "ws_789"
}
```

#### `post.failed`
Triggered when post publishing fails.

```json
{
  "event": "post.failed",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "postId": "post_123",
    "platform": "instagram",
    "error": "Authentication failed",
    "errorCode": "AUTH_ERROR"
  },
  "workspaceId": "ws_789"
}
```

### Social Listening Events

#### `mention.created`
Triggered when a new brand mention is detected.

```json
{
  "event": "mention.created",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "mentionId": "mention_abc",
    "queryId": "query_123",
    "platform": "twitter",
    "content": "Just tried @yourbrand's new product and it's amazing!",
    "author": {
      "username": "happy_customer",
      "followers": 5000
    },
    "sentiment": "positive",
    "sentimentScore": 0.85,
    "url": "https://twitter.com/happy_customer/status/123"
  },
  "workspaceId": "ws_789"
}
```

#### `crisis.detected`
Triggered when a potential PR crisis is detected.

```json
{
  "event": "crisis.detected",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "crisisId": "crisis_xyz",
    "severity": "high",
    "reason": "Negative sentiment spike",
    "metrics": {
      "sentimentScore": -0.75,
      "mentionVolume": 500,
      "volumeIncrease": 300
    },
    "topMentions": [
      {
        "content": "Disappointed with @yourbrand's service",
        "platform": "twitter",
        "reach": 10000
      }
    ]
  },
  "workspaceId": "ws_789"
}
```

#### `trend.detected`
Triggered when a new trend is identified.

```json
{
  "event": "trend.detected",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "trendId": "trend_def",
    "topic": "sustainable fashion",
    "hashtags": ["#sustainablefashion", "#ecofashion"],
    "growthRate": 150,
    "mentionCount": 1000,
    "platforms": ["instagram", "twitter"]
  },
  "workspaceId": "ws_789"
}
```

### Inbox Events

#### `message.received`
Triggered when a new message is received in the inbox.

```json
{
  "event": "message.received",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "messageId": "msg_123",
    "conversationId": "conv_456",
    "platform": "instagram",
    "type": "dm",
    "content": "Hi, I have a question about your product",
    "sender": {
      "username": "customer123",
      "name": "John Doe"
    },
    "sentiment": "neutral",
    "priority": "medium"
  },
  "workspaceId": "ws_789"
}
```

#### `message.replied`
Triggered when a team member replies to a message.

```json
{
  "event": "message.replied",
  "timestamp": "2024-01-10T12:05:00Z",
  "data": {
    "messageId": "msg_124",
    "conversationId": "conv_456",
    "replyContent": "Thank you for reaching out! How can we help?",
    "repliedBy": "user_789",
    "responseTime": 300
  },
  "workspaceId": "ws_789"
}
```

### Analytics Events

#### `analytics.updated`
Triggered when analytics data is updated (hourly).

```json
{
  "event": "analytics.updated",
  "timestamp": "2024-01-10T13:00:00Z",
  "data": {
    "period": "hourly",
    "platforms": ["instagram", "twitter"],
    "summary": {
      "totalEngagement": 1500,
      "totalReach": 25000,
      "followerGrowth": 50
    }
  },
  "workspaceId": "ws_789"
}
```

#### `goal.achieved`
Triggered when a campaign goal is achieved.

```json
{
  "event": "goal.achieved",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "campaignId": "campaign_123",
    "goalType": "engagement",
    "target": 10000,
    "achieved": 10500,
    "percentageComplete": 105
  },
  "workspaceId": "ws_789"
}
```

### Account Events

#### `account.connected`
Triggered when a social account is connected.

```json
{
  "event": "account.connected",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "accountId": "acc_123",
    "platform": "instagram",
    "username": "yourbrand",
    "connectedBy": "user_789"
  },
  "workspaceId": "ws_789"
}
```

#### `account.disconnected`
Triggered when a social account is disconnected.

```json
{
  "event": "account.disconnected",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "accountId": "acc_123",
    "platform": "instagram",
    "reason": "Token expired"
  },
  "workspaceId": "ws_789"
}
```

## Webhook Security

### Signature Verification

Every webhook request includes a signature in the `X-Webhook-Signature` header. Verify this signature to ensure the request came from the AI Social Platform.

The signature is computed as:
```
HMAC-SHA256(webhook_secret, request_body)
```

#### Verification Examples

```javascript
// Node.js
const crypto = require('crypto');

function verifySignature(signature, body, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

```python
# Python
import hmac
import hashlib
import json

def verify_signature(signature, body, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(body).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"sha256={expected_signature}" == signature
```

```php
// PHP
function verifySignature($signature, $body, $secret) {
    $expectedSignature = hash_hmac('sha256', json_encode($body), $secret);
    return "sha256={$expectedSignature}" === $signature;
}
```

### Best Practices

1. **Always verify signatures**: Never process webhook events without verifying the signature
2. **Use HTTPS**: Only accept webhooks over HTTPS
3. **Respond quickly**: Return a 200 status code within 5 seconds
4. **Process asynchronously**: Queue events for background processing
5. **Handle duplicates**: Events may be sent multiple times; use event IDs for idempotency
6. **Implement retry logic**: Handle temporary failures gracefully
7. **Monitor webhook health**: Track delivery success rates

## Webhook Delivery

### Retry Policy

If your endpoint doesn't respond with a 2xx status code, the platform will retry delivery:

- Retry 1: After 1 minute
- Retry 2: After 5 minutes
- Retry 3: After 15 minutes
- Retry 4: After 1 hour
- Retry 5: After 6 hours

After 5 failed attempts, the webhook will be marked as failed and you'll receive an email notification.

### Timeout

Webhook requests timeout after 30 seconds. Ensure your endpoint responds within this time.

### Response Codes

Your endpoint should return:
- `200-299`: Success - event processed
- `400-499`: Client error - event will not be retried
- `500-599`: Server error - event will be retried

## Testing Webhooks

### Test Webhook Delivery

Use the test endpoint to send a sample event:

```bash
curl -X POST https://api.example.com/api/v1/webhooks/webhook_123/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This sends a test event to your webhook URL:

```json
{
  "event": "webhook.test",
  "timestamp": "2024-01-10T12:00:00Z",
  "data": {
    "message": "This is a test webhook event"
  },
  "workspaceId": "ws_789"
}
```

### Local Development

For local testing, use tools like:
- **ngrok**: `ngrok http 3000`
- **localtunnel**: `lt --port 3000`
- **Webhook.site**: For quick testing without code

## Managing Webhooks

### List Webhooks

```bash
curl -X GET https://api.example.com/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Webhook

```bash
curl -X PUT https://api.example.com/api/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["post.published", "mention.created"]
  }'
```

### Delete Webhook

```bash
curl -X DELETE https://api.example.com/api/v1/webhooks/webhook_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Webhook Logs

```bash
curl -X GET https://api.example.com/api/v1/webhooks/webhook_123/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Webhook Not Receiving Events

1. Verify webhook is active: Check webhook status in dashboard
2. Check URL accessibility: Ensure your endpoint is publicly accessible
3. Verify SSL certificate: Use valid SSL certificate for HTTPS
4. Check firewall rules: Ensure incoming requests aren't blocked
5. Review logs: Check webhook delivery logs for errors

### Signature Verification Failing

1. Use correct secret: Ensure you're using the secret from webhook creation
2. Verify body format: Use raw request body, not parsed JSON
3. Check encoding: Ensure consistent UTF-8 encoding
4. Review implementation: Compare with example code

### High Latency

1. Respond immediately: Return 200 before processing
2. Use queue: Process events asynchronously
3. Optimize endpoint: Reduce processing time
4. Scale infrastructure: Handle increased load

## Rate Limits

Webhook deliveries are not subject to API rate limits, but we recommend:
- Process events asynchronously
- Implement backpressure handling
- Monitor queue depth
- Scale horizontally if needed

## Support

For webhook-related issues:
- Email: webhooks-support@example.com
- Documentation: https://docs.example.com/webhooks
- Status Page: https://status.example.com
