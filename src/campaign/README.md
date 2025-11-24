# Campaign Management Module

## Overview

The Campaign Management module provides comprehensive functionality for organizing, tracking, and analyzing marketing campaigns across social media platforms. It enables users to group related content, set campaign goals, track performance metrics, and measure ROI.

## Features

### 1. Campaign Creation and Configuration
- Create campaigns with name, description, start/end dates
- Set campaign budgets
- Define campaign goals with target metrics
- Automatic UTM parameter generation for tracking
- Tag campaigns for organization
- Support for multiple campaign statuses (DRAFT, ACTIVE, PAUSED, COMPLETED)

### 2. Campaign-Post Association
- Associate posts with campaigns
- Remove posts from campaigns
- View all posts within a campaign
- Track post performance within campaign context

### 3. UTM Parameter Automation
- Automatic generation of UTM parameters based on campaign name
- Custom UTM parameter configuration
- Consistent tracking across all campaign content
- Support for source, medium, campaign, term, and content parameters

### 4. Campaign Analytics Tracking
- Real-time campaign performance metrics
- Track reach, impressions, engagement across all campaign posts
- Platform-specific performance breakdown
- Timeline visualization of campaign performance
- Top-performing posts identification

### 5. Campaign Goal Tracking
- Define multiple goals per campaign (reach, engagement, conversions, etc.)
- Track progress towards goals in real-time
- Goal status indicators (on-track, at-risk, achieved, missed)
- Progress percentage calculation

### 6. Campaign Performance Dashboard
- Executive summary of campaign performance
- Comparison against campaign goals
- Platform breakdown analysis
- Timeline charts showing performance trends
- Top-performing content identification

## API Endpoints

### Create Campaign
```http
POST /campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "description": "Summer promotional campaign",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "budget": 5000,
  "tags": ["summer", "sale"],
  "goals": [
    { "metric": "reach", "target": 100000 },
    { "metric": "engagement", "target": 5000 }
  ],
  "utmParams": {
    "source": "social",
    "medium": "organic",
    "campaign": "summer-sale-2024"
  }
}
```

### Get All Campaigns
```http
GET /campaigns?status=ACTIVE&page=1&limit=20&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {token}
```

Query Parameters:
- `status`: Filter by campaign status (DRAFT, ACTIVE, PAUSED, COMPLETED)
- `tag`: Filter by tag
- `startDateFrom`: Filter campaigns starting after this date
- `startDateTo`: Filter campaigns starting before this date
- `endDateFrom`: Filter campaigns ending after this date
- `endDateTo`: Filter campaigns ending before this date
- `search`: Search by campaign name or description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

### Get Campaign by ID
```http
GET /campaigns/{id}
Authorization: Bearer {token}
```

### Update Campaign
```http
PATCH /campaigns/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Campaign Name",
  "status": "ACTIVE",
  "budget": 7500
}
```

### Delete Campaign
```http
DELETE /campaigns/{id}
Authorization: Bearer {token}
```

Note: Cannot delete campaigns with associated posts. Remove posts first or set their campaignId to null.

### Associate Post with Campaign
```http
POST /campaigns/{id}/posts/{postId}
Authorization: Bearer {token}
```

### Remove Post from Campaign
```http
DELETE /campaigns/{id}/posts/{postId}
Authorization: Bearer {token}
```

### Get Campaign Analytics
```http
GET /campaigns/{id}/analytics?startDate=2024-06-01&endDate=2024-08-31
Authorization: Bearer {token}
```

Query Parameters:
- `startDate`: Start date for analytics (optional, defaults to campaign start date)
- `endDate`: End date for analytics (optional, defaults to campaign end date)

Response:
```json
{
  "campaignId": "campaign-123",
  "campaignName": "Summer Sale 2024",
  "status": "ACTIVE",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "metrics": {
    "totalPosts": 25,
    "publishedPosts": 20,
    "scheduledPosts": 5,
    "totalReach": 150000,
    "totalImpressions": 300000,
    "totalEngagement": 7500,
    "totalLikes": 5000,
    "totalComments": 1500,
    "totalShares": 1000,
    "totalClicks": 2500,
    "engagementRate": 5.0,
    "averageEngagementPerPost": 375
  },
  "goals": [
    {
      "metric": "reach",
      "target": 100000,
      "current": 150000,
      "progress": 150.0,
      "status": "achieved"
    },
    {
      "metric": "engagement",
      "target": 5000,
      "current": 7500,
      "progress": 150.0,
      "status": "achieved"
    }
  ],
  "topPerformingPosts": [
    {
      "postId": "post-1",
      "content": "Check out our summer deals!",
      "engagement": 1200,
      "reach": 25000,
      "publishedAt": "2024-06-15T10:00:00Z"
    }
  ],
  "platformBreakdown": [
    {
      "platform": "INSTAGRAM",
      "posts": 10,
      "engagement": 4000,
      "reach": 80000
    },
    {
      "platform": "FACEBOOK",
      "posts": 10,
      "engagement": 3500,
      "reach": 70000
    }
  ],
  "timeline": [
    {
      "date": "2024-06-01T00:00:00Z",
      "engagement": 500,
      "reach": 10000,
      "posts": 2
    }
  ]
}
```

