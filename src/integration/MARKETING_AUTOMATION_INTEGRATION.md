# Marketing Automation Integration

This module provides integration with marketing automation platforms (Mailchimp and ActiveCampaign) to sync audiences, trigger workflows based on social media events, and automate marketing campaigns.

## Features

### Supported Platforms

1. **Mailchimp**
   - Contact and list management
   - Tag management
   - Event tracking
   - Campaign analytics
   - Batch operations

2. **ActiveCampaign**
   - Contact and list management
   - Tag management
   - Event tracking
   - Campaign analytics
   - Automation workflows

### Core Capabilities

- **Audience Sync**: Sync social media followers and engaged users to marketing lists
- **Workflow Triggers**: Automatically trigger marketing actions based on social events
- **Contact Enrichment**: Enrich marketing contacts with social media data
- **Event Tracking**: Track social media interactions as marketing events
- **Bidirectional Sync**: Keep contacts in sync between platforms

## API Endpoints

### Integration Management

#### Create Integration
```http
POST /api/marketing-automation/integrations
Authorization: Bearer <token>

{
  "provider": "mailchimp",
  "name": "Main Mailchimp Account",
  "credentials": {
    "apiKey": "your-api-key",
    "serverPrefix": "us1"
  },
  "syncConfig": {
    "direction": "bidirectional",
    "syncInterval": 60,
    "autoSync": true,
    "audienceFields": ["email", "firstName", "lastName", "tags"]
  }
}
```

### Contact Management

#### Sync Contact
```http
POST /api/marketing-automation/integrations/:id/contacts/sync

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "listId": "abc123",
  "tags": ["social-media", "engaged"],
  "socialProfiles": [
    {
      "platform": "instagram",
      "username": "johndoe",
      "url": "https://instagram.com/johndoe",
      "followers": 5000,
      "engagement": 3.5
    }
  ]
}
```

#### Get Contact
```http
GET /api/marketing-automation/integrations/:id/contacts?email=user@example.com
```

#### Update Contact
```http
PUT /api/marketing-automation/integrations/:id/contacts/:contactId

{
  "firstName": "Jane",
  "tags": ["vip", "engaged"],
  "socialData": {
    "platform": "instagram",
    "username": "janedoe",
    "followers": 10000,
    "engagementRate": 4.2
  }
}
```

### List Management

#### Create List
```http
POST /api/marketing-automation/integrations/:id/lists

{
  "name": "Social Media Followers",
  "description": "Followers from Instagram and Facebook",
  "doubleOptIn": false
}
```

#### Get Lists
```http
GET /api/marketing-automation/integrations/:id/lists
```

#### Add Contacts to List
```http
POST /api/marketing-automation/integrations/:id/lists/add-contacts

{
  "listId": "abc123",
  "contacts": [
    {
      "email": "user1@example.com",
      "firstName": "User",
      "lastName": "One"
    },
    {
      "email": "user2@example.com",
      "firstName": "User",
      "lastName": "Two"
    }
  ],
  "updateExisting": true
}
```

### Tag Management

#### Add Tags
```http
POST /api/marketing-automation/integrations/:id/contacts/tags

{
  "email": "user@example.com",
  "tags": ["engaged", "instagram-follower"]
}
```

#### Remove Tags
```http
DELETE /api/marketing-automation/integrations/:id/contacts/tags

{
  "email": "user@example.com",
  "tags": ["inactive"]
}
```

### Event Tracking

#### Track Event
```http
POST /api/marketing-automation/integrations/:id/events

{
  "email": "user@example.com",
  "eventName": "post_liked",
  "eventData": {
    "postId": "post123",
    "platform": "instagram",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Workflow Triggers

#### Create Workflow Trigger
```http
POST /api/marketing-automation/integrations/:id/triggers

{
  "name": "New Follower Welcome",
  "description": "Add new followers to welcome campaign",
  "event": "new_follower",
  "conditions": {
    "platform": ["instagram", "facebook"],
    "engagementMin": 0
  },
  "action": {
    "type": "add_to_list",
    "listId": "welcome-list-123",
    "tags": ["new-follower"]
  },
  "isActive": true
}
```

### Analytics

#### Get Audience Stats
```http
GET /api/marketing-automation/integrations/:id/stats?listId=abc123
```

Response:
```json
{
  "totalContacts": 5000,
  "activeContacts": 4500,
  "unsubscribed": 400,
  "bounced": 100,
  "avgEngagementRate": 3.2,
  "topTags": [
    { "tag": "engaged", "count": 1200 },
    { "tag": "instagram", "count": 3000 }
  ]
}
```

#### Get Campaigns
```http
GET /api/marketing-automation/integrations/:id/campaigns
```

## Workflow Triggers

Workflow triggers automatically execute marketing actions based on social media events.

### Supported Events

- `new_follower`: When someone follows your social account
- `post_published`: When a post is published
- `comment_received`: When someone comments on your post
- `dm_received`: When you receive a direct message
- `mention_detected`: When your brand is mentioned
- `engagement_threshold`: When engagement reaches a threshold
- `sentiment_change`: When sentiment changes significantly
- `campaign_completed`: When a social campaign completes

### Example Workflows

#### 1. New Follower Welcome Campaign
```javascript
{
  "event": "new_follower",
  "conditions": {
    "platform": ["instagram"]
  },
  "action": {
    "type": "add_to_list",
    "listId": "welcome-campaign-list",
    "tags": ["new-follower", "instagram"]
  }
}
```

#### 2. Engaged User Nurture
```javascript
{
  "event": "engagement_threshold",
  "conditions": {
    "engagementMin": 5
  },
  "action": {
    "type": "start_automation",
    "automationId": "engaged-user-nurture",
    "tags": ["highly-engaged"]
  }
}
```

#### 3. Negative Sentiment Alert
```javascript
{
  "event": "sentiment_change",
  "conditions": {
    "sentiment": ["negative"]
  },
  "action": {
    "type": "add_tag",
    "tags": ["needs-attention", "negative-sentiment"]
  }
}
```

## Usage Examples

### Sync Social Followers to Mailchimp

```typescript
// 1. Create integration
const integration = await marketingAutomationService.createIntegration(
  workspaceId,
  userId,
  {
    provider: 'mailchimp',
    name: 'Main Mailchimp',
    credentials: {
      apiKey: process.env.MAILCHIMP_API_KEY,
    },
  }
);

