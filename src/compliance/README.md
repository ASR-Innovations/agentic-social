# Compliance and Governance Module

This module implements comprehensive compliance and governance features for GDPR, CCPA, and other data protection regulations.

## Features

### 1. Data Retention Policies

Automated data retention management with configurable policies:

- **Policy Configuration**: Define retention periods for different data types
- **Automated Execution**: Daily execution of retention policies
- **Multiple Actions**: Delete, archive, or anonymize data
- **Flexible Conditions**: Apply policies based on custom conditions

**API Endpoints:**
- `POST /compliance/retention-policies` - Create a new retention policy
- `GET /compliance/retention-policies` - List all policies
- `GET /compliance/retention-policies/:id` - Get specific policy
- `PUT /compliance/retention-policies/:id` - Update policy
- `DELETE /compliance/retention-policies/:id` - Delete policy

**Example:**
```json
{
  "name": "Post Retention Policy",
  "description": "Delete posts older than 2 years",
  "dataType": "POSTS",
  "retentionDays": 730,
  "action": "DELETE",
  "isActive": true
}
```

### 2. Data Export (Right of Access)

GDPR Article 15 and CCPA compliance for data subject access requests:

- **Multiple Formats**: Export data in JSON, CSV, XML, or PDF
- **Selective Export**: Choose specific data types to export
- **Date Filtering**: Export data within specific date ranges
- **Automatic Expiration**: Export files expire after 7 days
- **Async Processing**: Large exports processed in background

**API Endpoints:**
- `POST /compliance/export-requests` - Create export request
- `GET /compliance/export-requests` - List all export requests
- `GET /compliance/export-requests/:id` - Get specific request

**Example:**
```json
{
  "requestType": "GDPR_SUBJECT_ACCESS",
  "format": "JSON",
  "dataTypes": ["POSTS", "MESSAGES", "USER_DATA"],
  "dateFrom": "2023-01-01",
  "dateTo": "2024-01-01"
}
```

### 3. Data Deletion (Right to Erasure)

GDPR Article 17 and CCPA right to delete compliance:

- **Approval Workflow**: Optional approval process for deletions
- **Scheduled Deletion**: Schedule deletions for future execution
- **Audit Trail**: Complete log of what was deleted
- **User Anonymization**: Anonymize user data instead of deletion
- **Bulk Operations**: Delete multiple data types at once

**API Endpoints:**
- `POST /compliance/deletion-requests` - Create deletion request
- `GET /compliance/deletion-requests` - List all deletion requests
- `GET /compliance/deletion-requests/:id` - Get specific request
- `POST /compliance/deletion-requests/:id/approve` - Approve deletion
- `POST /compliance/deletion-requests/:id/reject` - Reject deletion

**Example:**
```json
{
  "requestType": "GDPR_RIGHT_TO_ERASURE",
  "dataTypes": ["USER_DATA", "POSTS", "MESSAGES"],
  "userId": "user-id-to-delete",
  "requiresApproval": true
}
```

### 4. Compliance Reporting

Generate comprehensive compliance reports:

- **GDPR Compliance Report**: Overall GDPR compliance status
- **CCPA Compliance Report**: CCPA compliance metrics
- **Data Retention Report**: Retention policy effectiveness
- **Access Log Report**: Audit trail analysis
- **Compliance Scoring**: Automated compliance score calculation
- **Findings & Recommendations**: Actionable compliance improvements

**API Endpoints:**
- `POST /compliance/reports` - Generate compliance report
- `GET /compliance/reports` - List all reports
- `GET /compliance/reports/:id` - Get specific report

**Example:**
```json
{
  "reportType": "GDPR_COMPLIANCE",
  "title": "Q1 2024 GDPR Compliance Report",
  "periodFrom": "2024-01-01",
  "periodTo": "2024-03-31",
  "fileFormat": "PDF"
}
```

### 5. Consent Management

Track and manage user consent for data processing:

- **Consent Recording**: Record user consent with full audit trail
- **Consent Withdrawal**: Allow users to withdraw consent
- **Consent Verification**: Check if valid consent exists
- **Legal Basis Tracking**: Track legal basis for data processing
- **Expiration Management**: Automatic expiration of time-limited consents

**API Endpoints:**
- `POST /compliance/consent-records` - Record consent
- `GET /compliance/consent-records` - List consent records
- `GET /compliance/consent-records/:id` - Get specific record
- `POST /compliance/consent-records/:id/withdraw` - Withdraw consent
- `GET /compliance/consent-check` - Check if consent exists

**Example:**
```json
{
  "userId": "user-123",
  "consentType": "MARKETING_COMMUNICATIONS",
  "purpose": "Send promotional emails",
  "granted": true,
  "legalBasis": "CONSENT",
  "source": "signup_form"
}
```

## Automated Tasks

The module includes several automated cron jobs:

1. **Data Retention Execution** (Daily at 2 AM)
   - Executes all active retention policies
   - Deletes, archives, or anonymizes data based on policy

2. **Scheduled Deletions** (Every Hour)
   - Processes approved deletion requests
   - Executes deletions scheduled for current time

3. **Export Cleanup** (Daily at 3 AM)
   - Removes expired export files
   - Updates export request status

4. **Consent Cleanup** (Daily at 4 AM)
   - Marks expired consents as withdrawn
   - Maintains consent record integrity

## Data Types Supported

The following data types can be managed through compliance features:

- `POSTS` - Social media posts
- `MEDIA_ASSETS` - Images, videos, and other media
- `CONVERSATIONS` - Conversation threads
- `MESSAGES` - Individual messages
- `ANALYTICS_DATA` - Analytics and metrics data
- `AUDIT_LOGS` - Security and audit logs
- `USER_DATA` - User profile information
- `SOCIAL_ACCOUNT_DATA` - Connected social accounts
- `AI_CACHE` - AI-generated content cache
- `MENTIONS` - Social listening mentions

## Compliance Standards

### GDPR (General Data Protection Regulation)

- **Article 5(1)(e)**: Data retention limitations
- **Article 15**: Right of access by the data subject
- **Article 17**: Right to erasure ('right to be forgotten')
- **Article 30**: Records of processing activities
- **Article 33**: Notification of data breach

### CCPA (California Consumer Privacy Act)

- **Right to Know**: Data export functionality
- **Right to Delete**: Data deletion requests
- **45-Day Response**: Automated tracking of response times

## Security Features

- **Audit Trail**: Complete logging of all compliance actions
- **Approval Workflows**: Multi-level approval for sensitive operations
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based access to compliance features
- **Tamper-Proof Logs**: Immutable audit logs

## Best Practices

1. **Regular Reviews**: Review retention policies quarterly
2. **Timely Responses**: Process data subject requests within legal timeframes
3. **Documentation**: Maintain records of all data processing activities
4. **Training**: Ensure team members understand compliance requirements
5. **Monitoring**: Regularly generate compliance reports
6. **Testing**: Test data export and deletion processes regularly

## Configuration

The module uses the following environment variables:

```env
# Database connection (required)
DATABASE_URL=postgresql://user:password@localhost:5432/database

# File storage paths (optional)
EXPORT_STORAGE_PATH=./exports
REPORT_STORAGE_PATH=./reports
```

## Integration

To use the compliance module in your application:

```typescript
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [
    ComplianceModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Support

For questions or issues related to compliance features, please refer to:
- GDPR Official Text: https://gdpr-info.eu/
- CCPA Official Text: https://oag.ca.gov/privacy/ccpa
- Internal compliance documentation
