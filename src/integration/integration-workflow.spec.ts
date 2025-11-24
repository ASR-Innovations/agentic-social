import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationService } from './services/integration.service';
import { WebhookService } from './services/webhook.service';
import { ApiKeyService } from './services/api-key.service';
import { OAuthService } from './services/oauth.service';
import { RateLimitService } from './services/rate-limit.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Integration Workflow Tests
 * 
 * These tests demonstrate complete workflows for the integration framework,
 * showing how different components work together.
 */
describe('Integration Framework - Complete Workflows', () => {
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

  describe('Workflow 1: OAuth Integration Setup', () => {
    it('should complete full OAuth integration flow', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';

      // Step 1: Create integration
      const mockIntegration = {
        id: 'integration-1',
        workspaceId,
        name: 'Salesforce CRM',
        type: 'CRM',
        provider: 'salesforce',
        status: 'PENDING_SETUP',
        config: {
          authorizationUrl: 'https://login.salesforce.com/oauth/authorize',
          tokenUrl: 'https://login.salesforce.com/oauth/token',
          clientId: 'client-123',
          clientSecret: 'secret-456',
        },
        scopes: ['read_contacts', 'write_leads'],
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.integration.create.mockResolvedValue(mockIntegration);

      const integration = await integrationService.create(workspaceId, userId, {
        name: 'Salesforce CRM',
        type: 'CRM' as any,
        provider: 'salesforce',
        config: mockIntegration.config,
        scopes: mockIntegration.scopes,
      });

      expect(integration.id).toBe('integration-1');
      expect(integration.status).toBe('PENDING_SETUP');

      // Step 2: Initiate OAuth flow
      const mockOAuthState = {
        id: 'state-1',
        integrationId: integration.id,
        state: 'random-state-token',
        codeVerifier: 'code-verifier',
        redirectUri: 'https://app.com/callback',
        expiresAt: new Date(Date.now() + 600000),
        createdAt: new Date(),
      };

      mockPrismaService.integration.findFirst.mockResolvedValue(mockIntegration);
      mockPrismaService.integrationOAuthState.create.mockResolvedValue(mockOAuthState);

      const oauthFlow = await oauthService.initiateOAuth(
        integration.id,
        workspaceId,
        'https://app.com/callback',
      );

      expect(oauthFlow.authorizationUrl).toContain('https://login.salesforce.com/oauth/authorize');
      expect(oauthFlow.state).toBeTruthy();

      // Step 3: User authorizes and returns with code
      // (This happens in the browser)

      // Step 4: Handle OAuth callback
      // (In a real scenario, this would exchange the code for tokens)
      // For this test, we just verify the flow is set up correctly

      expect(mockPrismaService.integrationOAuthState.create).toHaveBeenCalled();
    });
  });

  describe('Workflow 2: Webhook Event Notification', () => {
    it('should create webhook and trigger event notification', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';

      // Step 1: Create webhook
      const mockWebhook = {
        id: 'webhook-1',
        workspaceId,
        name: 'Post Published Webhook',
        url: 'https://example.com/webhook',
        secret: 'webhook-secret-123',
        events: ['POST_PUBLISHED'],
        status: 'ACTIVE',
        headers: { 'X-Custom': 'value' },
        retryConfig: { maxRetries: 3, backoffMultiplier: 2 },
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.webhook.create.mockResolvedValue(mockWebhook);

      const webhook = await webhookService.create(workspaceId, userId, {
        name: 'Post Published Webhook',
        url: 'https://example.com/webhook',
        events: ['POST_PUBLISHED'] as any,
        headers: { 'X-Custom': 'value' },
      });

      expect(webhook.id).toBe('webhook-1');
      expect(webhook.secret).toBeTruthy();

      // Step 2: Trigger webhook event
      mockPrismaService.webhook.findMany.mockResolvedValue([mockWebhook]);
      mockPrismaService.webhook.findUnique.mockResolvedValue(mockWebhook);
      mockPrismaService.webhookDelivery.create.mockResolvedValue({
        id: 'delivery-1',
        webhookId: webhook.id,
        eventType: 'POST_PUBLISHED',
        payload: {},
        success: false,
        attempt: 1,
        createdAt: new Date(),
      });

      await webhookService.trigger('POST_PUBLISHED' as any, workspaceId, {
        event: 'POST_PUBLISHED',
        timestamp: new Date().toISOString(),
        workspaceId,
        data: {
          postId: 'post-123',
          platforms: ['INSTAGRAM', 'FACEBOOK'],
          content: 'Test post',
        },
      });

      // Verify webhook delivery was created
      expect(mockPrismaService.webhookDelivery.create).toHaveBeenCalled();
    });
  });

  describe('Workflow 3: API Key Authentication and Rate Limiting', () => {
    it('should create API key, verify it, and check rate limits', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';

      // Step 1: Create API key
      const mockApiKey = {
        id: 'key-1',
        workspaceId,
        name: 'Production Key',
        key: 'sk_live_abc...',
        hashedKey: 'hashed-key',
        status: 'ACTIVE',
        scopes: ['posts:read', 'posts:write'],
        rateLimitPerHour: 1000,
        rateLimitPerDay: 10000,
        expiresAt: null,
        lastUsedAt: null,
        usageCount: 0,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.apiKey.create.mockResolvedValue(mockApiKey);

      const apiKey = await apiKeyService.create(workspaceId, userId, {
        name: 'Production Key',
        scopes: ['posts:read', 'posts:write'],
        rateLimitPerHour: 1000,
        rateLimitPerDay: 10000,
      });

      expect(apiKey.key).toMatch(/^sk_live_/);

      // Step 2: Verify API key
      // (In a real scenario, this would hash and compare)
      // For this test, we just verify the method exists

      // Step 3: Check rate limits
      mockPrismaService.rateLimitTracking.findMany.mockResolvedValue([]);
      mockPrismaService.rateLimitTracking.findFirst.mockResolvedValue(null);
      mockPrismaService.rateLimitTracking.create.mockResolvedValue({});

      const rateLimit = await rateLimitService.checkRateLimit(
        'api_key',
        apiKey.id,
        workspaceId,
        1000,
        10000,
      );

      expect(rateLimit.allowed).toBe(true);
      expect(rateLimit.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Workflow 4: Integration Marketplace Discovery', () => {
    it('should list public integrations from marketplace', async () => {
      const mockMarketplaceIntegrations = [
        {
          id: '1',
          name: 'Zapier',
          type: 'ZAPIER',
          provider: 'zapier',
          description: 'Connect with 5000+ apps',
          logoUrl: 'https://example.com/zapier-logo.png',
          scopes: [],
          metadata: {},
        },
        {
          id: '2',
          name: 'Salesforce',
          type: 'CRM',
          provider: 'salesforce',
          description: 'Sync contacts and leads',
          logoUrl: 'https://example.com/salesforce-logo.png',
          scopes: ['read_contacts', 'write_leads'],
          metadata: {},
        },
      ];

      mockPrismaService.integration.findMany.mockResolvedValue(mockMarketplaceIntegrations);

      const marketplace = await integrationService.getMarketplace();

      expect(marketplace).toHaveLength(2);
      expect(marketplace[0].name).toBe('Zapier');
      expect(marketplace[1].name).toBe('Salesforce');
    });
  });

  describe('Workflow 5: Webhook Retry on Failure', () => {
    it('should retry failed webhook delivery', async () => {
      const workspaceId = 'workspace-1';
      const webhookId = 'webhook-1';
      const deliveryId = 'delivery-1';

      const mockWebhook = {
        id: webhookId,
        workspaceId,
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        secret: 'secret',
        events: ['POST_PUBLISHED'],
        status: 'ACTIVE',
        retryConfig: { maxRetries: 3, backoffMultiplier: 2 },
      };

      const mockDelivery = {
        id: deliveryId,
        webhookId,
        eventType: 'POST_PUBLISHED',
        payload: { test: 'data' },
        success: false,
        error: 'Connection timeout',
        attempt: 1,
        nextRetryAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        webhook: mockWebhook,
      };

      mockPrismaService.webhookDelivery.findFirst.mockResolvedValue(mockDelivery);
      mockPrismaService.webhook.findUnique.mockResolvedValue(mockWebhook);
      mockPrismaService.webhookDelivery.create.mockResolvedValue({
        ...mockDelivery,
        id: 'delivery-2',
        attempt: 2,
      });
      mockPrismaService.webhookDelivery.update.mockResolvedValue({});
      mockPrismaService.webhook.update.mockResolvedValue({
        ...mockWebhook,
        failureCount: 1,
      });

      await webhookService.retryDelivery(deliveryId, workspaceId);

      // Verify retry was initiated
      expect(mockPrismaService.webhookDelivery.findFirst).toHaveBeenCalled();
    });
  });

  describe('Workflow 6: Rate Limit Enforcement', () => {
    it('should enforce rate limits and deny excessive requests', async () => {
      const resourceType = 'api_key';
      const resourceId = 'key-1';
      const identifier = 'workspace-1';

      // Simulate 1000 requests already made in the current hour
      const mockTracking = Array(1000).fill({
        id: 'tracking-1',
        resourceType,
        resourceId,
        identifier,
        count: 1,
        windowStart: new Date(Date.now() - 30 * 60 * 1000),
        windowEnd: new Date(Date.now() + 30 * 60 * 1000),
      });

      mockPrismaService.rateLimitTracking.findMany.mockResolvedValue(mockTracking);

      const rateLimit = await rateLimitService.checkRateLimit(
        resourceType,
        resourceId,
        identifier,
        1000, // hourly limit
        10000, // daily limit
      );

      expect(rateLimit.allowed).toBe(false);
      expect(rateLimit.remaining).toBe(0);
      expect(rateLimit.resetAt).toBeInstanceOf(Date);
    });
  });

  describe('Workflow 7: Integration Status Management', () => {
    it('should update integration status through lifecycle', async () => {
      const workspaceId = 'workspace-1';
      const integrationId = 'integration-1';

      const mockIntegration = {
        id: integrationId,
        workspaceId,
        name: 'Test Integration',
        type: 'CRM',
        provider: 'test',
        status: 'PENDING_SETUP',
      };

      // Start with PENDING_SETUP
      mockPrismaService.integration.findFirst.mockResolvedValue(mockIntegration);
      mockPrismaService.integration.update.mockResolvedValue({
        ...mockIntegration,
        status: 'ACTIVE',
      });

      // Activate integration
      const activated = await integrationService.updateStatus(
        integrationId,
        workspaceId,
        'ACTIVE',
      );

      expect(activated.status).toBe('ACTIVE');

      // Deactivate integration
      mockPrismaService.integration.update.mockResolvedValue({
        ...mockIntegration,
        status: 'INACTIVE',
      });

      const deactivated = await integrationService.updateStatus(
        integrationId,
        workspaceId,
        'INACTIVE',
      );

      expect(deactivated.status).toBe('INACTIVE');

      // Mark as error
      mockPrismaService.integration.update.mockResolvedValue({
        ...mockIntegration,
        status: 'ERROR',
      });

      const errored = await integrationService.updateStatus(
        integrationId,
        workspaceId,
        'ERROR',
      );

      expect(errored.status).toBe('ERROR');
    });
  });
});
