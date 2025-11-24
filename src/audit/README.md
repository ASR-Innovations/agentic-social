# Audit Trail System

Comprehensive audit logging system with tamper-proof storage, advanced filtering, and compliance reporting capabilities.

## Overview

The Audit Trail System provides enterprise-grade audit logging for all system activities, ensuring compliance with SOC 2, GDPR, HIPAA, and other regulatory requirements. It features:

- **Tamper-Proof Logging**: SHA-256 hashing for log integrity verification
- **Comprehensive Coverage**: Logs all user actions, system events, and security incidents
- **Advanced Filtering**: Full-text search, date ranges, severity levels, and more
- **Compliance Reporting**: Pre-built reports for SOC 2, GDPR, and HIPAA compliance
- **Export Capabilities**: SIEM, Splunk, and ELK Stack integration
- **7-Year Retention**: Configurable retention policies with automatic cleanup

## Features

### 1. Tamper-Proof Audit Logs

Every audit log entry includes a SHA-256 hash that ensures data integrity:

```typescript
const auditLog = await auditService.create(workspaceId, userId, {
  action: AuditAction.POST_CREATE,
  resourceType: 'post',
  resourceId: 'post-123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  status: AuditStatus.SUCCESS,
  details: { title: 'My Post' },
});

// Verify integrity
const isValid = await auditService.verifyIntegrity(auditLog.id);
```

### 2. Automatic Audit Logging with Interceptor

Use the `@AuditLog` decorator to automatically log controller actions:

```typescript
import { AuditLog, AuditAction } from '../audit';

@Controller('posts')
export class PostsController {
  @Post()
  @AuditLog({
    action: AuditAction.POST_CREATE,
    resourceType: 'post',
    severity: AuditSeverity.INFO,
    includeBody: true,
    includeResponse: true,
  })
  async create(@Body() dto: CreatePostDto) {
    // Your logic here
  }
}
```

### 3. Advanced Filtering and Search

Query audit logs with powerful filtering options:

```typescript
const result = await auditService.findAll(workspaceId, {
  action: AuditAction.LOGIN,
  severity: AuditSeverity.WARNING,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  search: 'failed',
  page: 1,
  limit: 50,
  sortBy: 'timestamp',
  sortOrder: 'desc',
});
```

### 4. Statistics and Analytics

Get comprehensive statistics about audit activity:

```typescript
const stats = await auditService.getStatistics(workspaceId, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  groupBy: 'day',
});

// Returns:
// - totalLogs
// - actionCounts
// - severityCounts
// - statusCounts
// - topUsers
// - resourceTypeCounts
// - timeSeries (if groupBy specified)
```

### 5. Compliance Reporting

Generate compliance-ready audit reports:

```typescript
// General audit report
const report = await auditReportService.generateReport(workspaceId, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  actions: [AuditAction.DATA_EXPORT, AuditAction.DATA_DELETE],
  minSeverity: AuditSeverity.WARNING,
  format: 'json', // or 'csv', 'pdf'
  includeDetails: true,
});

// Compliance-specific report
const complianceReport = await auditReportService.generateComplianceReport(
  workspaceId,
  '2024-01-01',
  '2024-12-31',
);
```

### 6. Export for External Systems

Export audit logs in formats compatible with SIEM, Splunk, or ELK Stack:

```typescript
// SIEM (Common Event Format)
const siemLogs = await auditReportService.exportForCompliance(
  workspaceId,
  '2024-01-01',
  '2024-12-31',
  'siem',
);

// Splunk
const splunkLogs = await auditReportService.exportForCompliance(
  workspaceId,
  '2024-01-01',
  '2024-12-31',
  'splunk',
);

// ELK Stack (Elasticsearch)
const elkLogs = await auditReportService.exportForCompliance(
  workspaceId,
  '2024-01-01',
  '2024-12-31',
  'elk',
);
```

## API Endpoints

### Get Audit Logs
```
GET /audit/logs
Query Parameters:
  - userId: Filter by user ID
  - action: Filter by action type
  - resourceType: Filter by resource type
  - resourceId: Filter by resource ID
  - severity: Filter by severity level
  - status: Filter by status
  - startDate: Start date (ISO 8601)
  - endDate: End date (ISO 8601)
  - search: Full-text search
  - page: Page number (default: 1)
  - limit: Items per page (default: 50, max: 100)
  - sortBy: Sort field (default: timestamp)
  - sortOrder: Sort order (asc/desc, default: desc)
```

