# Advanced Security Features

This document describes the advanced security features implemented in the AI Social Media Platform.

## Overview

The platform implements enterprise-grade security controls including:
- IP Whitelisting
- Two-Factor Authentication (2FA)
- Session Management
- Security Audit Logging
- Automated Security Scanning
- Data Encryption at Rest

## Features

### 1. IP Whitelisting

Control access to your workspace by whitelisting specific IP addresses or CIDR ranges.

**Endpoints:**
- `POST /security/ip-whitelist` - Add IP to whitelist
- `GET /security/ip-whitelist` - List all whitelisted IPs
- `GET /security/ip-whitelist/:id` - Get specific whitelist entry
- `PUT /security/ip-whitelist/:id` - Update whitelist entry
- `DELETE /security/ip-whitelist/:id` - Remove IP from whitelist

**Example:**
```typescript
// Add IP to whitelist
POST /security/ip-whitelist
{
  "ipAddress": "192.168.1.100",
  "description": "Office network",
  "isActive": true
}

// Add CIDR range
POST /security/ip-whitelist
{
  "ipAddress": "10.0.0.0/24",
  "description": "VPN network"
}
```

**How it works:**
- If no whitelist entries exist, all IPs are allowed
- Once whitelist entries are added, only whitelisted IPs can access the workspace
- Supports both individual IPs and CIDR notation
- Can be enabled/disabled per entry without deletion

### 2. Two-Factor Authentication (2FA)

Add an extra layer of security with TOTP-based two-factor authentication.

**Endpoints:**
- `POST /security/2fa/setup` - Generate 2FA secret and QR code
- `POST /security/2fa/enable` - Enable 2FA with verification
- `POST /security/2fa/verify` - Verify 2FA token
- `POST /security/2fa/disable` - Disable 2FA
- `POST /security/2fa/backup-codes/regenerate` - Regenerate backup codes
- `GET /security/2fa/status` - Check 2FA status

**Setup Flow:**
1. Call `/security/2fa/setup` to get QR code and secret
2. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
3. Call `/security/2fa/enable` with verification token
4. Save backup codes securely

**Example:**
```typescript
// Step 1: Setup
POST /security/2fa/setup
Response: {
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}

// Step 2: Enable
POST /security/2fa/enable
{
  "token": "123456",
  "secret": "JBSWY3DPEHPK3PXP"
}
Response: {
  "enabled": true,
  "backupCodes": [
    "ABCD-1234",
    "EFGH-5678",
    ...
  ]
}

// Verify during login
POST /security/2fa/verify
{
  "token": "123456"
}
```

**Features:**
- TOTP-based (Time-based One-Time Password)
- 10 backup codes for emergency access
- Backup codes are single-use
- Encrypted storage of secrets

### 3. Session Management

Track and manage active user sessions across devices.

**Endpoints:**
- `GET /security/sessions` - List all active sessions
- `DELETE /security/sessions/:id` - Revoke specific session
- `POST /security/sessions/revoke-all` - Revoke all sessions

**Example:**
```typescript
// List sessions
GET /security/sessions
Response: [
  {
    "id": "session-1",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "deviceInfo": {
      "browser": "Chrome",
      "os": "Windows"
    },
    "lastActivity": "2024-01-20T10:30:00Z",
    "expiresAt": "2024-01-21T10:30:00Z",
    "isActive": true
  }
]

// Revoke specific session
DELETE /security/sessions/session-1

// Revoke all except current
POST /security/sessions/revoke-all
{
  "keepCurrent": true
}
```

**Features:**
- Track device information and location
- Automatic cleanup of expired sessions
- Maximum 10 concurrent sessions per user
- 24-hour session duration (configurable)

### 4. Security Audit Logging

Comprehensive audit trail of all security-relevant actions.

**Endpoints:**
- `GET /security/audit-logs` - Query audit logs
- `GET /security/audit-logs/statistics` - Get audit statistics

