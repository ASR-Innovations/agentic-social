import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DesignToolService } from './services/design-tools/design-tool.service';
import { CanvaService } from './services/design-tools/canva.service';
import { AdobeService } from './services/design-tools/adobe.service';
import { UnsplashService } from './services/design-tools/unsplash.service';
import { PexelsService } from './services/design-tools/pexels.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../media/s3.service';
import { DesignToolProvider } from './dto/design-tool.dto';

describe('Design Tool Integration (Integration)', () => {
  let app: INestApplication;
  let designToolService: DesignToolService;
  let prismaService: PrismaService;

  const mockWorkspaceId = 'test-workspace-id';
  const mockUserId = 'test-user-id';

  beforeAll(async () => {
    // Set encryption key for tests (must be exactly 32 characters)
    process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        DesignToolService,
        CanvaService,
        AdobeService,
        UnsplashService,
        PexelsService,
        {
          provide: PrismaService,
          useValue: {
            integration: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            integrationLog: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadBuffer: jest.fn().mockResolvedValue({
              key: 'test-key',
              url: 'https://s3.amazonaws.com/test-key',
              cdnUrl: 'https://cdn.example.com/test-key',
              bucket: 'test-bucket',
              size: 1024,
              contentType: 'image/jpeg',
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    designToolService = moduleFixture.get<DesignToolService>(DesignToolService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('connectDesignTool', () => {
    it('should create a new design tool integration', async () => {
      const mockIntegration = {
        id: 'integration-id',
        workspaceId: mockWorkspaceId,
        name: 'Unsplash',
        type: 'DESIGN_TOOL',
        provider: DesignToolProvider.UNSPLASH,
        status: 'ACTIVE',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.integration, 'create').mockResolvedValue(mockIntegration as any);

      // Mock validation to return true
      jest.spyOn(UnsplashService.prototype, 'validateCredentials').mockResolvedValue(true);

      const result = await designToolService.connectDesignTool(mockWorkspaceId, mockUserId, {
        provider: DesignToolProvider.UNSPLASH,
        apiKey: 'test-api-key',
      });

      expect(result).toBeDefined();
      expect(result.provider).toBe(DesignToolProvider.UNSPLASH);
      expect(prismaService.integration.create).toHaveBeenCalled();
    });

    it('should update existing integration if already connected', async () => {
      const existingIntegration = {
        id: 'existing-id',
        workspaceId: mockWorkspaceId,
        provider: DesignToolProvider.UNSPLASH,
        type: 'DESIGN_TOOL',
      };

      const updatedIntegration = {
        ...existingIntegration,
        status: 'ACTIVE',
      };

      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue(existingIntegration as any);
      jest.spyOn(prismaService.integration, 'update').mockResolvedValue(updatedIntegration as any);
      jest.spyOn(UnsplashService.prototype, 'validateCredentials').mockResolvedValue(true);

      const result = await designToolService.connectDesignTool(mockWorkspaceId, mockUserId, {
        provider: DesignToolProvider.UNSPLASH,
        apiKey: 'test-api-key',
      });

      expect(result).toBeDefined();
      expect(prismaService.integration.update).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      jest.spyOn(UnsplashService.prototype, 'validateCredentials').mockResolvedValue(false);

      await expect(
        designToolService.connectDesignTool(mockWorkspaceId, mockUserId, {
          provider: DesignToolProvider.UNSPLASH,
          apiKey: 'invalid-key',
        }),
      ).rejects.toThrow('Invalid credentials for design tool');
    });
  });

  describe('getConnectedTools', () => {
    it('should return list of connected design tools', async () => {
      const mockIntegrations = [
        {
          id: 'integration-1',
          name: 'Unsplash',
          provider: DesignToolProvider.UNSPLASH,
          status: 'ACTIVE',
          createdAt: new Date(),
        },
        {
          id: 'integration-2',
          name: 'Canva',
          provider: DesignToolProvider.CANVA,
          status: 'ACTIVE',
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.integration, 'findMany').mockResolvedValue(mockIntegrations as any);

      const result = await designToolService.getConnectedTools(mockWorkspaceId);

      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe(DesignToolProvider.UNSPLASH);
      expect(result[1].provider).toBe(DesignToolProvider.CANVA);
    });
  });

  describe('disconnectDesignTool', () => {
    it('should disconnect a design tool integration', async () => {
      const mockIntegration = {
        id: 'integration-id',
        workspaceId: mockWorkspaceId,
        type: 'DESIGN_TOOL',
      };

      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue(mockIntegration as any);
      jest.spyOn(prismaService.integration, 'delete').mockResolvedValue(mockIntegration as any);

      const result = await designToolService.disconnectDesignTool(mockWorkspaceId, 'integration-id');

      expect(result.message).toBe('Design tool disconnected successfully');
      expect(prismaService.integration.delete).toHaveBeenCalledWith({
        where: { id: 'integration-id' },
      });
    });

    it('should throw error if integration not found', async () => {
      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue(null);

      await expect(
        designToolService.disconnectDesignTool(mockWorkspaceId, 'non-existent-id'),
      ).rejects.toThrow('Design tool integration not found');
    });
  });

  describe('Stock Photo Operations', () => {
    it('should search stock photos from Unsplash', async () => {
      const mockCredentials = {
        encrypted: 'encrypted-data',
        iv: 'iv',
        authTag: 'authTag',
      };

      const mockIntegration = {
        id: 'integration-id',
        workspaceId: mockWorkspaceId,
        provider: DesignToolProvider.UNSPLASH,
        type: 'DESIGN_TOOL',
        status: 'ACTIVE',
        credentials: mockCredentials,
      };

      const mockSearchResults = {
        photos: [
          {
            id: 'photo-1',
            description: 'Test photo',
            urls: {
              raw: 'https://unsplash.com/raw',
              full: 'https://unsplash.com/full',
              regular: 'https://unsplash.com/regular',
              small: 'https://unsplash.com/small',
              thumb: 'https://unsplash.com/thumb',
            },
            width: 4000,
            height: 3000,
          },
        ],
        total: 1,
      };

      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue(mockIntegration as any);
      jest.spyOn(UnsplashService.prototype, 'searchPhotos').mockResolvedValue(mockSearchResults as any);

      // Mock decryption
      jest.spyOn(designToolService as any, 'decryptCredentials').mockReturnValue({
        apiKey: 'test-api-key',
      });

      const result = await designToolService.searchStockPhotos(
        mockWorkspaceId,
        DesignToolProvider.UNSPLASH,
        {
          query: 'nature',
          page: 1,
          perPage: 20,
        },
      );

      expect(result.photos).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('Asset Import', () => {
    it('should import asset from design tool', async () => {
      const mockAssetUrl = 'https://design-tool.com/asset.png';
      
      // Mock axios for downloading
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: Buffer.from('test-image-data'),
        headers: {
          'content-type': 'image/png',
        },
      });

      jest.spyOn(prismaService.integration, 'findFirst').mockResolvedValue({
        id: 'integration-id',
      } as any);
      jest.spyOn(prismaService.integrationLog, 'create').mockResolvedValue({} as any);

      const result = await designToolService.importAsset(mockWorkspaceId, {
        assetUrl: mockAssetUrl,
        provider: DesignToolProvider.CANVA,
        folder: 'imported',
      });

      expect(result.url).toBeDefined();
      expect(result.cdnUrl).toBeDefined();
      expect(result.s3Key).toBeDefined();
      expect(result.provider).toBe(DesignToolProvider.CANVA);
    });
  });
});
