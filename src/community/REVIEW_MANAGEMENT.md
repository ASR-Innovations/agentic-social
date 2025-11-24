# Review Management System

## Overview

The Review Management system provides comprehensive tools for aggregating, analyzing, and responding to customer reviews across multiple platforms. It includes sentiment analysis, reputation scoring, automated alerts, and response management capabilities.

## Features

### 1. Review Aggregation
- **Multi-Platform Support**: Google My Business, Facebook, Yelp, TripAdvisor, Trustpilot, Amazon, App Store, Google Play
- **Automatic Sync**: Configurable sync frequency for each platform
- **Deduplication**: Prevents duplicate reviews using platform-specific IDs
- **Location Support**: Multi-location business support

### 2. Sentiment Analysis
- **Automatic Analysis**: AI-powered sentiment detection for all reviews
- **Sentiment Scoring**: -1 to 1 scale for granular sentiment measurement
- **Topic Extraction**: Identifies key topics mentioned in reviews (service, quality, price, etc.)
- **Keyword Extraction**: Extracts meaningful keywords from review content
- **Trend Analysis**: Tracks sentiment changes over time

### 3. Reputation Scoring
- **Overall Score**: 0-100 composite reputation score
- **Weighted Algorithm**: 
  - 40% Average Rating
  - 30% Positive Sentiment Percentage
  - 20% Response Rate
  - 10% Response Time
- **Trend Tracking**: Monitors rating trends, volume trends, and sentiment shifts
- **Benchmarking**: Compare against industry averages and competitors
- **Historical Data**: Daily reputation scores for trend analysis

### 4. Review Alerts
- **Negative Review Alerts**: Immediate notification for low-rated reviews
- **Rating Drop Detection**: Alerts when average rating drops significantly
- **Review Spike Detection**: Identifies unusual review volume
- **Sentiment Shift Alerts**: Detects sudden changes in sentiment
- **Competitor Mentions**: Flags reviews mentioning competitors
- **Urgent Issues**: Identifies critical issues requiring immediate attention
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Multi-Channel Notifications**: Email, SMS, Slack, Push notifications

### 5. Response Management
- **Template System**: Pre-built response templates for different scenarios
- **Variable Substitution**: Dynamic content with {{reviewer_name}}, {{rating}}, etc.
- **Approval Workflow**: Optional approval process before publishing
- **Response Tracking**: Monitor response rates and times
- **Platform Publishing**: Direct publishing to review platforms
- **Draft Management**: Save and edit responses before publishing

### 6. Review Templates
- **Categorized Templates**: Thank You, Apology, Clarification, Resolution, Follow-Up, General
- **Sentiment-Based**: Templates matched to review sentiment
- **Rating Range Filtering**: Templates for specific rating ranges (1-2, 3, 4-5)
- **Usage Tracking**: Monitor template effectiveness
- **Suggested Templates**: AI-powered template suggestions based on review content

### 7. Analytics Dashboard
- **Overview Metrics**: Total reviews, average rating, sentiment breakdown
- **Rating Distribution**: Visual breakdown of 1-5 star ratings
- **Sentiment Trends**: Track sentiment changes over time
- **Top Topics**: Most mentioned topics (positive and negative)
- **Platform Breakdown**: Performance by platform
- **Response Metrics**: Response rate and average response time
- **Volume Trends**: Review volume over time
- **Period Comparison**: Compare current vs previous period

## API Endpoints

### Review Management

```typescript
// Create a review
POST /reviews
Body: CreateReviewDto

// Get all reviews with filters
GET /reviews?platform=GOOGLE_MY_BUSINESS&sentiment=NEGATIVE&page=1&limit=20

// Get review statistics
GET /reviews/statistics?platform=GOOGLE_MY_BUSINESS&startDate=2024-01-01&endDate=2024-12-31

// Get single review
GET /reviews/:id

// Update review
PUT /reviews/:id
Body: UpdateReviewDto

// Delete review
DELETE /reviews/:id

// Bulk update reviews
POST /reviews/bulk-update
Body: { reviewIds: string[], updates: UpdateReviewDto }
```

