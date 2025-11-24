import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditReportService } from './services/audit-report.service';
import {
  QueryAuditLogsDto,
  AuditReportDto,
  AuditStatisticsDto,
} from './dto/audit.dto';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly auditReportService: AuditReportService,
  ) {}

  /**
   * Get all audit logs with filtering
   */
  @Get('logs')
  async findAll(@Req() req: any, @Query() query: QueryAuditLogsDto) {
    const workspaceId = req.user?.workspaceId;
    return this.auditService.findAll(workspaceId, query);
  }

  /**
   * Get a single audit log by ID
   */
  @Get('logs/:id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const workspaceId = req.user?.workspaceId;
    return this.auditService.findOne(workspaceId, id);
  }

  /**
   * Get audit log statistics
   */
  @Get('statistics')
  async getStatistics(@Req() req: any, @Query() query: AuditStatisticsDto) {
    const workspaceId = req.user?.workspaceId;
    return this.auditService.getStatistics(workspaceId, query);
  }

  /**
   * Verify integrity of a single audit log
   */
  @Get('logs/:id/verify')
  async verifyIntegrity(@Req() req: any, @Param('id') id: string) {
    const isValid = await this.auditService.verifyIntegrity(id);
    return {
      logId: id,
      valid: isValid,
      verifiedAt: new Date(),
    };
  }

  /**
   * Batch verify integrity of audit logs
   */
  @Post('verify-batch')
  @HttpCode(HttpStatus.OK)
  async batchVerifyIntegrity(
    @Req() req: any,
    @Body() body: { startDate?: string; endDate?: string },
  ) {
    const workspaceId = req.user?.workspaceId;
    const startDate = body.startDate ? new Date(body.startDate) : undefined;
    const endDate = body.endDate ? new Date(body.endDate) : undefined;

    return this.auditService.batchVerifyIntegrity(
      workspaceId,
      startDate,
      endDate,
    );
  }

  /**
   * Generate audit report
   */
  @Post('reports/generate')
  @HttpCode(HttpStatus.OK)
  async generateReport(@Req() req: any, @Body() dto: AuditReportDto) {
    const workspaceId = req.user?.workspaceId;
    return this.auditReportService.generateReport(workspaceId, dto);
  }

  /**
   * Generate compliance audit report
   */
  @Post('reports/compliance')
  @HttpCode(HttpStatus.OK)
  async generateComplianceReport(
    @Req() req: any,
    @Body() body: { startDate: string; endDate: string },
  ) {
    const workspaceId = req.user?.workspaceId;
    return this.auditReportService.generateComplianceReport(
      workspaceId,
      body.startDate,
      body.endDate,
    );
  }

  /**
   * Export audit logs for external compliance tools
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  async exportForCompliance(
    @Req() req: any,
    @Body()
    body: {
      startDate: string;
      endDate: string;
      format?: 'siem' | 'splunk' | 'elk';
    },
  ) {
    const workspaceId = req.user?.workspaceId;
    return this.auditReportService.exportForCompliance(
      workspaceId,
      body.startDate,
      body.endDate,
      body.format,
    );
  }

  /**
   * Cleanup old audit logs (admin only)
   */
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanup(
    @Req() req: any,
    @Body() body: { retentionDays?: number },
  ) {
    const workspaceId = req.user?.workspaceId;
    const retentionDays = body.retentionDays || 2555; // Default 7 years
    return this.auditService.cleanup(workspaceId, retentionDays);
  }
}
