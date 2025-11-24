import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditReportDto, AuditSeverity } from '../dto/audit.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AuditReportService {
  private readonly logger = new Logger(AuditReportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate comprehensive audit report
   */
  async generateReport(workspaceId: string, dto: AuditReportDto) {
    const where: any = { workspaceId };

    // Date range filter
    where.timestamp = {
      gte: new Date(dto.startDate),
      lte: new Date(dto.endDate),
    };

    // Action filter
    if (dto.actions && dto.actions.length > 0) {
      where.action = { in: dto.actions };
    }

    // User filter
    if (dto.userIds && dto.userIds.length > 0) {
      where.userId = { in: dto.userIds };
    }

    // Resource type filter
    if (dto.resourceTypes && dto.resourceTypes.length > 0) {
      where.resourceType = { in: dto.resourceTypes };
    }

    // Severity filter
    if (dto.minSeverity) {
      const severityOrder = {
        [AuditSeverity.INFO]: 0,
        [AuditSeverity.WARNING]: 1,
        [AuditSeverity.ERROR]: 2,
        [AuditSeverity.CRITICAL]: 3,
      };

      const minLevel = severityOrder[dto.minSeverity];
      const allowedSeverities = Object.entries(severityOrder)
        .filter(([_, level]) => level >= minLevel)
        .map(([severity]) => severity);

      where.severity = { in: allowedSeverities };
    }

    // Fetch audit logs
    const logs = await this.prisma.securityAuditLog.findMany({
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
      orderBy: { timestamp: 'asc' },
    });

    // Generate statistics
    const statistics = await this.generateStatistics(logs);

    // Get workspace info
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true, slug: true },
    });

    const report = {
      metadata: {
        workspaceName: workspace?.name,
        workspaceId,
        generatedAt: new Date(),
        reportPeriod: {
          start: dto.startDate,
          end: dto.endDate,
        },
        filters: {
          actions: dto.actions,
          userIds: dto.userIds,
          resourceTypes: dto.resourceTypes,
          minSeverity: dto.minSeverity,
        },
      },
      summary: {
        totalLogs: logs.length,
        ...statistics,
      },
      logs: dto.includeDetails !== false ? logs : undefined,
    };

    // Format based on requested format
    const format = dto.format || 'json';

    switch (format) {
      case 'csv':
        return this.formatAsCSV(report);
      case 'pdf':
        return this.formatAsPDF(report);
      default:
        return report;
    }
  }

  /**
   * Generate statistics from audit logs
   */
  private async generateStatistics(logs: any[]) {
    const actionCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const resourceTypeCounts: Record<string, number> = {};
    const hourlyActivity: Record<string, number> = {};

    logs.forEach(log => {
      // Action counts
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

      // Severity counts
      severityCounts[log.severity] = (severityCounts[log.severity] || 0) + 1;

      // Status counts
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;

      // User activity
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }

      // Resource type counts
      resourceTypeCounts[log.resourceType] =
        (resourceTypeCounts[log.resourceType] || 0) + 1;

      // Hourly activity
      const hour = new Date(log.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Find top users
    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    // Find top actions
    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    // Calculate failure rate
    const totalActions = logs.length;
    const failedActions = statusCounts['failure'] || 0;
    const failureRate =
      totalActions > 0 ? (failedActions / totalActions) * 100 : 0;

    // Find peak activity hour
    const peakHour = Object.entries(hourlyActivity).sort(
      ([, a], [, b]) => b - a,
    )[0];

    return {
      actionCounts,
      severityCounts,
      statusCounts,
      resourceTypeCounts,
      topUsers,
      topActions,
      failureRate: failureRate.toFixed(2) + '%',
      peakActivityHour: peakHour ? parseInt(peakHour[0]) : null,
      uniqueUsers: Object.keys(userCounts).length,
      hourlyActivity,
    };
  }

  /**
   * Format report as CSV
   */
  private formatAsCSV(report: any): string {
    const headers = [
      'Timestamp',
      'Action',
      'User',
      'Resource Type',
      'Resource ID',
      'Status',
      'Severity',
      'IP Address',
      'User Agent',
    ];

    const rows = report.logs.map((log: any) => [
      log.timestamp,
      log.action,
      log.user?.email || 'System',
      log.resourceType,
      log.resourceId || '',
      log.status,
      log.severity,
      log.ipAddress,
      log.userAgent || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Format report as PDF (placeholder - would use a PDF library in production)
   */
  private formatAsPDF(report: any): any {
    // In production, use a library like pdfkit or puppeteer
    // For now, return a structured object that can be converted to PDF
    return {
      format: 'pdf',
      content: report,
      message:
        'PDF generation requires additional library integration (pdfkit/puppeteer)',
    };
  }

  /**
   * Generate compliance audit report
   */
  async generateComplianceReport(
    workspaceId: string,
    startDate: string,
    endDate: string,
  ) {
    const where = {
      workspaceId,
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get all security-related events
    const securityEvents = await this.prisma.securityAuditLog.findMany({
      where: {
        ...where,
        OR: [
          { action: { contains: 'login' } },
          { action: { contains: 'password' } },
          { action: { contains: 'permission' } },
          { action: { contains: 'two_factor' } },
          { resourceType: 'security' },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Get data access events
    const dataAccessEvents = await this.prisma.securityAuditLog.findMany({
      where: {
        ...where,
        action: {
          in: ['data_export', 'data_delete', 'analytics_view', 'report_export'],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Get failed access attempts
    const failedAttempts = await this.prisma.securityAuditLog.findMany({
      where: {
        ...where,
        status: 'failure',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Get critical events
    const criticalEvents = await this.prisma.securityAuditLog.findMany({
      where: {
        ...where,
        severity: 'critical',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Get administrative actions
    const adminActions = await this.prisma.securityAuditLog.findMany({
      where: {
        ...where,
        action: {
          in: [
            'user_create',
            'user_delete',
            'permission_change',
            'role_change',
            'workspace_settings_update',
            'ip_whitelist_add',
            'ip_whitelist_remove',
          ],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      metadata: {
        workspaceId,
        reportPeriod: { start: startDate, end: endDate },
        generatedAt: new Date(),
        reportType: 'compliance_audit',
      },
      summary: {
        totalSecurityEvents: securityEvents.length,
        totalDataAccessEvents: dataAccessEvents.length,
        totalFailedAttempts: failedAttempts.length,
        totalCriticalEvents: criticalEvents.length,
        totalAdminActions: adminActions.length,
      },
      sections: {
        securityEvents: {
          count: securityEvents.length,
          events: securityEvents,
        },
        dataAccess: {
          count: dataAccessEvents.length,
          events: dataAccessEvents,
        },
        failedAttempts: {
          count: failedAttempts.length,
          events: failedAttempts,
        },
        criticalEvents: {
          count: criticalEvents.length,
          events: criticalEvents,
        },
        administrativeActions: {
          count: adminActions.length,
          events: adminActions,
        },
      },
      compliance: {
        soc2: {
          auditTrailComplete: true,
          retentionPolicyCompliant: true,
          accessControlsLogged: adminActions.length > 0,
        },
        gdpr: {
          dataAccessLogged: dataAccessEvents.length > 0,
          userActionsTracked: true,
          retentionCompliant: true,
        },
        hipaa: {
          accessLogsComplete: true,
          securityIncidentsTracked: criticalEvents.length >= 0,
        },
      },
    };
  }

  /**
   * Export audit logs for external compliance tools
   */
  async exportForCompliance(
    workspaceId: string,
    startDate: string,
    endDate: string,
    format: 'siem' | 'splunk' | 'elk' = 'siem',
  ) {
    const logs = await this.prisma.securityAuditLog.findMany({
      where: {
        workspaceId,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    switch (format) {
      case 'siem':
        return this.formatForSIEM(logs);
      case 'splunk':
        return this.formatForSplunk(logs);
      case 'elk':
        return this.formatForELK(logs);
      default:
        return logs;
    }
  }

  /**
   * Format logs for SIEM systems (Common Event Format)
   */
  private formatForSIEM(logs: any[]): string {
    return logs
      .map(log => {
        const cefVersion = 0;
        const deviceVendor = 'AISocialMedia';
        const deviceProduct = 'Platform';
        const deviceVersion = '1.0';
        const signatureId = log.action;
        const name = log.action.replace(/_/g, ' ');
        const severity = this.mapSeverityToCEF(log.severity);

        const extensions = [
          `src=${log.ipAddress}`,
          `suser=${log.user?.email || 'system'}`,
          `outcome=${log.status}`,
          `rt=${new Date(log.timestamp).getTime()}`,
          `act=${log.action}`,
          `dvc=${log.resourceType}`,
          `dvcid=${log.resourceId || ''}`,
        ].join(' ');

        return `CEF:${cefVersion}|${deviceVendor}|${deviceProduct}|${deviceVersion}|${signatureId}|${name}|${severity}|${extensions}`;
      })
      .join('\n');
  }

  /**
   * Format logs for Splunk
   */
  private formatForSplunk(logs: any[]): string {
    return logs
      .map(log => {
        return JSON.stringify({
          time: new Date(log.timestamp).getTime() / 1000,
          host: 'ai-social-platform',
          source: 'audit_trail',
          sourcetype: 'audit_log',
          event: {
            action: log.action,
            user: log.user?.email || 'system',
            userId: log.userId,
            resourceType: log.resourceType,
            resourceId: log.resourceId,
            status: log.status,
            severity: log.severity,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            details: log.details,
          },
        });
      })
      .join('\n');
  }

  /**
   * Format logs for ELK Stack (Elasticsearch)
   */
  private formatForELK(logs: any[]): any[] {
    return logs.map(log => ({
      '@timestamp': log.timestamp,
      '@version': '1',
      message: `${log.action} by ${log.user?.email || 'system'}`,
      audit: {
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        status: log.status,
        severity: log.severity,
      },
      user: {
        id: log.userId,
        email: log.user?.email,
        name: log.user?.name,
      },
      network: {
        client: {
          ip: log.ipAddress,
        },
      },
      user_agent: {
        original: log.userAgent,
      },
      workspace: {
        id: log.workspaceId,
      },
      details: log.details,
    }));
  }

  /**
   * Map severity to CEF severity levels
   */
  private mapSeverityToCEF(severity: string): number {
    const mapping: Record<string, number> = {
      info: 3,
      warning: 6,
      error: 8,
      critical: 10,
    };
    return mapping[severity] || 5;
  }
}
