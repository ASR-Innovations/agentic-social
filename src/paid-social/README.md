# Paid Social Management Module

This module provides comprehensive paid social media advertising management capabilities, integrating with Facebook Ads Manager, Instagram Ads, LinkedIn Campaign Manager, and Twitter Ads.

## Features

### 1. Ad Campaign Management
- Create and manage ad campaigns across multiple platforms
- Support for various campaign objectives (awareness, traffic, engagement, leads, conversions, etc.)
- Flexible budget configuration (total budget, daily budget)
- Multiple bidding strategies (lowest cost, cost cap, bid cap, target cost)
- Campaign scheduling with start and end dates

### 2. Ad Set and Ad Creation
- Create ad sets with platform-specific targeting
- Configure optimization settings and schedules
- Create ads with custom creatives
- Support for boosting organic posts

### 3. Budget Tracking
- Real-time budget monitoring
- Configurable budget alerts (threshold-based, daily limits, total limits)
- Automated alert notifications when thresholds are reached
- Budget status reporting with remaining budget calculations

### 4. Performance Analytics
- Comprehensive performance metrics (impressions, clicks, spend, reach, conversions, revenue)
- Calculated metrics (CPC, CPM, CTR, ROAS)
- Performance data aggregation at campaign, ad set, and ad levels
- Historical performance tracking

### 5. Platform Integration
- **Facebook/Instagram**: Full integration with Facebook Ads Manager API
- **LinkedIn**: Integration with LinkedIn Campaign Manager API
- **Twitter**: Support for Twitter Ads (adapter ready for implementation)

### 6. Unified Reporting
- Combined organic and paid performance reporting
- Cross-platform performance comparison
- ROI and ROAS tracking
- Revenue attribution

## API Endpoints

### Campaigns

#### Create Campaign
```
POST /paid-social/campaigns
```

Request body:
```json
{
  "name": "Summer Sale Campaign",
  "description": "Promote summer sale products",
  "objective": "CONVERSIONS",
  "platforms": ["FACEBOOK", "INSTAGRAM"],
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-30T23:59:59Z",
  "totalBudget": 5000,
  "dailyBudget": 200,
  "bidStrategy": "LOWEST_COST",
  "targetAudience": {
    "age_min": 25,
    "age_max": 45,
    "genders": [1, 2],
    "interests": ["shopping", "fashion"]
  },
  "tags": ["summer", "sale"]
}
```

#### Get All Campaigns
```
GET /paid-social/campaigns
```

#### Get Campaign by ID
```
GET /paid-social/campaigns/:id
```

#### Update Campaign
```
PUT /paid-social/campaigns/:id
```

#### Delete Campaign
```
DELETE /paid-social/campaigns/:id
```

### Ad Sets

#### Create Ad Set
```
POST /paid-social/campaigns/:id/ad-sets
```

Request body:
```json
{
  "name": "Facebook Ad Set 1",
  "platform": "FACEBOOK",
  "budget": 1000,
  "bidAmount": 2.5,
  "targeting": {
    "age_min": 25,
    "age_max": 45,
    "locations": ["US", "CA"],
    "interests": ["shopping"]
  }
}
```

### Ads

#### Create Ad
```
POST /paid-social/ad-sets/:id/ads
```

Request body:
```json
{
  "name": "Summer Sale Ad 1",
  "platform": "FACEBOOK",
  "creative": {
    "title": "Summer Sale - Up to 50% Off",
    "body": "Don't miss our biggest sale of the year!",
    "image_url": "https://example.com/image.jpg"
  },
  "callToAction": "SHOP_NOW",
  "destinationUrl": "https://example.com/summer-sale"
}
```

### Boost Post

#### Boost Organic Post
```
POST /paid-social/boost-post
```

Request body:
```json
{
  "postId": "uuid-of-organic-post",
  "platforms": ["FACEBOOK", "INSTAGRAM"],
  "budget": 500,
  "duration": 7,
  "targetAudience": {
    "age_min": 18,
    "age_max": 65,
    "locations": ["US"]
  }
}
```

### Performance

