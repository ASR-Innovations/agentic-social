import { Test, TestingModule } from '@nestjs/testing';
import { SSOService } from './sso.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SSOProvider } from '../dto/sso-config.dto';

describe('SSOService', () => {
  let service: SSOService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    sSOConfig: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long-12345';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SSOService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SSOService>(SSOService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConfig', () => {
    it('should create SSO configuration', async () => {
      const dto = {
        provider: SSOProvider.GOOGLE,
        tenantId: 'workspace-123',
        enabled: true,
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        redirectUri: 'http://localhost:3001/auth/sso/google/callback',
      };

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(null);
      mockPrismaService.sSOConfig.create.mockResolvedValue({
        id: 'config-123',
        workspaceId: dto.tenantId,
        provider: dto.provider,
        enabled: dto.enabled,
        clientId: dto.clientId,
        clientSecret: 'encrypted-secret',
        redirectUri: dto.redirectUri,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createConfig(dto);

      expect(result).toBeDefined();
      expect(result.provider).toBe(SSOProvider.GOOGLE);
      expect(result.hasClientSecret).toBe(true);
      expect(mockPrismaService.sSOConfig.create).toHaveBeenCalled();
    });

    it('should throw error if config already exists', async () => {
      const dto = {
        provider: SSOProvider.GOOGLE,
        tenantId: 'workspace-123',
        enabled: true,
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      };

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue({
        id: 'existing-config',
        workspaceId: dto.tenantId,
      });

      await expect(service.createConfig(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getConfig', () => {
    it('should return SSO configuration', async () => {
      const workspaceId = 'workspace-123';
      const mockConfig = {
        id: 'config-123',
        workspaceId,
        provider: SSOProvider.GOOGLE,
        enabled: true,
        clientId: 'google-client-id',
        clientSecret: 'encrypted-secret',
        cert: 'certificate-data',
      };

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await service.getConfig(workspaceId);

      expect(result).toBeDefined();
      expect(result.provider).toBe(SSOProvider.GOOGLE);
      expect(result.hasClientSecret).toBe(true);
      expect(result.hasCert).toBe(true);
      expect(result.clientSecret).toBeUndefined();
      expect(result.cert).toBeUndefined();
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(null);

      await expect(service.getConfig('workspace-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConfigByProvider', () => {
    it('should return config for specific provider', async () => {
      const workspaceId = 'workspace-123';
      const provider = SSOProvider.GOOGLE;
      const mockConfig = {
        id: 'config-123',
        workspaceId,
        provider,
        enabled: true,
        clientId: 'google-client-id',
      };

      mockPrismaService.sSOConfig.findFirst.mockResolvedValue(mockConfig);

      const result = await service.getConfigByProvider(workspaceId, provider);

      expect(result).toBeDefined();
      expect(result.provider).toBe(provider);
      expect(mockPrismaService.sSOConfig.findFirst).toHaveBeenCalledWith({
        where: {
          workspaceId,
          provider,
          enabled: true,
        },
      });
    });

    it('should throw NotFoundException if provider config not found', async () => {
      mockPrismaService.sSOConfig.findFirst.mockResolvedValue(null);

      await expect(
        service.getConfigByProvider('workspace-123', SSOProvider.GOOGLE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateConfig', () => {
    it('should update SSO configuration', async () => {
      const workspaceId = 'workspace-123';
      const dto = {
        enabled: false,
        clientId: 'new-client-id',
      };

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue({
        id: 'config-123',
        workspaceId,
      });

      mockPrismaService.sSOConfig.update.mockResolvedValue({
        id: 'config-123',
        workspaceId,
        provider: SSOProvider.GOOGLE,
        enabled: dto.enabled,
        clientId: dto.clientId,
      });

      const result = await service.updateConfig(workspaceId, dto);

      expect(result).toBeDefined();
      expect(result.enabled).toBe(false);
      expect(mockPrismaService.sSOConfig.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(null);

      await expect(service.updateConfig('workspace-123', { enabled: false })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteConfig', () => {
    it('should delete SSO configuration', async () => {
      const workspaceId = 'workspace-123';

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue({
        id: 'config-123',
        workspaceId,
      });

      mockPrismaService.sSOConfig.delete.mockResolvedValue({
        id: 'config-123',
      });

      const result = await service.deleteConfig(workspaceId);

      expect(result.message).toBe('SSO configuration deleted successfully');
      expect(mockPrismaService.sSOConfig.delete).toHaveBeenCalledWith({
        where: { workspaceId },
      });
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(null);

      await expect(service.deleteConfig('workspace-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('encryption', () => {
    it('should encrypt and decrypt secrets correctly', async () => {
      const originalSecret = 'my-secret-key';
      
      // Create config with secret
      const dto = {
        provider: SSOProvider.GOOGLE,
        tenantId: 'workspace-123',
        enabled: true,
        clientId: 'client-id',
        clientSecret: originalSecret,
      };

      mockPrismaService.sSOConfig.findUnique.mockResolvedValue(null);
      
      let encryptedSecret: string = '';
      mockPrismaService.sSOConfig.create.mockImplementation((data) => {
        encryptedSecret = data.data.clientSecret;
        return Promise.resolve({
          id: 'config-123',
          workspaceId: dto.tenantId,
          provider: dto.provider,
          clientSecret: encryptedSecret,
        });
      });

      await service.createConfig(dto);

      // Verify secret was encrypted
      expect(encryptedSecret).toBeDefined();
      expect(encryptedSecret).not.toBe(originalSecret);
      expect(encryptedSecret).toContain(':'); // IV:encrypted format

      // Mock for decryption
      mockPrismaService.sSOConfig.findUnique.mockResolvedValue({
        id: 'config-123',
        workspaceId: dto.tenantId,
        clientSecret: encryptedSecret,
      });

      // Decrypt and verify
      const decrypted = await service.getDecryptedClientSecret(dto.tenantId);
      expect(decrypted).toBe(originalSecret);
    });
  });
});
