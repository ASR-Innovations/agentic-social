# SSO Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Add to `.env`:
```env
# Encryption Key (32 characters minimum)
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Google OAuth (if using Google SSO)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/sso/google/callback

# Azure AD (if using Azure SSO)
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# Okta (if using Okta SSO)
OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_CALLBACK_URL=http://localhost:3001/auth/sso/okta/callback
```

### 3. Run Database Migration
```bash
npm run prisma:migrate
npm run prisma:generate
```

## Usage

### Configure SSO (Admin)
```typescript
// POST /auth/sso/config
const response = await fetch('/auth/sso/config', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    provider: 'GOOGLE',
    tenantId: workspaceId,
    enabled: true,
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'http://localhost:3001/auth/sso/google/callback',
  }),
});
```

### Initiate SSO Login (Frontend)
```typescript
// Redirect user to SSO login
window.location.href = `/auth/sso/google/login?workspaceId=${workspaceId}`;
```

### Handle Callback (Frontend)
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

## Provider Setup

### Google Workspace
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/sso/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Azure AD
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory
3. Register new application
4. Add redirect URI: `http://localhost:3001/auth/sso/azure/callback`
5. Create client secret
6. Copy Tenant ID, Client ID, and Client Secret to `.env`

### Okta
1. Go to [Okta Admin Console](https://your-domain.okta.com/admin)
2. Create new application
3. Select "Web" application type
4. Add redirect URI: `http://localhost:3001/auth/sso/okta/callback`
5. Copy Client ID and Client Secret to `.env`

## Testing

### Manual Test
```bash
# 1. Start server
npm run start:dev

# 2. Configure SSO (use Postman or curl)
curl -X POST http://localhost:3001/auth/sso/config \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"provider":"GOOGLE","tenantId":"workspace-id","enabled":true,"clientId":"...","clientSecret":"..."}'

# 3. Open browser
http://localhost:3001/auth/sso/google/login?workspaceId=workspace-id

# 4. Complete OAuth flow
# 5. Verify redirect with tokens
```

### Run Tests
```bash
npm test -- sso.service.spec.ts
```

## Troubleshooting

### "SSO configuration not found"
- Ensure SSO is configured for the workspace
- Check workspace ID is correct

### "Email not provided by provider"
- Verify IdP includes email in profile/claims
- Check scope includes email permission

### "Workspace ID is required"
- Include workspaceId in login URL query parameter

### Encryption errors
- Ensure ENCRYPTION_KEY is at least 32 characters
- Use same key for encryption and decryption

## API Reference

### Configuration
- `POST /auth/sso/config` - Create config
- `GET /auth/sso/config` - Get config
- `PUT /auth/sso/config` - Update config
- `DELETE /auth/sso/config` - Delete config

### Authentication
- `GET /auth/sso/google/login?workspaceId=xxx` - Google login
- `GET /auth/sso/azure/login?workspaceId=xxx` - Azure login
- `GET /auth/sso/okta/login?workspaceId=xxx` - Okta login
- `GET /auth/sso/saml/login?workspaceId=xxx` - SAML login

### Callbacks (handled automatically)
- `GET /auth/sso/google/callback`
- `GET /auth/sso/azure/callback`
- `GET /auth/sso/okta/callback`
- `POST /auth/sso/saml/callback`

## Security Checklist

- [ ] ENCRYPTION_KEY is 32+ characters
- [ ] JWT secrets are strong and unique
- [ ] HTTPS enabled in production
- [ ] Redirect URIs match exactly
- [ ] Client secrets stored securely
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

## Next Steps

1. Configure IdP applications
2. Set up SSO for your workspace
3. Test login flow
4. Update frontend with SSO buttons
5. Deploy to production with HTTPS
6. Monitor SSO login events

For detailed documentation, see `SSO_IMPLEMENTATION.md`.
