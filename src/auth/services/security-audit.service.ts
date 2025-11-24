import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto, QueryAuditLogsDto, AuditAction, AuditSeverity } from '../dto/security-audit.dto';

@Injectable()
export class SecurityAuditService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, userId: string | null, dto: CreateAuditLogDto) {
    return this.prisma.securityAuditLog.create({
      data: {
        workspaceId,
        userId,
        action: dto.action,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        status: dto.status,
        details: dto.details,
        severity: dto.severity || AuditSeverity.INFO,
      },
    });
  }

  async findAll(workspaceId: string, query: QueryAuditLogsDto) {
    const where: any = { workspaceId };

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.securityAuditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.securityAuditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStatistics(workspaceId: string, startDate?: Date, endDate?: Date) {
    const where: any = { workspaceId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    const [
      totalLogs,
      actionCounts,
      severityCounts,
      failedActions,
    ] = await Promise.all([
      this.prisma.securityAuditLog.count({ where }),
      this.prisma.securityAuditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      this.prisma.securityAuditLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.securityAuditLog.count({
        where: {
          ...where,
          status: 'failure',
        },
      }),
    ]);

    return {
      totalLogs,
      actionCounts: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>),
      severityCounts: severityCounts.reduce((acc, item) => {
        acc[item.severity] = item._count;
        return acc;
      }, {} as Record<string, number>),
      failedActions,
    };
  }

  async cleanup(retentionDays: number = 2555) {
    // Default 7 years retention (2555 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    return this.prisma.securityAuditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });
  }

  // Helper method to log common actions
  async logLogin(workspaceId: string, userId: string, ipAddress: string, userAgent: string, success: boolean) {
    return this.create(workspaceId, userId, {
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: success ? 'success' : 'failure',
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    });
  }

  async logLogout(workspaceId: string, userId: string, ipAddress: string, userAgent: string) {
    return this.create(workspaceId, userId, {
      action: AuditAction.LOGOUT,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: 'success',
      severity: AuditSeverity.INFO,
    });
  }

  async logPasswordChange(workspaceId: string, userId: string, ipAddress: string, userAgent: string) {
    return this.create(workspaceId, userId, {
      action: AuditAction.PASSWORD_CHANGE,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: 'success',
      severity: AuditSeverity.WARNING,
    });
  }

  async logPermissionChange(
    workspaceId: string,
    adminUserId: string,
    targetUserId: string,
    ipAddress: string,
    userAgent: string,
    details: any
  ) {
    return this.create(workspaceId, adminUserId, {
      action: AuditAction.PERMISSION_CHANGE,
      resourceType: 'user',
      resourceId: targetUserId,
      ipAddress,
      userAgent,
      status: 'success',
      severity: AuditSeverity.WARNING,
      details,
    });
  }
}
