import { Test, TestingModule } from '@nestjs/testing';
import { SocialAccountService } from './social-account.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Platform } from '@prisma/client';

describe('SocialAccountService', () => {
  let service: SocialAccountService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    socialAccount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockSocialAccount = {
    id: 'account-123',
    workspaceId: 'workspace-123',
    platform: Platform.INSTAGRAM,
    platformAccountId: 'instagram-123',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    accessToken: 'encrypted-token',
    refreshToken: 'encrypted-refresh',
    tokenExpiry: new Date(Date.now() + 3600000),
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SocialAccountService>(SocialAccountService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      workspaceId: 'workspace-123',
      platform: Platform.INSTAGRAM,
      platformAccountId: 'instagram-123',
      username: 'testuser',
      displayName: 'Test User',
      accessToken: 'token-123',
      refreshToken: 'refresh-123',
      tokenExpiry: new Date(Date.now() + 3600000),
    };

    it('should create a social account', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);
      mockPrismaService.socialAccount.create.mockResolvedValue(mockSocialAccount);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSocialAccount);
      expect(mockPrismaService.socialAccount.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if account already exists', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(mockSocialAccount);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all accounts for a workspace', async () => {
      const accounts = [mockSocialAccount, { ...mockSocialAccount, id: 'account-456' }];
      mockPrismaService.socialAccount.findMany.mockResolvedValue(accounts);

      const result = await service.findAll('workspace-123');

      expect(result).toEqual(accounts);
      expect(mockPrismaService.socialAccount.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 'workspace-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by platform', async () => {
      mockPrismaService.socialAccount.findMany.mockResolvedValue([mockSocialAccount]);

      await service.findAll('workspace-123', Platform.INSTAGRAM);

      expect(mockPrismaService.socialAccount.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          platform: Platform.INSTAGRAM,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by active status', async () => {
      mockPrismaService.socialAccount.findMany.mockResolvedValue([mockSocialAccount]);

      await service.findAll('workspace-123', undefined, true);

      expect(mockPrismaService.socialAccount.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a social account by id', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(mockSocialAccount);

      const result = await service.findOne('workspace-123', 'account-123');

      expect(result).toEqual(mockSocialAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(service.findOne('workspace-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      displayName: 'Updated Name',
      isActive: false,
    };

    it('should update a social account', async () => {
      const updatedAccount = { ...mockSocialAccount, ...updateDto };
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(mockSocialAccount);
      mockPrismaService.socialAccount.update.mockResolvedValue(updatedAccount);

      const result = await service.update('workspace-123', 'account-123', updateDto);

      expect(result).toEqual(updatedAccount);
      expect(mockPrismaService.socialAccount.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.update('workspace-123', 'non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a social account', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(mockSocialAccount);
      mockPrismaService.socialAccount.delete.mockResolvedValue(mockSocialAccount);

      await service.remove('workspace-123', 'account-123');

      expect(mockPrismaService.socialAccount.delete).toHaveBeenCalledWith({
        where: { id: 'account-123' },
      });
    });

    it('should throw NotFoundException if account not found', async () => {
      mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

      await expect(service.remove('workspace-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh an expired token', async () => {
      const expiredAccount = {
        ...mockSocialAccount,
        tokenExpiry: new Date(Date.now() - 3600000), // Expired 1 hour ago
      };

      const refreshedAccount = {
        ...expiredAccount,
        accessToken: 'new-token',
        tokenExpiry: new Date(Date.now() + 3600000),
      };

      mockPrismaService.socialAccount.findFirst.mockResolvedValue(expiredAccount);
      mockPrismaService.socialAccount.update.mockResolvedValue(refreshedAccount);

      const result = await service.refreshToken('workspace-123', 'account-123');

      expect(result).toEqual(refreshedAccount);
      expect(mockPrismaService.socialAccount.update).toHaveBeenCalled();
    });
  });

  describe('checkTokenExpiry', () => {
    it('should return true if token is expiring soon', () => {
      const soonToExpire = new Date(Date.now() + 1800000); // 30 minutes from now
      const result = service.checkTokenExpiry(soonToExpire);
      expect(result).toBe(true);
    });

    it('should return false if token is not expiring soon', () => {
      const notExpiring = new Date(Date.now() + 7200000); // 2 hours from now
      const result = service.checkTokenExpiry(notExpiring);
      expect(result).toBe(false);
    });

    it('should return true if token is already expired', () => {
      const expired = new Date(Date.now() - 3600000); // 1 hour ago
      const result = service.checkTokenExpiry(expired);
      expect(result).toBe(true);
    });
  });

  describe('getAccountsByPlatform', () => {
    it('should return accounts grouped by platform', async () => {
      const accounts = [
        { ...mockSocialAccount, platform: Platform.INSTAGRAM },
        { ...mockSocialAccount, id: 'account-456', platform: Platform.FACEBOOK },
        { ...mockSocialAccount, id: 'account-789', platform: Platform.INSTAGRAM },
      ];

      mockPrismaService.socialAccount.findMany.mockResolvedValue(accounts);

      const result = await service.getAccountsByPlatform('workspace-123');

      expect(result).toHaveProperty(Platform.INSTAGRAM);
      expect(result).toHaveProperty(Platform.FACEBOOK);
      expect(result[Platform.INSTAGRAM]).toHaveLength(2);
      expect(result[Platform.FACEBOOK]).toHaveLength(1);
    });
  });

  describe('getAccountCount', () => {
    it('should return total account count for workspace', async () => {
      mockPrismaService.socialAccount.count.mockResolvedValue(5);

      const result = await service.getAccountCount('workspace-123');

      expect(result).toBe(5);
      expect(mockPrismaService.socialAccount.count).toHaveBeenCalledWith({
        where: { workspaceId: 'workspace-123' },
      });
    });

    it('should return count for specific platform', async () => {
      mockPrismaService.socialAccount.count.mockResolvedValue(2);

      const result = await service.getAccountCount('workspace-123', Platform.INSTAGRAM);

      expect(result).toBe(2);
      expect(mockPrismaService.socialAccount.count).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          platform: Platform.INSTAGRAM,
        },
      });
    });
  });
});