### Review Responses

```typescript
// Create response
POST /reviews/responses
Body: CreateReviewResponseDto

// Publish response
POST /reviews/responses/:id/publish

// Approve response
POST /reviews/responses/:id/approve

// Get responses for review
GET /reviews/:reviewId/responses
```

### Review Templates

```typescript
// Create template
POST /reviews/templates
Body: CreateReviewTemplateDto

// Get all templates
GET /reviews/templates?category=THANK_YOU&sentiment=POSITIVE

// Get single template
GET /reviews/templates/:id

// Update template
PUT /reviews/templates/:id
Body: UpdateReviewTemplateDto

// Delete template
DELETE /reviews/templates/:id

// Get suggested templates for review
GET /reviews/:reviewId/suggested-templates

// Generate response from template
POST /reviews/templates/generate-from-template
Body: { templateId: string, reviewId: string, variables?: Record<string, string> }
```

### Reputation & Analytics

```typescript
// Get current reputation score
GET /reviews/reputation/current?platform=GOOGLE_MY_BUSINESS

// Get reputation trends
GET /reviews/reputation/trends?startDate=2024-01-01&endDate=2024-12-31

// Get analytics dashboard
GET /reviews/analytics/dashboard?platform=GOOGLE_MY_BUSINESS&startDate=2024-01-01

// Get volume trends
GET /reviews/analytics/volume-trends?days=30

// Get period comparison
GET /reviews/analytics/comparison?days=30
```

### Alerts

```typescript
// Get active alerts
GET /reviews/alerts/active

// Acknowledge alert
POST /reviews/alerts/:id/acknowledge

// Resolve alert
POST /reviews/alerts/:id/resolve

// Run alert checks
POST /reviews/alerts/run-checks
```

## Data Models

### Review
```typescript
{
  id: string;
  workspaceId: string;
  platform: ReviewPlatform;
  platformReviewId: string;
  locationId?: string;
  locationName?: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerProfile?: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore?: number; // -1 to 1
  topics: string[];
  keywords: string[];
  hasResponse: boolean;
  responseText?: string;
  responseDate?: Date;
  respondedBy?: string;
  status: ReviewStatus;
  priority: Priority;
  assignedTo?: string;
  isVerified: boolean;
  isFlagged: boolean;
  flagReason?: string;
  tags: string[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### ReputationScore
```typescript
{
  id: string;
  workspaceId: string;
  date: Date;
  platform?: ReviewPlatform;
  locationId?: string;
  overallScore: number; // 0-100
  averageRating: number;
  totalReviews: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercentage: number;
  responseRate: number;
  avgResponseTime: number; // hours
  ratingTrend: number;
  reviewVolumeTrend: number;
  sentimentTrend: number;
  topPositiveTopics: string[];
  topNegativeTopics: string[];
  commonKeywords: string[];
  industryAverage?: number;
  competitorAverage?: number;
}
```

### ReviewAlert
```typescript
{
  id: string;
  workspaceId: string;
  reviewId?: string;
  type: ReviewAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedReviews?: number;
  ratingDrop?: number;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notificationsSent: string[];
  recipients: string[];
  createdAt: Date;
}
```

## Usage Examples

### 1. Fetching Reviews with Filters

```typescript
const response = await fetch('/reviews?platform=GOOGLE_MY_BUSINESS&sentiment=NEGATIVE&minRating=1&maxRating=2&page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data, meta } = await response.json();
// data: Review[]
// meta: { total, page, limit, totalPages }
```

### 2. Creating a Response from Template

```typescript
// Get suggested templates
const templates = await fetch(`/reviews/${reviewId}/suggested-templates`);
const suggestedTemplates = await templates.json();

// Generate response from template
const response = await fetch('/reviews/templates/generate-from-template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    templateId: suggestedTemplates[0].id,
    reviewId: reviewId,
    variables: {
      contact_email: 'support@example.com',
      contact_phone: '1-800-123-4567'
    }
  })
});

