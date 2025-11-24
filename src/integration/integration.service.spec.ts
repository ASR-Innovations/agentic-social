import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationService } from './services/integration.service';
import { WebhookService } from './services/webhook.service';
import { ApiKeyService } from './services/api-key.service';
import { OAuthService } from './services/oauth.service';
import { RateLimitService } from './services/rate-limit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Integration Framework', () => {
  let integrationService: IntegrationService;
  let webhookService: WebhookService;
  let apiKeyService: ApiKeyService;
  let oauthService: OAuthService;
  let rateLimitService: RateLimitService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    integration: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    webhook: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    webhookDelivery: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    apiKey: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    integrationOAuthState: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    integrationLog: {
      create: jest.fn(),
    },
    rateLimitTracking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        WebhookService,
        ApiKeyService,
        OAuthService,
        RateLimitService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    integrationService = module.get<IntegrationService>(IntegrationService);
    webhookService = module.get<WebhookService>(WebhookService);
    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
    oauthService = module.get<OAuthService>(OAuthService);
    rateLimitService = module.get<RateLimitService>(RateLimitService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('IntegrationService', () => {
    it('should be defined', () => {
      expect(integrationService).toBeDefined();
    });

    it('should create an integration', async () => {
      const mockIntegration = {
        id: 'integration-1',
        workspaceId: 'workspace-1',
        name: 'Salesforce CRM',
        type: 'CRM',
        provider: 'salesforce',
        status: 'PENDING_SETUP',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.integration.create.mockResolvedValue(mockIntegration);

      const result = await integrationService.create('workspace-1', 'user-1', {
        name: 'Salesforce CRM',
        type: 'CRM' as any,
        provider: 'salesforce',
      });

      expect(result).toEqual(mockIntegration);
      expect(mockPrismaService.integration.create).toHaveBeenCalled();
    });

    it('should list integrations including public ones', async () => {
      const mockIntegrations = [
        { id: '1', name: 'Integration 1', workspaceId: 'workspace-1' },
        { id: '2', name: 'Integration 2', isPublic: true },
      ];

      mockPrismaService.integration.findMany.mockResolvedValue(mockIntegrations);

      const result = await integrationService.findAll('workspace-1', true);

      expect(result).toEqual(mockIntegrations);
      expect(mockPrismaService.integration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should get marketplace integrations', async () => {
      const mockMarketplace = [
        { id: '1', name: 'Public Integration 1', isPublic: true, status: 'ACTIVE' },
        { id: '2', name: 'Public Integration 2', isPublic: true, status: 'ACTIVE' },
      ];

      mockPrismaService.integration.findMany.mockResolvedValue(mockMarketplace);

      const result = await integrationService.getMarketplace();

      expect(result).toEqual(mockMarketplace);
      expect(mockPrismaService.integration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPublic: true, status: 'ACTIVE' },
        }),
      );
    });
  });

  describe('WebhookService', () => {
    it('should be defined', () => {
      expect(webhookService).toBeDefined();
    });

    it('should create a webhook with secret', async () => {
      const mockWebhook = {
        id: 'webhook-1',
        workspaceId: 'workspace-1',
        name: 'Post Published Webhook',
        url: 'https://example.com/webhook',
        secret: 'generated-secret',
        events: ['POST_PUBLISHED'],
        status: 'ACTIVE',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.webhook.create.mockResolvedValue(mockWebhook);

      const result = await webhookService.create('workspace-1', 'user-1', {
        name: 'Post Published Webhook',
        url: 'https://example.com/webhook',
        events: ['POST_PUBLISHED'] as any,
      });

      expect(result).toHaveProperty('secret');
      expect(mockPrismaService.webhook.create).toHaveBeenCalled();
    });

    it('should list webhooks for workspace', async () => {
      const mockWebhooks = [
        { id: '1', name: 'Webhook 1', workspaceId: 'workspace-1' },
        { id: '2', name: 'Webhook 2', workspaceId: 'workspace-1' },
      ];

      mockPrismaService.webhook.findMany.mockResolvedValue(mockWebhooks);

      const result = await webhookService.findAll('workspace-1');

      expect(result).toEqual(mockWebhooks);
      expect(mockPrismaService.webhook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'workspace-1' },
        }),
      );
    });
  });

  describe('ApiKeyService', () => {
    it('should be defined', () => {
      expect(apiKeyService).toBeDefined();
    });

    it('should create an API key', async () => {
      const mockApiKey = {
        id: 'key-1',
        workspaceId: 'workspace-1',
        name: 'Production Key',
        key: 'sk_live_abc...',
        hashedKey: 'hashed',
        status: 'ACTIVE',
        scopes: ['posts:read', 'posts:write'],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.apiKey.create.mockResolvedValue(mockApiKey);

      const result = await apiKeyService.create('workspace-1', 'user-1', {
        name: 'Production Key',
        scopes: ['posts:read', 'posts:write'],
      });

      expect(result).toHaveProperty('key');
      expect(result.key).toMatch(/^sk_live_/);
      expect(mockPrismaService.apiKey.create).toHaveBeenCalled();
    });

    it('should list API keys for workspace', async () => {
      const mockApiKeys = [
        { id: '1', name: 'Key 1', workspaceId: 'workspace-1', key: 'sk_live_abc...' },
        { id: '2', name: 'Key 2', workspaceId: 'workspace-1', key: 'sk_live_def...' },
      ];

      mockPrismaService.apiKey.findMany.mockResolvedValue(mockApiKeys);

      const result = await apiKeyService.findAll('workspace-1');

      expect(result).toEqual(mockApiKeys);
      expect(mockPrismaService.apiKey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'workspace-1' },
        }),
      );
    });
  });

  describe('OAuthService', () => {
    it('should be defined', () => {
      expect(oauthService).toBeDefined();
    });

    it('should initiate OAuth flow', async () => {
      const mockIntegration = {
        id: 'integration-1',
        workspaceId: 'workspace-1',
        config: {
          authorizationUrl: 'https://provider.com/oauth/authorize',
          clientId: 'client-123',
        },
        scopes: ['read', 'write'],
      };

      const mockOAuthState = {
        id: 'state-1',
        integrationId: 'integration-1',
        state: 'random-state',
        codeVerifier: 'verifier',
        redirectUri: 'https://app.com/callback',
        expiresAt: new Date(Date.now() + 600000),
        createdAt: new Date(),
      };

      mockPrismaService.integration.findFirst.mockResolvedValue(mockIntegration);
      mockPrismaService.integrationOAuthState.create.mockResolvedValue(mockOAuthState);

      const result = await oauthService.initiateOAuth(
        'integration-1',
        'workspace-1',
        'https://app.com/callback',
      );

      expect(result).toHaveProperty('authorizationUrl');
      expect(result).toHaveProperty('state');
      expect(result.authorizationUrl).toContain('https://provider.com/oauth/authorize');
      expect(mockPrismaService.integrationOAuthState.create).toHaveBeenCalled();
    });
  });

  describe('RateLimitService', () => {
    it('should be defined', () => {
      expect(rateLimitService).toBeDefined();
    });

    it('should allow requests within rate limit', async () => {
      mockPrismaService.rateLimitTracking.findMany.mockResolvedValue([]);
      mockPrismaService.rateLimitTracking.findFirst.mockResolvedValue(null);
      mockPrismaService.rateLimitTracking.create.mockResolvedValue({});

      const result = await rateLimitService.checkRateLimit(
        'api_key',
        'key-1',
        'workspace-1',
        1000,
        10000,
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(mockPrismaService.rateLimitTracking.create).toHaveBeenCalled();
    });

    it('should deny requests exceeding rate limit', async () => {
      // Mock hourly tracking showing limit exceeded
      const mockTracking = Array(1000).fill({
        id: 'tracking-1',
        resourceType: 'api_key',
        resourceId: 'key-1',
        identifier: 'workspace-1',
        count: 1,
        windowStart: new Date(Date.now() - 30 * 60 * 1000),
        windowEnd: new Date(Date.now() + 30 * 60 * 1000),
      });

      mockPrismaService.rateLimitTracking.findMany.mockResolvedValue(mockTracking);

      const result = await rateLimitService.checkRateLimit(
        'api_key',
        'key-1',
        'workspace-1',
        1000,
        10000,
      );

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetAt).toBeInstanceOf(Date);
    });
  });
});