**Example:**
```typescript
// Query logs
GET /security/audit-logs?action=login&startDate=2024-01-01&endDate=2024-01-31
Response: {
  "logs": [
    {
      "id": "log-1",
      "action": "login",
      "resourceType": "user",
      "resourceId": "user-123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "severity": "info",
      "timestamp": "2024-01-20T10:30:00Z",
      "details": {
        "method": "POST",
        "path": "/auth/login",
        "statusCode": 200
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}

// Get statistics
GET /security/audit-logs/statistics?startDate=2024-01-01
Response: {
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

**Logged Actions:**
- Authentication (login, logout, failed attempts)
- Password changes
- 2FA enable/disable
- Session management
- Permission changes
- Content operations (create, update, delete)
- Settings updates
- User management

**Features:**
- Tamper-proof storage
- 7-year retention (configurable)
- Severity levels (info, warning, error, critical)
- Detailed context for each action
- Automatic cleanup of old logs

### 5. Automated Security Scanning

Regular security scans to identify vulnerabilities and compliance issues.

**Endpoints:**
- `POST /security/scans` - Initiate security scan
- `GET /security/scans` - List scan results
- `GET /security/scans/:id` - Get specific scan result

**Scan Types:**
- `vulnerability` - Scan for security vulnerabilities
- `compliance` - Check compliance with standards (SOC 2, GDPR, etc.)
- `dependency` - Scan dependencies for known vulnerabilities
- `code` - Static code analysis

**Example:**
```typescript
// Initiate scan
POST /security/scans
{
  "scanType": "vulnerability"
}
Response: {
  "id": "scan-1",
  "scanType": "vulnerability",
  "status": "pending",
  "startedAt": "2024-01-20T10:30:00Z"
}

// Get scan results
GET /security/scans/scan-1
Response: {
  "id": "scan-1",
  "scanType": "vulnerability",
  "status": "completed",
  "findings": [
    {
      "id": "VULN-001",
      "title": "SQL Injection Risk",
      "severity": "high",
      "location": "src/database/queries.ts:45",
      "recommendation": "Use parameterized queries"
    }
  ],
  "severityCounts": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 5
  },
  "completedAt": "2024-01-20T10:35:00Z"
}
```

**Integration Points:**
- OWASP ZAP for vulnerability scanning
- Snyk for dependency scanning
- SonarQube for code quality
- Custom compliance checks

### 6. Data Encryption at Rest

AES-256-GCM encryption for sensitive data.

**Service:** `EncryptionService`

**Features:**
- AES-256-GCM encryption
- Workspace-specific encryption keys
- Key rotation support
- Master key encryption
- Automatic re-encryption during key rotation

**Usage:**
```typescript
// Encrypt data
const encrypted = await encryptionService.encrypt(
  'sensitive data',
  workspaceId,
  'data'
);

// Decrypt data
const decrypted = await encryptionService.decrypt(
  encrypted,
  workspaceId,
  'data'
);

// Rotate keys
await encryptionService.rotateKey(workspaceId, 'data');

// Hash sensitive data (one-way)
const hash = encryptionService.hash('password');

// Generate secure token
const token = encryptionService.generateToken(32);
```

**Key Types:**
- `data` - General data encryption
- `token` - Token encryption
- `backup` - Backup encryption

## Environment Variables

Add these to your `.env` file:

```env
# Two-Factor Authentication
TWO_FACTOR_ENCRYPTION_KEY=your-32-byte-hex-key

# Master Encryption Key (for data at rest)
MASTER_ENCRYPTION_KEY=your-32-byte-hex-key

# Session Configuration
SESSION_DURATION_HOURS=24
MAX_SESSIONS_PER_USER=10

# Audit Log Retention
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
```

## Security Best Practices

1. **IP Whitelisting:**
   - Use CIDR ranges for networks
   - Regularly review and update whitelist
   - Document each entry with clear descriptions

2. **Two-Factor Authentication:**
   - Enforce 2FA for admin users
   - Store backup codes securely
   - Regenerate backup codes periodically

3. **Session Management:**
   - Set appropriate session duration
   - Revoke sessions on password change
   - Monitor for suspicious session activity

4. **Audit Logging:**
   - Regularly review audit logs
   - Set up alerts for critical events
   - Export logs for compliance

5. **Security Scanning:**
   - Run scans regularly (weekly/monthly)
   - Address critical findings immediately
   - Track remediation progress

6. **Encryption:**
   - Rotate encryption keys annually
   - Store master key in secure vault (AWS KMS, HashiCorp Vault)
   - Never commit encryption keys to version control

## Compliance

These security features help meet requirements for:
- SOC 2 Type II
- GDPR
- HIPAA
- PCI DSS
- ISO 27001

## Monitoring and Alerts

Set up monitoring for:
- Failed login attempts
- IP whitelist violations
- Session anomalies
- Security scan findings
- Encryption key rotations

## API Integration

All security endpoints require authentication:

```typescript
// Add Bearer token to requests
headers: {
  'Authorization': 'Bearer your-jwt-token'
}
```

## Testing

Run security tests:

```bash
npm run test -- src/auth/services/*.spec.ts
```

## Support

For security issues or questions:
- Email: security@example.com
- Slack: #security-team
- Documentation: https://docs.example.com/security
