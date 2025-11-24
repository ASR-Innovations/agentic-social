import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSSOConfigDto, UpdateSSOConfigDto, SSOProvider } from '../dto/sso-config.dto';
import * as crypto from 'crypto';

@Injectable()
export class SSOService {
  constructor(private prisma: PrismaService) {}

  async createConfig(dto: CreateSSOConfigDto) {
    // Check if config already exists for this workspace
    const existing = await this.prisma.sSOConfig.findUnique({
      where: { workspaceId: dto.tenantId },
    });

    if (existing) {
      throw new BadRequestException('SSO configuration already exists for this workspace');
    }

    // Encrypt sensitive data
    const encryptedClientSecret = dto.clientSecret
      ? this.encryptSecret(dto.clientSecret)
      : undefined;

    const config = await this.prisma.sSOConfig.create({
      data: {
        workspaceId: dto.tenantId,
        provider: dto.provider,
        enabled: dto.enabled ?? true,
        entryPoint: dto.entryPoint,
        issuer: dto.issuer,
        cert: dto.cert,
        callbackUrl: dto.callbackUrl,
        clientId: dto.clientId,
        clientSecret: encryptedClientSecret,
        domain: dto.domain,
        tenantDomain: dto.tenantDomain,
        redirectUri: dto.redirectUri,
        metadata: dto.metadata,
      },
    });

    return this.sanitizeConfig(config);
  }

  async getConfig(workspaceId: string) {
    const config = await this.prisma.sSOConfig.findUnique({
      where: { workspaceId },
    });

    if (!config) {
      throw new NotFoundException('SSO configuration not found');
    }

    return this.sanitizeConfig(config);
  }

  async getConfigByProvider(workspaceId: string, provider: SSOProvider) {
    const config = await this.prisma.sSOConfig.findFirst({
      where: {
        workspaceId,
        provider,
        enabled: true,
      },
    });

    if (!config) {
      throw new NotFoundException(`SSO configuration for ${provider} not found`);
    }

    return config;
  }

  async updateConfig(workspaceId: string, dto: UpdateSSOConfigDto) {
    const existing = await this.prisma.sSOConfig.findUnique({
      where: { workspaceId },
    });

    if (!existing) {
      throw new NotFoundException('SSO configuration not found');
    }

    // Encrypt client secret if provided
    const encryptedClientSecret = dto.clientSecret
      ? this.encryptSecret(dto.clientSecret)
      : undefined;

    const config = await this.prisma.sSOConfig.update({
      where: { workspaceId },
      data: {
        enabled: dto.enabled,
        entryPoint: dto.entryPoint,
        issuer: dto.issuer,
        cert: dto.cert,
        callbackUrl: dto.callbackUrl,
        clientId: dto.clientId,
        clientSecret: encryptedClientSecret,
        domain: dto.domain,
        tenantDomain: dto.tenantDomain,
        redirectUri: dto.redirectUri,
        metadata: dto.metadata,
      },
    });

    return this.sanitizeConfig(config);
  }

  async deleteConfig(workspaceId: string) {
    const existing = await this.prisma.sSOConfig.findUnique({
      where: { workspaceId },
    });

    if (!existing) {
      throw new NotFoundException('SSO configuration not found');
    }

    await this.prisma.sSOConfig.delete({
      where: { workspaceId },
    });

    return { message: 'SSO configuration deleted successfully' };
  }

  async getDecryptedClientSecret(workspaceId: string): Promise<string | null> {
    const config = await this.prisma.sSOConfig.findUnique({
      where: { workspaceId },
    });

    if (!config || !config.clientSecret) {
      return null;
    }

    return this.decryptSecret(config.clientSecret);
  }

  private encryptSecret(secret: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptSecret(encryptedSecret: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars', 'utf8').slice(0, 32);

    const [ivHex, encrypted] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private sanitizeConfig(config: any) {
    // Remove sensitive data from response
    const { clientSecret, cert, ...sanitized } = config;
    return {
      ...sanitized,
      hasClientSecret: !!clientSecret,
      hasCert: !!cert,
    };
  }
}
