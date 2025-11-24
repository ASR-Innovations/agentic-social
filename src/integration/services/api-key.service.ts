import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateApiKeyDto) {
    // Generate API key
    const key = this.generateApiKey();
    const hashedKey = await bcrypt.hash(key, 10);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        workspaceId,
        name: dto.name,
        key: this.maskApiKey(key), // Store only prefix for display
        hashedKey,
        scopes: dto.scopes || [],
        rateLimitPerHour: dto.rateLimitPerHour || 1000,
        rateLimitPerDay: dto.rateLimitPerDay || 10000,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdBy: userId,
      },
    });

    // Return the full key only on creation
    return {
      ...apiKey,
      key, // Full key returned only once
    };
  }

  async findAll(workspaceId: string) {
    return this.prisma.apiKey.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        key: true, // Masked key
        status: true,
        scopes: true,
        rateLimitPerHour: true,
        rateLimitPerDay: true,
        expiresAt: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, workspaceId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  async revoke(id: string, workspaceId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, workspaceId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }

  async verify(key: string): Promise<{ workspaceId: string; scopes: string[] } | null> {
    // Find API key by prefix
    const prefix = this.maskApiKey(key);
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        key: prefix,
        status: 'ACTIVE',
      },
    });

    // Verify the full key against hashed keys
    for (const apiKey of apiKeys) {
      const isValid = await bcrypt.compare(key, apiKey.hashedKey);
      
      if (isValid) {
        // Check expiration
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { status: 'EXPIRED' },
          });
          return null;
        }

        // Update usage stats
        await this.prisma.apiKey.update({
          where: { id: apiKey.id },
          data: {
            lastUsedAt: new Date(),
            usageCount: { increment: 1 },
          },
        });

        return {
          workspaceId: apiKey.workspaceId,
          scopes: apiKey.scopes,
        };
      }
    }

    return null;
  }

  async checkRateLimit(workspaceId: string, apiKeyId: string): Promise<boolean> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey) return false;

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check hourly rate limit
    const hourlyCount = await this.prisma.rateLimitTracking.count({
      where: {
        resourceType: 'api_key',
        resourceId: apiKeyId,
        windowStart: { gte: hourAgo },
      },
    });

    if (hourlyCount >= (apiKey.rateLimitPerHour || 1000)) {
      return false;
    }

    // Check daily rate limit
    const dailyCount = await this.prisma.rateLimitTracking.count({
      where: {
        resourceType: 'api_key',
        resourceId: apiKeyId,
        windowStart: { gte: dayAgo },
      },
    });

    if (dailyCount >= (apiKey.rateLimitPerDay || 10000)) {
      return false;
    }

    // Record this request
    await this.prisma.rateLimitTracking.create({
      data: {
        resourceType: 'api_key',
        resourceId: apiKeyId,
        identifier: workspaceId,
        count: 1,
        windowStart: now,
        windowEnd: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour window
      },
    });

    return true;
  }

  private generateApiKey(): string {
    // Generate a secure random API key
    // Format: sk_live_<random_string>
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `sk_live_${randomBytes}`;
  }

  private maskApiKey(key: string): string {
    // Return only the prefix for display
    // e.g., sk_live_abc123... -> sk_live_abc...
    if (key.length <= 15) return key;
    return key.substring(0, 15) + '...';
  }
}
