# Database Schema Reference

Quick reference guide for the database schema of the AI Social Media Management Platform.

## PostgreSQL Tables

### Users & Authentication

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| password | String | Hashed password (bcrypt) |
| name | String | User's full name |
| avatar | String? | Profile picture URL |
| role | Enum | OWNER, ADMIN, MANAGER, EDITOR, VIEWER |
| isActive | Boolean | Account status |
| workspaceId | UUID | Foreign key to workspace |
| preferences | JSON | User preferences |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: email, workspaceId, (workspaceId, role), isActive

#### `user_permissions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to user |
| resource | String | Resource type (posts, analytics, etc.) |
| action | String | Action (create, read, update, delete) |
| conditions | JSON? | Additional permission conditions |

**Unique**: (userId, resource, action)

#### `workspaces`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Workspace name |
| slug | String | Unique URL slug |
| plan | Enum | FREE, STARTER, PROFESSIONAL, ENTERPRISE |
| settings | JSON | Workspace settings |
| branding | JSON | Custom branding config |
| limits | JSON | Usage limits |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: slug (unique)

### Social Media

#### `social_accounts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| platform | Enum | INSTAGRAM, FACEBOOK, TWITTER, etc. |
| platformAccountId | String | Platform's account ID |
| username | String | Account username |
| displayName | String | Display name |
| avatar | String? | Profile picture URL |
| accessToken | String | Encrypted OAuth token |
| refreshToken | String? | Encrypted refresh token |
| tokenExpiry | DateTime? | Token expiration date |
| isActive | Boolean | Account status |
| metadata | JSON | Platform-specific data |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, platform, isActive
**Unique**: (workspaceId, platform, platformAccountId)

#### `posts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| authorId | UUID | Foreign key to user |
| content | JSON | Post content (text, hashtags, mentions) |
| status | Enum | DRAFT, SCHEDULED, PUBLISHED, etc. |
| scheduledAt | DateTime? | Scheduled publish time |
| publishedAt | DateTime? | Actual publish time |
| campaignId | UUID? | Foreign key to campaign |
| tags | String[] | Content tags |
| aiGenerated | Boolean | AI-generated flag |
| aiMetadata | JSON? | AI generation metadata |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, authorId, status, scheduledAt, publishedAt, campaignId, (workspaceId, status, scheduledAt), (workspaceId, createdAt)

#### `platform_posts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| postId | UUID | Foreign key to post |
| accountId | UUID | Foreign key to social_account |
| platform | Enum | Platform type |
| customContent | JSON? | Platform-specific overrides |
| platformPostId | String? | Platform's post ID |
| publishStatus | Enum | PENDING, PUBLISHING, PUBLISHED, FAILED |
| error | String? | Error message if failed |
| publishedAt | DateTime? | Publish timestamp |

**Indexes**: postId, accountId, publishStatus, (platform, publishStatus)

#### `media_assets`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| type | Enum | IMAGE, VIDEO, GIF |
| url | String | Asset URL |
| thumbnailUrl | String? | Thumbnail URL |
| filename | String | Original filename |
| size | Int | File size in bytes |
| dimensions | JSON? | Width and height |
| duration | Int? | Video duration in seconds |
| metadata | JSON | Additional metadata |
| tags | String[] | Asset tags |
| folder | String? | Folder path |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, type, folder, (workspaceId, createdAt)

#### `post_media`
| Column | Type | Description |
|--------|------|-------------|
| postId | UUID | Foreign key to post |
| mediaId | UUID | Foreign key to media_asset |
| order | Int | Display order |

**Primary Key**: (postId, mediaId)

### Campaigns

#### `campaigns`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| name | String | Campaign name |
| description | String? | Campaign description |
| startDate | DateTime | Start date |
| endDate | DateTime | End date |
| goals | JSON | Campaign goals |
| budget | Float? | Budget amount |
| tags | String[] | Campaign tags |
| utmParams | JSON | UTM parameters |
| status | Enum | DRAFT, ACTIVE, PAUSED, COMPLETED |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, status, (workspaceId, startDate), (workspaceId, status)

### Community Management

#### `conversations`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| accountId | UUID | Foreign key to social_account |
| platform | Enum | Platform type |
| type | Enum | COMMENT, DM, MENTION, REVIEW |
| participantId | String | External user ID |
| participantName | String | External user name |
| participantAvatar | String? | External user avatar |
| status | Enum | OPEN, PENDING, RESOLVED, ARCHIVED |
| priority | Enum | LOW, MEDIUM, HIGH, URGENT |
| sentiment | Enum | POSITIVE, NEUTRAL, NEGATIVE |
| assignedToId | UUID? | Foreign key to user |
| tags | String[] | Conversation tags |
| slaDeadline | DateTime? | SLA deadline |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, accountId, status, assignedToId, platform, sentiment, priority, (workspaceId, status, createdAt), (workspaceId, priority)

#### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversationId | UUID | Foreign key to conversation |
| direction | Enum | INBOUND, OUTBOUND |
| content | String | Message content |
| platformMessageId | String | Platform's message ID |
| authorId | UUID? | Foreign key to user (if outbound) |
| sentiment | Float? | Sentiment score (-1 to 1) |
| aiGenerated | Boolean | AI-generated flag |
| metadata | JSON | Additional metadata |
| createdAt | DateTime | Creation timestamp |

**Indexes**: conversationId, direction, (conversationId, createdAt)

### Workflows

#### `workflows`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspaceId | UUID | Foreign key to workspace |
| name | String | Workflow name |
| description | String? | Workflow description |
| type | Enum | APPROVAL, AUTOMATION, CHATBOT |
| config | JSON | Workflow configuration |
| isActive | Boolean | Active status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes**: workspaceId, (workspaceId, type, isActive)

#### `approvals`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| postId | UUID | Foreign key to post |
| approverId | UUID | Foreign key to user |
| status | Enum | PENDING, APPROVED, REJECTED |
| comments | String? | Approval comments |
| level | Int | Approval level in chain |
| approvedAt | DateTime? | Approval timestamp |
| createdAt | DateTime | Creation timestamp |

**Indexes**: postId, approverId, (postId, status), (approverId, status)

## MongoDB Collections

### `metrics` (Time-Series)
```javascript
{
  timestamp: Date,              // Time of metric collection
  metadata: {
    workspaceId: String,        // Workspace identifier
    accountId: String,          // Social account ID
    postId: String,             // Post ID (optional)
    platform: String,           // Platform name
    metricType: String          // Type: engagement, account, etc.
  },
  // Engagement metrics
  likes: Number,
  comments: Number,
  shares: Number,
  saves: Number,
  reach: Number,
  impressions: Number,
  // Account metrics
  followers: Number,
  following: Number,
  posts: Number,
  avgEngagementRate: Number
}
```

**Indexes**: 
- (metadata.workspaceId, timestamp)
- (metadata.accountId, timestamp)
- (metadata.postId, timestamp)
- (metadata.platform, timestamp)
- (metadata.metricType, timestamp)

**TTL**: 1 year

### `mentions`
```javascript
{
  workspaceId: String,          // Workspace identifier
  queryId: String,              // Listening query ID
  platform: String,             // Platform name
  author: {
    id: String,                 // Author's platform ID
    username: String,           // Username
    name: String,               // Display name
    avatar: String,             // Avatar URL
    followers: Number           // Follower count
  },
  content: String,              // Mention content
  url: String,                  // URL to mention
  sentiment: String,            // positive, neutral, negative
  sentimentScore: Number,       // -1 to 1
  reach: Number,                // Potential reach
  engagement: Number,           // Engagement count
  language: String,             // Language code
  location: String,             // Location (optional)
  isInfluencer: Boolean,        // Influencer flag
  tags: [String],               // Tags
  createdAt: Date,              // Original creation time
  fetchedAt: Date               // When we fetched it
}
```

**Indexes**:
- (workspaceId, createdAt)
- (workspaceId, platform, createdAt)
- (workspaceId, sentiment)
- (queryId, createdAt)
- (author.username)
- (isInfluencer)
- (tags)
- (language)
- Text index on (content, author.name)

### `ai_cache`
```javascript
{
  cacheKey: String,             // Unique cache key
  workspaceId: String,          // Workspace identifier
  agentType: String,            // Agent type
  prompt: String,               // Original prompt
  response: Object,             // AI response
  model: String,                // Model used
  cost: Number,                 // Cost in USD
  createdAt: Date               // Creation time
}
```

**Indexes**:
- cacheKey (unique)
- workspaceId
- agentType
- createdAt (with TTL: 24 hours)

### `audit_logs`
```javascript
{
  workspaceId: String,          // Workspace identifier
  userId: String,               // User ID
  userName: String,             // User name
  userEmail: String,            // User email
  action: String,               // Action performed
  resourceType: String,         // Resource type
  resourceId: String,           // Resource ID
  details: Object,              // Action details
  ipAddress: String,            // IP address
  userAgent: String,            // User agent
  timestamp: Date               // Action timestamp
}
```

**Indexes**:
- (workspaceId, timestamp)
- (userId, timestamp)
- (action, timestamp)
- (resourceType, resourceId)
- timestamp

