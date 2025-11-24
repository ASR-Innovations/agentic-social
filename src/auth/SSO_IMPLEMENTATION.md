# SSO Integration Implementation

## Overview

This implementation provides comprehensive Single Sign-On (SSO) support for the AI Social Media Platform, enabling enterprise authentication through multiple identity providers.

## Supported SSO Providers

1. **SAML 2.0** - Generic SAML authentication
2. **Google Workspace** - OAuth 2.0 with Google
3. **Azure Active Directory** - Microsoft Azure AD
4. **Okta** - Okta identity platform

## Architecture

### Components

#### 1. SSO Configuration Service (`sso.service.ts`)
- Manages SSO configuration per workspace
- Encrypts sensitive credentials (client secrets, certificates)
- Provides CRUD operations for SSO configs

#### 2. Authentication Strategies
- **SamlStrategy** - SAML 2.0 authentication
- **GoogleStrategy** - Google OAuth 2.0
- **AzureADStrategy** - Azure AD Bearer token validation
- **OktaStrategy** - Okta OAuth 2.0

#### 3. SSO Controller (`sso.controller.ts`)
- Configuration management endpoints
- SSO login initiation endpoints
- Callback handlers for each provider

### Database Schema

#### SSOConfig Model
```prisma
model SSOConfig {
  id          String      @id @default(uuid())
  workspaceId String      @unique
  workspace   Workspace   @relation(fields: [workspaceId], references: [id])
  
  provider    SSOProvider
  enabled     Boolean     @default(true)
  
  // SAML Configuration
  entryPoint  String?
  issuer      String?
  cert        String?
  callbackUrl String?
  
  // OAuth 2.0 Configuration
  clientId     String?
  clientSecret String?  // Encrypted
  domain       String?
  tenantDomain String?
  redirectUri  String?
  
  metadata Json?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum SSOProvider {
  SAML
  GOOGLE
  AZURE_AD
  OKTA
}
```

#### User Model Updates
```prisma
model User {
  // ... existing fields
  password      String?      // Optional for SSO users
  ssoProvider   SSOProvider?
  ssoProviderId String?      // External ID from SSO provider
  refreshToken  String?      // For JWT refresh token rotation
}
```

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Key for SSO secrets
ENCRYPTION_KEY=your-32-character-encryption-key

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/sso/google/callback

# Azure AD
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# Okta
OKTA_DOMAIN=your-okta-domain.okta.com
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_CALLBACK_URL=http://localhost:3001/auth/sso/okta/callback
```

## API Endpoints

### Configuration Management (Admin Only)

#### Create SSO Configuration
```http
POST /auth/sso/config
Authorization: Bearer <jwt-token>

{
  "provider": "GOOGLE",
  "tenantId": "workspace-uuid",
  "enabled": true,
  "clientId": "google-client-id",
  "clientSecret": "google-client-secret",
  "redirectUri": "http://localhost:3001/auth/sso/google/callback"
}
```

#### Get SSO Configuration
```http
GET /auth/sso/config
Authorization: Bearer <jwt-token>
```

#### Update SSO Configuration
```http
PUT /auth/sso/config
Authorization: Bearer <jwt-token>

{
  "enabled": false
}
```

#### Delete SSO Configuration
```http
DELETE /auth/sso/config
Authorization: Bearer <jwt-token>
```

### SSO Login Flows

#### SAML Login
```http
GET /auth/sso/saml/login?workspaceId=<workspace-uuid>
```
Redirects to SAML IdP for authentication.

#### SAML Callback
```http
POST /auth/sso/saml/callback
```
Handles SAML assertion and issues JWT tokens.

#### Google Login
```http
GET /auth/sso/google/login?workspaceId=<workspace-uuid>
```
Redirects to Google OAuth consent screen.

#### Google Callback
```http
GET /auth/sso/google/callback
```
Handles Google OAuth callback and issues JWT tokens.

#### Azure AD Login
```http
GET /auth/sso/azure/login?workspaceId=<workspace-uuid>
```
Redirects to Azure AD login.

#### Azure AD Callback
```http
GET /auth/sso/azure/callback
```
Handles Azure AD callback and issues JWT tokens.

#### Okta Login
```http
GET /auth/sso/okta/login?workspaceId=<workspace-uuid>
```
Redirects to Okta login.

#### Okta Callback
```http
GET /auth/sso/okta/callback
```
Handles Okta callback and issues JWT tokens.

#### Get Available Providers
```http
GET /auth/sso/providers/:workspaceId
```
Returns enabled SSO provider for a workspace.

## Authentication Flow

### 1. User Initiates SSO Login
```
User clicks "Sign in with Google" on frontend
  ↓
Frontend redirects to: GET /auth/sso/google/login?workspaceId=xxx
  ↓
Backend redirects to Google OAuth consent screen
```

### 2. User Authenticates with IdP
```
User enters credentials on Google
  ↓
Google validates credentials
  ↓
Google redirects to callback URL with authorization code
```

### 3. Backend Processes Callback
```
Backend receives callback: GET /auth/sso/google/callback?code=xxx
  ↓
GoogleStrategy validates with Google
  ↓
Strategy retrieves user profile
  ↓
System finds or creates user in database
  ↓
System generates JWT access and refresh tokens
  ↓
Backend redirects to frontend with tokens
```

### 4. Frontend Stores Tokens
```
Frontend receives: /auth/callback?access_token=xxx&refresh_token=yyy
  ↓
