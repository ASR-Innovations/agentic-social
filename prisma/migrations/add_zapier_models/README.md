# Zapier Integration Database Migration

This migration adds the necessary database tables for Zapier integration.

## Tables Added

### zapier_triggers
Stores Zapier trigger subscriptions (webhooks).

**Columns:**
- `id` (UUID, Primary Key)
- `workspaceId` (UUID, Foreign Key to workspaces)
- `name` (String)
- `triggerKey` (String) - e.g., "post_published", "mention_received"
- `description` (String, Optional)
- `config` (JSON, Optional)
- `subscriptionId` (String, Optional) - Zapier subscription ID
- `targetUrl` (String, Optional) - Zapier webhook URL
- `isActive` (Boolean, Default: true)
- `metadata` (JSON, Optional)
- `createdBy` (String) - User ID
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- `workspaceId`
- `triggerKey`
- `isActive`

**Unique Constraint:**
- `(workspaceId, triggerKey, subscriptionId)`

### zapier_actions
Logs all actions executed via Zapier.

**Columns:**
- `id` (UUID, Primary Key)
- `workspaceId` (String)
- `actionKey` (String) - e.g., "create_post", "schedule_post"
- `description` (String, Optional)
- `inputData` (JSON) - Data received from Zapier
- `outputData` (JSON, Optional) - Data returned to Zapier
- `status` (Enum: PENDING, SUCCESS, FAILED)
- `error` (String, Optional)
- `metadata` (JSON, Optional)
- `executedBy` (String) - API key or user ID
- `executedAt` (DateTime)

**Indexes:**
- `workspaceId`
- `actionKey`
- `status`
- `executedAt`

## Running the Migration

### Development
```bash
npx prisma migrate dev --name add_zapier_models
```

### Production
```bash
npx prisma migrate deploy
```

## Rollback

If you need to rollback this migration:

```sql
-- Drop tables
DROP TABLE IF EXISTS "zapier_actions";
DROP TABLE IF EXISTS "zapier_triggers";

-- Drop enum
DROP TYPE IF EXISTS "ZapierActionStatus";
```

## Verification

After running the migration, verify the tables exist:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('zapier_triggers', 'zapier_actions');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('zapier_triggers', 'zapier_actions');
```

## Data Seeding (Optional)

You can seed some test data:

```sql
-- Insert a test trigger subscription
INSERT INTO zapier_triggers (
  id, 
  "workspaceId", 
  name, 
  "triggerKey", 
  description, 
  "subscriptionId", 
  "targetUrl", 
  "isActive", 
  "createdBy", 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'your-workspace-id',
  'Post Published Test',
  'post_published',
  'Test trigger for post published events',
  'test_sub_123',
  'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
  true,
  'test-user-id',
  NOW(),
  NOW()
);
```

## Impact

- **Breaking Changes**: None
- **Data Loss**: None
- **Downtime Required**: No
- **Estimated Duration**: < 1 second

## Dependencies

This migration depends on:
- Existing `workspaces` table
- Existing `Workspace` relation in Prisma schema

## Notes

- The migration is safe to run in production
- No existing data will be affected
- Tables are created with proper indexes for performance
- Foreign key constraints ensure data integrity
