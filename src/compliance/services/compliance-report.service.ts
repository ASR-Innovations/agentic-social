import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplianceReportDto } from '../dto/create-compliance-report.dto';
import { ComplianceReportType, ReportStatus, ExportFormat } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ComplianceReportService {
  private readonly logger = new Logger(ComplianceReportService.name);

  constructor(private prisma: PrismaService) {}

  async createReport(workspaceId: string, userId: string, dto: CreateComplianceReportDto) {
    const report = await this.prisma.complianceReport.create({
      data: {
        workspaceId,
        generatedBy: userId,
        reportType: dto.reportType,
        title: dto.title,
        description: dto.description,
        periodFrom: new Date(dto.periodFrom),
        periodTo: new Date(dto.periodTo),
        fileFormat: dto.fileFormat || ExportFormat.PDF,
        status: ReportStatus.GENERATING,
        startedAt: new Date(),
      },
    });

    // Generate report asynchronously
    this.generateReport(report.id).catch(error => {
      this.logger.error(`Failed to generate report ${report.id}:`, error);
    });

    return report;
  }

  async getReports(workspaceId: string) {
    return this.prisma.complianceReport.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(id: string, workspaceId: string) {
    return this.prisma.complianceReport.findFirst({
      where: { id, workspaceId },
    });
  }

  private async generateReport(reportId: string) {
    const report = await this.prisma.complianceReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    try {
      let reportData: any;
      let complianceScore: number;
      let findings: any[];
      let recommendations: any[];

      switch (report.reportType) {
        case ComplianceReportType.GDPR_COMPLIANCE:
          ({ reportData, complianceScore, findings, recommendations } = await this.generateGDPRReport(
            report.workspaceId,
            report.periodFrom,
            report.periodTo,
          ));
          break;

        case ComplianceReportType.CCPA_COMPLIANCE:
          ({ reportData, complianceScore, findings, recommendations } = await this.generateCCPAReport(
            report.workspaceId,
            report.periodFrom,
            report.periodTo,
          ));
          break;

        case ComplianceReportType.DATA_RETENTION:
          ({ reportData, complianceScore, findings, recommendations } = await this.generateDataRetentionReport(
            report.workspaceId,
            report.periodFrom,
            report.periodTo,
          ));
          break;

        case ComplianceReportType.ACCESS_LOG:
          ({ reportData, complianceScore, findings, recommendations } = await this.generateAccessLogReport(
            report.workspaceId,
            report.periodFrom,
            report.periodTo,
          ));
          break;

        default:
          throw new Error(`Unsupported report type: ${report.reportType}`);
      }

      // Generate summary
      const summary = {
        totalFindings: findings.length,
        criticalFindings: findings.filter(f => f.severity === 'critical').length,
        complianceScore,
        period: {
          from: report.periodFrom,
          to: report.periodTo,
        },
      };

      // Save report file
      const fileName = `compliance-report-${reportId}.json`;
      const filePath = path.join(process.cwd(), 'reports', fileName);
      
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileContent = JSON.stringify({
        ...report,
        data: reportData,
        summary,
        findings,
        recommendations,
      }, null, 2);

      fs.writeFileSync(filePath, fileContent);
      const fileSize = fs.statSync(filePath).size;

      await this.prisma.complianceReport.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          data: reportData,
          summary,
          complianceScore,
          findings,
          recommendations,
          fileUrl: `/reports/${fileName}`,
          fileSize: BigInt(fileSize),
          completedAt: new Date(),
        },
      });

      this.logger.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      this.logger.error(`Report ${reportId} generation failed:`, error);
      
      await this.prisma.complianceReport.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.FAILED,
          error: error.message,
          completedAt: new Date(),
        },
      });
    }
  }

  private async generateGDPRReport(workspaceId: string, periodFrom: Date, periodTo: Date) {
    const findings: any[] = [];
    let complianceScore = 100;

    // Check data retention policies
    const retentionPolicies = await this.prisma.dataRetentionPolicy.findMany({
      where: { workspaceId, isActive: true },
    });

    if (retentionPolicies.length === 0) {
      findings.push({
        severity: 'high',
        category: 'Data Retention',
        issue: 'No active data retention policies found',
        recommendation: 'Implement data retention policies to comply with GDPR Article 5(1)(e)',
      });
      complianceScore -= 15;
    }

    // Check consent records
    const consentRecords = await this.prisma.consentRecord.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodFrom, lte: periodTo },
      },
    });

    const grantedConsents = consentRecords.filter(c => c.granted).length;
    const totalConsents = consentRecords.length;

    if (totalConsents === 0) {
      findings.push({
        severity: 'medium',
        category: 'Consent Management',
        issue: 'No consent records found',
        recommendation: 'Implement consent tracking for data processing activities',
      });
      complianceScore -= 10;
    }

    // Check data export requests (Right of Access)
    const exportRequests = await this.prisma.dataExportRequest.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodFrom, lte: periodTo },
      },
    });

    const completedExports = exportRequests.filter(r => r.status === 'COMPLETED').length;
    const failedExports = exportRequests.filter(r => r.status === 'FAILED').length;

    if (failedExports > 0) {
      findings.push({
        severity: 'high',
        category: 'Right of Access',
        issue: `${failedExports} data export requests failed`,
        recommendation: 'Investigate and resolve failed export requests to ensure compliance with GDPR Article 15',
      });
      complianceScore -= 20;
    }

    // Check deletion requests (Right to Erasure)
    const deletionRequests = await this.prisma.dataDeletionRequest.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodFrom, lte: periodTo },
      },
    });

    const pendingDeletions = deletionRequests.filter(r => r.status === 'PENDING_APPROVAL').length;

    if (pendingDeletions > 0) {
      findings.push({
        severity: 'high',
        category: 'Right to Erasure',
        issue: `${pendingDeletions} deletion requests pending approval`,
        recommendation: 'Process pending deletion requests within 30 days as required by GDPR Article 17',
      });
      complianceScore -= 15;
    }

    // Check data processing activities
    const processingActivities = await this.prisma.dataProcessingActivity.findMany({
      where: { workspaceId, isActive: true },
    });

    if (processingActivities.length === 0) {
      findings.push({
        severity: 'medium',
        category: 'Data Processing',
        issue: 'No documented data processing activities',
        recommendation: 'Document all data processing activities as required by GDPR Article 30',
      });
      complianceScore -= 10;
    }

    const reportData = {
      retentionPolicies: retentionPolicies.length,
      consentRecords: {
        total: totalConsents,
        granted: grantedConsents,
        withdrawn: consentRecords.filter(c => c.withdrawn).length,
      },
      exportRequests: {
        total: exportRequests.length,
        completed: completedExports,
        failed: failedExports,
      },
      deletionRequests: {
        total: deletionRequests.length,
        pending: pendingDeletions,
        completed: deletionRequests.filter(r => r.status === 'COMPLETED').length,
      },
      processingActivities: processingActivities.length,
    };

    const recommendations = [
      'Regularly review and update data retention policies',
      'Ensure all data processing activities are documented',
      'Implement automated consent management workflows',
      'Monitor and respond to data subject requests within required timeframes',
    ];

    return { reportData, complianceScore, findings, recommendations };
  }

  private async generateCCPAReport(workspaceId: string, periodFrom: Date, periodTo: Date) {
    const findings: any[] = [];
    let complianceScore = 100;

    // Check data export requests (Right to Know)
    const exportRequests = await this.prisma.dataExportRequest.findMany({
      where: {
        workspaceId,
        requestType: 'CCPA_DATA_ACCESS',
        createdAt: { gte: periodFrom, lte: periodTo },
      },
    });

    const avgProcessingTime = this.calculateAverageProcessingTime(exportRequests);
    
    if (avgProcessingTime > 45) { // CCPA requires response within 45 days
      findings.push({
        severity: 'high',
        category: 'Right to Know',
        issue: `Average processing time (${avgProcessingTime} days) exceeds CCPA requirement`,
        recommendation: 'Improve data export processing to meet 45-day requirement',
      });
      complianceScore -= 20;
    }

    // Check deletion requests (Right to Delete)
    const deletionRequests = await this.prisma.dataDeletionRequest.findMany({
      where: {
        workspaceId,
        requestType: 'CCPA_RIGHT_TO_DELETE',
        createdAt: { gte: periodFrom, lte: periodTo },
      },
    });

    const reportData = {
      exportRequests: {
        total: exportRequests.length,
        avgProcessingDays: avgProcessingTime,
      },
      deletionRequests: {
        total: deletionRequests.length,
        completed: deletionRequests.filter(r => r.status === 'COMPLETED').length,
      },
    };

    const recommendations = [
      'Ensure data subject requests are processed within 45 days',
      'Maintain clear records of all consumer requests',
      'Implement opt-out mechanisms for data sales',
    ];

    return { reportData, complianceScore, findings, recommendations };
  }

  private async generateDataRetentionReport(workspaceId: string, periodFrom: Date, periodTo: Date) {
    const policies = await this.prisma.dataRetentionPolicy.findMany({
      where: { workspaceId },
    });

    const reportData = {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.isActive).length,
      policiesByDataType: policies.reduce((acc, p) => {
        acc[p.dataType] = (acc[p.dataType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const findings: any[] = [];
    const complianceScore = 100;
    const recommendations = ['Review retention policies quarterly', 'Ensure policies align with legal requirements'];

    return { reportData, complianceScore, findings, recommendations };
  }

  private async generateAccessLogReport(workspaceId: string, periodFrom: Date, periodTo: Date) {
    const logs = await this.prisma.securityAuditLog.findMany({
      where: {
        workspaceId,
        timestamp: { gte: periodFrom, lte: periodTo },
      },
    });

    const reportData = {
      totalLogs: logs.length,
      byAction: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const findings: any[] = [];
    const complianceScore = 100;
    const recommendations = ['Maintain audit logs for at least 7 years', 'Regularly review access patterns'];

    return { reportData, complianceScore, findings, recommendations };
  }

  private calculateAverageProcessingTime(requests: any[]): number {
    if (requests.length === 0) return 0;

    const completedRequests = requests.filter(r => r.completedAt);
    if (completedRequests.length === 0) return 0;

    const totalDays = completedRequests.reduce((sum, r) => {
      const days = Math.floor((r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / completedRequests.length);
  }
}
