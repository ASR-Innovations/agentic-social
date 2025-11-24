# White-Label Platform Documentation

## Overview

The white-label platform feature allows agencies and enterprise clients to customize the platform with their own branding, including custom domains, logos, colors, fonts, and email templates. This enables agencies to offer the platform as their own service to clients.

## Features

### 1. Custom Domain Mapping

Configure custom domains for your workspace:

```typescript
// Update custom domain
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  customDomain: {
    domain: 'app.yourbrand.com',
  },
});

// Get DNS records for configuration
const dnsRecords = await whiteLabelService.getDnsRecords(workspaceId);
// Returns: { A: '192.0.2.1', CNAME: 'app.platform.com', TXT: 'platform-verification=...' }

// Verify domain
const result = await whiteLabelService.verifyCustomDomain(workspaceId);
```

### 2. UI Customization

Customize the user interface with your branding:

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  enabled: true,
  companyName: 'Your Agency',
  logoUrl: 'https://youragency.com/logo.png',
  faviconUrl: 'https://youragency.com/favicon.ico',
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Roboto',
    heading: 'Poppins',
  },
  termsUrl: 'https://youragency.com/terms',
  privacyUrl: 'https://youragency.com/privacy',
  supportUrl: 'https://youragency.com/support',
});
```

### 3. Email Template Branding

All system emails are automatically branded with your configuration:

```typescript
// Generate branded email
const template = await emailTemplateService.generateEmailTemplate(
  workspaceId,
  'welcome',
  {
    subject: 'Welcome',
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
    loginUrl: 'https://app.youragency.com/login',
  },
);

// Available email templates:
// - welcome
// - post-published
// - approval-request
// - crisis-alert
// - report-ready
// - password-reset
// - team-invitation
```

### 4. Report Branding

Customize reports with your branding:

```typescript
// Get report branding configuration
const branding = await reportBrandingService.getReportBranding(workspaceId);

// Generate branded report
const html = await reportBrandingService.generateBrandedReport(
  workspaceId,
  'Monthly Analytics Report',
  reportContent,
);

// Generate CSV with branding
const csvHeader = await reportBrandingService.generateBrandedCsvHeader(
  workspaceId,
  'Analytics Export',
);
```

### 5. Hide Platform Branding

Remove all platform branding from client-facing interfaces:

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  hidePlatformBranding: true,
});
```

## API Endpoints

### Get White-Label Configuration

```http
GET /white-label/:workspaceId
```

**Response:**
```json
{
  "enabled": true,
  "companyName": "Your Agency",
  "logoUrl": "https://youragency.com/logo.png",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981"
  },
  "customDomain": {
    "domain": "app.youragency.com",
    "verified": true
  }
}
```

### Update White-Label Configuration

```http
PUT /white-label/:workspaceId
Content-Type: application/json

{
  "enabled": true,
  "companyName": "Your Agency",
  "logoUrl": "https://youragency.com/logo.png",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981"
  }
}
```

### Reset White-Label Configuration

```http
DELETE /white-label/:workspaceId
```

### Get DNS Records

```http
GET /white-label/:workspaceId/domain/dns-records
```

**Response:**
```json
{
  "A": "192.0.2.1",
  "CNAME": "app.platform.com",
  "TXT": "platform-verification=workspace-id"
}
```

### Verify Custom Domain

```http
GET /white-label/:workspaceId/domain/verify
```

**Response:**
```json
{
  "verified": true,
  "message": "Domain app.youragency.com verified successfully"
}
```

### Get Public Configuration (by domain)

```http
GET /white-label/public/config?domain=app.youragency.com
```

## Custom Domain Setup

### Step 1: Configure Domain in Platform

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  customDomain: {
    domain: 'app.youragency.com',
  },
});
```

### Step 2: Get DNS Records

```typescript
const dnsRecords = await whiteLabelService.getDnsRecords(workspaceId);
```

### Step 3: Configure DNS

Add the following DNS records to your domain:

- **A Record**: Point to the platform's IP address
- **CNAME Record**: Point to the platform's domain
- **TXT Record**: For domain verification

### Step 4: Verify Domain

```typescript
const result = await whiteLabelService.verifyCustomDomain(workspaceId);
```

### Step 5: SSL Certificate

SSL certificates are automatically provisioned and managed for verified custom domains.

## Email Branding Configuration

Configure email-specific branding:

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  emailBranding: {
    headerLogoUrl: 'https://youragency.com/email-logo.png',
    footerLogoUrl: 'https://youragency.com/footer-logo.png',
    headerBackgroundColor: '#3B82F6',
    footerText: '© 2024 Your Agency. All rights reserved.',
    supportEmail: 'support@youragency.com',
    companyAddress: '123 Main St, City, State 12345',
  },
});
```

