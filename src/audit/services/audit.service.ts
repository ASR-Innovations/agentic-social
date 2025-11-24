import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAuditLogDto,
  QueryAuditLogsDto,
  AuditAction,
  AuditSeverity,
  AuditStatus,
  AuditStatisticsDto,
} from '../dto/audit.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create an audit log entry with tamper-proof hash
   */
  async create(
    workspaceId: string,
    userId: string | null,
    dto: CreateAuditLogDto,
  ) {
    try {
      // Create tamper-proof hash of the log entry
      const logData = {
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
        timestamp: new Date().toISOString(),
      };

      const hash = this.generateHash(logData);

      const auditLog = await this.prisma.securityAuditLog.create({
        data: {
          workspaceId,
          userId,
          action: dto.action,
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          status: dto.status,
          details: {
            ...dto.details,
            _hash: hash,
            _version: '1.0',
          },
          severity: dto.severity || AuditSeverity.INFO,
        },
      });

      return auditLog;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create audit log: ${errorMessage}`, errorStack);
      // Don't throw - audit logging should never break the main flow
      return null;
    }
  }

  /**
   * Generate tamper-proof hash for audit log entry
   */
  private generateHash(data: any): string {
    const content = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Verify integrity of an audit log entry
   */
  async verifyIntegrity(logId: string): Promise<boolean> {
    const log = await this.prisma.securityAuditLog.findUnique({
      where: { id: logId },
    });

    if (!log || !log.details || typeof log.details !== 'object') {
      return false;
    }

    const details = log.details as any;
    const storedHash = details._hash;

    if (!storedHash) {
      return false;
    }

    // Reconstruct the original data
    const logData = {
      workspaceId: log.workspaceId,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      status: log.status,
      details: { ...details },
      severity: log.severity,
      timestamp: log.timestamp.toISOString(),
    };

    // Remove hash from details for verification
    delete logData.details._hash;
    delete logData.details._version;

    const computedHash = this.generateHash(logData);
    return computedHash === storedHash;
  }

  /**
   * Find all audit logs with advanced filtering
   */
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

    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.status) {
      where.status = query.status;
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

    // Full-text search across multiple fields
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { resourceType: { contains: query.search, mode: 'insensitive' } },
        { resourceId: { contains: query.search, mode: 'insensitive' } },
        { ipAddress: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';

    const [logs, total] = await Promise.all([
      this.prisma.securityAuditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
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
      hasMore: page * limit < total,
    };
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(workspaceId: string, dto: AuditStatisticsDto) {
    const where: any = { workspaceId };

    if (dto.startDate || dto.endDate) {
      where.timestamp = {};
      if (dto.startDate) {
        where.timestamp.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.timestamp.lte = new Date(dto.endDate);
      }
    }

    const [
      totalLogs,
      actionCounts,
      severityCounts,
      statusCounts,
      userActivity,
      resourceTypeCounts,
    ] = await Promise.all([
      this.prisma.securityAuditLog.count({ where }),
      this.prisma.securityAuditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 20,
      }),
      this.prisma.securityAuditLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.securityAuditLog.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.securityAuditLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      this.prisma.securityAuditLog.groupBy({
        by: ['resourceType'],
        where,
        _count: true,
        orderBy: { _count: { resourceType: 'desc' } },
      }),
    ]);

    // Get time-series data if groupBy is specified
    let timeSeries = null;
    if (dto.groupBy === 'day' || dto.groupBy === 'hour') {
      timeSeries = await this.getTimeSeriesData(workspaceId, dto);
    }

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
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      topUsers: userActivity.map(item => ({
        userId: item.userId,
        count: item._count,
      })),
      resourceTypeCounts: resourceTypeCounts.reduce((acc, item) => {
        acc[item.resourceType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      timeSeries,
    };
  }

  /**
   * Get time-series data for audit logs
   */
  private async getTimeSeriesData(
    workspaceId: string,
    dto: AuditStatisticsDto,
  ) {
    const where: any = { workspaceId };

    if (dto.startDate || dto.endDate) {
      where.timestamp = {};
      if (dto.startDate) {
        where.timestamp.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.timestamp.lte = new Date(dto.endDate);
      }
    }

    // Use raw SQL for time-series aggregation
    const groupByClause =
      dto.groupBy === 'hour'
        ? "DATE_TRUNC('hour', timestamp)"
        : "DATE_TRUNC('day', timestamp)";

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        ${groupByClause} as period,
        COUNT(*) as count,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN status = 'failure' THEN 1 END) as failure_count
      FROM security_audit_logs
      WHERE workspace_id = '${workspaceId}'
      ${dto.startDate ? `AND timestamp >= '${dto.startDate}'` : ''}
      ${dto.endDate ? `AND timestamp <= '${dto.endDate}'` : ''}
      GROUP BY period
      ORDER BY period ASC
    `);

    return result;
  }

  /**
   * Get a single audit log by ID
   */
  async findOne(workspaceId: string, id: string) {
    const log = await this.prisma.securityAuditLog.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!log) {
      return null;
    }

    // Verify integrity
    const isValid = await this.verifyIntegrity(id);

    return {
      ...log,
      _integrity: {
        verified: isValid,
        verifiedAt: new Date(),
      },
    };
  }

  /**
   * Cleanup old audit logs based on retention policy
   */
  async cleanup(workspaceId: string, retentionDays: number = 2555) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.securityAuditLog.deleteMany({
      where: {
        workspaceId,
        timestamp: { lt: cutoffDate },
      },
    });

    this.logger.log(
      `Cleaned up ${result.count} audit logs older than ${retentionDays} days for workspace ${workspaceId}`,
    );

    return result;
  }

  /**
   * Batch verify integrity of audit logs
   */
  async batchVerifyIntegrity(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
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

    const logs = await this.prisma.securityAuditLog.findMany({
      where,
      select: { id: true },
    });

    const results = await Promise.all(
      logs.map(async log => ({
        id: log.id,
        valid: await this.verifyIntegrity(log.id),
      })),
    );

    const totalLogs = results.length;
    const validLogs = results.filter(r => r.valid).length;
    const invalidLogs = results.filter(r => !r.valid);

    return {
      totalLogs,
      validLogs,
      invalidLogs: invalidLogs.length,
      invalidLogIds: invalidLogs.map(r => r.id),
      integrityPercentage: totalLogs > 0 ? (validLogs / totalLogs) * 100 : 100,
    };
  }

  // Helper methods for common audit actions
  async logLogin(
    workspaceId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
  ) {
    return this.create(workspaceId, userId, {
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    });
  }

  async logLogout(
    workspaceId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.create(workspaceId, userId, {
      action: AuditAction.LOGOUT,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.INFO,
    });
  }

  async logResourceAction(
    workspaceId: string,
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    details?: any,
    status: AuditStatus = AuditStatus.SUCCESS,
  ) {
    return this.create(workspaceId, userId, {
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      status,
      details,
      severity: AuditSeverity.INFO,
    });
  }

  async logSecurityEvent(
    workspaceId: string,
    userId: string | null,
    action: AuditAction,
    ipAddress: string,
    userAgent: string,
    details: any,
    severity: AuditSeverity = AuditSeverity.WARNING,
  ) {
    return this.create(workspaceId, userId, {
      action,
      resourceType: 'security',
      ipAddress,
      userAgent,
      status: AuditStatus.SUCCESS,
      details,
      severity,
    });
  }
}