### `trends`
```javascript
{
  workspaceId: String,          // Workspace identifier
  platform: String,             // Platform name
  trendType: String,            // hashtag, topic, etc.
  value: String,                // Trend value
  growthVelocity: Number,       // Growth rate
  volume: Number,               // Mention volume
  sentiment: String,            // Overall sentiment
  detectedAt: Date              // Detection time
}
```

**Indexes**:
- (workspaceId, detectedAt)
- (platform, detectedAt)
- trendType
- growthVelocity

### `influencers`
```javascript
{
  workspaceId: String,          // Workspace identifier
  platform: String,             // Platform name
  username: String,             // Username
  displayName: String,          // Display name
  avatar: String,               // Avatar URL
  metrics: {
    followers: Number,          // Follower count
    following: Number,          // Following count
    posts: Number,              // Post count
    engagementRate: Number      // Engagement rate
  },
  authenticityScore: Number,    // Authenticity score
  niche: [String],              // Niches
  tags: [String],               // Tags
  lastAnalyzed: Date            // Last analysis time
}
```

**Indexes**:
- workspaceId
- (platform, username)
- (metrics.followers)
- (metrics.engagementRate)
- authenticityScore
- tags

### `analytics_aggregations`
```javascript
{
  workspaceId: String,          // Workspace identifier
  accountId: String,            // Account ID (optional)
  platform: String,             // Platform name (optional)
  date: Date,                   // Aggregation date
  granularity: String,          // daily, weekly, monthly
  metrics: {
    totalPosts: Number,
    totalEngagement: Number,
    totalReach: Number,
    totalImpressions: Number,
    avgEngagementRate: Number,
    followerGrowth: Number
  }
}
```

**Indexes**:
- (workspaceId, date, granularity)
- (accountId, date)
- (platform, date)

## Relationships

### One-to-Many
- Workspace → Users
- Workspace → Social Accounts
- Workspace → Posts
- Workspace → Campaigns
- Workspace → Media Assets
- Workspace → Conversations
- Workspace → Workflows
- User → Posts (as author)
- Post → Platform Posts
- Post → Approvals
- Conversation → Messages
- Campaign → Posts

### Many-to-Many
- Posts ↔ Media Assets (via post_media)

### Optional Relationships
- Post → Campaign (optional)
- Conversation → User (assigned to, optional)
- Message → User (author, for outbound messages)

## Data Types

### Enums

**UserRole**: OWNER, ADMIN, MANAGER, EDITOR, VIEWER

**WorkspacePlan**: FREE, STARTER, PROFESSIONAL, ENTERPRISE

**Platform**: INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN, TIKTOK, YOUTUBE, PINTEREST, THREADS, REDDIT

**PostStatus**: DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, PUBLISHING, PUBLISHED, FAILED, ARCHIVED

**PublishStatus**: PENDING, PUBLISHING, PUBLISHED, FAILED

**MediaType**: IMAGE, VIDEO, GIF

**CampaignStatus**: DRAFT, ACTIVE, PAUSED, COMPLETED

**ConversationType**: COMMENT, DM, MENTION, REVIEW

**ConversationStatus**: OPEN, PENDING, RESOLVED, ARCHIVED

**Priority**: LOW, MEDIUM, HIGH, URGENT

**Sentiment**: POSITIVE, NEUTRAL, NEGATIVE

**MessageDirection**: INBOUND, OUTBOUND

**WorkflowType**: APPROVAL, AUTOMATION, CHATBOT

**ApprovalStatus**: PENDING, APPROVED, REJECTED

## Common Query Patterns

### Get user's scheduled posts
```sql
SELECT * FROM posts 
WHERE "workspaceId" = ? 
  AND status = 'SCHEDULED' 
  AND "scheduledAt" > NOW()
ORDER BY "scheduledAt" ASC;
```

### Get inbox conversations
```sql
SELECT * FROM conversations 
WHERE "workspaceId" = ? 
  AND status = 'OPEN'
ORDER BY priority DESC, "createdAt" DESC;
```

### Get campaign posts
```sql
SELECT p.*, pp.* 
FROM posts p
LEFT JOIN platform_posts pp ON p.id = pp."postId"
WHERE p."campaignId" = ?
ORDER BY p."publishedAt" DESC;
```

### Get account metrics (MongoDB)
```javascript
db.metrics.find({
  'metadata.workspaceId': workspaceId,
  'metadata.accountId': accountId,
  'metadata.metricType': 'account',
  timestamp: { $gte: startDate, $lte: endDate }
}).sort({ timestamp: -1 });
```

### Search mentions (MongoDB)
```javascript
db.mentions.find({
  workspaceId: workspaceId,
  $text: { $search: searchQuery },
  sentiment: 'positive'
}).sort({ createdAt: -1 });
```
