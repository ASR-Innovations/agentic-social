# Employee Advocacy Platform

The Employee Advocacy Platform enables organizations to amplify their brand reach by empowering employees to share approved content through their personal social media accounts. This module includes gamification, content suggestions, compliance controls, and comprehensive tracking.

## Features

### 1. Content Library for Employee Sharing
- Admins curate approved content for employee distribution
- Content categorization and tagging
- Platform-specific content targeting
- Expiration dates for time-sensitive content
- Media asset management

### 2. One-Click Sharing
- Simple sharing interface for employees
- Platform selection (LinkedIn, Twitter, Facebook, etc.)
- Optional content modification (if allowed)
- Automatic compliance disclaimer injection
- Share tracking and status monitoring

### 3. Employee Engagement Tracking
- Individual share metrics (reach, likes, comments, shares)
- Aggregate employee performance statistics
- Content performance analytics
- Platform-specific engagement data
- Historical tracking and trends

### 4. Gamification System
- **Points System**: Earn points for shares, reach, and engagement
- **Levels**: Progress through levels based on total points
- **Badges**: 12 different achievement badges including:
  - First Share 🎉
  - 10/50/100 Shares 🔟⭐💯
  - 1K/10K/100K Reach 📢📣🚀
  - Engagement Master 💪
  - Consistent Sharer 📅
  - Top Performer 🏆
  - Influencer 🌟
  - Brand Ambassador 👑
- **Leaderboards**: Daily, weekly, monthly, quarterly, yearly, and all-time rankings

### 5. AI-Powered Content Suggestions
- Personalized content recommendations based on:
  - Employee interests
  - Preferred platforms
  - Past sharing behavior
  - Content popularity
  - Recency
- Relevance scoring algorithm
- Suggestion tracking (viewed, shared, dismissed)

### 6. Compliance Controls
- Content approval workflow
- Modification restrictions
- Mandatory disclaimers
- Audit trail for all shares
- Platform policy compliance

## API Endpoints

### Employee Profiles
- `POST /employee-advocacy/profiles` - Create employee profile
- `GET /employee-advocacy/profiles` - List all profiles
- `GET /employee-advocacy/profiles/me` - Get current user profile
- `GET /employee-advocacy/profiles/:id` - Get profile by ID
- `PUT /employee-advocacy/profiles/:id` - Update profile
- `POST /employee-advocacy/profiles/:id/activate` - Activate profile
- `POST /employee-advocacy/profiles/:id/deactivate` - Deactivate profile

### Content Management
- `POST /employee-advocacy/content` - Create content
- `GET /employee-advocacy/content` - List all content
- `GET /employee-advocacy/content/approved` - List approved content
- `GET /employee-advocacy/content/:id` - Get content by ID
- `PUT /employee-advocacy/content/:id` - Update content
- `POST /employee-advocacy/content/:id/approve` - Approve/reject content
- `DELETE /employee-advocacy/content/:id` - Delete content
- `GET /employee-advocacy/content/meta/categories` - Get categories
- `GET /employee-advocacy/content/meta/tags` - Get tags

### Sharing
- `POST /employee-advocacy/shares` - Share content
- `GET /employee-advocacy/shares` - List all shares
- `GET /employee-advocacy/shares/me` - Get current user shares
- `GET /employee-advocacy/shares/:id` - Get share by ID

### Gamification
- `GET /employee-advocacy/badges/me` - Get current user badges
- `GET /employee-advocacy/badges/progress` - Get badge progress

### Leaderboards
- `GET /employee-advocacy/leaderboard/:period` - Get leaderboard
- `GET /employee-advocacy/leaderboard/:period/me` - Get current user rank
- `GET /employee-advocacy/leaderboard/:period/top` - Get top performers

### Content Suggestions
- `POST /employee-advocacy/suggestions/generate` - Generate suggestions
- `GET /employee-advocacy/suggestions` - Get suggestions
- `POST /employee-advocacy/suggestions/:id/viewed` - Mark as viewed
- `POST /employee-advocacy/suggestions/:id/dismissed` - Dismiss suggestion

### Settings
- `GET /employee-advocacy/settings` - Get settings
- `PUT /employee-advocacy/settings` - Update settings

## Database Schema

### EmployeeProfile
- Employee information and preferences
- Gamification stats (points, level, badges)
- Engagement metrics (shares, reach, engagement)
- Personal social account connections

### AdvocacyContent
- Content library for sharing
- Approval status and workflow
- Platform targeting
- Compliance settings
- Performance metrics

### EmployeeShare
- Share records with platform details
- Engagement metrics per share
- Points earned
- Status tracking

