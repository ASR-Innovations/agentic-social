# Advanced Security Features - Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing and using the advanced security features in the AI Social Media Platform. All features are production-ready and follow enterprise security best practices.

## Table of Contents

1. [IP Whitelisting](#ip-whitelisting)
2. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
3. [Session Management](#session-management)
4. [Security Audit Logging](#security-audit-logging)
5. [Automated Security Scanning](#automated-security-scanning)
6. [Data Encryption at Rest](#data-encryption-at-rest)
7. [Integration Examples](#integration-examples)
8. [Security Best Practices](#security-best-practices)

## Requirements Validation

This implementation satisfies the following requirements from the specification:

- **Requirement 32.1**: SOC 2 Type II compliance with security certifications
- **Requirement 32.2**: AES-256 encryption at rest and TLS 1.3 for data in transit
- **Requirement 32.4**: Comprehensive audit logs with tamper-proof storage and 7-year retention
- **Requirement 32.5**: IP whitelisting, two-factor authentication, session management, and automated security scanning

## 1. IP Whitelisting

### Overview
Control access to your workspace by whitelisting specific IP addresses or CIDR ranges. When enabled, only requests from whitelisted IPs can access the workspace.

### Features
- Individual IP address whitelisting
- CIDR range support for network whitelisting
- Enable/disable entries without deletion
- Automatic validation of IP formats
- If no whitelist exists, all IPs are allowed (fail-open)

### API Endpoints

#### Add IP to Whitelist
```http
POST /security/ip-whitelist
Authorization: Bearer <token>
Content-Type: application/json

{
  "ipAddress": "192.168.1.100",
  "description": "Office network",
  "isActive": true
}
```

#### Add CIDR Range
```http
POST /security/ip-whitelist
Authorization: Bearer <token>
Content-Type: application/json

{
  "ipAddress": "10.0.0.0/24",
  "description": "VPN network",
  "isActive": true
}
```

#### List All Whitelisted IPs
```http
GET /security/ip-whitelist
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "uuid",
    "workspaceId": "workspace-id",
    "ipAddress": "192.168.1.100",
    "description": "Office network",
    "isActive": true,
    "createdBy": "user-id",
    "creator": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
]
```

#### Update Whitelist Entry
```http
PUT /security/ip-whitelist/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false
}
```

#### Remove IP from Whitelist
```http
DELETE /security/ip-whitelist/:id
Authorization: Bearer <token>
```

### Implementation in Code

#### Using the IP Whitelist Guard
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';

@Controller('protected')
@UseGuards(JwtAuthGuard, IPWhitelistGuard)
export class ProtectedController {
  @Get()
  async getProtectedResource() {
    // This endpoint is protected by IP whitelist
    return { message: 'Access granted' };
  }
}
```

#### Checking IP Programmatically
```typescript
import { IPWhitelistService } from './services/ip-whitelist.service';

constructor(private ipWhitelistService: IPWhitelistService) {}

async checkAccess(workspaceId: string, ipAddress: string) {
  const isAllowed = await this.ipWhitelistService.isIPWhitelisted(
    workspaceId,
    ipAddress
  );
  
  if (!isAllowed) {
    throw new ForbiddenException('IP not whitelisted');
  }
}
```

## 2. Two-Factor Authentication (2FA)

### Overview
TOTP-based two-factor authentication adds an extra layer of security. Users scan a QR code with an authenticator app and enter a 6-digit code during login.

### Features
- TOTP (Time-based One-Time Password) standard
- QR code generation for easy setup
- 10 backup codes for emergency access
- Backup codes are single-use
- Encrypted storage of secrets

### Setup Flow

#### Step 1: Generate Secret and QR Code
```http
POST /security/2fa/setup
Authorization: Bearer <token>
```

Response:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

#### Step 2: Enable 2FA with Verification
```http
POST /security/2fa/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

Response:
```json
{
  "enabled": true,
  "backupCodes": [
    "ABCD-1234",
    "EFGH-5678",
    "IJKL-9012",
    "MNOP-3456",
    "QRST-7890",
    "UVWX-1234",
    "YZAB-5678",
    "CDEF-9012",
    "GHIJ-3456",
    "KLMN-7890"
  ]
}
```

### Usage

#### Verify 2FA Token
```http
POST /security/2fa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

Response:
```json
{
  "valid": true
}
```

#### Check 2FA Status
```http
GET /security/2fa/status
Authorization: Bearer <token>
```

Response:
```json
{
  "enabled": true
}
```

#### Disable 2FA
```http
POST /security/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "user-password",
  "token": "123456"
}
```

#### Regenerate Backup Codes
```http
POST /security/2fa/backup-codes/regenerate
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

Response:
```json
{
  "backupCodes": [
    "OPQR-1111",
    "STUV-2222",
    ...
  ]
}
```

### Integration in Login Flow

```typescript
import { TwoFactorService } from './services/two-factor.service';

async login(email: string, password: string, twoFactorToken?: string) {
  // Validate credentials
  const user = await this.validateUser(email, password);
  
  // Check if 2FA is enabled
  const has2FA = await this.twoFactorService.isEnabled(user.id);
  
  if (has2FA) {
    if (!twoFactorToken) {
      return {
        requires2FA: true,
        message: 'Please provide 2FA token'
      };
    }
    
    // Verify 2FA token
    const isValid = await this.twoFactorService.verify(user.id, twoFactorToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
  }
  
  // Generate JWT tokens
  return this.generateTokens(user);
}
```

## 3. Session Management

### Overview
Track and manage active user sessions across devices. Provides visibility into where users are logged in and ability to revoke sessions.

### Features
- Track device information and IP addresses
- Maximum 10 concurrent sessions per user
- 24-hour session duration (configurable)
- Automatic cleanup of expired sessions
- Revoke individual or all sessions

### API Endpoints

#### List Active Sessions
```http
GET /security/sessions
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "session-1",
    "userId": "user-id",
    "sessionToken": "token-hash",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "deviceInfo": {
      "browser": "Chrome",
      "os": "Windows",
      "device": "Desktop"
    },
    "isActive": true,
    "lastActivity": "2024-01-20T10:30:00Z",
    "expiresAt": "2024-01-21T10:30:00Z",
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

#### Revoke Specific Session
```http
DELETE /security/sessions/:sessionId
Authorization: Bearer <token>
```

#### Revoke All Sessions
```http
POST /security/sessions/revoke-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "keepCurrent": true
}
```

### Implementation

#### Creating a Session
```typescript
import { SessionService } from './services/session.service';

async createSession(userId: string, req: Request) {
  const session = await this.sessionService.create({
    userId,
    ipAddress: this.getClientIP(req),
    userAgent: req.headers['user-agent'],
    deviceInfo: this.parseUserAgent(req.headers['user-agent'])
  });
  
  return session.sessionToken;
}
```

#### Validating a Session
```typescript
async validateSession(sessionToken: string) {
  try {
    const session = await this.sessionService.findByToken(sessionToken);
    
    // Update last activity
    await this.sessionService.updateActivity(sessionToken);
    
    return session.user;
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired session');
  }
}
```

## 4. Security Audit Logging

### Overview
Comprehensive audit trail of all security-relevant actions with tamper-proof storage and 7-year retention.

### Features
- Automatic logging of security events
- Severity levels (info, warning, error, critical)
- Detailed context for each action
- Query and filter capabilities
- Statistics and analytics
- 7-year retention (configurable)

### Logged Actions
- Authentication (login, logout, failed attempts)
- Password changes
- 2FA enable/disable
- Session management
- Permission changes
- Content operations
- Settings updates
- User management

### API Endpoints

#### Query Audit Logs
```http
GET /security/audit-logs?action=login&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=50
Authorization: Bearer <token>
```

Response:
```json
{
  "logs": [
    {
      "id": "log-1",
      "workspaceId": "workspace-id",
      "userId": "user-id",
      "user": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "login",
      "resourceType": "user",
      "resourceId": "user-id",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "severity": "info",
      "details": {
        "method": "POST",
        "path": "/auth/login",
        "statusCode": 200
      },
      "timestamp": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

#### Get Audit Statistics
```http
GET /security/audit-logs/statistics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

Response:
```json
{
  "totalLogs": 1500,
  "actionCounts": {
    "login": 500,
    "logout": 450,
    "post_create": 300,
    "settings_update": 50
  },
  "severityCounts": {
    "info": 1200,
    "warning": 250,
    "error": 40,
    "critical": 10
  },
  "failedActions": 50
}
```

### Implementation

#### Manual Logging
```typescript
import { SecurityAuditService } from './services/security-audit.service';
import { AuditAction, AuditSeverity } from './dto/security-audit.dto';

async logAction(workspaceId: string, userId: string, req: Request) {
  await this.securityAuditService.create(workspaceId, userId, {
    action: AuditAction.POST_CREATE,
    resourceType: 'post',
    resourceId: 'post-id',
    ipAddress: this.getClientIP(req),
    userAgent: req.headers['user-agent'],
    status: 'success',
    severity: AuditSeverity.INFO,
    details: {
      postTitle: 'My Post',
      platforms: ['instagram', 'twitter']
    }
  });
}
```

#### Using Helper Methods
```typescript
// Log successful login
await this.securityAuditService.logLogin(
  workspaceId,
  userId,
  ipAddress,
  userAgent,
  true
);

// Log failed login
await this.securityAuditService.logLogin(
  workspaceId,
  userId,
  ipAddress,
  userAgent,
  false
);

// Log password change
await this.securityAuditService.logPasswordChange(
  workspaceId,
  userId,
  ipAddress,
  userAgent
);

// Log permission change
await this.securityAuditService.logPermissionChange(
  workspaceId,
  adminUserId,
  targetUserId,
  ipAddress,
  userAgent,
  { oldRole: 'editor', newRole: 'admin' }
);
```

## 5. Automated Security Scanning

### Overview
Regular security scans to identify vulnerabilities, compliance issues, and security risks.

### Scan Types
1. **Vulnerability Scan**: Identify security vulnerabilities in code and infrastructure
2. **Compliance Scan**: Check compliance with SOC 2, GDPR, HIPAA, PCI DSS
3. **Dependency Scan**: Scan dependencies for known vulnerabilities
4. **Code Scan**: Static code analysis for security issues

### API Endpoints

#### Initiate Security Scan
```http
POST /security/scans
Authorization: Bearer <token>
Content-Type: application/json

{
  "scanType": "vulnerability",
  "config": {
    "depth": "full",
    "includeThirdParty": true
  }
}
```

Response:
```json
{
  "id": "scan-1",
  "workspaceId": "workspace-id",
  "scanType": "vulnerability",
  "status": "pending",
  "startedAt": "2024-01-20T10:30:00Z",
  "createdAt": "2024-01-20T10:30:00Z"
}
```

#### List Scan Results
```http
GET /security/scans?scanType=vulnerability&status=completed&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "scans": [
    {
      "id": "scan-1",
      "workspaceId": "workspace-id",
      "scanType": "vulnerability",
      "status": "completed",
      "findings": [
        {
          "id": "VULN-001",
          "title": "SQL Injection Risk",
          "description": "Potential SQL injection vulnerability detected",
          "severity": "high",
          "location": "src/database/queries.ts:45",
          "recommendation": "Use parameterized queries",
          "status": "open"
        }
      ],
      "severityCounts": {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 5,
        "info": 10
      },
      "startedAt": "2024-01-20T10:30:00Z",
      "completedAt": "2024-01-20T10:35:00Z",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Get Specific Scan Result
```http
GET /security/scans/:scanId
Authorization: Bearer <token>
```

### Implementation

#### Scheduling Regular Scans
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';
import { SecurityScanService } from './services/security-scan.service';
import { ScanType } from './dto/security-scan.dto';

@Injectable()
export class SecurityScanScheduler {
  constructor(private securityScanService: SecurityScanService) {}
  
  // Run vulnerability scan weekly
  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyVulnerabilityScan() {
    const workspaces = await this.getActiveWorkspaces();
    
    for (const workspace of workspaces) {
      await this.securityScanService.initiate(workspace.id, {
        scanType: ScanType.VULNERABILITY
      });
    }
  }
  
  // Run compliance scan monthly
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async runMonthlyComplianceScan() {
    const workspaces = await this.getActiveWorkspaces();
    
    for (const workspace of workspaces) {
      await this.securityScanService.initiate(workspace.id, {
        scanType: ScanType.COMPLIANCE
      });
    }
  }
}
```

## 6. Data Encryption at Rest

### Overview
AES-256-GCM encryption for sensitive data with workspace-specific keys and key rotation support.

### Features
- AES-256-GCM encryption
- Workspace-specific encryption keys
- Master key encryption
- Key rotation support
- Automatic re-encryption during rotation

### Implementation

#### Encrypting Data
```typescript
import { EncryptionService } from './services/encryption.service';

constructor(private encryptionService: EncryptionService) {}

async saveSecretData(workspaceId: string, data: string) {
  // Encrypt sensitive data
  const encrypted = await this.encryptionService.encrypt(
    data,
    workspaceId,
    'data'
  );
  
  // Store encrypted data
  await this.database.save({ encryptedData: encrypted });
}
```

#### Decrypting Data
```typescript
async getSecretData(workspaceId: string, encryptedData: string) {
  // Decrypt data
  const decrypted = await this.encryptionService.decrypt(
    encryptedData,
    workspaceId,
    'data'
  );
  
  return decrypted;
}
```

#### Key Rotation
```typescript
async rotateEncryptionKeys(workspaceId: string) {
  // Rotate the encryption key
  await this.encryptionService.rotateKey(workspaceId, 'data');
  
  // Re-encrypt all data with new key
  const records = await this.database.findAll({ workspaceId });
  
  for (const record of records) {
    const decrypted = await this.encryptionService.decrypt(
      record.encryptedData,
      workspaceId,
      'data'
    );
    
    const reencrypted = await this.encryptionService.encrypt(
      decrypted,
      workspaceId,
      'data'
    );
    
    await this.database.update(record.id, { encryptedData: reencrypted });
  }
}
```

#### Hashing (One-Way)
```typescript
// Hash sensitive data (cannot be decrypted)
const hash = this.encryptionService.hash('sensitive-data');

// Verify hash
const inputHash = this.encryptionService.hash(userInput);
if (inputHash === storedHash) {
  // Match!
}
```

#### Generate Secure Tokens
```typescript
// Generate 32-byte token (64 hex characters)
const token = this.encryptionService.generateToken(32);

// Use for API keys, session tokens, etc.
```

## 7. Integration Examples

### Complete Security Setup

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { IPWhitelistGuard } from './auth/guards/ip-whitelist.guard';

@Module({
  imports: [AuthModule],
  providers: [
    // Apply JWT auth globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply IP whitelist globally (optional)
    {
      provide: APP_GUARD,
      useClass: IPWhitelistGuard,
    },
  ],
})
export class AppModule {}
```

### Secure Controller Example

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';
import { SecurityAuditService } from './services/security-audit.service';
import { EncryptionService } from './services/encryption.service';
import { AuditAction, AuditSeverity } from './dto/security-audit.dto';

@Controller('sensitive-data')
@UseGuards(JwtAuthGuard, IPWhitelistGuard)
export class SensitiveDataController {
  constructor(
    private securityAuditService: SecurityAuditService,
    private encryptionService: EncryptionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSensitiveData(@Request() req, @Body() dto: CreateDataDto) {
    try {
      // Encrypt sensitive data
      const encrypted = await this.encryptionService.encrypt(
        dto.secretValue,
        req.user.workspaceId,
        'data'
      );

      // Save to database
      const record = await this.database.create({
        workspaceId: req.user.workspaceId,
        userId: req.user.userId,
        encryptedData: encrypted,
      });

      // Log the action
      await this.securityAuditService.create(
        req.user.workspaceId,
        req.user.userId,
        {
          action: AuditAction.POST_CREATE,
          resourceType: 'sensitive_data',
          resourceId: record.id,
          ipAddress: this.getClientIP(req),
          userAgent: req.headers['user-agent'],
          status: 'success',
          severity: AuditSeverity.INFO,
        }
      );

      return { id: record.id, created: true };
    } catch (error) {
      // Log failure
      await this.securityAuditService.create(
        req.user.workspaceId,
        req.user.userId,
        {
          action: AuditAction.POST_CREATE,
          resourceType: 'sensitive_data',
          resourceId: null,
          ipAddress: this.getClientIP(req),
          userAgent: req.headers['user-agent'],
          status: 'failure',
          severity: AuditSeverity.ERROR,
          details: { error: error.message },
        }
      );

      throw error;
    }
  }

  private getClientIP(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.connection?.remoteAddress ||
      req.ip ||
      '0.0.0.0'
    );
  }
}
```

## 8. Security Best Practices

### Environment Variables

Add these to your `.env` file:

```env
# Two-Factor Authentication
TWO_FACTOR_ENCRYPTION_KEY=your-32-byte-hex-key-here

# Master Encryption Key (for data at rest)
MASTER_ENCRYPTION_KEY=your-32-byte-hex-key-here

# Session Configuration
SESSION_DURATION_HOURS=24
MAX_SESSIONS_PER_USER=10

# Audit Log Retention
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Generate Secure Keys

```bash
# Generate 32-byte hex key for encryption
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### IP Whitelisting Best Practices

1. **Use CIDR ranges for networks**: Instead of adding individual IPs, use CIDR notation for entire networks
2. **Document each entry**: Always provide clear descriptions
3. **Regular audits**: Review whitelist quarterly
4. **Emergency access**: Keep a backup admin account accessible from any IP
5. **Test before enabling**: Add your current IP first, then test

### Two-Factor Authentication Best Practices

1. **Enforce for admins**: Require 2FA for all admin and owner roles
2. **Backup codes**: Ensure users save backup codes securely
3. **Recovery process**: Have a documented process for 2FA recovery
4. **Regular regeneration**: Encourage users to regenerate backup codes annually
5. **Grace period**: Allow 7-day grace period for 2FA setup after account creation

### Session Management Best Practices

1. **Appropriate duration**: 24 hours for regular users, shorter for admins
2. **Revoke on password change**: Always revoke all sessions when password changes
3. **Monitor suspicious activity**: Alert on sessions from new locations
4. **Limit concurrent sessions**: 10 is reasonable, adjust based on use case
5. **Regular cleanup**: Run cleanup job daily to remove expired sessions

### Audit Logging Best Practices

1. **Log everything security-related**: Better to have too much than too little
2. **Regular reviews**: Review critical and error logs weekly
3. **Automated alerts**: Set up alerts for critical events
4. **Retention compliance**: Ensure 7-year retention for compliance
5. **Export for analysis**: Regularly export logs for security analysis

### Security Scanning Best Practices

1. **Regular schedule**: Weekly vulnerability scans, monthly compliance scans
2. **Address critical findings immediately**: Don't let critical issues sit
3. **Track remediation**: Use a ticketing system to track fixes
4. **Scan before deployment**: Always scan before production deployments
5. **Third-party integration**: Consider integrating with Snyk, SonarQube, etc.

### Encryption Best Practices

1. **Rotate keys annually**: Set up annual key rotation schedule
2. **Secure master key**: Store master key in AWS KMS or HashiCorp Vault
3. **Never commit keys**: Use environment variables, never commit to git
4. **Encrypt all PII**: Any personally identifiable information should be encrypted
5. **Test decryption**: Regularly test that encrypted data can be decrypted

## Compliance Checklist

### SOC 2 Type II
- ✅ Comprehensive audit logging
- ✅ Access controls (IP whitelist, 2FA)
- ✅ Data encryption at rest
- ✅ Session management
- ✅ Security scanning

### GDPR
- ✅ Audit logs with 7-year retention
- ✅ Data encryption
- ✅ Access controls
- ✅ Right to deletion (via audit logs)
- ✅ Data export capabilities

### HIPAA
- ✅ Encryption at rest and in transit
- ✅ Access controls
- ✅ Audit logging
- ✅ Session management
- ✅ Security scanning

### PCI DSS
- ✅ Strong access controls
- ✅ Encryption of cardholder data
- ✅ Regular security testing
- ✅ Audit trails
- ✅ Secure authentication

## Monitoring and Alerts

### Recommended Alerts

1. **Failed login attempts**: Alert after 5 failed attempts in 5 minutes
2. **IP whitelist violations**: Alert on any blocked IP
3. **Session anomalies**: Alert on sessions from new countries
4. **Critical scan findings**: Alert immediately on critical vulnerabilities
5. **Encryption key rotation**: Alert when keys need rotation

### Metrics to Track

1. **Failed authentication rate**: Should be < 1%
2. **2FA adoption rate**: Target > 80% for admins
3. **Active sessions per user**: Average should be 1-2
4. **Audit log volume**: Track for anomalies
5. **Security scan findings**: Track trend over time

## Troubleshooting

### Common Issues

#### IP Whitelist Not Working
- Check if whitelist entries exist (empty = allow all)
- Verify IP format (use ipaddr.js validation)
- Check for proxy/load balancer IP forwarding
- Verify guard is applied to route

#### 2FA Token Invalid
- Check time synchronization on server and client
- Verify secret is correctly stored and encrypted
- Check if backup code was already used
- Ensure token is 6 digits

#### Session Expired
- Check session duration configuration
- Verify session cleanup isn't too aggressive
- Check for clock skew between servers
- Verify session token is being sent correctly

#### Encryption Fails
- Verify MASTER_ENCRYPTION_KEY is set
- Check key exists for workspace
- Verify data format (should be iv:encrypted:authTag)
- Check for key rotation in progress

## Support

For security issues or questions:
- **Security Email**: security@example.com
- **Documentation**: https://docs.example.com/security
- **Slack Channel**: #security-team

## Version History

- **v1.0.0** (2024-01-20): Initial implementation
  - IP Whitelisting
  - Two-Factor Authentication
  - Session Management
  - Security Audit Logging
  - Automated Security Scanning
  - Data Encryption at Rest
