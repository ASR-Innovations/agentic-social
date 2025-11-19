# Database Quick Reference Card

Quick commands and tips for working with the database.

## 🚀 Quick Start

```bash
# Complete setup (one command)
npm run db:setup

# Verify setup
npm run db:verify
```

## 📦 PostgreSQL Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

## 🍃 MongoDB Commands

```bash
# Initialize MongoDB collections
npm run mongodb:init

# Connect with MongoDB Compass
# URL: mongodb://localhost:27017
# Database: social_media_platform
```

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart specific service
docker-compose restart postgres
docker-compose restart mongodb
```

## 🔍 Common Queries

### PostgreSQL (Prisma)

```typescript
// Get workspace with users
const workspace = await prisma.workspace.findUnique({
  where: { slug: 'demo-agency' },
  include: { users: true }
});

// Get scheduled posts
const posts = await prisma.post.findMany({
  where: {
    workspaceId: workspaceId,
    status: 'SCHEDULED',
    scheduledAt: { gte: new Date() }
  },
  orderBy: { scheduledAt: 'asc' }
});

// Get inbox conversations
const conversations = await prisma.conversation.findMany({
  where: {
    workspaceId: workspaceId,
    status: 'OPEN'
  },
  include: { messages: true },
  orderBy: [
    { priority: 'desc' },
    { createdAt: 'desc' }
  ]
});
```

### MongoDB

```javascript
// Get recent metrics
db.metrics.find({
  'metadata.workspaceId': workspaceId,
  'metadata.accountId': accountId,
  timestamp: { $gte: startDate, $lte: endDate }
}).sort({ timestamp: -1 });

// Search mentions
db.mentions.find({
  workspaceId: workspaceId,
  $text: { $search: 'product launch' },
  sentiment: 'positive'
}).sort({ createdAt: -1 });

// Get cached AI response
db.ai_cache.findOne({
  cacheKey: 'content_gen_summer_instagram'
});

// Query audit logs
db.audit_logs.find({
  workspaceId: workspaceId,
  action: 'post.publish',
  timestamp: { $gte: startDate }
}).sort({ timestamp: -1 });
```

## 🔐 Demo Credentials

```
Email: owner@demo.com   | Password: password123
Email: admin@demo.com   | Password: password123
Email: manager@demo.com | Password: password123
Email: editor@demo.com  | Password: password123
```

## 📊 Key Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| workspaces | Multi-tenant workspaces |
| social_accounts | Connected social accounts |
| posts | Content items |
| platform_posts | Platform-specific posts |
| media_assets | Media library |
| conversations | Inbox conversations |
| messages | Individual messages |
| campaigns | Marketing campaigns |
| workflows | Approval workflows |

## 🍃 Key Collections

| Collection | Purpose |
|------------|---------|
| metrics | Performance metrics (time-series) |
| mentions | Social listening data |
| ai_cache | AI response cache (24h TTL) |
| audit_logs | Audit trail |
| trends | Trending topics |
| influencers | Influencer database |
| analytics_aggregations | Pre-computed analytics |

## 🔧 Troubleshooting

### PostgreSQL not connecting
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### MongoDB not connecting
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Reset database (CAUTION: destroys data)
```bash
npm run prisma:migrate reset
npm run prisma:seed
npm run mongodb:init
```

### Check database status
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -c "\l"

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('listDatabases')"
```

## 📚 Documentation

- **Full Setup Guide**: `DATABASE_SETUP.md`
- **Schema Reference**: `DATABASE_SCHEMA_REFERENCE.md`
- **Implementation Summary**: `TASK_2_IMPLEMENTATION_SUMMARY.md`

## 🎯 Performance Tips

1. **Use indexes**: All common queries have supporting indexes
2. **Batch operations**: Use `createMany()` for bulk inserts
3. **Select specific fields**: Use `select` to reduce data transfer
4. **Use includes wisely**: Only include relations you need
5. **Cache frequently accessed data**: Use Redis for hot data
6. **Monitor slow queries**: Check Prisma query logs

## 🔒 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- OAuth tokens are encrypted with AES-256
- Use environment variables for sensitive data
- Never commit `.env` files
- Rotate database credentials regularly
- Use SSL/TLS in production

## 📈 Monitoring

```bash
# Check database size (PostgreSQL)
docker-compose exec postgres psql -U postgres -d social_media_platform -c "SELECT pg_size_pretty(pg_database_size('social_media_platform'));"

# Check collection sizes (MongoDB)
docker-compose exec mongodb mongosh social_media_platform --eval "db.stats()"

# Check index usage (PostgreSQL)
docker-compose exec postgres psql -U postgres -d social_media_platform -c "SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan;"
```

## 🚨 Common Issues

**Issue**: Migration fails with "relation already exists"
**Solution**: Run `npm run prisma:migrate reset` or manually drop tables

**Issue**: Seed script fails with duplicate key
**Solution**: The script auto-cleans in dev mode. Check NODE_ENV

**Issue**: MongoDB collections not created
**Solution**: Run `npm run mongodb:init` again (safe to re-run)

**Issue**: Prisma client out of sync
**Solution**: Run `npm run prisma:generate`

## 💡 Pro Tips

- Use Prisma Studio for quick data inspection
- Use MongoDB Compass for visual query building
- Keep migrations small and focused
- Test migrations on a copy of production data
- Document schema changes in migration files
- Use transactions for multi-step operations
- Set up automated backups in production
