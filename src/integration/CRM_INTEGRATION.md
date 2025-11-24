# CRM Integration

## Overview

The CRM Integration module provides bidirectional synchronization between the social media management platform and popular CRM systems (Salesforce, HubSpot, Pipedrive). This enables automatic contact enrichment, lead attribution tracking, and seamless data flow between social interactions and CRM records.

## Supported CRM Providers

### 1. Salesforce
- Full bidirectional sync
- Contact and Lead management
- Custom field mapping
- OAuth 2.0 authentication
- Automatic token refresh

### 2. HubSpot
- Contact lifecycle management
- Lead scoring integration
- Native batch operations
- API key authentication
- Custom property support

### 3. Pipedrive
- Person and Lead management
- Deal pipeline integration
- Activity tracking
- API token authentication
- Notes-based enrichment

## Features

### Contact Synchronization
- **Automatic Sync**: Contacts are automatically created/updated in CRM when conversations occur
- **Batch Operations**: Bulk sync multiple contacts efficiently
- **Deduplication**: Email-based matching prevents duplicate records
- **Custom Fields**: Map social media data to CRM custom fields

### Lead Attribution
- **Multi-Touch Attribution**: Track all social touchpoints in the customer journey
- **Campaign Tracking**: Associate leads with specific social campaigns
- **Engagement Scoring**: Calculate engagement scores from social interactions
- **Conversion Tracking**: Link social interactions to conversions

### Contact Enrichment
- **Social Profiles**: Add social media profiles to CRM contacts
- **Engagement History**: Sync conversation history and sentiment
- **Follower Counts**: Track social media reach metrics
- **Real-time Updates**: Keep CRM data fresh with automatic updates

### Bidirectional Sync
- **CRM to Platform**: Pull contact updates from CRM
- **Platform to CRM**: Push social data to CRM
- **Scheduled Sync**: Automatic hourly and 6-hour sync jobs
- **Conflict Resolution**: Smart merging of data from both sources

## API Endpoints

### Create CRM Integration
```http
POST /api/crm/integrations
Authorization: Bearer <token>

{
  "provider": "salesforce",
  "name": "Main Salesforce Instance",
  "description": "Production Salesforce CRM",
  "credentials": {
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret",
    "accessToken": "your_access_token",
    "refreshToken": "your_refresh_token",
    "domain": "https://mycompany.salesforce.com"
  },
  "scopes": ["read_contacts", "write_leads"],
  "syncConfig": {
    "direction": "bidirectional",
    "syncInterval": 60,
    "autoSync": true,
    "contactFields": ["email", "firstName", "lastName", "company"],
    "leadFields": ["email", "source", "status"]
  }
}
```

### Sync Contact to CRM
```http
POST /api/crm/integrations/:id/contacts/sync
Authorization: Bearer <token>

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Inc",
  "phone": "+1234567890",
  "socialProfiles": [
    {
      "platform": "twitter",
      "username": "johndoe",
      "url": "https://twitter.com/johndoe",
      "followers": 5000,
      "engagement": 250
    }
  ],
  "customFields": {
    "industry": "Technology",
    "employee_count": "50-100"
  }
}
```

### Sync Lead to CRM
```http
POST /api/crm/integrations/:id/leads/sync
Authorization: Bearer <token>

{
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "company": "Tech Corp",
  "source": "twitter_dm",
  "status": "new",
  "socialContext": {
    "platform": "twitter",
    "conversationId": "conv-123",
    "sentiment": "positive",
    "engagementScore": 85
  }
}
```

### Get Contact from CRM
```http
GET /api/crm/integrations/:id/contacts?email=john@example.com
Authorization: Bearer <token>
```

### Enrich Contact with Social Data
```http
POST /api/crm/integrations/:id/contacts/enrich
Authorization: Bearer <token>

{
  "contactId": "contact-123",
  "provider": "salesforce",
  "includeSocialData": true,
  "includeEngagementHistory": true
}
```

### Track Lead Attribution
```http
POST /api/crm/integrations/:id/leads/attribution
Authorization: Bearer <token>

{
  "leadId": "lead-123",
  "source": "instagram",
  "campaign": "summer-sale-2024",
  "postId": "post-456",
  "conversationId": "conv-789",
  "touchpoints": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "platform": "instagram",
      "type": "post_view",
      "postId": "post-456"
    },
    {
      "timestamp": "2024-01-15T11:00:00Z",
      "platform": "instagram",
      "type": "dm",
      "conversationId": "conv-789"
    }
  ]
}
```

### Batch Sync Contacts
```http
POST /api/crm/integrations/:id/contacts/batch-sync
Authorization: Bearer <token>

[
  {
    "email": "contact1@example.com",
    "firstName": "Contact",
    "lastName": "One"
  },
  {
    "email": "contact2@example.com",
    "firstName": "Contact",
    "lastName": "Two"
  }
]
```

### Bidirectional Sync
```http
POST /api/crm/integrations/:id/sync-from-crm
Authorization: Bearer <token>
```

## Automatic Workflows

### 1. New Conversation → CRM Contact
When a new conversation is created:
1. Extract participant email and name
2. Check if contact exists in CRM
3. Create or update contact with social profile data
4. Link conversation to CRM contact

### 2. Message Sent → Engagement Update
When a message is sent or received:
1. Calculate engagement score
2. Update CRM contact with latest engagement data
3. Track interaction in CRM activity timeline

