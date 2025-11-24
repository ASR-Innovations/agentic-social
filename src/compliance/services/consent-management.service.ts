import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConsentRecordDto } from '../dto/create-consent-record.dto';

@Injectable()
export class ConsentManagementService {
  private readonly logger = new Logger(ConsentManagementService.name);

  constructor(private prisma: PrismaService) {}

  async createConsentRecord(workspaceId: string, dto: CreateConsentRecordDto, ipAddress?: string, userAgent?: string) {
    return this.prisma.consentRecord.create({
      data: {
        workspaceId,
        userId: dto.userId,
        externalId: dto.externalId,
        email: dto.email,
        consentType: dto.consentType,
        purpose: dto.purpose,
        granted: dto.granted,
        grantedAt: dto.granted ? new Date() : undefined,
        legalBasis: dto.legalBasis,
        source: dto.source,
        ipAddress,
        userAgent,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async getConsentRecords(workspaceId: string, filters?: {
    userId?: string;
    externalId?: string;
    email?: string;
    consentType?: string;
    granted?: boolean;
  }) {
    return this.prisma.consentRecord.findMany({
      where: {
        workspaceId,
        ...(filters as any),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConsentRecord(id: string, workspaceId: string) {
    return this.prisma.consentRecord.findFirst({
      where: { id, workspaceId },
    });
  }

  async withdrawConsent(id: string, workspaceId: string) {
    return this.prisma.consentRecord.update({
      where: { id },
      data: {
        withdrawn: true,
        withdrawnAt: new Date(),
      },
    });
  }

  async checkConsent(
    workspaceId: string,
    consentType: string,
    identifier: { userId?: string; externalId?: string; email?: string },
  ): Promise<boolean> {
    const consent = await this.prisma.consentRecord.findFirst({
      where: {
        workspaceId,
        consentType: consentType as any,
        ...identifier,
        granted: true,
        withdrawn: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return !!consent;
  }

  async cleanupExpiredConsents() {
    const expiredConsents = await this.prisma.consentRecord.findMany({
      where: {
        granted: true,
        withdrawn: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const consent of expiredConsents) {
      await this.prisma.consentRecord.update({
        where: { id: consent.id },
        data: {
          withdrawn: true,
          withdrawnAt: new Date(),
        },
      });
    }

    this.logger.log(`Cleaned up ${expiredConsents.length} expired consents`);
  }
}
