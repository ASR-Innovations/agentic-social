# Database Optimization - Quick Start Guide

## Overview
This guide provides quick instructions for using the database optimization features.

## Installation

### 1. Apply Database Optimizations
```bash
# Apply the optimization migration
npm run db:optimize

# Or using Prisma directly
npx prisma migrate deploy
```

### 2. Verify Installation
```bash
# Check if materialized views were created
npm run db:verify

# Or manually check
psql -d your_database -c "SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';"
```

## Common Tasks

### Refresh Materialized Views
```bash
# Via API (requires authentication)
curl -X POST http://localhost:3000/admin/database/maintenance/refresh-views

# Or programmatically
import { DatabaseMaintenanceService } from './database/database-maintenance.service';
await maintenanceService.refreshMaterializedViews();
```

### Check Database Health
```bash
# Via API
curl http://localhost:3000/admin/database/health

# Response example:
{
  "healthy": true,
  "metrics": {
    "total_connections": 15,
    "active_connections": 3,
    "idle_connections": 12
  },
  "timestamp": "2024-11-21T10:00:00.000Z"
}
```

### Monitor Slow Queries
```bash
# Via API
curl http://localhost:3000/admin/database/metrics/slow-queries

# Or programmatically
import { QueryAnalyzer } from './database/query-optimizer';
const analyzer = new QueryAnalyzer(prisma);
const slowQueries = await analyzer.getSlowQueries(1000); // queries > 1000ms
```

### Use Query Optimizer
```typescript
import { QueryOptimizer } from './database/query-optimizer';

const optimizer = new QueryOptimizer({
  enableQueryLogging: true,
  slowQueryThreshold: 1000,
  cacheEnabled: true,
  cacheTTL: 300
});

// Execute with metrics
const posts = await optimizer.executeWithMetrics(
  () => prisma.post.findMany({ where: { workspaceId } }),
  'findWorkspacePosts'
);

// Execute with caching
const cachedPosts = await optimizer.executeWithCache(
  () => prisma.post.findMany({ where: { workspaceId } }),
  `posts:workspace:${workspaceId}`,
  600 // 10 minutes
);
```

### Use Cursor Pagination
```typescript
import { cursorPaginate } from './database/query-optimizer';

const result = await cursorPaginate(
  (params) => prisma.post.findMany(params),
  {
    cursor: lastPostId,
    take: 20,
    orderBy: { createdAt: 'desc' }
  }
);

console.log(result.data); // Array of posts
console.log(result.nextCursor); // Cursor for next page
console.log(result.hasMore); // Boolean
```

### Use Query Builder
```typescript
import { QueryBuilder } from './database/query-optimizer';

// Build complex filters
const filter = QueryBuilder.combineFilters(
  QueryBuilder.workspaceFilter(workspaceId),
  QueryBuilder.dateRange('createdAt', startDate, endDate),
  QueryBuilder.enumFilter('status', ['PUBLISHED', 'SCHEDULED']),
  QueryBuilder.fullTextSearch(['title', 'content'], searchTerm)
);

const posts = await prisma.post.findMany({ where: filter });
```

## Configuration

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Optional - Connection Pool
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=100
DATABASE_CONNECTION_TIMEOUT=5000
DATABASE_IDLE_TIMEOUT=30000

# Optional - Read Replica
DATABASE_READ_REPLICA_URL=postgresql://user:password@replica:5432/database

# Optional - Optimization
PARTITION_RETENTION_MONTHS=24
SLOW_QUERY_THRESHOLD=1000
ENABLE_QUERY_CACHE=true
QUERY_CACHE_TTL=300
```

## Monitoring

### Key Metrics to Watch
1. **Connection Pool Utilization**: Should be < 80%
2. **Query Execution Time**: p95 should be < 50ms
3. **Cache Hit Ratio**: Should be > 90%
4. **Slow Queries**: Should be minimal
5. **Table Bloat**: Dead tuple % should be < 20%

### Monitoring Endpoints
```bash
# Connection pool metrics
curl http://localhost:3000/admin/database/metrics/connection-pool

# Slow queries
curl http://localhost:3000/admin/database/metrics/slow-queries

