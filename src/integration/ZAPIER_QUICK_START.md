# Zapier Integration Quick Start Guide

Get your Zapier integration up and running in 5 minutes.

## Prerequisites

- Node.js 20+
- PostgreSQL database
- API key from the platform

## Step 1: Generate API Key

```bash
curl -X POST http://localhost:3000/api/integrations/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zapier Integration",
    "scopes": ["posts:read", "posts:write", "mentions:read", "messages:read"],
    "rateLimitPerHour": 1000,
    "rateLimitPerDay": 10000
  }'
```

Save the returned API key - you'll need it for authentication.

## Step 2: Test Authentication

```bash
curl -X POST http://localhost:3000/api/zapier/auth/test \
  -H "X-API-Key: YOUR_API_KEY"
```

Expected response:
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

## Step 3: Subscribe to a Trigger

```bash
curl -X POST http://localhost:3000/api/zapier/triggers/post_published/subscribe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
    "subscriptionId": "test_sub_123"
  }'
```

## Step 4: Test the Trigger

```bash
curl -X POST http://localhost:3000/api/zapier/triggers/post_published/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

This will send sample data to your Zapier webhook URL.

## Step 5: Create a Post via Action

```bash
curl -X POST http://localhost:3000/api/zapier/actions/create-post \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from Zapier! 🚀",
    "platforms": ["INSTAGRAM", "FACEBOOK"],
    "hashtags": ["test", "zapier", "automation"],
    "publishNow": false,
    "scheduledAt": "2024-12-31T12:00:00Z"
  }'
```

Expected response:
```json
{
  "id": "post_789",
  "status": "SCHEDULED",
  "scheduledAt": "2024-12-31T12:00:00Z",
  "createdAt": "2024-01-13T12:00:00Z"
}
```

## Step 6: Integrate with Your Code

### Trigger Zapier Webhooks

```typescript
import { ZapierTriggerUtil } from './integration/utils/zapier-trigger.util';

@Injectable()
export class YourService {
  constructor(private zapierTrigger: ZapierTriggerUtil) {}

  async onPostPublished(post: Post) {
    // Trigger Zapier webhook
    await this.zapierTrigger.postPublished(post.workspaceId, post);
  }
}
```

### Available Trigger Methods

```typescript
// Post events
await zapierTrigger.postPublished(workspaceId, post);
await zapierTrigger.postScheduled(workspaceId, post);

// Mention events
await zapierTrigger.mentionReceived(workspaceId, mention);

// Message events
await zapierTrigger.messageReceived(workspaceId, message);

// Alert events
await zapierTrigger.alertTriggered(workspaceId, alert);

// Campaign events
await zapierTrigger.campaignStarted(workspaceId, campaign);
await zapierTrigger.campaignCompleted(workspaceId, campaign);
```

## Common Use Cases

### 1. Post to Social Media from Google Sheets

**Zap Setup:**
1. Trigger: New row in Google Sheets
2. Action: Create Post (AI Social Media Platform)

**Field Mapping:**
- Column A → Content
- Column B → Platforms (comma-separated)
- Column C → Scheduled Date

### 2. Alert Team on Negative Mentions

**Zap Setup:**
1. Trigger: Mention Received (AI Social Media Platform)
2. Filter: Sentiment is "NEGATIVE"
3. Action: Send Slack Message

### 3. Log Published Posts to Airtable

**Zap Setup:**
1. Trigger: Post Published (AI Social Media Platform)
2. Action: Create Record (Airtable)

## Troubleshooting

### Authentication Fails

- Verify API key is active and not expired
- Check that API key has required scopes
- Ensure API key is sent in `X-API-Key` header

### Trigger Not Firing

- Verify subscription is active
- Check webhook URL is accessible
- Review webhook delivery logs
- Test with sample data first

### Action Fails

- Validate required fields are provided
- Check platform accounts are connected
- Verify content meets platform requirements
- Review error message in response

## Next Steps

- Read the [full documentation](./ZAPIER_INTEGRATION.md)
- Explore [Zapier app definition](./zapier-app-definition.json)
- Check out [example Zaps](#examples)
- Join our [developer community](#support)

## Support

- Documentation: https://docs.yourdomain.com/zapier
- Email: support@yourdomain.com
- Slack: #zapier-integration
