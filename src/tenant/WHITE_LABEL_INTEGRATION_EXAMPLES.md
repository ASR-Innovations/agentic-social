# White-Label Integration Examples

## Complete Integration Examples

### Example 1: Agency Onboarding Flow

```typescript
import { Injectable } from '@nestjs/common';
import { WhiteLabelService } from './services/white-label.service';
import { EmailTemplateService } from './services/email-template.service';

@Injectable()
export class AgencyOnboardingService {
  constructor(
    private whiteLabelService: WhiteLabelService,
    private emailTemplateService: EmailTemplateService,
  ) {}

  async onboardNewAgency(workspaceId: string, agencyData: any) {
    // Step 1: Configure white-label branding
    await this.whiteLabelService.updateWhiteLabelConfig(workspaceId, {
      enabled: true,
      companyName: agencyData.companyName,
      logoUrl: agencyData.logoUrl,
      faviconUrl: agencyData.faviconUrl,
      colors: {
        primary: agencyData.primaryColor,
        secondary: agencyData.secondaryColor,
      },
      fonts: {
        primary: agencyData.fontFamily || 'Inter',
      },
      emailBranding: {
        supportEmail: agencyData.supportEmail,
        footerText: `© ${new Date().getFullYear()} ${agencyData.companyName}`,
        companyAddress: agencyData.address,
      },
      termsUrl: agencyData.termsUrl,
      privacyUrl: agencyData.privacyUrl,
      supportUrl: agencyData.supportUrl,
      hidePlatformBranding: true,
    });

    // Step 2: Configure custom domain
    if (agencyData.customDomain) {
      await this.whiteLabelService.updateWhiteLabelConfig(workspaceId, {
        customDomain: {
          domain: agencyData.customDomain,
        },
      });

      // Get DNS records for agency to configure
      const dnsRecords = await this.whiteLabelService.getDnsRecords(workspaceId);
      
      // Send DNS setup instructions
      await this.sendDnsSetupEmail(agencyData.email, dnsRecords);
    }

    // Step 3: Send welcome email with branded template
    const welcomeEmail = await this.emailTemplateService.generateEmailTemplate(
      workspaceId,
      'welcome',
      {
        subject: 'Welcome',
        recipientName: agencyData.ownerName,
        recipientEmail: agencyData.email,
        loginUrl: agencyData.customDomain 
          ? `https://${agencyData.customDomain}/login`
          : `https://app.platform.com/login`,
      },
    );

    await this.sendEmail(welcomeEmail);

    return {
      success: true,
      dnsRecords: agencyData.customDomain ? await this.whiteLabelService.getDnsRecords(workspaceId) : null,
      message: 'Agency onboarded successfully',
    };
  }

  private async sendDnsSetupEmail(email: string, dnsRecords: any) {
    // Implementation for sending DNS setup instructions
  }

  private async sendEmail(email: any) {
    // Implementation for sending email
  }
}
```

### Example 2: Branded Report Generation

```typescript
import { Injectable } from '@nestjs/common';
import { ReportBrandingService } from './services/report-branding.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportGenerationService {
  constructor(private reportBrandingService: ReportBrandingService) {}

  async generateMonthlyReport(workspaceId: string, data: any) {
    // Generate report content
    const reportContent = this.buildReportContent(data);

    // Apply white-label branding
    const brandedReport = await this.reportBrandingService.generateBrandedReport(
      workspaceId,
      'Monthly Analytics Report',
      reportContent,
    );

    // Convert to PDF
    const pdfBuffer = await this.htmlToPdf(brandedReport);

    return {
      html: brandedReport,
      pdf: pdfBuffer,
      filename: `monthly-report-${new Date().toISOString().split('T')[0]}.pdf`,
    };
  }

  private buildReportContent(data: any): string {
    return `
      <div class="report-section">
        <h2>Executive Summary</h2>
        <div class="metric-card">
          <div class="metric-value">${data.totalFollowers.toLocaleString()}</div>
          <div class="metric-label">Total Followers</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.engagementRate}%</div>
          <div class="metric-label">Engagement Rate</div>
        </div>
      </div>

      <div class="report-section">
        <h2>Top Performing Posts</h2>
        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Platform</th>
              <th>Engagement</th>
              <th>Reach</th>
            </tr>
          </thead>
          <tbody>
            ${data.topPosts.map(post => `
              <tr>
                <td>${post.title}</td>
                <td>${post.platform}</td>
                <td>${post.engagement}</td>
                <td>${post.reach}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="report-section">
        <h2>Growth Trends</h2>
        <div class="chart-container">
          <!-- Chart would be inserted here -->
          <p>Follower growth: +${data.followerGrowth}% this month</p>
        </div>
      </div>
    `;
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    // Implementation for converting HTML to PDF
    // Could use puppeteer, pdfkit, or similar library
    return Buffer.from(''); // Placeholder
  }
}
```

### Example 3: Multi-Client Dashboard

```typescript
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WhiteLabelService } from './services/white-label.service';
import { CustomDomainWorkspace } from './decorators/white-label.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private whiteLabelService: WhiteLabelService) {}

  @Get()
  async getDashboard(@CustomDomainWorkspace() workspaceId?: string) {
    // If accessed via custom domain, use that workspace
    if (workspaceId) {
      const config = await this.whiteLabelService.getWhiteLabelConfig(workspaceId);
      return {
        branding: {
          companyName: config.companyName,
          logoUrl: config.logoUrl,
          colors: config.colors,
          fonts: config.fonts,
        },
        data: await this.getDashboardData(workspaceId),
      };
    }

    // Default platform dashboard
    return {
      branding: this.getDefaultBranding(),
      data: await this.getDefaultDashboardData(),
    };
  }

  @Get(':workspaceId')
  async getWorkspaceDashboard(@Param('workspaceId') workspaceId: string) {
    const config = await this.whiteLabelService.getWhiteLabelConfig(workspaceId);
    
    return {
      branding: {
        companyName: config.companyName,
        logoUrl: config.logoUrl,
        colors: config.colors,
        fonts: config.fonts,
      },
      data: await this.getDashboardData(workspaceId),
    };
  }

  private getDefaultBranding() {
    return {
      companyName: 'Social Media Platform',
      logoUrl: 'https://platform.com/logo.png',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    };
  }

  private async getDashboardData(workspaceId: string) {
    // Fetch workspace-specific data
    return {};
  }

  private async getDefaultDashboardData() {
    // Fetch default data
    return {};
  }
}
```

### Example 4: Automated Email Campaigns

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailTemplateService } from './services/email-template.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailCampaignService {
  constructor(
    private emailTemplateService: EmailTemplateService,
    private prisma: PrismaService,
  ) {}

  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async sendWeeklyReports() {
    // Get all workspaces with white-label enabled
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        branding: {
          path: ['enabled'],
          equals: true,
        },
      },
      include: {
        users: {
          where: { role: 'OWNER' },
        },
      },
    });

    for (const workspace of workspaces) {
      const owner = workspace.users[0];
      if (!owner) continue;

      // Generate branded email
      const email = await this.emailTemplateService.generateEmailTemplate(
        workspace.id,
        'report-ready',
        {
          subject: 'Weekly Report',
          recipientName: owner.name,
          recipientEmail: owner.email,
          reportName: 'Weekly Performance Report',
          reportPeriod: this.getLastWeekPeriod(),
          downloadUrl: `https://app.platform.com/reports/weekly/${workspace.id}`,
        },
      );

      await this.sendEmail(email);
    }
  }

  async sendPostPublishedNotification(workspaceId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        platformPosts: {
          include: { account: true },
        },
      },
    });

    if (!post) return;

    const platforms = post.platformPosts
      .map(pp => pp.account.platform)
      .join(', ');

    const email = await this.emailTemplateService.generateEmailTemplate(
      workspaceId,
      'post-published',
      {
        subject: 'Post Published',
        recipientName: post.author.name,
        recipientEmail: post.author.email,
        postTitle: this.extractPostTitle(post.content),
        platforms,
        postUrl: `https://app.platform.com/posts/${postId}`,
        postPreview: this.generatePostPreview(post.content),
      },
    );

    await this.sendEmail(email);
  }

  private getLastWeekPeriod(): string {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return `${lastWeek.toLocaleDateString()} - ${now.toLocaleDateString()}`;
  }

  private extractPostTitle(content: any): string {
    // Extract title from post content
    return content.text?.substring(0, 50) || 'Untitled Post';
  }

  private generatePostPreview(content: any): string {
    // Generate HTML preview of post
    return `<p>${content.text?.substring(0, 200)}...</p>`;
  }

  private async sendEmail(email: any) {
    // Implementation for sending email
  }
}
```

### Example 5: Client Portal with White-Label

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WhiteLabelService } from './services/white-label.service';
import { ReportBrandingService } from './services/report-branding.service';

@Controller('client-portal')
export class ClientPortalController {
  constructor(
    private whiteLabelService: WhiteLabelService,
    private reportBrandingService: ReportBrandingService,
  ) {}

  @Get(':workspaceId/branding')
  async getClientBranding(@Param('workspaceId') workspaceId: string) {
    const config = await this.whiteLabelService.getWhiteLabelConfig(workspaceId);

    // Return only client-safe branding information
    return {
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      colors: config.colors,
      fonts: config.fonts,
      termsUrl: config.termsUrl,
      privacyUrl: config.privacyUrl,
      supportUrl: config.supportUrl,
    };
  }

  @Get(':workspaceId/reports/:reportId')
  async getClientReport(
    @Param('workspaceId') workspaceId: string,
    @Param('reportId') reportId: string,
  ) {
    // Fetch report data
    const reportData = await this.fetchReportData(reportId);

    // Generate branded report
    const brandedReport = await this.reportBrandingService.generateBrandedReport(
      workspaceId,
      reportData.title,
      reportData.content,
    );

    return {
      html: brandedReport,
      title: reportData.title,
      generatedAt: new Date(),
    };
  }

  @Post(':workspaceId/feedback')
  async submitClientFeedback(
    @Param('workspaceId') workspaceId: string,
    @Body() feedback: any,
  ) {
    // Store feedback
    // Send notification to agency

    return {
      success: true,
      message: 'Feedback submitted successfully',
    };
  }

  private async fetchReportData(reportId: string) {
    // Implementation
    return {
      title: 'Monthly Report',
      content: '<div>Report content</div>',
    };
  }
}
```