# Index usage
curl http://localhost:3000/admin/database/metrics/index-stats

# Table bloat
curl http://localhost:3000/admin/database/metrics/table-bloat

# Unused indexes
curl http://localhost:3000/admin/database/metrics/unused-indexes
```

## Troubleshooting

### Slow Queries
```typescript
// 1. Identify slow queries
const analyzer = new QueryAnalyzer(prisma);
const slowQueries = await analyzer.getSlowQueries(1000);

// 2. Analyze query plan
const plan = await analyzer.explainQuery('SELECT * FROM posts WHERE ...');

// 3. Check if indexes are being used
const indexStats = await analyzer.getIndexStats('posts');
```

### High Connection Pool Usage
```typescript
// Check pool metrics
const metrics = await prisma.getPoolMetrics();

if (metrics.utilizationPercent > 80) {
  // Consider:
  // 1. Increasing pool size
  // 2. Adding read replicas
  // 3. Optimizing queries
  // 4. Implementing connection pooling at application level
}
```

### Materialized View Out of Date
```bash
# Refresh specific view
curl -X POST http://localhost:3000/admin/database/maintenance/refresh-views

# Or refresh all views
npm run db:optimize
```

## Best Practices

### 1. Always Use Indexes
```typescript
// Good: Uses index on workspaceId
const posts = await prisma.post.findMany({
  where: { workspaceId }
});

// Bad: Full table scan
const posts = await prisma.post.findMany();
```

### 2. Use Pagination
```typescript
// Good: Cursor-based pagination
const result = await cursorPaginate(
  (params) => prisma.post.findMany(params),
  { take: 20, cursor: lastId }
);

// Bad: Loading all records
const posts = await prisma.post.findMany();
```

### 3. Cache Frequently Accessed Data
```typescript
// Good: Cache with TTL
const posts = await optimizer.executeWithCache(
  () => prisma.post.findMany({ where: { featured: true } }),
  'featured-posts',
  3600 // 1 hour
);

// Bad: Always hitting database
const posts = await prisma.post.findMany({ where: { featured: true } });
```

### 4. Use Materialized Views for Analytics
```typescript
// Good: Query materialized view
const metrics = await prisma.$queryRaw`
  SELECT * FROM mv_daily_post_metrics
  WHERE workspace_id = ${workspaceId}
  AND date >= ${startDate}
`;

// Bad: Complex aggregation on live data
const metrics = await prisma.post.groupBy({
  by: ['workspaceId'],
  _count: true,
  _avg: { engagement: true }
});
```

### 5. Monitor and Optimize
```typescript
// Set up monitoring
const monitor = new DatabaseHealthMonitor(prisma);

setInterval(async () => {
  const health = await monitor.checkHealth();
  const longQueries = await monitor.getLongRunningQueries(30000);
  
  if (!health.healthy || longQueries.length > 0) {
    // Alert and investigate
  }
}, 60000); // Every minute
```

## Automated Maintenance

The following tasks run automatically:
- **Hourly**: Refresh materialized views
- **Daily**: Create new partitions, update statistics
- **Weekly**: Vacuum tables, drop old partitions
- **Monthly**: Reindex tables
- **Every 5 min**: Health monitoring
- **Every minute**: Long query detection

No manual intervention required!

## Support

For issues or questions:
1. Check `DATABASE_OPTIMIZATION.md` for detailed documentation
2. Review logs for error messages
3. Use monitoring endpoints to diagnose issues
4. Contact the database team

## Quick Reference

| Task | Command |
|------|---------|
| Apply optimizations | `npm run db:optimize` |
| Check health | `curl http://localhost:3000/admin/database/health` |
| Refresh views | `curl -X POST http://localhost:3000/admin/database/maintenance/refresh-views` |
| Get slow queries | `curl http://localhost:3000/admin/database/metrics/slow-queries` |
| Full maintenance | `curl -X POST http://localhost:3000/admin/database/maintenance/full` |

## Next Steps

1. Apply the optimizations: `npm run db:optimize`
2. Monitor performance using the admin endpoints
3. Review slow queries and add indexes as needed
4. Configure connection pooling for your environment
5. Set up alerts for key metrics
