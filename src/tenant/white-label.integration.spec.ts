import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { TenantModule } from './tenant.module';
import { WhiteLabelService } from './services/white-label.service';
import { EmailTemplateService } from './services/email-template.service';
import { ReportBrandingService } from './services/report-branding.service';

describe('White Label Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let whiteLabelService: WhiteLabelService;
  let emailTemplateService: EmailTemplateService;
  let reportBrandingService: ReportBrandingService;
  let testWorkspaceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    whiteLabelService = moduleFixture.get<WhiteLabelService>(WhiteLabelService);
    emailTemplateService = moduleFixture.get<EmailTemplateService>(EmailTemplateService);
    reportBrandingService = moduleFixture.get<ReportBrandingService>(ReportBrandingService);

    // Create test workspace with ENTERPRISE plan
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Agency',
        slug: 'test-agency-wl',
        plan: 'ENTERPRISE',
      },
    });
    testWorkspaceId = workspace.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.workspace.delete({ where: { id: testWorkspaceId } });
    await app.close();
  });

  describe('White Label Configuration', () => {
    it('should get default white-label configuration', async () => {
      const config = await whiteLabelService.getWhiteLabelConfig(testWorkspaceId);

      expect(config).toBeDefined();
      expect(config.enabled).toBe(false);
    });

    it('should update white-label configuration', async () => {
      const updateDto = {
        enabled: true,
        companyName: 'My Agency',
        logoUrl: 'https://example.com/logo.png',
        colors: {
          primary: '#FF5733',
          secondary: '#33FF57',
        },
        fonts: {
          primary: 'Roboto',
          secondary: 'Open Sans',
        },
      };

      const config = await whiteLabelService.updateWhiteLabelConfig(
        testWorkspaceId,
        updateDto,
      );

      expect(config.enabled).toBe(true);
      expect(config.companyName).toBe('My Agency');
      expect(config.logoUrl).toBe('https://example.com/logo.png');
      expect(config.colors?.primary).toBe('#FF5733');
      expect(config.fonts?.primary).toBe('Roboto');
    });

    it('should update custom domain configuration', async () => {
      const updateDto = {
        customDomain: {
          domain: 'app.myagency.com',
          verified: false,
        },
      };

      const config = await whiteLabelService.updateWhiteLabelConfig(
        testWorkspaceId,
        updateDto,
      );

      expect(config.customDomain?.domain).toBe('app.myagency.com');
      expect(config.customDomain?.verified).toBe(false);
    });

    it('should get workspace by custom domain', async () => {
      const workspaceId = await whiteLabelService.getWorkspaceByDomain('app.myagency.com');

      expect(workspaceId).toBe(testWorkspaceId);
    });

    it('should return null for non-existent domain', async () => {
      const workspaceId = await whiteLabelService.getWorkspaceByDomain('nonexistent.com');

      expect(workspaceId).toBeNull();
    });

    it('should get DNS records for custom domain', async () => {
      const dnsRecords = await whiteLabelService.getDnsRecords(testWorkspaceId);

      expect(dnsRecords).toBeDefined();
      expect(dnsRecords.A).toBeDefined();
      expect(dnsRecords.CNAME).toBeDefined();
      expect(dnsRecords.TXT).toContain(testWorkspaceId);
    });

    it('should verify custom domain', async () => {
      const result = await whiteLabelService.verifyCustomDomain(testWorkspaceId);

      expect(result.verified).toBe(true);
      expect(result.message).toContain('verified successfully');
    });

    it('should reset white-label configuration', async () => {
      await whiteLabelService.resetWhiteLabelConfig(testWorkspaceId);

      const config = await whiteLabelService.getWhiteLabelConfig(testWorkspaceId);
      expect(config.enabled).toBe(false);
      expect(config.companyName).toBeUndefined();
    });

    it('should reject white-label for non-enterprise plans', async () => {
      const freeWorkspace = await prisma.workspace.create({
        data: {
          name: 'Free Workspace',
          slug: 'free-workspace-wl',
          plan: 'FREE',
        },
      });

      await expect(
        whiteLabelService.getWhiteLabelConfig(freeWorkspace.id),
      ).rejects.toThrow('White-label features require Professional or Enterprise plan');

      await prisma.workspace.delete({ where: { id: freeWorkspace.id } });
    });
  });

  describe('Email Templates', () => {
    beforeEach(async () => {
      // Set up white-label config for email tests
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        enabled: true,
        companyName: 'My Agency',
        logoUrl: 'https://example.com/logo.png',
        emailBranding: {
          supportEmail: 'support@myagency.com',
          footerText: '© 2024 My Agency',
        },
      });
    });

    it('should generate welcome email with white-label branding', async () => {
      const template = await emailTemplateService.generateEmailTemplate(
        testWorkspaceId,
        'welcome',
        {
          subject: 'Welcome',
          recipientName: 'John Doe',
          recipientEmail: 'john@example.com',
          loginUrl: 'https://app.myagency.com/login',
        },
      );

      expect(template.subject).toContain('My Agency');
      expect(template.html).toContain('My Agency');
      expect(template.html).toContain('https://example.com/logo.png');
      expect(template.html).toContain('support@myagency.com');
      expect(template.text).toBeDefined();
    });

    it('should generate post published email', async () => {
      const template = await emailTemplateService.generateEmailTemplate(
        testWorkspaceId,
        'post-published',
        {
          subject: 'Post Published',
          recipientName: 'Jane Doe',
          recipientEmail: 'jane@example.com',
          postTitle: 'My Awesome Post',
          platforms: 'Instagram, Facebook',
        },
      );

      expect(template.subject).toContain('published');
      expect(template.html).toContain('My Awesome Post');
      expect(template.html).toContain('Instagram, Facebook');
    });

    it('should generate approval request email', async () => {
      const template = await emailTemplateService.generateEmailTemplate(
        testWorkspaceId,
        'approval-request',
        {
          subject: 'Approval Required',
          recipientName: 'Manager',
          recipientEmail: 'manager@example.com',
          requesterName: 'John Doe',
          postTitle: 'New Campaign Post',
          approvalUrl: 'https://app.myagency.com/approvals/123',
        },
      );

      expect(template.subject).toContain('Approval Required');
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('New Campaign Post');
    });

    it('should generate crisis alert email', async () => {
      const template = await emailTemplateService.generateEmailTemplate(
        testWorkspaceId,
        'crisis-alert',
        {
          subject: 'Crisis Alert',
          recipientName: 'Crisis Manager',
          recipientEmail: 'crisis@example.com',
          alertType: 'Sentiment Spike',
          severity: 'HIGH',
          description: 'Negative sentiment spike detected',
        },
      );

      expect(template.subject).toContain('CRISIS ALERT');
      expect(template.html).toContain('Sentiment Spike');
      expect(template.html).toContain('HIGH');
    });

    it('should use default branding when white-label is disabled', async () => {
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        enabled: false,
      });

      const template = await emailTemplateService.generateEmailTemplate(
        testWorkspaceId,
        'welcome',
        {
          subject: 'Welcome',
          recipientName: 'John Doe',
          recipientEmail: 'john@example.com',
        },
      );

      expect(template.html).toContain('Social Media Platform');
    });
  });

  describe('Report Branding', () => {
    beforeEach(async () => {
      // Set up white-label config for report tests
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        enabled: true,
        companyName: 'My Agency',
        logoUrl: 'https://example.com/logo.png',
        colors: {
          primary: '#FF5733',
          secondary: '#33FF57',
        },
        hidePlatformBranding: true,
      });
    });

    it('should get report branding configuration', async () => {
      const branding = await reportBrandingService.getReportBranding(testWorkspaceId);

      expect(branding.companyName).toBe('My Agency');
      expect(branding.logoUrl).toBe('https://example.com/logo.png');
      expect(branding.primaryColor).toBe('#FF5733');
      expect(branding.showPlatformBranding).toBe(false);
    });

    it('should generate report header with branding', async () => {
      const header = await reportBrandingService.generateReportHeader(
        testWorkspaceId,
        'Monthly Analytics Report',
      );

      expect(header).toContain('My Agency');
      expect(header).toContain('Monthly Analytics Report');
      expect(header).toContain('#FF5733');
      expect(header).toContain('https://example.com/logo.png');
    });

    it('should generate report footer with branding', async () => {
      const footer = await reportBrandingService.generateReportFooter(testWorkspaceId);

      expect(footer).toContain('My Agency');
      expect(footer).not.toContain('Powered by Social Media Platform');
    });

    it('should generate report styles with custom colors', async () => {
      const styles = await reportBrandingService.generateReportStyles(testWorkspaceId);

      expect(styles).toContain('#FF5733');
      expect(styles).toContain('#33FF57');
    });

    it('should generate complete branded report', async () => {
      const reportContent = '<div class="report-section"><h2>Analytics</h2><p>Content here</p></div>';
      const html = await reportBrandingService.generateBrandedReport(
        testWorkspaceId,
        'Q4 Report',
        reportContent,
      );

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Q4 Report');
      expect(html).toContain('My Agency');
      expect(html).toContain(reportContent);
    });

    it('should generate CSV header with branding', async () => {
      const csvHeader = await reportBrandingService.generateBrandedCsvHeader(
        testWorkspaceId,
        'Analytics Export',
      );

      expect(csvHeader).toContain('Analytics Export');
      expect(csvHeader).toContain('My Agency');
    });

    it('should not apply watermark when platform branding is hidden', async () => {
      const watermark = await reportBrandingService.applyWatermark(testWorkspaceId);

      expect(watermark).toBeNull();
    });

    it('should apply watermark when platform branding is shown', async () => {
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        hidePlatformBranding: false,
      });

      const watermark = await reportBrandingService.applyWatermark(testWorkspaceId);

      expect(watermark).toContain('Powered by Social Media Platform');
    });
  });

  describe('API Endpoints', () => {
    it('GET /white-label/:workspaceId - should return white-label config', async () => {
      const response = await request(app.getHttpServer())
        .get(`/white-label/${testWorkspaceId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.enabled).toBeDefined();
    });

    it('PUT /white-label/:workspaceId - should update white-label config', async () => {
      const updateDto = {
        enabled: true,
        companyName: 'Updated Agency',
        colors: {
          primary: '#123456',
          secondary: '#654321',
        },
      };

      const response = await request(app.getHttpServer())
        .put(`/white-label/${testWorkspaceId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.companyName).toBe('Updated Agency');
      expect(response.body.colors.primary).toBe('#123456');
    });

    it('DELETE /white-label/:workspaceId - should reset white-label config', async () => {
      await request(app.getHttpServer())
        .delete(`/white-label/${testWorkspaceId}`)
        .expect(204);

      const config = await whiteLabelService.getWhiteLabelConfig(testWorkspaceId);
      expect(config.enabled).toBe(false);
    });

    it('GET /white-label/:workspaceId/domain/dns-records - should return DNS records', async () => {
      // First set a custom domain
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        customDomain: {
          domain: 'test.example.com',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/white-label/${testWorkspaceId}/domain/dns-records`)
        .expect(200);

      expect(response.body.A).toBeDefined();
      expect(response.body.CNAME).toBeDefined();
      expect(response.body.TXT).toContain(testWorkspaceId);
    });

    it('GET /white-label/:workspaceId/domain/verify - should verify domain', async () => {
      const response = await request(app.getHttpServer())
        .get(`/white-label/${testWorkspaceId}/domain/verify`)
        .expect(200);

      expect(response.body.verified).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('GET /white-label/public/config - should return public config by domain', async () => {
      await whiteLabelService.updateWhiteLabelConfig(testWorkspaceId, {
        enabled: true,
        companyName: 'Public Agency',
        customDomain: {
          domain: 'public.example.com',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/white-label/public/config')
        .query({ domain: 'public.example.com' })
        .expect(200);

      expect(response.body.companyName).toBe('Public Agency');
      expect(response.body.customCss).toBeUndefined(); // Should not expose sensitive fields
    });
  });
});