### EmployeeBadge
- Badge achievements
- Earned dates
- Achievement criteria

### AdvocacyLeaderboard
- Period-based rankings
- Performance metrics
- Historical leaderboards

### ContentSuggestion
- AI-generated suggestions
- Relevance scores
- Status tracking

### AdvocacySettings
- Workspace-level configuration
- Gamification settings
- Notification preferences
- Compliance rules

## Usage Examples

### Creating Employee Profile
```typescript
POST /employee-advocacy/profiles
{
  "userId": "user-123",
  "displayName": "John Doe",
  "interests": ["technology", "marketing", "AI"],
  "preferredPlatforms": ["linkedin", "twitter"]
}
```

### Creating Advocacy Content
```typescript
POST /employee-advocacy/content
{
  "title": "New Product Launch",
  "content": "Excited to announce our new AI-powered platform! 🚀",
  "targetPlatforms": ["linkedin", "twitter", "facebook"],
  "category": "product",
  "tags": ["product-launch", "AI", "innovation"],
  "hashtags": ["#AI", "#Innovation", "#TechNews"],
  "allowModification": false,
  "requiredDisclaimer": "Views are my own"
}
```

### Sharing Content
```typescript
POST /employee-advocacy/shares
{
  "contentId": "content-123",
  "platform": "linkedin"
}
```

### Updating Share Metrics
```typescript
// Called by background job after fetching platform metrics
await employeeShareService.updateMetrics(shareId, {
  reach: 1500,
  likes: 45,
  comments: 12,
  shares: 8,
  clicks: 23
});
```

### Generating Content Suggestions
```typescript
POST /employee-advocacy/suggestions/generate
// Returns personalized content suggestions based on employee profile
```

## Gamification Logic

### Points Calculation
- **Base Share**: 10 points (configurable)
- **Reach**: 0.01 points per person reached (configurable)
- **Engagement**: 0.1 points per engagement (like, comment, share) (configurable)

### Level Progression
- Level = floor(totalPoints / 1000) + 1
- Every 1000 points = 1 level up

### Badge Criteria
Badges are automatically awarded when criteria are met:
- **First Share**: Share 1 piece of content
- **10/50/100 Shares**: Reach share milestones
- **1K/10K/100K Reach**: Reach audience milestones
- **Engagement Master**: Generate 1,000+ total engagements
- **Consistent Sharer**: Share for 7 consecutive days
- **Influencer**: Average 1,000+ reach per share
- **Brand Ambassador**: Reach level 10

## Compliance Features

### Content Approval Workflow
1. Admin creates content
2. Content marked as pending approval
3. Approver reviews and approves/rejects
4. Only approved content visible to employees

### Modification Controls
- `allowModification: false` - Employees must share as-is
- `allowModification: true` - Employees can customize message

### Mandatory Disclaimers
- Automatically appended to all shares
- Ensures compliance with platform policies
- Customizable per workspace

### Audit Trail
- All shares tracked with timestamps
- Employee attribution
- Platform and content details
- Engagement metrics history

## Integration Points

### Social Platform Integration
- Requires social account connections
- Platform-specific API calls for posting
- Metrics collection from platform APIs

### AI Integration
- Content suggestion engine
- Relevance scoring
- Interest matching

### Notification System
- New content alerts
- Badge earned notifications
- Leaderboard updates
- Suggestion notifications

## Configuration

### Workspace Settings
```typescript
{
  "pointsPerShare": 10,
  "pointsPerReach": 0.01,
  "pointsPerEngagement": 0.1,
  "enableLeaderboard": true,
  "leaderboardPeriods": ["WEEKLY", "MONTHLY", "ALL_TIME"],
  "notifyOnNewContent": true,
  "notifyOnBadgeEarned": true,
  "notifyOnLeaderboard": true,
  "requireApproval": true,
  "allowContentModification": false,
  "mandatoryDisclaimer": "Views are my own",
  "enableAISuggestions": true,
  "suggestionFrequency": "DAILY"
}
```

## Requirements Validation

This implementation satisfies all requirements from Requirement 14:

✅ **14.1**: Content library with admin curation and one-click distribution
✅ **14.2**: Individual engagement metrics, reach amplification, and participation tracking
✅ **14.3**: Gamification with leaderboards, points, badges, and rewards
✅ **14.4**: AI-powered content suggestions based on interests and network
✅ **14.5**: Compliance controls preventing modification and tracking all shares

## Future Enhancements

- Mobile app support for on-the-go sharing
- Advanced analytics dashboard
- Team-based competitions
- Rewards marketplace
- Integration with HR systems
- Advanced AI personalization
- Multi-language support
- Custom badge creation
