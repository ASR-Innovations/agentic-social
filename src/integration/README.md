# Integration Framework

A comprehensive integration framework for the AI Social Media Management Platform, providing OAuth flows, webhook management, API key authentication, and rate limiting.

## Features

### 1. Integration Registry
- Support for multiple integration types (Zapier, Make, n8n, CRM, Design Tools, Marketing Automation)
- Public marketplace for discovering integrations
- Encrypted credential storage
- OAuth 2.0 with PKCE support
- Integration status tracking and error handling

### 2. Webhook System
- Event-driven notifications for platform events
- HMAC signature verification for security
- Automatic retry with exponential backoff
- Delivery tracking and analytics
- Support for custom headers

### 3. API Key Management
- Secure API key generation and storage
- Scoped permissions
- Per-key rate limiting
- Usage tracking and analytics
- Automatic expiration

### 4. Rate Limiting
- Per-integration rate limiting
- Per-API-key rate limiting
- Hourly and daily limits
- Automatic cleanup of old tracking records

## API Endpoints

### Integration Management

#### Create Integration
```http
POST /api/integrations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Salesforce CRM",
  "type": "CRM",
  "provider": "salesforce",
  "description": "Sync contacts and leads with Salesforce",
  "scopes": ["read_contacts", "write_leads"],
  "config": {
    "authorizationUrl": "https://login.salesforce.com/services/oauth2/authorize",
    "tokenUrl": "https://login.salesforce.com/services/oauth2/token",
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret"
  }
}
```

#### List Integrations
```http
GET /api/integrations?includePublic=true
Authorization: Bearer <jwt_token>
```

#### Get Integration
```http
GET /api/integrations/:id
Authorization: Bearer <jwt_token>
```

#### Update Integration
```http
PUT /api/integrations/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "ACTIVE"
}
```

#### Delete Integration
```http
DELETE /api/integrations/:id
Authorization: Bearer <jwt_token>
```

### OAuth Flow

#### Initiate OAuth
```http
POST /api/integrations/:id/oauth/initiate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "redirectUri": "https://yourapp.com/oauth/callback"
}
```

Response:
```json
{
  "authorizationUrl": "https://provider.com/oauth/authorize?client_id=...&state=...",
  "state": "random_state_token"
}
```

#### Handle OAuth Callback
```http
POST /api/integrations/oauth/callback
Content-Type: application/json

{
  "code": "authorization_code",
  "state": "state_from_initiate"
}
```

#### Refresh Token
```http
POST /api/integrations/:id/oauth/refresh
Authorization: Bearer <jwt_token>
```

### Webhook Management

#### Create Webhook
```http
POST /api/integrations/webhooks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Post Published Webhook",
  "url": "https://yourapp.com/webhooks/post-published",
  "events": ["POST_PUBLISHED", "POST_FAILED"],
  "headers": {
    "X-Custom-Header": "value"
  },
  "retryConfig": {
    "maxRetries": 3,
    "backoffMultiplier": 2
  }
}
```

Response includes the webhook secret for signature verification:
```json
{
  "id": "webhook_id",
  "name": "Post Published Webhook",
  "url": "https://yourapp.com/webhooks/post-published",
  "secret": "whsec_...",
  "events": ["POST_PUBLISHED", "POST_FAILED"],
  "status": "ACTIVE"
}
```

#### List Webhooks
```http
GET /api/integrations/webhooks
Authorization: Bearer <jwt_token>
```

#### Get Webhook
```http
GET /api/integrations/webhooks/:id
Authorization: Bearer <jwt_token>
```

#### Update Webhook
```http
PUT /api/integrations/webhooks/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "events": ["POST_PUBLISHED", "POST_SCHEDULED", "POST_FAILED"]
}
```

#### Delete Webhook
```http
DELETE /api/integrations/webhooks/:id
Authorization: Bearer <jwt_token>
```

#### Retry Failed Delivery
```http
POST /api/integrations/webhooks/:id/deliveries/:deliveryId/retry
Authorization: Bearer <jwt_token>
```

### API Key Management

#### Create API Key
```http
POST /api/integrations/api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Production API Key",
  "scopes": ["posts:read", "posts:write", "analytics:read"],
  "rateLimitPerHour": 1000,
  "rateLimitPerDay": 10000,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

Response (key is only shown once):
```json
{
  "id": "key_id",
  "name": "Production API Key",
  "key": "sk_live_abc123...",
  "scopes": ["posts:read", "posts:write", "analytics:read"],
  "status": "ACTIVE",
  "createdAt": "2024-01-13T00:00:00Z"
}
```

#### List API Keys
```http
GET /api/integrations/api-keys
Authorization: Bearer <jwt_token>
```

#### Get API Key
```http
GET /api/integrations/api-keys/:id
Authorization: Bearer <jwt_token>
```

#### Revoke API Key
```http
DELETE /api/integrations/api-keys/:id
Authorization: Bearer <jwt_token>
```

## Webhook Events

The following events can trigger webhooks:

- `POST_PUBLISHED` - A post was successfully published
- `POST_SCHEDULED` - A post was scheduled
- `POST_FAILED` - A post failed to publish
- `MENTION_RECEIVED` - A brand mention was detected
- `MESSAGE_RECEIVED` - A new message was received
- `CONVERSATION_ASSIGNED` - A conversation was assigned to a team member
- `ALERT_TRIGGERED` - A listening alert was triggered
- `CAMPAIGN_STARTED` - A campaign was started
- `CAMPAIGN_COMPLETED` - A campaign was completed
- `APPROVAL_REQUESTED` - Approval was requested for content
- `APPROVAL_COMPLETED` - Approval workflow was completed

## Webhook Payload Format

All webhook payloads follow this structure:

```json
{
  "event": "POST_PUBLISHED",
  "timestamp": "2024-01-13T12:00:00Z",
  "workspaceId": "workspace_id",
  "data": {
    // Event-specific data
  }
}
```

### Example: POST_PUBLISHED Event

```json
{
  "event": "POST_PUBLISHED",
  "timestamp": "2024-01-13T12:00:00Z",
  "workspaceId": "workspace_123",
  "data": {
    "postId": "post_456",
    "platforms": ["INSTAGRAM", "FACEBOOK"],
    "content": "Check out our new product!",
    "publishedAt": "2024-01-13T12:00:00Z"
  }
}
```

## Webhook Signature Verification

All webhook requests include an `X-Webhook-Signature` header containing an HMAC SHA-256 signature of the payload.

### Verifying Signatures (Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhooks/post-published', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  const secret = 'your_webhook_secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  console.log('Received event:', payload.event);
  res.status(200).send('OK');
});
```

