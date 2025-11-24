import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceModule } from './compliance.module';
import { DataRetentionService } from './services/data-retention.service';
import { DataExportService } from './services/data-export.service';
import { DataDeletionService } from './services/data-deletion.service';
import { ComplianceReportService } from './services/compliance-report.service';
import { ConsentManagementService } from './services/consent-management.service';
import { PrismaService } from '../prisma/prisma.service';
import { DataType, RetentionAction, ExportRequestType, ExportFormat, DeletionRequestType, ComplianceReportType, ConsentType, LegalBasis } from '@prisma/client';

describe('Compliance Module Integration', () => {
  let module: TestingModule;
  let dataRetentionService: DataRetentionService;
  let dataExportService: DataExportService;
  let dataDeletionService: DataDeletionService;
  let complianceReportService: ComplianceReportService;
  let consentManagementService: ConsentManagementService;
  let prismaService: PrismaService;

  const mockWorkspaceId = 'test-workspace-id';
  const mockUserId = 'test-user-id';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ComplianceModule],
    }).compile();

    dataRetentionService = module.get<DataRetentionService>(DataRetentionService);
    dataExportService = module.get<DataExportService>(DataExportService);
    dataDeletionService = module.get<DataDeletionService>(DataDeletionService);
    complianceReportService = module.get<ComplianceReportService>(ComplianceReportService);
    consentManagementService = module.get<ConsentManagementService>(ConsentManagementService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Data Retention Service', () => {
    it('should be defined', () => {
      expect(dataRetentionService).toBeDefined();
    });

    it('should create a retention policy', async () => {
      const dto = {
        name: 'Test Policy',
        description: 'Test retention policy',
        dataType: DataType.POSTS,
        retentionDays: 365,
        action: RetentionAction.DELETE,
        isActive: true,
      };

      // Mock the prisma call
      jest.spyOn(prismaService.dataRetentionPolicy, 'create').mockResolvedValue({
        id: 'policy-id',
        workspaceId: mockWorkspaceId,
        createdBy: mockUserId,
        ...dto,
        conditions: null,
        lastExecutedAt: null,
        nextExecutionAt: new Date(),
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await dataRetentionService.createPolicy(mockWorkspaceId, mockUserId, dto);
      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('Data Export Service', () => {
    it('should be defined', () => {
      expect(dataExportService).toBeDefined();
    });

    it('should create an export request', async () => {
      const dto = {
        requestType: ExportRequestType.GDPR_SUBJECT_ACCESS,
        format: ExportFormat.JSON,
        dataTypes: [DataType.POSTS, DataType.USER_DATA],
      };

      // Mock the prisma call
      jest.spyOn(prismaService.dataExportRequest, 'create').mockResolvedValue({
        id: 'export-id',
        workspaceId: mockWorkspaceId,
        requestedBy: mockUserId,
        requestType: dto.requestType,
        format: dto.format,
        dataTypes: dto.dataTypes,
        dateFrom: null,
        dateTo: null,
        filters: null,
        status: 'PENDING',
        fileUrl: null,
        fileSize: null,
        expiresAt: null,
        error: null,
        startedAt: null,
        completedAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await dataExportService.createExportRequest(mockWorkspaceId, mockUserId, dto);
      expect(result).toBeDefined();
      expect(result.requestType).toBe(dto.requestType);
    });
  });

  describe('Data Deletion Service', () => {
    it('should be defined', () => {
      expect(dataDeletionService).toBeDefined();
    });

    it('should create a deletion request', async () => {
      const dto = {
        requestType: DeletionRequestType.GDPR_RIGHT_TO_ERASURE,
        dataTypes: [DataType.USER_DATA],
        userId: mockUserId,
        requiresApproval: true,
      };

      // Mock the prisma call
      jest.spyOn(prismaService.dataDeletionRequest, 'create').mockResolvedValue({
        id: 'deletion-id',
        workspaceId: mockWorkspaceId,
        requestedBy: mockUserId,
        requestType: dto.requestType,
        dataTypes: dto.dataTypes,
        userId: dto.userId,
        dateFrom: null,
        dateTo: null,
        filters: null,
        status: 'PENDING_APPROVAL',
        requiresApproval: true,
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
        scheduledFor: null,
        executedAt: null,
        itemsDeleted: null,
        itemsFailed: null,
        error: null,
        auditLog: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await dataDeletionService.createDeletionRequest(mockWorkspaceId, mockUserId, dto);
      expect(result).toBeDefined();
      expect(result.requestType).toBe(dto.requestType);
    });
  });

  describe('Compliance Report Service', () => {
    it('should be defined', () => {
      expect(complianceReportService).toBeDefined();
    });

    it('should create a compliance report', async () => {
      const dto = {
        reportType: ComplianceReportType.GDPR_COMPLIANCE,
        title: 'Test Report',
        periodFrom: new Date().toISOString(),
        periodTo: new Date().toISOString(),
      };

      // Mock the prisma call
      jest.spyOn(prismaService.complianceReport, 'create').mockResolvedValue({
        id: 'report-id',
        workspaceId: mockWorkspaceId,
        generatedBy: mockUserId,
        reportType: dto.reportType,
        title: dto.title,
        description: null,
        periodFrom: new Date(dto.periodFrom),
        periodTo: new Date(dto.periodTo),
        status: 'GENERATING',
        data: null,
        summary: null,
        fileUrl: null,
        fileFormat: ExportFormat.PDF,
        fileSize: null,
        complianceScore: null,
        findings: null,
        recommendations: null,
        error: null,
        startedAt: new Date(),
        completedAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await complianceReportService.createReport(mockWorkspaceId, mockUserId, dto);
      expect(result).toBeDefined();
      expect(result.reportType).toBe(dto.reportType);
    });
  });

  describe('Consent Management Service', () => {
    it('should be defined', () => {
      expect(consentManagementService).toBeDefined();
    });

    it('should create a consent record', async () => {
      const dto = {
        userId: mockUserId,
        consentType: ConsentType.MARKETING_COMMUNICATIONS,
        purpose: 'Send promotional emails',
        granted: true,
        legalBasis: LegalBasis.CONSENT,
      };

      // Mock the prisma call
      jest.spyOn(prismaService.consentRecord, 'create').mockResolvedValue({
        id: 'consent-id',
        workspaceId: mockWorkspaceId,
        userId: dto.userId,
        externalId: null,
        email: null,
        consentType: dto.consentType,
        purpose: dto.purpose,
        granted: dto.granted,
        grantedAt: new Date(),
        withdrawn: false,
        withdrawnAt: null,
        source: null,
        ipAddress: null,
        userAgent: null,
        legalBasis: dto.legalBasis,
        expiresAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await consentManagementService.createConsentRecord(mockWorkspaceId, dto);
      expect(result).toBeDefined();
      expect(result.consentType).toBe(dto.consentType);
    });

    it('should check consent', async () => {
      // Mock the prisma call
      jest.spyOn(prismaService.consentRecord, 'findFirst').mockResolvedValue({
        id: 'consent-id',
        workspaceId: mockWorkspaceId,
        userId: mockUserId,
        externalId: null,
        email: null,
        consentType: ConsentType.MARKETING_COMMUNICATIONS,
        purpose: 'Send promotional emails',
        granted: true,
        grantedAt: new Date(),
        withdrawn: false,
        withdrawnAt: null,
        source: null,
        ipAddress: null,
        userAgent: null,
        legalBasis: LegalBasis.CONSENT,
        expiresAt: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const hasConsent = await consentManagementService.checkConsent(
        mockWorkspaceId,
        ConsentType.MARKETING_COMMUNICATIONS,
        { userId: mockUserId },
      );

      expect(hasConsent).toBe(true);
    });
  });
});