// 2. Create a list for social followers
const list = await marketingAutomationService.createList(
  integration.id,
  {
    name: 'Social Media Followers',
    description: 'Followers from all social platforms',
  }
);

// 3. Sync followers
const followers = await getSocialFollowers(socialAccountId);
const contacts = followers.map(follower => ({
  email: follower.email,
  firstName: follower.firstName,
  lastName: follower.lastName,
  listId: list.id,
  tags: ['social-follower', follower.platform],
  socialProfiles: [{
    platform: follower.platform,
    username: follower.username,
    url: follower.profileUrl,
    followers: follower.followerCount,
  }],
}));

await marketingAutomationService.batchSyncContacts(
  integration.id,
  contacts
);
```

### Set Up Automated Workflow

```typescript
// Create trigger for new followers
await marketingAutomationService.createWorkflowTrigger(
  workspaceId,
  integration.id,
  {
    name: 'New Follower Welcome',
    event: 'new_follower',
    conditions: {
      platform: ['instagram', 'facebook'],
    },
    action: {
      type: 'add_to_list',
      listId: welcomeListId,
      tags: ['new-follower', 'welcome-campaign'],
    },
    isActive: true,
  }
);

// When a new follower event occurs
await marketingAutomationService.executeWorkflowTrigger(
  workspaceId,
  'new_follower',
  {
    email: 'newfollower@example.com',
    platform: 'instagram',
    username: 'newfollower',
    timestamp: new Date(),
  }
);
```

### Track Social Engagement Events

```typescript
// Track when someone likes a post
await marketingAutomationService.trackEvent(
  integration.id,
  {
    email: 'user@example.com',
    eventName: 'post_liked',
    eventData: {
      postId: 'post123',
      platform: 'instagram',
      postType: 'image',
    },
  }
);

// Track when someone comments
await marketingAutomationService.trackEvent(
  integration.id,
  {
    email: 'user@example.com',
    eventName: 'post_commented',
    eventData: {
      postId: 'post123',
      platform: 'instagram',
      sentiment: 'positive',
    },
  }
);
```

## Configuration

### Environment Variables

```env
# Mailchimp
MAILCHIMP_API_KEY=your-mailchimp-api-key

# ActiveCampaign
ACTIVECAMPAIGN_API_KEY=your-activecampaign-api-key
ACTIVECAMPAIGN_API_URL=https://youraccountname.api-us1.com
```

### Database Migration

Run the Prisma migration to create the necessary tables:

```bash
npx prisma migrate dev --name add_marketing_automation
```

## Best Practices

1. **Rate Limiting**: Both Mailchimp and ActiveCampaign have rate limits. Use batch operations when syncing large numbers of contacts.

2. **Error Handling**: Always handle errors gracefully and log failures for retry.

3. **Data Privacy**: Ensure you have proper consent before syncing user data to marketing platforms.

4. **Webhook Security**: Validate webhook signatures when receiving events from marketing platforms.

5. **Testing**: Test workflows in a sandbox environment before deploying to production.

## Troubleshooting

### Connection Issues

If connection tests fail:
- Verify API credentials are correct
- Check that the API key has necessary permissions
- Ensure the server prefix (Mailchimp) or API URL (ActiveCampaign) is correct

### Sync Failures

If contacts fail to sync:
- Check that required fields (email) are provided
- Verify the list ID exists
- Check rate limits haven't been exceeded
- Review error messages in workflow execution logs

### Workflow Not Triggering

If workflows don't execute:
- Verify the trigger is active
- Check that conditions match the event data
- Review workflow execution logs for errors
- Ensure the integration is active and connected

## Security Considerations

- API keys are encrypted at rest in the database
- Use environment variables for sensitive credentials
- Implement proper access controls for integration management
- Audit all workflow executions
- Validate all input data before syncing

## Future Enhancements

- Support for additional platforms (HubSpot Marketing, Klaviyo, etc.)
- Advanced segmentation based on social engagement
- A/B testing integration
- Predictive lead scoring
- Custom field mapping UI
- Real-time sync via webhooks