## Advanced Customization

### Custom CSS

Add custom CSS for advanced styling:

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  customCss: `
    .custom-button {
      background-color: #FF5733;
      border-radius: 8px;
    }
  `,
});
```

### Custom JavaScript

Add custom JavaScript for advanced functionality:

```typescript
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  customJs: `
    console.log('Custom white-label script loaded');
    // Your custom code here
  `,
});
```

## Middleware Integration

The custom domain middleware automatically detects custom domains and attaches the workspace ID to requests:

```typescript
// In your controller
@Get('dashboard')
async getDashboard(@CustomDomainWorkspace() workspaceId?: string) {
  if (workspaceId) {
    // Request came from custom domain
    return this.getDashboardForWorkspace(workspaceId);
  }
  // Regular request
  return this.getDefaultDashboard();
}
```

## Plan Requirements

White-label features are available for:
- **Professional Plan**: Basic white-label features
- **Enterprise Plan**: Full white-label features including custom domains

## Security Considerations

1. **Domain Verification**: All custom domains must be verified before activation
2. **SSL/TLS**: Automatic SSL certificate provisioning for custom domains
3. **Content Security**: Custom CSS/JS is sanitized to prevent XSS attacks
4. **Access Control**: Only workspace owners and admins can modify white-label settings

## Best Practices

1. **Logo Dimensions**: Use logos with transparent backgrounds, recommended size 200x60px
2. **Color Contrast**: Ensure sufficient contrast between text and background colors
3. **Email Testing**: Test email templates before deploying to production
4. **Domain Setup**: Allow 24-48 hours for DNS propagation
5. **Backup Branding**: Always maintain fallback branding in case custom assets fail to load

## Troubleshooting

### Custom Domain Not Working

1. Verify DNS records are correctly configured
2. Check domain verification status
3. Ensure SSL certificate is active
4. Clear browser cache and DNS cache

### Email Branding Not Appearing

1. Verify white-label is enabled
2. Check email branding configuration
3. Ensure logo URLs are accessible
4. Test with different email clients

### Report Branding Issues

1. Verify workspace plan supports white-label
2. Check report branding configuration
3. Ensure colors are valid hex codes
4. Test report generation with sample data

## Examples

### Complete White-Label Setup

```typescript
// 1. Enable white-label
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  enabled: true,
  companyName: 'Acme Agency',
  logoUrl: 'https://acme.com/logo.png',
  faviconUrl: 'https://acme.com/favicon.ico',
  
  // Colors
  colors: {
    primary: '#2563EB',
    secondary: '#059669',
    accent: '#F59E0B',
  },
  
  // Fonts
  fonts: {
    primary: 'Inter',
    heading: 'Poppins',
  },
  
  // Email branding
  emailBranding: {
    supportEmail: 'support@acme.com',
    footerText: '© 2024 Acme Agency',
    companyAddress: '123 Business Ave, Suite 100',
  },
  
  // Custom domain
  customDomain: {
    domain: 'app.acme.com',
  },
  
  // Hide platform branding
  hidePlatformBranding: true,
  
  // Legal links
  termsUrl: 'https://acme.com/terms',
  privacyUrl: 'https://acme.com/privacy',
  supportUrl: 'https://acme.com/support',
});

// 2. Configure DNS
const dnsRecords = await whiteLabelService.getDnsRecords(workspaceId);
console.log('Add these DNS records:', dnsRecords);

// 3. Verify domain
const verification = await whiteLabelService.verifyCustomDomain(workspaceId);
console.log('Domain verification:', verification);

// 4. Test email template
const email = await emailTemplateService.generateEmailTemplate(
  workspaceId,
  'welcome',
  {
    subject: 'Welcome',
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
  },
);
console.log('Email subject:', email.subject);

// 5. Generate branded report
const report = await reportBrandingService.generateBrandedReport(
  workspaceId,
  'Monthly Report',
  '<div>Report content</div>',
);
console.log('Report generated with branding');
```

## Support

For additional support with white-label configuration:
- Email: support@platform.com
- Documentation: https://docs.platform.com/white-label
- API Reference: https://api.platform.com/docs