### Example 6: Dynamic Theme Loading (Frontend)

```typescript
// Frontend React/Next.js example
import { useEffect, useState } from 'react';

interface WhiteLabelTheme {
  companyName: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  fonts: {
    primary: string;
    secondary?: string;
    heading?: string;
  };
}

export function useWhiteLabelTheme(workspaceId?: string) {
  const [theme, setTheme] = useState<WhiteLabelTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        // Check if on custom domain
        const domain = window.location.hostname;
        
        let config;
        if (domain !== 'app.platform.com' && domain !== 'localhost') {
          // Load theme by custom domain
          const response = await fetch(
            `/api/white-label/public/config?domain=${domain}`
          );
          config = await response.json();
        } else if (workspaceId) {
          // Load theme by workspace ID
          const response = await fetch(
            `/api/white-label/${workspaceId}`
          );
          config = await response.json();
        }

        if (config && config.enabled) {
          setTheme(config);
          applyTheme(config);
        }
      } catch (error) {
        console.error('Failed to load white-label theme:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, [workspaceId]);

  return { theme, loading };
}

function applyTheme(theme: WhiteLabelTheme) {
  // Apply CSS variables
  const root = document.documentElement;
  
  if (theme.colors) {
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    if (theme.colors.accent) {
      root.style.setProperty('--color-accent', theme.colors.accent);
    }
  }

  if (theme.fonts) {
    root.style.setProperty('--font-primary', theme.fonts.primary);
    if (theme.fonts.secondary) {
      root.style.setProperty('--font-secondary', theme.fonts.secondary);
    }
    if (theme.fonts.heading) {
      root.style.setProperty('--font-heading', theme.fonts.heading);
    }
  }

  // Update favicon
  if (theme.logoUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = theme.logoUrl;
    }
  }

  // Update page title
  if (theme.companyName) {
    document.title = `${theme.companyName} - Social Media Management`;
  }
}

// Usage in component
export function App() {
  const { theme, loading } = useWhiteLabelTheme();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header>
        {theme?.logoUrl && (
          <img src={theme.logoUrl} alt={theme.companyName} />
        )}
        <h1>{theme?.companyName || 'Social Media Platform'}</h1>
      </header>
      {/* Rest of app */}
    </div>
  );
}
```

