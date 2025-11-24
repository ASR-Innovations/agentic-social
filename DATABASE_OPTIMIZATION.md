# Database Optimization Guide

This document describes the database optimization features implemented for the AI Social Media Management Platform.

## Overview

The database optimization implementation includes:
- **Comprehensive Indexing**: 100+ indexes for optimal query performance
- **Materialized Views**: Pre-aggregated data for analytics queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Tools and utilities for query performance
- **Table Partitioning**: Time-series data partitioning for scalability
- **Automated Maintenance**: Scheduled tasks for database health

## Requirements

- **31.2**: Handle 1 million scheduled posts per day with 99.9% publishing success rate
- **31.3**: Implement horizontal scaling with auto-scaling based on load metrics

## Features

### 1. Database Indexes

#### Single-Column Indexes
- User authentication and authorization
- Workspace isolation and filtering
- Social account platform operations
- Post status and scheduling
- Conversation management
- Analytics queries

#### Composite Indexes
- Dashboard analytics queries
- Inbox filtering and sorting
- Scheduled post processing
- SLA breach monitoring
- Campaign performance tracking

#### GIN Indexes (Array/JSONB)
- Tag-based searches
- Array contains operations
- Full-text search capabilities

### 2. Materialized Views

Pre-aggregated views for fast analytics:

#### `mv_daily_post_metrics`
- Daily post performance aggregation
- Platform distribution
- AI-generated content tracking

#### `mv_daily_workspace_activity`
- Workspace activity summary
- Post status distribution
- Publishing trends

#### `mv_conversation_metrics`
- Response time metrics
- Sentiment analysis
- Resolution rates

#### `mv_listening_sentiment_trends`
- Mention volume tracking
- Sentiment trends
- Influencer mentions

#### `mv_influencer_metrics`
- Influencer performance
- Collaboration tracking
- ROI metrics

### 3. Connection Pooling

#### Configuration
```typescript
// Production settings
{
  min: 10,
  max: 100,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 30000,
  query_timeout: 30000
}
```

#### Features
- Environment-specific pool sizes
- Automatic connection recycling
- Health monitoring
- Read replica support

### 4. Query Optimization

#### QueryOptimizer Class
```typescript
const optimizer = new QueryOptimizer({
  enableQueryLogging: true,
  slowQueryThreshold: 1000,
  cacheEnabled: true,
  cacheTTL: 300
});

// Execute with metrics
const result = await optimizer.executeWithMetrics(
  () => prisma.post.findMany(),
  'findAllPosts'
);

// Execute with caching
const cached = await optimizer.executeWithCache(
  () => prisma.post.findMany(),
  'posts:all',
  600 // 10 minutes
);
```

#### Cursor-Based Pagination
```typescript
const result = await cursorPaginate(
  (params) => prisma.post.findMany(params),
  {
    cursor: lastPostId,
    take: 20,
    orderBy: { createdAt: 'desc' }
  }
);
```

#### Query Builder Helpers
```typescript
// Date range filter
const filter = QueryBuilder.dateRange('createdAt', startDate, endDate);

// Full-text search
const search = QueryBuilder.fullTextSearch(['title', 'content'], 'keyword');

// Combine filters
const combined = QueryBuilder.combineFilters(
  QueryBuilder.workspaceFilter(workspaceId),
  filter,
  search
);
```

### 5. Table Partitioning

#### Partitioned Tables
- `security_audit_logs_partitioned`: Monthly partitions for audit logs
- `listening_mentions_partitioned`: Monthly partitions for social listening data

#### Automatic Partition Management
```sql
-- Creates partitions for next 3 months
SELECT create_monthly_partitions();
```

#### Partition Retention
- Configurable retention period (default: 24 months)
- Automatic cleanup of old partitions
- Runs weekly via cron job

### 6. Automated Maintenance

#### Scheduled Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Refresh Materialized Views | Hourly | Updates pre-aggregated analytics data |
| Create Partitions | Daily | Creates partitions for upcoming months |
| Drop Old Partitions | Weekly | Removes partitions beyond retention period |
| Vacuum and Analyze | Weekly | Reclaims space and updates statistics |
| Reindex Tables | Monthly | Rebuilds indexes for optimal performance |
| Update Statistics | Daily | Updates query planner statistics |
| Health Monitoring | Every 5 min | Monitors database health metrics |
| Long Query Check | Every minute | Identifies slow queries |

## Usage

### Running Migrations

```bash
# Apply database optimization migration
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### Refreshing Materialized Views

```typescript
// Automatic (via cron)
// Views refresh every hour automatically

