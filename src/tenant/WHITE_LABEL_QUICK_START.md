# White-Label Platform - Quick Start Guide

## For Developers

### Setup White-Label for a Workspace

```typescript
import { WhiteLabelService } from './services/white-label.service';

// 1. Enable white-label (requires Professional or Enterprise plan)
const config = await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  enabled: true,
  companyName: 'Acme Agency',
  logoUrl: 'https://acme.com/logo.png',
  colors: {
    primary: '#2563EB',
    secondary: '#059669',
  },
});

// 2. Configure custom domain
await whiteLabelService.updateWhiteLabelConfig(workspaceId, {
  customDomain: {
    domain: 'app.acme.com',
  },
});

// 3. Get DNS records for domain setup
const dnsRecords = await whiteLabelService.getDnsRecords(workspaceId);
console.log('Configure these DNS records:', dnsRecords);

// 4. Verify domain
const verification = await whiteLabelService.verifyCustomDomain(workspaceId);
console.log('Verification status:', verification);
```

### Send Branded Email

```typescript
import { EmailTemplateService } from './services/email-template.service';

const email = await emailTemplateService.generateEmailTemplate(
  workspaceId,
  'welcome', // or 'post-published', 'approval-request', etc.
  {
    subject: 'Welcome',
    recipientName: 'John Doe',
    recipientEmail: 'john@example.com',
    loginUrl: 'https://app.acme.com/login',
  },
);

// Send email using your email service
await emailService.send({
  to: email.recipientEmail,
  subject: email.subject,
  html: email.html,
  text: email.text,
});
```

### Generate Branded Report

```typescript
import { ReportBrandingService } from './services/report-branding.service';

// Generate complete branded report
const reportHtml = await reportBrandingService.generateBrandedReport(
  workspaceId,
  'Monthly Analytics Report',
  '<div class="report-section"><h2>Performance</h2><p>Content here</p></div>',
);

// Or generate individual components
const header = await reportBrandingService.generateReportHeader(workspaceId, 'Q4 Report');
const footer = await reportBrandingService.generateReportFooter(workspaceId);
const styles = await reportBrandingService.generateReportStyles(workspaceId);
```

### Use Custom Domain Middleware

The middleware automatically detects custom domains:

```typescript
import { CustomDomainWorkspace, IsCustomDomain } from './decorators/white-label.decorator';

@Controller('dashboard')
export class DashboardController {
  @Get()
  async getDashboard(
    @CustomDomainWorkspace() workspaceId?: string,
    @IsCustomDomain() isCustomDomain?: boolean,
  ) {
    if (isCustomDomain && workspaceId) {
      // Request came from custom domain
      return this.getCustomBrandedDashboard(workspaceId);
    }
    // Regular request
    return this.getDefaultDashboard();
  }
}
```

## For API Users

### Get White-Label Configuration

```bash
curl -X GET https://api.platform.com/white-label/{workspaceId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Configuration

```bash
curl -X PUT https://api.platform.com/white-label/{workspaceId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "companyName": "Acme Agency",
    "logoUrl": "https://acme.com/logo.png",
    "colors": {
      "primary": "#2563EB",
      "secondary": "#059669"
    }
  }'
```

### Get DNS Records

```bash
curl -X GET https://api.platform.com/white-label/{workspaceId}/domain/dns-records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Domain

```bash
curl -X GET https://api.platform.com/white-label/{workspaceId}/domain/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration Options

### Colors
```typescript
colors: {
  primary: '#3B82F6',    // Main brand color
  secondary: '#10B981',  // Secondary color
  accent: '#F59E0B',     // Accent color (optional)
  background: '#FFFFFF', // Background color (optional)
  text: '#1F2937',       // Text color (optional)
}
```

### Fonts
```typescript
fonts: {
  primary: 'Inter',      // Main font
  secondary: 'Roboto',   // Secondary font (optional)
  heading: 'Poppins',    // Heading font (optional)
}
```

### Email Branding
```typescript
emailBranding: {
  headerLogoUrl: 'https://...',
  footerLogoUrl: 'https://...',
  headerBackgroundColor: '#3B82F6',
  footerText: '© 2024 Your Company',
  supportEmail: 'support@yourcompany.com',
  companyAddress: '123 Main St, City, State',
}
```

### Custom Domain
```typescript
customDomain: {
  domain: 'app.yourcompany.com',
  verified: false, // Set by system after verification
  sslStatus: 'pending', // Set by system
}
```

## Email Templates Available

- `welcome` - Welcome new users
- `post-published` - Notify when post is published
- `approval-request` - Request content approval
- `crisis-alert` - Alert about potential crisis
- `report-ready` - Notify when report is ready
- `password-reset` - Password reset instructions
- `team-invitation` - Invite team members
- Generic template for custom emails

## Common Patterns

### Check if White-Label is Enabled

```typescript
const config = await whiteLabelService.getWhiteLabelConfig(workspaceId);
if (config.enabled) {
  // Use white-label branding
} else {
  // Use default platform branding
}
```

### Get Public Configuration (No Auth Required)

```typescript
const config = await whiteLabelService.getPublicWhiteLabelConfig('app.acme.com');
// Returns only public-safe fields (no customCss, customJs, etc.)
```

### Reset Configuration

```typescript
await whiteLabelService.resetWhiteLabelConfig(workspaceId);
// Resets to default platform branding
```

## Testing

```typescript
// In your tests
import { Test } from '@nestjs/testing';
import { WhiteLabelService } from './services/white-label.service';

const module = await Test.createTestingModule({
  providers: [WhiteLabelService, PrismaService],
}).compile();

const service = module.get<WhiteLabelService>(WhiteLabelService);

// Test configuration
const config = await service.updateWhiteLabelConfig(workspaceId, {
  enabled: true,
  companyName: 'Test Agency',
});

expect(config.companyName).toBe('Test Agency');
```

## Troubleshooting

### "White-label features require Professional or Enterprise plan"
- Upgrade workspace to Professional or Enterprise plan
- Check workspace.plan in database

### Custom domain not working
- Verify DNS records are configured correctly
- Run domain verification endpoint
- Check domain verification status
- Allow 24-48 hours for DNS propagation

### Email branding not showing
- Verify white-label is enabled
- Check logoUrl is accessible
- Test email template generation
- Verify email service is using generated templates

### Report branding not applying
- Check workspace plan
- Verify branding configuration exists
- Test report generation with sample data
- Check hidePlatformBranding setting

## Best Practices

1. **Always validate plan before enabling white-label**
2. **Test email templates before production use**
3. **Use CDN for logo and asset URLs**
4. **Implement fallback branding for failed asset loads**
5. **Cache white-label configuration for performance**
6. **Verify domains before going live**
7. **Test custom CSS/JS in sandbox first**
8. **Monitor custom domain SSL certificate expiry**

## Support

For issues or questions:
- Check documentation: `WHITE_LABEL_DOCUMENTATION.md`
- Review implementation: `WHITE_LABEL_IMPLEMENTATION_SUMMARY.md`
- Contact: support@platform.com
