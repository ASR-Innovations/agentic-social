import { Injectable, Logger } from '@nestjs/common';
import { WhiteLabelService } from './white-label.service';
import { WhiteLabelConfigDto } from '../dto/white-label-config.dto';

export interface EmailTemplateData {
  subject: string;
  recipientName?: string;
  recipientEmail: string;
  [key: string]: any;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private whiteLabelService: WhiteLabelService) {}

  /**
   * Generate email template with white-label branding
   */
  async generateEmailTemplate(
    workspaceId: string,
    templateType: string,
    data: EmailTemplateData,
  ): Promise<EmailTemplate> {
    let whiteLabelConfig: WhiteLabelConfigDto | null = null;

    try {
      whiteLabelConfig = await this.whiteLabelService.getWhiteLabelConfig(workspaceId);
    } catch (error) {
      // If white-label config is not available, use default branding
      this.logger.warn(`White-label config not available for workspace ${workspaceId}, using defaults`);
    }

    const branding = this.getBrandingConfig(whiteLabelConfig);

    switch (templateType) {
      case 'welcome':
        return this.generateWelcomeEmail(data, branding);
      case 'post-published':
        return this.generatePostPublishedEmail(data, branding);
      case 'approval-request':
        return this.generateApprovalRequestEmail(data, branding);
      case 'crisis-alert':
        return this.generateCrisisAlertEmail(data, branding);
      case 'report-ready':
        return this.generateReportReadyEmail(data, branding);
      case 'password-reset':
        return this.generatePasswordResetEmail(data, branding);
      case 'team-invitation':
        return this.generateTeamInvitationEmail(data, branding);
      default:
        return this.generateGenericEmail(data, branding);
    }
  }

  /**
   * Get branding configuration with defaults
   */
  private getBrandingConfig(whiteLabelConfig: WhiteLabelConfigDto | null): any {
    const defaultBranding = {
      companyName: 'Social Media Platform',
      logoUrl: 'https://platform.com/logo.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      supportEmail: 'support@platform.com',
      footerText: '© 2024 Social Media Platform. All rights reserved.',
      termsUrl: 'https://platform.com/terms',
      privacyUrl: 'https://platform.com/privacy',
    };

    if (!whiteLabelConfig || !whiteLabelConfig.enabled) {
      return defaultBranding;
    }

    return {
      companyName: whiteLabelConfig.companyName || defaultBranding.companyName,
      logoUrl: whiteLabelConfig.emailBranding?.headerLogoUrl || whiteLabelConfig.logoUrl || defaultBranding.logoUrl,
      primaryColor: whiteLabelConfig.colors?.primary || defaultBranding.primaryColor,
      secondaryColor: whiteLabelConfig.colors?.secondary || defaultBranding.secondaryColor,
      supportEmail: whiteLabelConfig.emailBranding?.supportEmail || defaultBranding.supportEmail,
      footerText: whiteLabelConfig.emailBranding?.footerText || defaultBranding.footerText,
      termsUrl: whiteLabelConfig.termsUrl || defaultBranding.termsUrl,
      privacyUrl: whiteLabelConfig.privacyUrl || defaultBranding.privacyUrl,
      companyAddress: whiteLabelConfig.emailBranding?.companyAddress,
    };
  }

  /**
   * Generate base email HTML structure
   */
  private generateBaseEmailHtml(content: string, branding: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background-color: ${branding.primaryColor};
      padding: 30px 20px;
      text-align: center;
    }
    .email-header img {
      max-width: 200px;
      height: auto;
    }
    .email-body {
      padding: 40px 30px;
      color: #374151;
      line-height: 1.6;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${branding.primaryColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: ${branding.secondaryColor};
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${branding.logoUrl}" alt="${branding.companyName}">
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>${branding.footerText}</p>
      ${branding.companyAddress ? `<p>${branding.companyAddress}</p>` : ''}
      <div class="footer-links">
        <a href="${branding.termsUrl}">Terms of Service</a>
        <a href="${branding.privacyUrl}">Privacy Policy</a>
        <a href="mailto:${branding.supportEmail}">Support</a>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text version of email
   */
  private generatePlainText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Welcome email template
   */
  private generateWelcomeEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>Welcome to ${branding.companyName}!</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>We're excited to have you on board! Your account has been successfully created.</p>
      <p>Get started by connecting your social media accounts and creating your first post.</p>
      <a href="${data.loginUrl || '#'}" class="button">Get Started</a>
      <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:${branding.supportEmail}">${branding.supportEmail}</a>.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `Welcome to ${branding.companyName}!`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Post published email template
   */
  private generatePostPublishedEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>Your Post Has Been Published!</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>Great news! Your post "${data.postTitle || 'Untitled'}" has been successfully published to ${data.platforms || 'your social accounts'}.</p>
      ${data.postPreview ? `<div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">${data.postPreview}</div>` : ''}
      <a href="${data.postUrl || '#'}" class="button">View Post</a>
      <p>Track your post's performance in the analytics dashboard.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `Your post has been published - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Approval request email template
   */
  private generateApprovalRequestEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>Approval Request</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>${data.requesterName || 'A team member'} has submitted a post for your approval.</p>
      <p><strong>Post Title:</strong> ${data.postTitle || 'Untitled'}</p>
      <p><strong>Scheduled for:</strong> ${data.scheduledDate || 'Not scheduled'}</p>
      ${data.postPreview ? `<div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">${data.postPreview}</div>` : ''}
      <a href="${data.approvalUrl || '#'}" class="button">Review & Approve</a>
      <p>Please review and approve or reject this post at your earliest convenience.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `Approval Required: ${data.postTitle || 'New Post'} - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Crisis alert email template
   */
  private generateCrisisAlertEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1 style="color: #DC2626;">⚠️ Crisis Alert</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p><strong>A potential crisis has been detected!</strong></p>
      <p><strong>Alert Type:</strong> ${data.alertType || 'Sentiment Spike'}</p>
      <p><strong>Severity:</strong> <span style="color: #DC2626; font-weight: bold;">${data.severity || 'HIGH'}</span></p>
      <p><strong>Description:</strong> ${data.description || 'Unusual activity detected'}</p>
      <a href="${data.dashboardUrl || '#'}" class="button" style="background-color: #DC2626;">View Crisis Dashboard</a>
      <p>Immediate action may be required. Please review the situation and coordinate with your team.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `🚨 CRISIS ALERT: ${data.alertType || 'Immediate Attention Required'} - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Report ready email template
   */
  private generateReportReadyEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>Your Report is Ready</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>Your scheduled report "${data.reportName || 'Analytics Report'}" has been generated and is ready for download.</p>
      <p><strong>Report Period:</strong> ${data.reportPeriod || 'N/A'}</p>
      <p><strong>Format:</strong> ${data.reportFormat || 'PDF'}</p>
      <a href="${data.downloadUrl || '#'}" class="button">Download Report</a>
      <p>This report will be available for download for the next 30 days.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `Report Ready: ${data.reportName || 'Your Analytics Report'} - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Password reset email template
   */
  private generatePasswordResetEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>Reset Your Password</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${data.resetUrl || '#'}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `Reset Your Password - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Team invitation email template
   */
  private generateTeamInvitationEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>You've Been Invited!</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      <p>${data.inviterName || 'A team member'} has invited you to join their workspace on ${branding.companyName}.</p>
      <p><strong>Workspace:</strong> ${data.workspaceName || 'N/A'}</p>
      <p><strong>Role:</strong> ${data.role || 'Team Member'}</p>
      <a href="${data.invitationUrl || '#'}" class="button">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: `You've been invited to join ${data.workspaceName || 'a workspace'} - ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }

  /**
   * Generic email template
   */
  private generateGenericEmail(data: EmailTemplateData, branding: any): EmailTemplate {
    const content = `
      <h1>${data.title || 'Notification'}</h1>
      <p>Hi ${data.recipientName || 'there'},</p>
      ${data.body || '<p>You have a new notification.</p>'}
      ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>` : ''}
      <p>Best regards,<br>The ${branding.companyName} Team</p>
    `;

    const html = this.generateBaseEmailHtml(content, branding);

    return {
      subject: data.subject || `Notification from ${branding.companyName}`,
      html,
      text: this.generatePlainText(html),
    };
  }
}
