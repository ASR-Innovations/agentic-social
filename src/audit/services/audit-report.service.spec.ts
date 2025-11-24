import { Test, TestingModule } from '@nestjs/testing';
import { AuditReportService } from './audit-report.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditSeverity, AuditStatus } from '../dto/audit.dto';

describe('AuditReportService', () => {
  let service: AuditReportService;
  let prisma: PrismaService;

  const mockPrismaService = {
    securityAuditLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditReportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditReportService>(AuditReportService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    it('should generate a comprehensive audit report', async () => {
      const workspaceId = 'workspace-1';
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: 'json' as const,
      };

      const mockLogs = [
        {
          id: 'audit-1',
          workspaceId,
          userId: 'user-1',
          action: AuditAction.LOGIN,
          resourceType: 'user',
          resourceId: 'user-1',
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date('2024-06-01'),
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockPrismaService.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
        slug: 'test-workspace',
      });

      mockPrismaService.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.generateReport(workspaceId, dto);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.workspaceName).toBe('Test Workspace');
      expect(result.summary).toBeDefined();
      expect(result.summary.totalLogs).toBe(1);
      expect(result.logs).toBeDefined();
    });

    it('should filter by actions', async () => {
      const workspaceId = 'workspace-1';
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        actions: [AuditAction.LOGIN, AuditAction.LOGOUT],
        format: 'json' as const,
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue({
        name: 'Test Workspace',
      });
      mockPrismaService.securityAuditLog.findMany.mockResolvedValue([]);

      await service.generateReport(workspaceId, dto);

      expect(mockPrismaService.securityAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: { in: dto.actions },
          }),
        }),
      );
    });

    it('should filter by minimum severity', async () => {
      const workspaceId = 'workspace-1';
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minSeverity: AuditSeverity.WARNING,
        format: 'json' as const,
      };

      mockPrismaService.workspace.findUnique.mockResolvedValue({
        name: 'Test Workspace',
      });
      mockPrismaService.securityAuditLog.findMany.mockResolvedValue([]);

      await service.generateReport(workspaceId, dto);

      expect(mockPrismaService.securityAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: {
              in: expect.arrayContaining([
                AuditSeverity.WARNING,
                AuditSeverity.ERROR,
                AuditSeverity.CRITICAL,
              ]),
            },
          }),
        }),
      );
    });

    it('should generate CSV format', async () => {
      const workspaceId = 'workspace-1';
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        format: 'csv' as const,
      };

      const mockLogs = [
        {
          id: 'audit-1',
          action: AuditAction.LOGIN,
          resourceType: 'user',
          resourceId: 'user-1',
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date('2024-06-01'),
          user: { email: 'test@example.com' },
        },
      ];

      mockPrismaService.workspace.findUnique.mockResolvedValue({
        name: 'Test Workspace',
      });
      mockPrismaService.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.generateReport(workspaceId, dto);

      expect(typeof result).toBe('string');
      expect(result).toContain('Timestamp');
      expect(result).toContain('Action');
      expect(result).toContain('login');
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate compliance audit report', async () => {
      const workspaceId = 'workspace-1';
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      mockPrismaService.securityAuditLog.findMany.mockResolvedValue([]);

      const result = await service.generateComplianceReport(
        workspaceId,
        startDate,
        endDate,
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.reportType).toBe('compliance_audit');
      expect(result.summary).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.compliance).toBeDefined();
      expect(result.compliance.soc2).toBeDefined();
      expect(result.compliance.gdpr).toBeDefined();
      expect(result.compliance.hipaa).toBeDefined();
    });

    it('should categorize security events correctly', async () => {
      const workspaceId = 'workspace-1';
      const mockSecurityEvents = [
        {
          id: 'audit-1',
          action: AuditAction.LOGIN,
          user: { id: 'user-1', name: 'Test', email: 'test@example.com' },
        },
      ];

      mockPrismaService.securityAuditLog.findMany
        .mockResolvedValueOnce(mockSecurityEvents)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.generateComplianceReport(
        workspaceId,
        '2024-01-01',
        '2024-12-31',
      );

      expect(result.sections.securityEvents.count).toBe(1);
    });
  });

  describe('exportForCompliance', () => {
    it('should export in SIEM format', async () => {
      const workspaceId = 'workspace-1';
      const mockLogs = [
        {
          id: 'audit-1',
          action: AuditAction.LOGIN,
          resourceType: 'user',
          resourceId: 'user-1',
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date('2024-06-01'),
          user: { email: 'test@example.com' },
        },
      ];

      mockPrismaService.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.exportForCompliance(
        workspaceId,
        '2024-01-01',
        '2024-12-31',
        'siem',
      );

      expect(typeof result).toBe('string');
      expect(result).toContain('CEF:');
    });

    it('should export in Splunk format', async () => {
      const workspaceId = 'workspace-1';
      const mockLogs = [
        {
          id: 'audit-1',
          action: AuditAction.LOGIN,
          resourceType: 'user',
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          ipAddress: '192.168.1.1',
          timestamp: new Date('2024-06-01'),
          user: { email: 'test@example.com' },
        },
      ];

      mockPrismaService.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.exportForCompliance(
        workspaceId,
        '2024-01-01',
        '2024-12-31',
        'splunk',
      );

      expect(typeof result).toBe('string');
      expect(result).toContain('"time":');
      expect(result).toContain('"sourcetype":"audit_log"');
    });

    it('should export in ELK format', async () => {
      const workspaceId = 'workspace-1';
      const mockLogs = [
        {
          id: 'audit-1',
          action: AuditAction.LOGIN,
          resourceType: 'user',
          status: AuditStatus.SUCCESS,
          severity: AuditSeverity.INFO,
          ipAddress: '192.168.1.1',
          timestamp: new Date('2024-06-01'),
          user: { email: 'test@example.com' },
          workspaceId,
        },
      ];

      mockPrismaService.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.exportForCompliance(
        workspaceId,
        '2024-01-01',
        '2024-12-31',
        'elk',
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('@timestamp');
      expect(result[0]).toHaveProperty('audit');
    });
  });
});
