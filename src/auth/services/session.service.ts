import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from '../dto/session.dto';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  private readonly SESSION_DURATION_HOURS = 24;
  private readonly MAX_SESSIONS_PER_USER = 10;

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    // Generate unique session token
    const sessionToken = this.generateSessionToken();

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.SESSION_DURATION_HOURS);

    // Check if user has too many active sessions
    const activeSessions = await this.prisma.userSession.count({
      where: {
        userId: dto.userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSessions >= this.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldestSession = await this.prisma.userSession.findFirst({
        where: {
          userId: dto.userId,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestSession) {
        await this.prisma.userSession.update({
          where: { id: oldestSession.id },
          data: { isActive: false },
        });
      }
    }

    return this.prisma.userSession.create({
      data: {
        userId: dto.userId,
        sessionToken,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        deviceInfo: dto.deviceInfo,
        expiresAt,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async findByToken(sessionToken: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            workspaceId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or inactive');
    }

    return session;
  }

  async updateActivity(sessionToken: string) {
    return this.prisma.userSession.update({
      where: { sessionToken },
      data: { lastActivity: new Date() },
    });
  }

  async revoke(sessionId: string, userId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async revokeAll(userId: string, keepCurrentToken?: string) {
    const where: any = { userId, isActive: true };
    
    if (keepCurrentToken) {
      where.sessionToken = { not: keepCurrentToken };
    }

    return this.prisma.userSession.updateMany({
      where,
      data: { isActive: false },
    });
  }

  async cleanupExpired() {
    // Delete expired sessions older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { createdAt: { lt: thirtyDaysAgo } },
        ],
      },
    });
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