### Get Single Audit Log
```
GET /audit/logs/:id
Returns the audit log with integrity verification status
```

### Get Statistics
```
GET /audit/statistics
Query Parameters:
  - startDate: Start date (ISO 8601)
  - endDate: End date (ISO 8601)
  - groupBy: Group by field (action, user, resourceType, severity, status, day, hour)
```

### Verify Integrity
```
GET /audit/logs/:id/verify
Verifies the tamper-proof hash of a single audit log
```

### Batch Verify Integrity
```
POST /audit/verify-batch
Body:
  - startDate: Optional start date
  - endDate: Optional end date
Returns integrity verification results for all logs in range
```

### Generate Report
```
POST /audit/reports/generate
Body:
  - startDate: Start date (required)
  - endDate: End date (required)
  - actions: Array of actions to include
  - userIds: Array of user IDs to include
  - resourceTypes: Array of resource types to include
  - minSeverity: Minimum severity level
  - format: Output format (json, csv, pdf)
  - includeDetails: Include full log details (default: true)
```

### Generate Compliance Report
```
POST /audit/reports/compliance
Body:
  - startDate: Start date (required)
  - endDate: End date (required)
Returns compliance-specific report with SOC 2, GDPR, and HIPAA sections
```

### Export for Compliance
```
POST /audit/export
Body:
  - startDate: Start date (required)
  - endDate: End date (required)
  - format: Export format (siem, splunk, elk)
```

### Cleanup Old Logs
```
POST /audit/cleanup
Body:
  - retentionDays: Number of days to retain (default: 2555 = 7 years)
```

## Audit Actions

The system tracks the following categories of actions:

### Authentication
- `LOGIN`, `LOGOUT`, `LOGIN_FAILED`
- `PASSWORD_CHANGE`, `PASSWORD_RESET`
- `TWO_FACTOR_ENABLED`, `TWO_FACTOR_DISABLED`

### User Management
- `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `USER_INVITE`
- `PERMISSION_CHANGE`, `ROLE_CHANGE`

### Content Management
- `POST_CREATE`, `POST_UPDATE`, `POST_DELETE`
- `POST_PUBLISH`, `POST_SCHEDULE`
- `POST_APPROVE`, `POST_REJECT`

### Media Management
- `MEDIA_UPLOAD`, `MEDIA_DELETE`, `MEDIA_UPDATE`

### Social Account Management
- `ACCOUNT_CONNECT`, `ACCOUNT_DISCONNECT`, `ACCOUNT_UPDATE`

### Workspace Management
- `WORKSPACE_CREATE`, `WORKSPACE_UPDATE`, `WORKSPACE_DELETE`
- `WORKSPACE_SETTINGS_UPDATE`

### Campaign Management
- `CAMPAIGN_CREATE`, `CAMPAIGN_UPDATE`, `CAMPAIGN_DELETE`

### Analytics & Reports
- `REPORT_GENERATE`, `REPORT_EXPORT`, `ANALYTICS_VIEW`

### Compliance & Data
- `DATA_EXPORT`, `DATA_DELETE`
- `CONSENT_GRANT`, `CONSENT_REVOKE`

### Security
- `IP_WHITELIST_ADD`, `IP_WHITELIST_REMOVE`
- `SECURITY_SCAN`, `ENCRYPTION_KEY_ROTATE`

### Integration
- `INTEGRATION_CONNECT`, `INTEGRATION_DISCONNECT`
- `API_KEY_CREATE`, `API_KEY_DELETE`

### Workflow
- `WORKFLOW_CREATE`, `WORKFLOW_UPDATE`, `WORKFLOW_DELETE`, `WORKFLOW_EXECUTE`
- `APPROVAL_SUBMIT`, `APPROVAL_APPROVE`, `APPROVAL_REJECT`

### AI Operations
- `AI_CONTENT_GENERATE`, `AI_BRAND_VOICE_TRAIN`, `AI_ANALYSIS`

### Community Management
- `MESSAGE_SEND`, `MESSAGE_DELETE`
- `CONVERSATION_ASSIGN`, `CONVERSATION_RESOLVE`

### System
- `SYSTEM_CONFIG_UPDATE`, `BACKUP_CREATE`, `BACKUP_RESTORE`

## Severity Levels

- `INFO`: Normal operations
- `WARNING`: Potentially concerning events
- `ERROR`: Error conditions
- `CRITICAL`: Critical security or system events

## Status Values

- `SUCCESS`: Operation completed successfully
- `FAILURE`: Operation failed
- `BLOCKED`: Operation was blocked by security rules
- `PENDING`: Operation is pending approval

## Helper Methods

The `AuditService` provides convenient helper methods for common operations:

```typescript
// Log login attempt
await auditService.logLogin(workspaceId, userId, ipAddress, userAgent, success);

