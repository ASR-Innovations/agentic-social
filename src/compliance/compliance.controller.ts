import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DataRetentionService } from './services/data-retention.service';
import { DataExportService } from './services/data-export.service';
import { DataDeletionService } from './services/data-deletion.service';
import { ComplianceReportService } from './services/compliance-report.service';
import { ConsentManagementService } from './services/consent-management.service';
import { CreateRetentionPolicyDto } from './dto/create-retention-policy.dto';
import { CreateExportRequestDto } from './dto/create-export-request.dto';
import { CreateDeletionRequestDto } from './dto/create-deletion-request.dto';
import { CreateComplianceReportDto } from './dto/create-compliance-report.dto';
import { CreateConsentRecordDto } from './dto/create-consent-record.dto';

@Controller('compliance')
export class ComplianceController {
  constructor(
    private dataRetentionService: DataRetentionService,
    private dataExportService: DataExportService,
    private dataDeletionService: DataDeletionService,
    private complianceReportService: ComplianceReportService,
    private consentManagementService: ConsentManagementService,
  ) {}

  // Data Retention Policies
  @Post('retention-policies')
  async createRetentionPolicy(
    @Request() req: any,
    @Body() dto: CreateRetentionPolicyDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.dataRetentionService.createPolicy(workspaceId, userId, dto);
  }

  @Get('retention-policies')
  async getRetentionPolicies(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.dataRetentionService.getPolicies(workspaceId);
  }

  @Get('retention-policies/:id')
  async getRetentionPolicy(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.dataRetentionService.getPolicy(id, workspaceId);
  }

  @Put('retention-policies/:id')
  async updateRetentionPolicy(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateRetentionPolicyDto>,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.dataRetentionService.updatePolicy(id, workspaceId, dto);
  }

  @Delete('retention-policies/:id')
  async deleteRetentionPolicy(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.dataRetentionService.deletePolicy(id, workspaceId);
  }

  // Data Export Requests
  @Post('export-requests')
  async createExportRequest(
    @Request() req: any,
    @Body() dto: CreateExportRequestDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.dataExportService.createExportRequest(workspaceId, userId, dto);
  }

  @Get('export-requests')
  async getExportRequests(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.dataExportService.getExportRequests(workspaceId);
  }

  @Get('export-requests/:id')
  async getExportRequest(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.dataExportService.getExportRequest(id, workspaceId);
  }

  // Data Deletion Requests
  @Post('deletion-requests')
  async createDeletionRequest(
    @Request() req: any,
    @Body() dto: CreateDeletionRequestDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.dataDeletionService.createDeletionRequest(workspaceId, userId, dto);
  }

  @Get('deletion-requests')
  async getDeletionRequests(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.dataDeletionService.getDeletionRequests(workspaceId);
  }

  @Get('deletion-requests/:id')
  async getDeletionRequest(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.dataDeletionService.getDeletionRequest(id, workspaceId);
  }

  @Post('deletion-requests/:id/approve')
  async approveDeletionRequest(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.dataDeletionService.approveDeletionRequest(id, workspaceId, userId);
  }

  @Post('deletion-requests/:id/reject')
  async rejectDeletionRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.dataDeletionService.rejectDeletionRequest(id, workspaceId, userId, reason);
  }

  // Compliance Reports
  @Post('reports')
  async createComplianceReport(
    @Request() req: any,
    @Body() dto: CreateComplianceReportDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.complianceReportService.createReport(workspaceId, userId, dto);
  }

  @Get('reports')
  async getComplianceReports(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.complianceReportService.getReports(workspaceId);
  }

  @Get('reports/:id')
  async getComplianceReport(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.complianceReportService.getReport(id, workspaceId);
  }

  // Consent Management
  @Post('consent-records')
  async createConsentRecord(
    @Request() req: any,
    @Body() dto: CreateConsentRecordDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.consentManagementService.createConsentRecord(workspaceId, dto, ipAddress, userAgent);
  }

  @Get('consent-records')
  async getConsentRecords(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('externalId') externalId?: string,
    @Query('email') email?: string,
    @Query('consentType') consentType?: string,
    @Query('granted') granted?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const filters = {
      userId,
      externalId,
      email,
      consentType,
      granted: granted ? granted === 'true' : undefined,
    };
    return this.consentManagementService.getConsentRecords(workspaceId, filters);
  }

  @Get('consent-records/:id')
  async getConsentRecord(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.consentManagementService.getConsentRecord(id, workspaceId);
  }

  @Post('consent-records/:id/withdraw')
  async withdrawConsent(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.consentManagementService.withdrawConsent(id, workspaceId);
  }

  @Get('consent-check')
  async checkConsent(
    @Request() req: any,
    @Query('consentType') consentType: string,
    @Query('userId') userId?: string,
    @Query('externalId') externalId?: string,
    @Query('email') email?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const hasConsent = await this.consentManagementService.checkConsent(
      workspaceId,
      consentType,
      { userId, externalId, email },
    );
    return { hasConsent };
  }
}