// Manual refresh
await databaseMaintenanceService.refreshView('mv_daily_post_metrics');

// Refresh all views
await databaseMaintenanceService.runFullMaintenance();
```

### Monitoring

#### Database Health
```typescript
const health = await prismaService.healthCheck();
const metrics = await prismaService.getPoolMetrics();
```

#### Query Performance
```typescript
const analyzer = new QueryAnalyzer(prisma);

// Get slow queries
const slowQueries = await analyzer.getSlowQueries(1000);

// Get table statistics
const stats = await analyzer.getTableStats('posts');

// Get index usage
const indexStats = await analyzer.getIndexStats('posts');
```

#### Pool Metrics
```typescript
import { getPoolMetrics } from './config/database-pool.config';

const metrics = getPoolMetrics(pool);
console.log({
  totalConnections: metrics.totalConnections,
  activeConnections: metrics.activeConnections,
  utilizationPercent: metrics.utilizationPercent
});
```

## Performance Targets

### Query Performance
- API response time: < 200ms (p95)
- Database query time: < 50ms (p95)
- Materialized view queries: < 10ms

### Scalability
- Support 10,000+ concurrent users per workspace
- Handle 1 million scheduled posts per day
- Process 100,000+ social listening mentions per hour

### Availability
- 99.95% uptime SLA
- Automatic failover
- Database replication

## Best Practices

### Query Optimization
1. **Use indexes**: Ensure queries use appropriate indexes
2. **Limit results**: Always use pagination for large datasets
3. **Select specific fields**: Avoid `SELECT *`
4. **Use materialized views**: For complex analytics queries
5. **Cache results**: Cache frequently accessed data

### Connection Management
1. **Use connection pooling**: Never create direct connections
2. **Close connections**: Always release connections after use
3. **Monitor pool**: Watch for connection leaks
4. **Set timeouts**: Configure appropriate timeout values

### Maintenance
1. **Regular vacuum**: Keep tables optimized
2. **Update statistics**: Ensure query planner has current data
3. **Monitor bloat**: Watch for table and index bloat
4. **Partition management**: Keep partitions up to date

## Troubleshooting

### Slow Queries
```typescript
// Find slow queries
const slowQueries = await analyzer.getSlowQueries(1000);

// Analyze query plan
const plan = await analyzer.explainQuery('SELECT * FROM posts WHERE ...');
```

### Connection Pool Issues
```typescript
// Check pool health
const health = await checkPoolHealth(pool);

// Get pool metrics
const metrics = getPoolMetrics(pool);

// Monitor pool
const monitor = monitorPool(pool, 60000);
```

### High Database Load
1. Check for missing indexes
2. Identify long-running queries
3. Review materialized view refresh schedule
4. Check connection pool utilization
5. Consider read replicas for read-heavy workloads

### Partition Issues
```typescript
// Manually create partitions
await databaseMaintenanceService.createUpcomingPartitions();

// Check partition status
const partitions = await prisma.$queryRaw`
  SELECT tablename FROM pg_tables 
  WHERE tablename LIKE '%_y%m%'
  ORDER BY tablename DESC
`;
```

## Environment Variables

```env
# Database connection
DATABASE_URL=postgresql://user:password@host:5432/database?connection_limit=20&pool_timeout=5

# Read replica (optional)
DATABASE_READ_REPLICA_URL=postgresql://user:password@replica:5432/database

# Connection pool settings
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=100
DATABASE_CONNECTION_TIMEOUT=5000
DATABASE_IDLE_TIMEOUT=30000

# Partition retention
PARTITION_RETENTION_MONTHS=24

# Query optimization
ENABLE_QUERY_LOGGING=true
SLOW_QUERY_THRESHOLD=1000
ENABLE_QUERY_CACHE=true
QUERY_CACHE_TTL=300
```

## Monitoring and Alerts

### Key Metrics to Monitor
- Connection pool utilization
- Query execution time (p50, p95, p99)
- Cache hit ratio
- Table bloat
- Index usage
- Materialized view freshness
- Partition count and size

### Alert Thresholds
- Pool utilization > 80%
- Query time > 1000ms
- Cache hit ratio < 90%
- Dead tuple percentage > 20%
- Long-running queries > 30s

## Additional Resources

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Connection Pooling Best Practices](https://node-postgres.com/features/pooling)

## Support

For issues or questions about database optimization:
1. Check the troubleshooting section
2. Review query logs and metrics
3. Contact the database team
4. File an issue in the project repository