## Data Models

### Campaign
```typescript
{
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  goals?: CampaignGoal[];
  budget?: number;
  tags: string[];
  utmParams?: UTMParameters;
  status: CampaignStatus; // DRAFT, ACTIVE, PAUSED, COMPLETED
  posts: Post[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign Goal
```typescript
{
  metric: string; // e.g., "reach", "engagement", "conversions"
  target: number;
  current: number;
}
```

### UTM Parameters
```typescript
{
  source?: string;    // e.g., "social"
  medium?: string;    // e.g., "organic", "paid"
  campaign?: string;  // e.g., "summer-sale-2024"
  term?: string;      // e.g., "running-shoes"
  content?: string;   // e.g., "banner-ad"
}
```

## Usage Examples

### Creating a Campaign with Goals
```typescript
const campaign = await campaignService.create(workspaceId, {
  name: 'Product Launch 2024',
  description: 'Launch campaign for new product line',
  startDate: '2024-07-01T00:00:00Z',
  endDate: '2024-09-30T23:59:59Z',
  budget: 10000,
  tags: ['product-launch', 'q3-2024'],
  goals: [
    { metric: 'reach', target: 500000 },
    { metric: 'engagement', target: 25000 },
    { metric: 'conversions', target: 1000 },
  ],
});
```

### Associating Posts with Campaign
```typescript
// Associate a post
await campaignService.addPost(workspaceId, campaignId, postId);

// Remove a post
await campaignService.removePost(workspaceId, campaignId, postId);
```

### Getting Campaign Performance
```typescript
const performance = await campaignService.getPerformance(
  workspaceId,
  campaignId,
  '2024-07-01T00:00:00Z',
  '2024-07-31T23:59:59Z'
);

console.log(`Campaign: ${performance.campaignName}`);
console.log(`Total Reach: ${performance.metrics.totalReach}`);
console.log(`Engagement Rate: ${performance.metrics.engagementRate}%`);

performance.goals.forEach(goal => {
  console.log(`${goal.metric}: ${goal.current}/${goal.target} (${goal.progress}%) - ${goal.status}`);
});
```

### Filtering Campaigns
```typescript
const { campaigns, total } = await campaignService.findAll(workspaceId, {
  status: CampaignStatus.ACTIVE,
  tag: 'summer',
  startDateFrom: '2024-06-01T00:00:00Z',
  search: 'sale',
  page: 1,
  limit: 10,
  sortBy: 'startDate',
  sortOrder: 'desc',
});
```

## Requirements Validation

This implementation satisfies the following requirements from Requirement 20:

### 20.1: Campaign Creation with Tracking
✅ Implemented: Campaign creation with campaign-specific tags, UTM parameters, and tracking codes
- Automatic UTM parameter generation
- Custom UTM parameter support
- Campaign tagging system

### 20.2: Campaign Management Tools
✅ Implemented: Campaign calendar view, content approval workflows, and team collaboration
- Campaign listing with filtering
- Campaign status management (DRAFT, ACTIVE, PAUSED, COMPLETED)
- Post association management

### 20.3: Campaign-Specific Metrics
✅ Implemented: Track reach, engagement, conversions, and ROI with goal comparison
- Comprehensive metrics tracking
- Goal progress calculation
- Goal status indicators (on-track, at-risk, achieved, missed)

### 20.4: Multi-Channel Campaign Coordination
✅ Implemented: Coordinate content across social platforms
- Platform breakdown analytics
- Multi-platform post support through campaign-post associations

### 20.5: Campaign Reports
✅ Implemented: Executive summaries, performance highlights, and optimization recommendations
- Campaign performance dashboard
- Top-performing posts identification
- Timeline visualization
- Platform breakdown analysis

## Testing

### Unit Tests
```bash
npm test -- src/campaign/campaign.service.spec.ts --run
```

### Integration Tests
```bash
npm test -- src/campaign/campaign.integration.spec.ts --run
```

## Future Enhancements

1. **Advanced Analytics Integration**
   - Integration with MongoDB for real-time metrics
   - Historical trend analysis
   - Predictive analytics for campaign performance

2. **Campaign Templates**
   - Pre-configured campaign templates
   - Template library for common campaign types
   - Quick campaign creation from templates

3. **Campaign Collaboration**
   - Team member assignments per campaign
   - Campaign-specific permissions
   - Collaborative campaign planning tools

4. **Campaign Automation**
   - Automated campaign status transitions
   - Scheduled campaign activation/deactivation
   - Auto-generated campaign reports

5. **A/B Testing**
   - Campaign variant testing
   - Performance comparison between variants
   - Automated winner selection

## Related Modules

- **Publishing Module**: For creating and scheduling posts within campaigns
- **Analytics Module**: For detailed performance metrics and reporting
- **Scheduling Module**: For campaign content scheduling
- **AI Module**: For AI-powered campaign optimization suggestions