### 3. Post Engagement → Lead Attribution
When a user engages with a post:
1. Check if user is a lead in CRM
2. Track touchpoint (view, click, comment, share)
3. Update lead attribution data
4. Calculate multi-touch attribution score

### 4. Scheduled Sync Jobs
- **Hourly**: Sync all new contacts from conversations to CRM
- **Every 6 Hours**: Bidirectional sync to pull CRM updates

## Configuration

### Salesforce Setup
1. Create a Connected App in Salesforce
2. Enable OAuth 2.0
3. Set callback URL: `https://your-domain.com/api/integrations/oauth/callback`
4. Grant required permissions:
   - `api` - Access and manage data
   - `refresh_token` - Perform requests at any time
   - `offline_access` - Perform requests at any time

### HubSpot Setup
1. Create a Private App in HubSpot
2. Grant scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read`
3. Copy the access token

### Pipedrive Setup
1. Go to Settings → Personal Preferences → API
2. Generate API token
3. Note your company domain (e.g., `mycompany.pipedrive.com`)

## Custom Field Mapping

### Salesforce Custom Fields
```javascript
// Social media fields (create these in Salesforce)
twitter_username__c
twitter_url__c
twitter_followers__c
instagram_username__c
instagram_url__c
instagram_followers__c
linkedin_username__c
linkedin_url__c
social_engagement_score__c
social_touchpoints__c
```

### HubSpot Custom Properties
```javascript
// Create these in HubSpot
twitter_username
twitter_url
twitter_followers
instagram_username
instagram_url
instagram_followers
social_engagement_score
social_platform
social_sentiment
```

### Pipedrive Custom Fields
Pipedrive uses notes for social data by default, but you can create custom fields:
- Social Engagement Score (Number)
- Primary Social Platform (Text)
- Social Profile URL (Text)

## Error Handling

### Connection Failures
- Automatic retry with exponential backoff
- Token refresh for expired credentials
- Detailed error logging
- User notifications for persistent failures

### Data Conflicts
- Email-based deduplication
- Last-write-wins for conflicts
- Audit trail of all changes
- Manual conflict resolution UI

### Rate Limiting
- Respect CRM API rate limits
- Queue-based request throttling
- Batch operations where supported
- Automatic retry after rate limit reset

## Best Practices

### 1. Field Mapping
- Map only essential fields to reduce API calls
- Use custom fields for social-specific data
- Maintain consistent naming conventions
- Document field mappings for team

### 2. Sync Frequency
- Hourly sync for most use cases
- Real-time sync for high-priority contacts
- Bidirectional sync every 6 hours
- Adjust based on CRM API limits

### 3. Data Quality
- Validate email addresses before sync
- Normalize phone numbers
- Clean up duplicate records regularly
- Monitor sync success rates

### 4. Security
- Store credentials encrypted
- Use OAuth 2.0 where available
- Rotate API keys regularly
- Audit access logs

## Monitoring

### Metrics to Track
- Contacts synced per hour
- Sync success rate
- API error rate
- Average sync latency
- CRM API quota usage

### Alerts
- Failed sync jobs
- API authentication errors
- Rate limit warnings
- Data quality issues

## Troubleshooting

### Common Issues

**Issue**: Contacts not syncing
- Check CRM credentials are valid
- Verify API permissions
- Check sync configuration
- Review error logs

**Issue**: Duplicate contacts created
- Ensure email matching is enabled
- Check deduplication rules
- Review CRM duplicate detection settings

**Issue**: Missing custom fields
- Verify custom fields exist in CRM
- Check field API names match
- Ensure proper permissions

**Issue**: Rate limit errors
- Reduce sync frequency
- Enable batch operations
- Increase API quota with CRM provider

## Examples

### Complete Integration Flow
```typescript
// 1. Create CRM integration
const integration = await crmService.createIntegration(workspaceId, userId, {
  provider: CRMProvider.SALESFORCE,
  name: 'Production Salesforce',
  credentials: {
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    accessToken: oauthTokens.access_token,
    refreshToken: oauthTokens.refresh_token,
  },
});

// 2. Sync a contact
const result = await crmService.syncContact(integration.id, {
  email: 'customer@example.com',
  firstName: 'Jane',
  lastName: 'Customer',
  socialProfiles: [{
    platform: 'twitter',
    username: 'janecustomer',
    url: 'https://twitter.com/janecustomer',
    followers: 1500,
  }],
});

// 3. Track lead attribution
await crmService.trackLeadAttribution(integration.id, {
  leadId: result.recordId,
  source: 'twitter',
  campaign: 'product-launch',
  postId: 'post-123',
  touchpoints: [
    { timestamp: new Date(), platform: 'twitter', type: 'view' },
    { timestamp: new Date(), platform: 'twitter', type: 'click' },
  ],
});

// 4. Enrich with engagement data
await crmService.enrichContact(integration.id, {
  contactId: result.recordId,
  provider: CRMProvider.SALESFORCE,
  includeSocialData: true,
  includeEngagementHistory: true,
});
```

## Roadmap

### Planned Features
- [ ] Zoho CRM integration
- [ ] Microsoft Dynamics 365 integration
- [ ] Custom field mapping UI
- [ ] Advanced conflict resolution
- [ ] Real-time webhooks from CRM
- [ ] AI-powered lead scoring
- [ ] Predictive contact enrichment
- [ ] Multi-CRM sync (sync to multiple CRMs)

## Support

For issues or questions:
- Check the troubleshooting guide above
- Review error logs in the integration dashboard
- Contact support with integration ID and error details