## Using API Keys

API keys can be used to authenticate API requests without requiring user login.

### Authentication

Include the API key in the `Authorization` header:

```http
GET /api/posts
Authorization: Bearer sk_live_abc123...
```

Or use the `X-API-Key` header:

```http
GET /api/posts
X-API-Key: sk_live_abc123...
```

### Rate Limiting

API responses include rate limit headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 2024-01-13T13:00:00Z
```

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-13T13:00:00Z

{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again at 2024-01-13T13:00:00Z"
}
```

## Integration Types

### Zapier
Connect with 5000+ apps through Zapier. Supports triggers and actions.

### Make (formerly Integromat)
Visual automation platform with advanced routing and data transformation.

### n8n
Open-source workflow automation with custom nodes.

### CRM
Bidirectional sync with Salesforce, HubSpot, Pipedrive, and Zoho CRM.

### Design Tools
Direct integration with Canva, Adobe Creative Cloud, and stock photo services.

### Marketing Automation
Connect with Mailchimp, ActiveCampaign, and other marketing platforms.

### Custom
Build custom integrations using webhooks and API keys.

## Security Best Practices

1. **Store Secrets Securely**: Never commit API keys or webhook secrets to version control
2. **Use HTTPS**: Always use HTTPS for webhook URLs
3. **Verify Signatures**: Always verify webhook signatures before processing
4. **Rotate Keys**: Regularly rotate API keys and webhook secrets
5. **Limit Scopes**: Only grant necessary permissions to API keys
6. **Monitor Usage**: Track API key usage and set up alerts for unusual activity
7. **Set Expiration**: Use expiration dates for API keys when possible

## Environment Variables

```env
# Required for credential encryption
ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-in-production-must-be-at-least-32-chars
```

## Database Models

The integration framework uses the following Prisma models:

- `Integration` - Integration configurations
- `IntegrationOAuthState` - OAuth state tracking
- `Webhook` - Webhook configurations
- `WebhookDelivery` - Webhook delivery tracking
- `ApiKey` - API key management
- `IntegrationLog` - Integration activity logs
- `RateLimitTracking` - Rate limit tracking

## Testing

### Testing Webhooks Locally

Use tools like ngrok to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL as your webhook URL:
```
https://abc123.ngrok.io/webhooks/test
```

### Testing API Keys

```bash
# Create an API key
curl -X POST http://localhost:3000/api/integrations/api-keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "scopes": ["posts:read"]}'

# Use the API key
curl http://localhost:3000/api/posts \
  -H "Authorization: Bearer sk_live_..."
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook status is `ACTIVE`
2. Verify the URL is accessible from the internet
3. Check webhook delivery logs for errors
4. Verify signature verification is correct

### API Key Authentication Failing

1. Verify the API key is `ACTIVE` and not expired
2. Check rate limits haven't been exceeded
3. Verify the API key has required scopes
4. Ensure the key is being sent in the correct header

### OAuth Flow Failing

1. Verify OAuth configuration (client ID, secret, URLs)
2. Check redirect URI matches exactly
3. Verify state parameter is being preserved
4. Check integration logs for detailed error messages

## Zapier Integration

The platform includes a comprehensive Zapier integration enabling connections with 5000+ apps. See [ZAPIER_INTEGRATION.md](./ZAPIER_INTEGRATION.md) for complete documentation.

### Quick Start

1. **Generate API Key:**
   ```http
   POST /api/integrations/api-keys
   ```

2. **Test Authentication:**
   ```http
   POST /api/zapier/auth/test
   X-API-Key: your_api_key
   ```

3. **Available Triggers:**
   - Post Published
   - Post Scheduled
   - Mention Received
   - Message Received
   - Alert Triggered
   - Campaign Started
   - Campaign Completed

4. **Available Actions:**
   - Create Post
   - Schedule Post

### Triggering Zapier Webhooks

Use the `ZapierTriggerUtil` to trigger webhooks from your services:

```typescript
import { ZapierTriggerUtil } from '../integration/utils/zapier-trigger.util';

@Injectable()
export class PublishingService {
  constructor(private zapierTrigger: ZapierTriggerUtil) {}

  async publishPost(post: Post) {
    // ... publish logic ...
    
    // Trigger Zapier webhook
    await this.zapierTrigger.postPublished(post.workspaceId, post);
  }
}
```

## Future Enhancements

- [ ] Webhook retry queue with dead letter queue
- [ ] Integration templates for common use cases
- [ ] Visual integration builder
- [ ] Integration analytics dashboard
- [ ] Webhook testing tool
- [ ] API key rotation automation
- [ ] Integration health monitoring
- [ ] Custom integration SDK
- [ ] Make (Integromat) integration
- [ ] n8n integration
