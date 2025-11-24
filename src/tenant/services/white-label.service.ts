import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhiteLabelConfigDto, UpdateWhiteLabelDto } from '../dto/white-label-config.dto';

@Injectable()
export class WhiteLabelService {
  private readonly logger = new Logger(WhiteLabelService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get white-label configuration for a workspace
   */
  async getWhiteLabelConfig(workspaceId: string): Promise<WhiteLabelConfigDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { branding: true, plan: true },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    // White-label features are only available for PROFESSIONAL and ENTERPRISE plans
    if (workspace.plan !== 'PROFESSIONAL' && workspace.plan !== 'ENTERPRISE') {
      throw new BadRequestException('White-label features require Professional or Enterprise plan');
    }

    // Return branding configuration or default values
    const branding = workspace.branding as any || {};
    return {
      enabled: branding.enabled || false,
      companyName: branding.companyName,
      logoUrl: branding.logoUrl,
      faviconUrl: branding.faviconUrl,
      colors: branding.colors,
      fonts: branding.fonts,
      emailBranding: branding.emailBranding,
      customDomain: branding.customDomain,
      hidePlatformBranding: branding.hidePlatformBranding || false,
      customCss: branding.customCss,
      customJs: branding.customJs,
      termsUrl: branding.termsUrl,
      privacyUrl: branding.privacyUrl,
      supportUrl: branding.supportUrl,
      metadata: branding.metadata,
    };
  }

  /**
   * Update white-label configuration for a workspace
   */
  async updateWhiteLabelConfig(
    workspaceId: string,
    updateDto: UpdateWhiteLabelDto,
  ): Promise<WhiteLabelConfigDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { branding: true, plan: true },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    // White-label features are only available for PROFESSIONAL and ENTERPRISE plans
    if (workspace.plan !== 'PROFESSIONAL' && workspace.plan !== 'ENTERPRISE') {
      throw new BadRequestException('White-label features require Professional or Enterprise plan');
    }

    // Validate custom domain if provided
    if (updateDto.customDomain?.domain) {
      await this.validateCustomDomain(updateDto.customDomain.domain, workspaceId);
    }

    // Merge existing branding with updates
    const existingBranding = (workspace.branding as any) || {};
    const updatedBranding = {
      ...existingBranding,
      ...updateDto,
      customDomain: updateDto.customDomain
        ? { ...existingBranding.customDomain, ...updateDto.customDomain }
        : existingBranding.customDomain,
      colors: updateDto.colors
        ? { ...existingBranding.colors, ...updateDto.colors }
        : existingBranding.colors,
      fonts: updateDto.fonts
        ? { ...existingBranding.fonts, ...updateDto.fonts }
        : existingBranding.fonts,
      emailBranding: updateDto.emailBranding
        ? { ...existingBranding.emailBranding, ...updateDto.emailBranding }
        : existingBranding.emailBranding,
    };

    // Update workspace branding
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { branding: updatedBranding },
    });

    this.logger.log(`Updated white-label config for workspace ${workspaceId}`);

    return updatedBranding;
  }

  /**
   * Validate custom domain
   */
  private async validateCustomDomain(domain: string, workspaceId: string): Promise<void> {
    // Check if domain is already in use by another workspace
    const existingWorkspace = await this.prisma.workspace.findFirst({
      where: {
        id: { not: workspaceId },
        branding: {
          path: ['customDomain', 'domain'],
          equals: domain,
        },
      },
    });

    if (existingWorkspace) {
      throw new BadRequestException(`Domain ${domain} is already in use`);
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      throw new BadRequestException(`Invalid domain format: ${domain}`);
    }
  }

  /**
   * Get workspace by custom domain
   */
  async getWorkspaceByDomain(domain: string): Promise<string | null> {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        branding: {
          path: ['customDomain', 'domain'],
          equals: domain,
        },
      },
      select: { id: true },
    });

    return workspace?.id || null;
  }

  /**
   * Verify custom domain DNS configuration
   */
  async verifyCustomDomain(workspaceId: string): Promise<{ verified: boolean; message: string }> {
    const config = await this.getWhiteLabelConfig(workspaceId);

    if (!config.customDomain?.domain) {
      throw new BadRequestException('No custom domain configured');
    }

    // In a real implementation, this would check DNS records
    // For now, we'll simulate the verification
    const domain = config.customDomain.domain;

    try {
      // Simulate DNS verification
      // In production, you would use a DNS lookup library
      this.logger.log(`Verifying DNS for domain: ${domain}`);

      // Update verification status
      const updatedConfig = await this.updateWhiteLabelConfig(workspaceId, {
        customDomain: {
          ...config.customDomain,
          verified: true,
          sslStatus: 'active',
        },
      });

      return {
        verified: true,
        message: `Domain ${domain} verified successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to verify domain ${domain}:`, error);
      return {
        verified: false,
        message: `Failed to verify domain ${domain}. Please check DNS configuration.`,
      };
    }
  }

  /**
   * Get DNS records required for custom domain setup
   */
  async getDnsRecords(workspaceId: string): Promise<Record<string, string>> {
    const config = await this.getWhiteLabelConfig(workspaceId);

    if (!config.customDomain?.domain) {
      throw new BadRequestException('No custom domain configured');
    }

    // Generate DNS records for domain verification and SSL
    return {
      'A': '192.0.2.1', // Example IP - replace with actual load balancer IP
      'CNAME': 'app.platform.com', // Example CNAME - replace with actual platform domain
      'TXT': `platform-verification=${workspaceId}`, // Verification record
    };
  }

  /**
   * Reset white-label configuration to defaults
   */
  async resetWhiteLabelConfig(workspaceId: string): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { branding: {} },
    });

    this.logger.log(`Reset white-label config for workspace ${workspaceId}`);
  }

  /**
   * Get white-label configuration for public access (by domain)
   */
  async getPublicWhiteLabelConfig(domain: string): Promise<WhiteLabelConfigDto | null> {
    const workspaceId = await this.getWorkspaceByDomain(domain);

    if (!workspaceId) {
      return null;
    }

    try {
      const config = await this.getWhiteLabelConfig(workspaceId);
      
      // Return only public-safe configuration
      return {
        enabled: config.enabled,
        companyName: config.companyName,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        colors: config.colors,
        fonts: config.fonts,
        termsUrl: config.termsUrl,
        privacyUrl: config.privacyUrl,
        supportUrl: config.supportUrl,
        // Exclude sensitive fields like customCss, customJs
      };
    } catch (error) {
      this.logger.error(`Failed to get public white-label config for domain ${domain}:`, error);
      return null;
    }
  }
}
