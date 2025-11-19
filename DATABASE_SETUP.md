# Database Setup Guide

This guide covers the complete database setup for the AI Social Media Management Platform, including PostgreSQL (via Prisma) and MongoDB.

## Overview

The platform uses a hybrid database architecture:
- **PostgreSQL**: Primary relational database for core entities (users, posts, campaigns, etc.)
- **MongoDB**: Document database for analytics, metrics, mentions, AI cache, and audit logs

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ installed
- npm or yarn package manager

## Quick Start

### 1. Start Database Services

```bash
# Start PostgreSQL, Redis, and MongoDB containers
npm run docker:up

# Or manually with docker-compose
docker-compose up -d postgres redis mongodb
```

### 2. Initialize PostgreSQL

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed development data
npm run prisma:seed
```

### 3. Initialize MongoDB

```bash
# Create collections and indexes
npm run mongodb:init
```

## PostgreSQL Schema

### Core Tables

#### Users & Workspaces
- `users` - User accounts with roles and permissions
- `user_permissions` - Granular permission system
- `workspaces` - Multi-tenant workspace isolation

#### Social Media
- `social_accounts` - Connected social media accounts
- `posts` - Content items
- `platform_posts` - Platform-specific post instances
- `media_assets` - Media library
- `post_media` - Post-media relationships

#### Community Management
- `conversations` - Unified inbox conversations
- `messages` - Individual messages in conversations

#### Campaigns & Workflows
- `campaigns` - Marketing campaigns
- `workflows` - Approval and automation workflows
- `approvals` - Post approval tracking

### Performance Indexes

The schema includes comprehensive indexes for optimal query performance:

**Posts**
- Composite index on `(workspaceId, status, scheduledAt)` for calendar queries
- Index on `(workspaceId, createdAt)` for recent posts
- Index on `publishedAt` for analytics

**Conversations**
- Composite index on `(workspaceId, status, createdAt)` for inbox filtering
- Index on `priority` for urgent message routing
- Index on `sentiment` for sentiment-based filtering

**Social Accounts**
- Index on `platform` for platform-specific queries
- Index on `isActive` for active account filtering

See `prisma/migrations/20240102000000_add_performance_indexes/migration.sql` for complete index list.

## MongoDB Collections

### Metrics (Time-Series)
**Purpose**: Store social media performance metrics

**Schema**:
```javascript
{
  timestamp: Date,
  metadata: {
    workspaceId: String,
    accountId: String,
    postId: String,
    platform: String,
    metricType: String
  },
  likes: Number,
  comments: Number,
  shares: Number,
  saves: Number,
  reach: Number,
  impressions: Number,
  // ... other metrics
}
```

**Features**:
- Time-series collection with hourly granularity
- Automatic data expiration after 1 year
- Optimized for time-range queries

**Indexes**:
- `(metadata.workspaceId, timestamp)`
- `(metadata.accountId, timestamp)`
- `(metadata.postId, timestamp)`
- `(metadata.platform, timestamp)`

### Mentions
**Purpose**: Social listening and brand monitoring

**Schema**:
```javascript
{
  workspaceId: String,
  queryId: String,
  platform: String,
  author: {
    id: String,
    username: String,
    name: String,
    avatar: String,
    followers: Number
  },
  content: String,
  url: String,
  sentiment: String, // 'positive', 'neutral', 'negative'
  sentimentScore: Number, // -1 to 1
  reach: Number,
  engagement: Number,
  language: String,
  location: String,
  isInfluencer: Boolean,
  tags: [String],
  createdAt: Date,
  fetchedAt: Date
}
```

**Indexes**:
- `(workspaceId, createdAt)`
- `(workspaceId, platform, createdAt)`
- `(workspaceId, sentiment)`
- `(queryId, createdAt)`
- Full-text search on `content` and `author.name`

### AI Cache
**Purpose**: Cache AI-generated content and analysis

**Schema**:
```javascript
{
  cacheKey: String, // unique
  workspaceId: String,
  agentType: String,
  prompt: String,
  response: Object,
  model: String,
  cost: Number,
  createdAt: Date
}
```

**Features**:
- Automatic TTL expiration after 24 hours
- Unique cache keys for deduplication

**Indexes**:
- `cacheKey` (unique)
- `workspaceId`
- `agentType`
- `createdAt` with TTL

### Audit Logs
**Purpose**: Comprehensive audit trail for compliance

**Schema**:
```javascript
{
  workspaceId: String,
  userId: String,
  userName: String,
  userEmail: String,
  action: String, // e.g., 'post.create', 'user.invite'
  resourceType: String,
  resourceId: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

**Indexes**:
- `(workspaceId, timestamp)`
- `(userId, timestamp)`
- `(action, timestamp)`
- `(resourceType, resourceId)`

### Additional Collections

**Trends**: Trending topics and hashtags
**Influencers**: Influencer database and analytics
**Analytics Aggregations**: Pre-computed analytics for performance

## Database Migrations

### Creating New Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:migrate:deploy
```

### Migration Best Practices

1. **Always test migrations locally first**
2. **Use descriptive migration names**
3. **Add indexes for new query patterns**
4. **Consider data migration for schema changes**
5. **Document breaking changes**

## Seeding Development Data

The seed script creates:
- 1 demo workspace ("Demo Agency")
- 4 users with different roles (Owner, Admin, Manager, Editor)
- 3 social accounts (Instagram, Twitter, LinkedIn)
- 2 campaigns
- 4 posts (published, scheduled, draft, pending approval)
- 3 media assets
- 2 conversations with messages
- 3 workflows

### Login Credentials

```
Email: owner@demo.com   | Password: password123
Email: admin@demo.com   | Password: password123
Email: manager@demo.com | Password: password123
Email: editor@demo.com  | Password: password123
```

### Re-seeding

```bash
# Clear and re-seed database
npm run prisma:seed
```

## Database Management

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Access at: http://localhost:5555

### MongoDB Compass

Connect to MongoDB:
- Connection String: `mongodb://localhost:27017`
- Database: `social_media_platform`

### Backup and Restore

#### PostgreSQL

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres social_media_platform > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres social_media_platform < backup.sql
```

#### MongoDB

```bash
# Backup
docker-compose exec mongodb mongodump --db social_media_platform --out /backup

# Restore
docker-compose exec mongodb mongorestore --db social_media_platform /backup/social_media_platform
```

## Environment Variables

Required environment variables:

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_media_platform?schema=public"

# MongoDB
MONGODB_URI="mongodb://localhost:27017"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
```

## Troubleshooting

### Connection Issues

**PostgreSQL not connecting:**
```bash
# Check if container is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart container
docker-compose restart postgres
```

**MongoDB not connecting:**
```bash
# Check container status
docker-compose ps mongodb

# View logs
docker-compose logs mongodb
```

### Migration Errors

**Migration failed:**
```bash
# Reset database (CAUTION: destroys all data)
npm run prisma:migrate reset

# Or manually drop and recreate
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

### Seed Script Errors

**Seed fails with duplicate key:**
```bash
# The seed script automatically cleans data in development
# If it fails, manually reset:
npm run prisma:migrate reset
npm run prisma:seed
```

## Performance Optimization

### PostgreSQL

1. **Connection Pooling**: Configured in Prisma (default: 10 connections)
2. **Indexes**: All critical queries have supporting indexes
3. **Query Optimization**: Use `EXPLAIN ANALYZE` for slow queries

```sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE "workspaceId" = 'xxx' AND status = 'SCHEDULED';
```

### MongoDB

1. **Indexes**: All collections have appropriate indexes
2. **Time-Series**: Metrics use time-series collection for efficiency
3. **TTL**: AI cache automatically expires old data
4. **Aggregation Pipeline**: Use for complex analytics queries

## Production Considerations

### PostgreSQL

- Use managed database service (AWS RDS, Google Cloud SQL)
- Enable automated backups
- Set up read replicas for analytics queries
- Configure connection pooling (PgBouncer)
- Monitor query performance

### MongoDB

- Use MongoDB Atlas or managed service
- Enable sharding for large datasets
- Configure replica sets for high availability
- Set up automated backups
- Monitor collection sizes and index usage

## Schema Evolution

### Adding New Tables (PostgreSQL)

1. Update `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update seed script if needed
4. Update TypeScript types

### Adding New Collections (MongoDB)

1. Update `scripts/init-mongodb.ts`
2. Add indexes for query patterns
3. Document schema in this file
4. Update application code

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
