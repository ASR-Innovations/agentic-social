import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIntegrationDto } from '../dto/create-integration.dto';
import { UpdateIntegrationDto } from '../dto/update-integration.dto';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateIntegrationDto) {
    // Encrypt credentials if provided
    const encryptedCredentials = dto.config?.credentials
      ? this.encryptCredentials(dto.config.credentials)
      : null;

    const integration = await this.prisma.integration.create({
      data: {
        workspaceId,
        name: dto.name,
        type: dto.type,
        provider: dto.provider,
        description: dto.description,
        logoUrl: dto.logoUrl,
        config: dto.config ? { ...dto.config, credentials: undefined } : undefined,
        credentials: encryptedCredentials,
        scopes: dto.scopes || [],
        rateLimitPerHour: dto.rateLimitPerHour || 1000,
        rateLimitPerDay: dto.rateLimitPerDay || 10000,
        isPublic: dto.isPublic || false,
        metadata: dto.metadata,
        createdBy: userId,
      },
    });

    return integration;
  }

  async findAll(workspaceId: string, includePublic = false) {
    const where: any = includePublic
      ? {
          OR: [
            { workspaceId },
            { isPublic: true },
          ],
        }
      : { workspaceId };

    return this.prisma.integration.findMany({
      where,
      include: {
        webhooks: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: {
        id,
        OR: [
          { workspaceId },
          { isPublic: true },
        ],
      },
      include: {
        webhooks: true,
        logs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Decrypt credentials for the owner workspace
    if (integration.workspaceId === workspaceId && integration.credentials) {
      integration.credentials = this.decryptCredentials(integration.credentials as any);
    } else {
      // Don't expose credentials for public integrations
      integration.credentials = null;
    }

    return integration;
  }

  async update(id: string, workspaceId: string, dto: UpdateIntegrationDto) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, workspaceId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Encrypt credentials if provided
    const encryptedCredentials = dto.config?.credentials
      ? this.encryptCredentials(dto.config.credentials)
      : undefined;

    return this.prisma.integration.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        config: dto.config ? { ...dto.config, credentials: undefined } : undefined,
        credentials: encryptedCredentials,
        scopes: dto.scopes,
        rateLimitPerHour: dto.rateLimitPerHour,
        rateLimitPerDay: dto.rateLimitPerDay,
        metadata: dto.metadata,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, workspaceId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    await this.prisma.integration.delete({
      where: { id },
    });

    return { message: 'Integration deleted successfully' };
  }

  async updateStatus(id: string, workspaceId: string, status: 'ACTIVE' | 'INACTIVE' | 'ERROR') {
    const integration = await this.prisma.integration.findFirst({
      where: { id, workspaceId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return this.prisma.integration.update({
      where: { id },
      data: { status },
    });
  }

  async logAction(
    integrationId: string,
    action: string,
    status: string,
    request?: any,
    response?: any,
    error?: string,
    duration?: number,
  ) {
    return this.prisma.integrationLog.create({
      data: {
        integrationId,
        action,
        status,
        request,
        response,
        error,
        duration,
      },
    });
  }

  async getMarketplace() {
    return this.prisma.integration.findMany({
      where: { isPublic: true, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        type: true,
        provider: true,
        description: true,
        logoUrl: true,
        scopes: true,
        metadata: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  private encryptCredentials(credentials: any): any {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  private decryptCredentials(encryptedData: any): any {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex'),
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