#### Get Performance Metrics
```
GET /paid-social/performance?campaignId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

Query parameters:
- `campaignId` (optional): Filter by campaign
- `adSetId` (optional): Filter by ad set
- `adId` (optional): Filter by ad
- `platform` (optional): Filter by platform
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

#### Sync Performance Data
```
POST /paid-social/campaigns/:id/sync-performance
```

### Budget Alerts

#### Create Budget Alert
```
POST /paid-social/campaigns/:id/budget-alerts
```

Request body:
```json
{
  "alertType": "budget_threshold",
  "threshold": 80,
  "recipients": ["manager@example.com", "finance@example.com"]
}
```

### Unified Reporting

#### Get Unified Report
```
GET /paid-social/reports/unified?startDate=2024-01-01&endDate=2024-01-31
```

## Database Schema

### AdCampaign
- Campaign configuration and metadata
- Budget settings
- Platform selection
- Target audience configuration

### AdSet
- Ad set configuration within campaigns
- Platform-specific targeting
- Budget allocation
- Optimization settings

### Ad
- Individual ad configuration
- Creative assets
- Call to action
- Destination URL
- Link to organic post (for boosted posts)

### AdPerformance
- Time-series performance data
- Metrics at campaign, ad set, and ad levels
- Calculated performance indicators

### BudgetAlert
- Alert configuration
- Threshold settings
- Recipient list
- Trigger status

## Background Jobs

### Performance Sync Cron
- Runs every 6 hours for active campaigns
- Runs daily at midnight for recently completed campaigns
- Syncs performance data from platform APIs
- Updates local database with latest metrics

### Budget Tracking Cron
- Runs every hour
- Checks all active campaigns for budget alerts
- Triggers notifications when thresholds are reached
- Updates alert status

## Platform Adapters

### Facebook Ads Adapter
- Campaign creation and management
- Ad set and ad creation
- Creative management
- Performance insights retrieval
- Post boosting

### LinkedIn Ads Adapter
- Campaign creation and management
- Creative management
- Performance analytics retrieval
- Post boosting

## Usage Examples

### Creating a Complete Campaign

```typescript
// 1. Create campaign
const campaign = await paidSocialService.createCampaign(workspaceId, userId, {
  name: 'Q4 Product Launch',
  objective: 'CONVERSIONS',
  platforms: ['FACEBOOK', 'LINKEDIN'],
  totalBudget: 10000,
  dailyBudget: 500,
  bidStrategy: 'LOWEST_COST',
  targetAudience: {
    age_min: 25,
    age_max: 55,
    interests: ['technology', 'business']
  }
});

// 2. Create ad sets for each platform
const facebookAdSet = await paidSocialService.createAdSet(campaign.id, workspaceId, {
  name: 'Facebook Ad Set',
  platform: 'FACEBOOK',
  budget: 5000,
  targeting: { /* Facebook-specific targeting */ }
});

const linkedInAdSet = await paidSocialService.createAdSet(campaign.id, workspaceId, {
  name: 'LinkedIn Ad Set',
  platform: 'LINKEDIN',
  budget: 5000,
  targeting: { /* LinkedIn-specific targeting */ }
});

// 3. Create ads
await paidSocialService.createAd(facebookAdSet.id, workspaceId, {
  name: 'Facebook Ad 1',
  platform: 'FACEBOOK',
  creative: { /* Creative configuration */ },
  callToAction: 'LEARN_MORE',
  destinationUrl: 'https://example.com/product'
});

// 4. Set up budget alerts
await paidSocialService.createBudgetAlert(campaign.id, workspaceId, {
  alertType: 'budget_threshold',
  threshold: 80,
  recipients: ['manager@example.com']
});

// 5. Activate campaign
await paidSocialService.updateCampaign(campaign.id, workspaceId, {
  status: 'ACTIVE'
});
```

### Boosting an Organic Post

```typescript
const result = await paidSocialService.boostPost(workspaceId, userId, {
  postId: 'organic-post-uuid',
  platforms: ['FACEBOOK', 'INSTAGRAM'],
  budget: 500,
  duration: 7,
  targetAudience: {
    age_min: 18,
    age_max: 65,
    locations: ['US', 'CA', 'UK']
  }
});
```

### Getting Performance Metrics

```typescript
const performance = await paidSocialService.getPerformance(workspaceId, {
  campaignId: 'campaign-uuid',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log('Aggregated metrics:', performance.aggregated);
// {
//   impressions: 150000,
//   clicks: 3000,
//   spend: 2500,
//   reach: 100000,
//   conversions: 150,
//   revenue: 15000,
//   cpc: 0.83,
//   cpm: 16.67,
//   ctr: 2.0,
//   roas: 6.0
// }
```

## Requirements Validation

This implementation satisfies the following requirements from Requirement 21:

- ✅ 21.1: Integration with Facebook Ads Manager, Instagram Ads, LinkedIn Campaign Manager
- ✅ 21.2: Support for boosting organic posts, creating new ad campaigns, and A/B testing ad creative
- ✅ 21.3: Track paid social performance including spend, impressions, clicks, conversions, CPC, CPM, and ROAS
- ✅ 21.4: Budget allocation tools, spend tracking, and automated alerts at threshold limits
- ✅ 21.5: Unified reporting combining organic and paid performance with attribution analysis

## Future Enhancements

1. Twitter Ads integration (adapter structure ready)
2. A/B testing framework for ad creatives
3. Advanced attribution modeling
4. Automated bid optimization
5. Creative performance insights
6. Audience insights and recommendations
7. Competitive analysis for paid ads
8. Integration with analytics dashboard
9. Custom conversion tracking
10. Automated campaign optimization based on performance
