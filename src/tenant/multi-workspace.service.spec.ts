import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MultiWorkspaceService } from './multi-workspace.service';
import { Tenant } from './entities/tenant.entity';
import { WorkspaceTemplate } from './entities/workspace-template.entity';
import { ClientPortalAccess } from './entities/client-portal-access.entity';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ClientPortalAccessLevel } from './dto/client-portal.dto';

describe('MultiWorkspaceService', () => {
  let service: MultiWorkspaceService;
  let tenantRepository: Repository<Tenant>;
  let templateRepository: Repository<WorkspaceTemplate>;
  let clientPortalRepository: Repository<ClientPortalAccess>;

  const mockTenantRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockTemplateRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockClientPortalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiWorkspaceService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceTemplate),
          useValue: mockTemplateRepository,
        },
        {
          provide: getRepositoryToken(ClientPortalAccess),
          useValue: mockClientPortalRepository,
        },
      ],
    }).compile();

    service = module.get<MultiWorkspaceService>(MultiWorkspaceService);
    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant),
    );
    templateRepository = module.get<Repository<WorkspaceTemplate>>(
      getRepositoryToken(WorkspaceTemplate),
    );
    clientPortalRepository = module.get<Repository<ClientPortalAccess>>(
      getRepositoryToken(ClientPortalAccess),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserWorkspaces', () => {
    it('should return all workspaces for a user', async () => {
      const mockWorkspaces = [
        { id: '1', name: 'Workspace 1' },
        { id: '2', name: 'Workspace 2' },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockWorkspaces),
      };

      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserWorkspaces('user-id');

      expect(result).toEqual(mockWorkspaces);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', {
        userId: 'user-id',
      });
    });
  });

  describe('switchWorkspace', () => {
    it('should successfully switch workspace', async () => {
      const mockWorkspace = { id: 'workspace-id', name: 'Test Workspace' };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockWorkspace),
      };

      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.switchWorkspace('user-id', 'workspace-id');

      expect(result.workspace).toEqual(mockWorkspace);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.switchWorkspace('user-id', 'workspace-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createTemplate', () => {
    it('should create a new workspace template', async () => {
      const createDto = {
        name: 'Test Template',
        description: 'Test Description',
        config: { settings: {} },
        isPublic: true,
      };

      const mockTemplate = { id: 'template-id', ...createDto };

      mockTemplateRepository.create.mockReturnValue(mockTemplate);
      mockTemplateRepository.save.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate(createDto, 'user-id');

      expect(result).toEqual(mockTemplate);
      expect(mockTemplateRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdBy: 'user-id',
      });
    });
  });

  describe('getTemplate', () => {
    it('should return a template by id', async () => {
      const mockTemplate = { id: 'template-id', name: 'Test Template' };

      mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.getTemplate('template-id');

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if template not found', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.getTemplate('template-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('applyTemplate', () => {
    it('should apply template to workspace', async () => {
      const mockTemplate = {
        id: 'template-id',
        config: {
          settings: { timezone: 'UTC' },
          branding: { color: 'blue' },
        },
      };

      const mockWorkspace = {
        id: 'workspace-id',
        settings: {},
        branding: {},
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockWorkspace),
      };

      mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
      mockTenantRepository.findOne.mockResolvedValue(mockWorkspace);
      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockTenantRepository.save.mockResolvedValue(mockWorkspace);

      const result = await service.applyTemplate(
        { templateId: 'template-id', workspaceId: 'workspace-id' },
        'user-id',
      );

      expect(result).toBeDefined();
      expect(mockTenantRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const mockTemplate = { id: 'template-id', config: {} };
      const mockWorkspace = { id: 'workspace-id' };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockTemplateRepository.findOne.mockResolvedValue(mockTemplate);
      mockTenantRepository.findOne.mockResolvedValue(mockWorkspace);
      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.applyTemplate(
          { templateId: 'template-id', workspaceId: 'workspace-id' },
          'user-id',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createClientPortalAccess', () => {
    it('should create client portal access', async () => {
      const createDto = {
        email: 'client@example.com',
        name: 'Test Client',
        workspaceId: 'workspace-id',
        accessLevel: ClientPortalAccessLevel.VIEW_ONLY,
        permissions: ['view_analytics'],
      };

      const mockWorkspace = { id: 'workspace-id' };
      const mockAccess = { id: 'access-id', ...createDto };

      mockTenantRepository.findOne.mockResolvedValue(mockWorkspace);
      mockClientPortalRepository.findOne.mockResolvedValue(null);
      mockClientPortalRepository.create.mockReturnValue(mockAccess);
      mockClientPortalRepository.save.mockResolvedValue(mockAccess);

      const result = await service.createClientPortalAccess(createDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createDto.email);
      expect(mockClientPortalRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if client already has access', async () => {
      const createDto = {
        email: 'client@example.com',
        name: 'Test Client',
        workspaceId: 'workspace-id',
        accessLevel: ClientPortalAccessLevel.VIEW_ONLY,
      };

      const mockWorkspace = { id: 'workspace-id' };
      const existingAccess = { id: 'existing-id' };

      mockTenantRepository.findOne.mockResolvedValue(mockWorkspace);
      mockClientPortalRepository.findOne.mockResolvedValue(existingAccess);

      await expect(
        service.createClientPortalAccess(createDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyClientPortalToken', () => {
    it('should verify valid token', async () => {
      const mockAccess = {
        id: 'access-id',
        inviteToken: 'valid-token',
        inviteExpiresAt: new Date(Date.now() + 86400000), // 1 day from now
        isActive: true,
      };

      mockClientPortalRepository.findOne.mockResolvedValue(mockAccess);
      mockClientPortalRepository.save.mockResolvedValue(mockAccess);

      const result = await service.verifyClientPortalToken('valid-token');

      expect(result).toBeDefined();
      expect(mockClientPortalRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockClientPortalRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyClientPortalToken('invalid-token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const mockAccess = {
        id: 'access-id',
        inviteToken: 'expired-token',
        inviteExpiresAt: new Date(Date.now() - 86400000), // 1 day ago
        isActive: true,
      };

      mockClientPortalRepository.findOne.mockResolvedValue(mockAccess);

      await expect(
        service.verifyClientPortalToken('expired-token'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAgencyDashboard', () => {
    it('should return agency dashboard data', async () => {
      const mockWorkspaces = [
        { id: '1', name: 'Workspace 1', plan: 'PROFESSIONAL' },
        { id: '2', name: 'Workspace 2', plan: 'ENTERPRISE' },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockWorkspaces),
      };

      mockTenantRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockClientPortalRepository.find.mockResolvedValue([]);

      const result = await service.getAgencyDashboard('user-id');

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('workspaces');
      expect(result.overview.totalWorkspaces).toBe(2);
    });
  });
});
