import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccountService } from './social-account.service';
import { SocialAccount, SocialPlatform } from './entities/social-account.entity';
import { EncryptionService } from './services/encryption.service';
import { OAuthService } from './services/oauth.service';
import { PlatformClientFactory } from './services/platform-client.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SocialAccountService', () => {
  let service: SocialAccountService;
  let repository: Repository<SocialAccount>;
  let encryptionService: EncryptionService;
  let oauthService: OAuthService;
  let platformClientFactory: PlatformClientFactory;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockEncryptionService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    encryptTokens: jest.fn(),
    decryptTokens: jest.fn(),
  };

  const mockOAuthService = {
    getAuthUrl: jest.fn(),
    exchangeCodeForToken: jest.fn(),
    refreshToken: jest.fn(),
    isPlatformConfigured: jest.fn(),
    getConfiguredPlatforms: jest.fn(),
  };

  const mockPlatformClient = {
    getAccountInfo: jest.fn(),
    post: jest.fn(),
    getPost: jest.fn(),
    deletePost: jest.fn(),
  };

  const mockPlatformClientFactory = {
    getClient: jest.fn().mockReturnValue(mockPlatformClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAccountService,
        {
          provide: getRepositoryToken(SocialAccount),
          useValue: mockRepository,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
        {
          provide: PlatformClientFactory,
          useValue: mockPlatformClientFactory,
        },
      ],
    }).compile();

    service = module.get<SocialAccountService>(SocialAccountService);
    repository = module.get<Repository<SocialAccount>>(getRepositoryToken(SocialAccount));
    encryptionService = module.get<EncryptionService>(EncryptionService);
    oauthService = module.get<OAuthService>(OAuthService);
    platformClientFactory = module.get<PlatformClientFactory>(PlatformClientFactory);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('should return OAuth URL for configured platform', async () => {
      const tenantId = 'tenant-123';
      const platform = SocialPlatform.TWITTER;
      const expectedUrl = 'https://twitter.com/oauth/authorize?...';

      mockOAuthService.isPlatformConfigured.mockReturnValue(true);
      mockOAuthService.getAuthUrl.mockReturnValue(expectedUrl);

      const result = await service.getAuthUrl(tenantId, platform);

      expect(result.url).toBe(expectedUrl);
      expect(result.state).toBeDefined();
      expect(mockOAuthService.isPlatformConfigured).toHaveBeenCalledWith(platform);
    });

    it('should throw error for unconfigured platform', async () => {
      const tenantId = 'tenant-123';
      const platform = SocialPlatform.TWITTER;

      mockOAuthService.isPlatformConfigured.mockReturnValue(false);

      await expect(service.getAuthUrl(tenantId, platform)).rejects.toThrow(BadRequestException);
    });
  });

  describe('connectAccount', () => {
    it('should connect a new social account', async () => {
      const tenantId = 'tenant-123';
      const platform = SocialPlatform.TWITTER;
      const code = 'oauth-code-123';

      const tokenResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'read write',
      };

      const accountInfo = {
        accountId: 'twitter-123',
        displayName: 'Test User',
        metadata: { followers: 1000 },
      };

      const encryptedTokens = 'encrypted-tokens';
      const encryptedRefreshToken = 'encrypted-refresh';

      mockOAuthService.exchangeCodeForToken.mockResolvedValue(tokenResponse);
      mockPlatformClient.getAccountInfo.mockResolvedValue(accountInfo);
      mockEncryptionService.encryptTokens.mockResolvedValue(encryptedTokens);
      mockEncryptionService.encrypt.mockResolvedValue(encryptedRefreshToken);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({
        id: 'account-123',
        tenantId,
        platform,
        accountIdentifier: accountInfo.accountId,
        displayName: accountInfo.displayName,
      });

      const result = await service.connectAccount(tenantId, platform, code);

      expect(result).toBeDefined();
      expect(mockOAuthService.exchangeCodeForToken).toHaveBeenCalledWith(platform, code, undefined);
      expect(mockPlatformClient.getAccountInfo).toHaveBeenCalledWith(tokenResponse.accessToken);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update existing social account', async () => {
      const tenantId = 'tenant-123';
      const platform = SocialPlatform.TWITTER;
      const code = 'oauth-code-123';

      const tokenResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'read write',
      };

      const accountInfo = {
        accountId: 'twitter-123',
        displayName: 'Test User',
        metadata: { followers: 1000 },
      };

      const existingAccount = {
        id: 'account-123',
        tenantId,
        platform,
        accountIdentifier: accountInfo.accountId,
      };

      mockOAuthService.exchangeCodeForToken.mockResolvedValue(tokenResponse);
      mockPlatformClient.getAccountInfo.mockResolvedValue(accountInfo);
      mockEncryptionService.encryptTokens.mockResolvedValue('encrypted-tokens');
      mockEncryptionService.encrypt.mockResolvedValue('encrypted-refresh');
      mockRepository.findOne.mockResolvedValue(existingAccount);
      mockRepository.save.mockResolvedValue({ ...existingAccount, displayName: accountInfo.displayName });

      const result = await service.connectAccount(tenantId, platform, code);

      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('disconnectAccount', () => {
    it('should disconnect a social account', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      const account = {
        id: accountId,
        tenantId,
        platform: SocialPlatform.TWITTER,
      };

      mockRepository.findOne.mockResolvedValue(account);
      mockRepository.remove.mockResolvedValue(account);

      await service.disconnectAccount(tenantId, accountId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: accountId, tenantId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(account);
    });

    it('should throw error if account not found', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.disconnectAccount(tenantId, accountId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all accounts for tenant', async () => {
      const tenantId = 'tenant-123';
      const accounts = [
        { id: 'account-1', tenantId, platform: SocialPlatform.TWITTER },
        { id: 'account-2', tenantId, platform: SocialPlatform.INSTAGRAM },
      ];

      mockRepository.find.mockResolvedValue(accounts);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(accounts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by platform', async () => {
      const tenantId = 'tenant-123';
      const platform = SocialPlatform.TWITTER;
      const accounts = [
        { id: 'account-1', tenantId, platform },
      ];

      mockRepository.find.mockResolvedValue(accounts);

      const result = await service.findAll(tenantId, platform);

      expect(result).toEqual(accounts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId, platform },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('refreshAccountToken', () => {
    it('should refresh expired token', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      const account = {
        id: accountId,
        tenantId,
        platform: SocialPlatform.TWITTER,
        refreshTokenEncrypted: 'encrypted-refresh',
      };

      const refreshToken = 'refresh-token';
      const newTokenResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      mockRepository.findOne.mockResolvedValue(account);
      mockEncryptionService.decrypt.mockResolvedValue(refreshToken);
      mockOAuthService.refreshToken.mockResolvedValue(newTokenResponse);
      mockEncryptionService.encryptTokens.mockResolvedValue('new-encrypted-tokens');
      mockEncryptionService.encrypt.mockResolvedValue('new-encrypted-refresh');
      mockRepository.save.mockResolvedValue({ ...account, oauthTokensEncrypted: 'new-encrypted-tokens' });

      const result = await service.refreshAccountToken(tenantId, accountId);

      expect(result).toBeDefined();
      expect(mockOAuthService.refreshToken).toHaveBeenCalledWith(account.platform, refreshToken);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error if no refresh token', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      const account = {
        id: accountId,
        tenantId,
        platform: SocialPlatform.TWITTER,
        refreshTokenEncrypted: null,
      };

      mockRepository.findOne.mockResolvedValue(account);

      await expect(service.refreshAccountToken(tenantId, accountId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAccessToken', () => {
    it('should return valid access token', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      const account = {
        id: accountId,
        tenantId,
        platform: SocialPlatform.TWITTER,
        oauthTokensEncrypted: 'encrypted-tokens',
        tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      const tokens = {
        accessToken: 'access-token',
        tokenType: 'Bearer',
      };

      mockRepository.findOne.mockResolvedValue(account);
      mockEncryptionService.decryptTokens.mockResolvedValue(tokens);

      const result = await service.getAccessToken(tenantId, accountId);

      expect(result).toBe(tokens.accessToken);
    });

    it('should refresh token if expired', async () => {
      const tenantId = 'tenant-123';
      const accountId = 'account-123';

      const account = {
        id: accountId,
        tenantId,
        platform: SocialPlatform.TWITTER,
        oauthTokensEncrypted: 'encrypted-tokens',
        tokenExpiresAt: new Date(Date.now() - 1000), // Expired
        refreshTokenEncrypted: 'encrypted-refresh',
      };

      const refreshedAccount = {
        ...account,
        oauthTokensEncrypted: 'new-encrypted-tokens',
        tokenExpiresAt: new Date(Date.now() + 3600000),
      };

      const tokens = {
        accessToken: 'new-access-token',
        tokenType: 'Bearer',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(account)
        .mockResolvedValueOnce(refreshedAccount);
      mockEncryptionService.decrypt.mockResolvedValue('refresh-token');
      mockOAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
      mockEncryptionService.encryptTokens.mockResolvedValue('new-encrypted-tokens');
      mockEncryptionService.encrypt.mockResolvedValue('new-encrypted-refresh');
      mockRepository.save.mockResolvedValue(refreshedAccount);
      mockEncryptionService.decryptTokens.mockResolvedValue(tokens);

      const result = await service.getAccessToken(tenantId, accountId);

      expect(result).toBe(tokens.accessToken);
    });
  });

  describe('getConfiguredPlatforms', () => {
    it('should return list of configured platforms', () => {
      const platforms = [SocialPlatform.TWITTER, SocialPlatform.INSTAGRAM];

      mockOAuthService.getConfiguredPlatforms.mockReturnValue(platforms);

      const result = service.getConfiguredPlatforms();

      expect(result).toEqual(platforms);
    });
  });
});