const { content, templateId } = await response.json();

// Create and publish response
await fetch('/reviews/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    reviewId: reviewId,
    content: content,
    templateId: templateId,
    publishImmediately: true
  })
});
```

### 3. Monitoring Reputation Score

```typescript
// Get current reputation
const current = await fetch('/reviews/reputation/current?platform=GOOGLE_MY_BUSINESS');
const reputation = await current.json();

console.log(`Overall Score: ${reputation.overallScore}/100`);
console.log(`Average Rating: ${reputation.averageRating}/5`);
console.log(`Response Rate: ${reputation.responseRate}%`);
console.log(`Avg Response Time: ${reputation.avgResponseTime} hours`);

// Get trends
const trends = await fetch('/reviews/reputation/trends?startDate=2024-01-01&endDate=2024-12-31');
const trendData = await trends.json();

// Plot trends over time
trendData.forEach(day => {
  console.log(`${day.date}: ${day.overallScore}/100`);
});
```

### 4. Handling Alerts

```typescript
// Get active alerts
const alerts = await fetch('/reviews/alerts/active');
const activeAlerts = await alerts.json();

// Process critical alerts
const criticalAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL');

for (const alert of criticalAlerts) {
  console.log(`CRITICAL: ${alert.title}`);
  console.log(alert.description);
  
  // Acknowledge alert
  await fetch(`/reviews/alerts/${alert.id}/acknowledge`, {
    method: 'POST'
  });
  
  // Handle the alert...
  
  // Resolve alert
  await fetch(`/reviews/alerts/${alert.id}/resolve`, {
    method: 'POST'
  });
}
```

## Best Practices

### 1. Response Time
- Respond to negative reviews within 24 hours
- Respond to positive reviews within 48 hours
- Use templates for faster responses
- Personalize template responses with reviewer name

### 2. Sentiment Analysis
- Run sentiment analysis immediately after fetching new reviews
- Use sentiment scores to prioritize responses
- Track sentiment trends to identify issues early

### 3. Alert Management
- Configure alert thresholds based on your business needs
- Set up multi-channel notifications for critical alerts
- Review and acknowledge alerts promptly
- Use alert data to improve products/services

### 4. Template Management
- Create templates for common scenarios
- Keep templates professional and empathetic
- Use variables for personalization
- Track template effectiveness and update accordingly

### 5. Reputation Monitoring
- Calculate reputation scores daily
- Monitor trends weekly
- Compare against competitors and industry benchmarks
- Use insights to drive business improvements

## Integration with Other Modules

### Community Module
- Reviews are part of the broader community management system
- Integrates with unified inbox for centralized management
- Shares sentiment analysis capabilities with social listening

### Analytics Module
- Review metrics feed into overall analytics dashboard
- Reputation scores contribute to business intelligence
- Trend data used for predictive analytics

### AI Module
- Sentiment analysis powered by AI services
- Template suggestions use AI for content matching
- Future: AI-powered response generation

## Future Enhancements

1. **AI-Powered Response Generation**: Automatically generate personalized responses
2. **Review Solicitation**: Automated review request campaigns
3. **Competitor Analysis**: Track and compare competitor reviews
4. **Review Widgets**: Embeddable review widgets for websites
5. **Review Insights**: AI-powered insights from review content
6. **Multi-Language Support**: Automatic translation of reviews and responses
7. **Video/Photo Reviews**: Support for multimedia reviews
8. **Review Verification**: Enhanced verification of authentic reviews
9. **Sentiment Prediction**: Predict future sentiment trends
10. **Custom Workflows**: Configurable review management workflows