Frontend stores tokens in secure storage
  ↓
Frontend redirects to dashboard
```

## User Provisioning

### Auto-Provisioning
When a user logs in via SSO for the first time:

1. System checks if user exists by email
2. If not exists:
   - Creates new user with SSO provider info
   - Sets default role (EDITOR)
   - No password required
3. If exists but no SSO info:
   - Updates user with SSO provider info
   - Links existing account to SSO
4. Generates JWT tokens
5. Returns authenticated session

### User Attributes Mapping

#### SAML
- Email: `profile.email` or `profile.nameID`
- Name: `profile.displayName` or `profile.name`
- ID: `profile.nameID`

#### Google
- Email: `profile.emails[0].value`
- Name: `profile.displayName`
- Avatar: `profile.photos[0].value`
- ID: `profile.id`

#### Azure AD
- Email: `token.preferred_username` or `token.email` or `token.upn`
- Name: `token.name`
- ID: `token.oid` or `token.sub`

#### Okta
- Email: `userInfo.email`
- Name: `userInfo.name`
- ID: `userInfo.sub`

## Security Features

### 1. Credential Encryption
- Client secrets encrypted using AES-256-CBC
- Encryption key from environment variable
- IV (Initialization Vector) generated per encryption

### 2. Token Security
- JWT access tokens (short-lived: 15 minutes)
- JWT refresh tokens (long-lived: 7 days)
- Refresh token rotation on use
- Tokens invalidated on logout

### 3. Workspace Isolation
- SSO configuration per workspace
- Users auto-assigned to correct workspace
- Cross-workspace access prevented

### 4. CSRF Protection
- State parameter in OAuth flows
- SAML request validation
- Callback URL validation

## Testing

### Manual Testing

#### 1. Configure SSO (Admin)
```bash
curl -X POST http://localhost:3001/auth/sso/config \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "GOOGLE",
    "tenantId": "workspace-uuid",
    "enabled": true,
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "redirectUri": "http://localhost:3001/auth/sso/google/callback"
  }'
```

#### 2. Test SSO Login
```bash
# Open in browser
http://localhost:3001/auth/sso/google/login?workspaceId=workspace-uuid
```

#### 3. Verify User Creation
```bash
curl http://localhost:3001/auth/profile \
  -H "Authorization: Bearer <jwt-from-sso>"
```

### Integration Testing

```typescript
describe('SSO Integration', () => {
  it('should create SSO configuration', async () => {
    const response = await request(app)
      .post('/auth/sso/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        provider: 'GOOGLE',
        tenantId: workspaceId,
        enabled: true,
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.provider).toBe('GOOGLE');
  });

  it('should auto-provision user on first SSO login', async () => {
    // Mock Google OAuth response
    // Trigger callback
    // Verify user created
  });
});
```

## Troubleshooting

### Common Issues

#### 1. "SSO configuration not found"
- Ensure SSO is configured for the workspace
- Check workspace ID is correct
- Verify SSO is enabled

#### 2. "Email not provided by provider"
- Check IdP configuration includes email scope
- Verify email claim is mapped correctly
- Check IdP user has email address

#### 3. "User account is deactivated"
- User exists but is marked inactive
- Admin must reactivate user account

#### 4. "Workspace ID is required"
- Include workspaceId in login URL
- Check state parameter in OAuth flow

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
```

Check logs for:
- SSO configuration loading
- Provider authentication flow
- User provisioning
- Token generation

## Migration Guide

### From Password-Only to SSO

1. **Add SSO Configuration**
   ```typescript
   await ssoService.createConfig({
     provider: SSOProvider.GOOGLE,
     tenantId: workspaceId,
     enabled: true,
     clientId: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
   });
   ```

2. **Update Frontend Login**
   ```typescript
   // Add SSO button
   <button onClick={() => window.location.href = `/auth/sso/google/login?workspaceId=${workspaceId}`}>
     Sign in with Google
   </button>
   ```

3. **Handle Callback**
   ```typescript
   // In /auth/callback route
   const params = new URLSearchParams(window.location.search);
   const accessToken = params.get('access_token');
   const refreshToken = params.get('refresh_token');
   
   // Store tokens
   localStorage.setItem('access_token', accessToken);
   localStorage.setItem('refresh_token', refreshToken);
   
   // Redirect to dashboard
   router.push('/dashboard');
   ```

## Requirements Satisfied

✅ **Requirement 32.3** - SSO integration with SAML 2.0, OAuth 2.0
✅ **Requirement 32.3** - Support for Okta, Azure AD, and Google Workspace
✅ **Requirement 32.2** - Secure credential storage with AES-256 encryption
✅ **Requirement 5.1** - OAuth 2.0 authentication flow
✅ **Requirement 5.4** - Workspace isolation for multi-tenant SSO

## Future Enhancements

1. **Additional Providers**
   - OneLogin
   - Auth0
   - Ping Identity
   - Custom OIDC providers

2. **Advanced Features**
   - Just-in-Time (JIT) provisioning
   - SCIM user provisioning
   - Group/role mapping from IdP
   - Multi-factor authentication (MFA)
   - Session management
   - Single Logout (SLO)

3. **Admin Features**
   - SSO configuration wizard
   - Connection testing
   - Audit logs for SSO events
   - User provisioning rules

## Support

For issues or questions:
- Check troubleshooting section
- Review logs with debug mode enabled
- Verify IdP configuration
- Contact platform support