// Log logout
await auditService.logLogout(workspaceId, userId, ipAddress, userAgent);

// Log resource action
await auditService.logResourceAction(
  workspaceId,
  userId,
  AuditAction.POST_CREATE,
  'post',
  'post-123',
  ipAddress,
  userAgent,
  { title: 'My Post' },
);

// Log security event
await auditService.logSecurityEvent(
  workspaceId,
  userId,
  AuditAction.IP_WHITELIST_ADD,
  ipAddress,
  userAgent,
  { ip: '192.168.1.100' },
  AuditSeverity.WARNING,
);
```

## Data Retention

The system supports configurable retention policies:

- **Default**: 2555 days (7 years) for compliance
- **Automatic Cleanup**: Scheduled job removes logs older than retention period
- **Manual Cleanup**: Admin can trigger cleanup via API

```typescript
// Cleanup logs older than 7 years
await auditService.cleanup(workspaceId, 2555);
```

## Security Features

### 1. Tamper-Proof Storage
Each log entry includes a SHA-256 hash that can be verified to ensure the log hasn't been modified.

### 2. Sensitive Data Sanitization
The audit interceptor automatically redacts sensitive fields like passwords, tokens, and API keys.

### 3. Workspace Isolation
All audit logs are scoped to workspaces, ensuring complete tenant isolation.

### 4. Immutable Logs
Audit logs cannot be modified or deleted (except by retention policy), ensuring a complete audit trail.

## Compliance

### SOC 2 Type II
- ✅ Comprehensive audit logging
- ✅ Tamper-proof storage
- ✅ Access control logging
- ✅ 7-year retention

### GDPR
- ✅ Data access logging
- ✅ User action tracking
- ✅ Right to deletion support
- ✅ Data export capabilities

### HIPAA
- ✅ Complete access logs
- ✅ Security incident tracking
- ✅ Audit trail integrity
- ✅ Retention compliance

## Integration with Other Modules

The audit module is designed to be used across the entire application:

```typescript
// In any service
constructor(private auditService: AuditService) {}

async someAction(workspaceId: string, userId: string) {
  // Perform action
  const result = await this.doSomething();
  
  // Log the action
  await this.auditService.logResourceAction(
    workspaceId,
    userId,
    AuditAction.POST_CREATE,
    'post',
    result.id,
    req.ip,
    req.headers['user-agent'],
    { title: result.title },
  );
  
  return result;
}
```

## Performance Considerations

1. **Async Logging**: Audit logging is non-blocking and won't slow down main operations
2. **Indexed Queries**: All common query patterns use database indexes
3. **Batch Operations**: Integrity verification can be batched for efficiency
4. **Caching**: Statistics can be cached for frequently accessed data
5. **Archival**: Old logs can be archived to cold storage for cost optimization

## Testing

The module includes comprehensive unit tests:

```bash
npm test -- src/audit --run
```

Test coverage includes:
- Audit log creation with hash generation
- Integrity verification
- Filtering and search
- Statistics generation
- Report generation
- Export formats
- Helper methods

## Future Enhancements

- [ ] Real-time audit log streaming via WebSocket
- [ ] Machine learning for anomaly detection
- [ ] Automated compliance scoring
- [ ] Integration with external SIEM systems
- [ ] Blockchain-based immutable audit trail
- [ ] Advanced visualization dashboards
- [ ] Automated incident response workflows