## Testing Examples

### Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { WhiteLabelService } from './services/white-label.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WhiteLabelService', () => {
  let service: WhiteLabelService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WhiteLabelService, PrismaService],
    }).compile();

    service = module.get<WhiteLabelService>(WhiteLabelService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should update white-label configuration', async () => {
    const workspaceId = 'test-workspace-id';
    
    // Mock workspace
    jest.spyOn(prisma.workspace, 'findUnique').mockResolvedValue({
      id: workspaceId,
      plan: 'ENTERPRISE',
      branding: {},
    } as any);

    jest.spyOn(prisma.workspace, 'update').mockResolvedValue({
      id: workspaceId,
      branding: {
        enabled: true,
        companyName: 'Test Agency',
      },
    } as any);

    const result = await service.updateWhiteLabelConfig(workspaceId, {
      enabled: true,
      companyName: 'Test Agency',
    });

    expect(result.enabled).toBe(true);
    expect(result.companyName).toBe('Test Agency');
  });
});
```

## Common Patterns

### Pattern 1: Conditional Branding

```typescript
async function renderWithBranding(workspaceId: string, content: string) {
  try {
    const config = await whiteLabelService.getWhiteLabelConfig(workspaceId);
    
    if (config.enabled) {
      return applyCustomBranding(content, config);
    }
  } catch (error) {
    // Fallback to default branding
  }
  
  return applyDefaultBranding(content);
}
```

### Pattern 2: Caching White-Label Config

```typescript
import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CachedWhiteLabelService {
  constructor(
    private whiteLabelService: WhiteLabelService,
    private cacheManager: Cache,
  ) {}

  async getWhiteLabelConfig(workspaceId: string) {
    const cacheKey = `white-label:${workspaceId}`;
    
    // Try cache first
    let config = await this.cacheManager.get(cacheKey);
    
    if (!config) {
      // Load from database
      config = await this.whiteLabelService.getWhiteLabelConfig(workspaceId);
      
      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, config, 3600);
    }
    
    return config;
  }

  async invalidateCache(workspaceId: string) {
    await this.cacheManager.del(`white-label:${workspaceId}`);
  }
}
```

### Pattern 3: Fallback Asset Loading

```typescript
function getLogoUrl(config: WhiteLabelConfig): string {
  if (config.enabled && config.logoUrl) {
    return config.logoUrl;
  }
  return 'https://platform.com/default-logo.png';
}

function getColorScheme(config: WhiteLabelConfig) {
  return {
    primary: config.colors?.primary || '#3B82F6',
    secondary: config.colors?.secondary || '#10B981',
    accent: config.colors?.accent || '#F59E0B',
  };
}
```

These examples demonstrate real-world integration patterns for the white-label platform features.
