import { Test, TestingModule } from '@nestjs/testing';
import { CRMService } from './crm.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { IntegrationService } from '../integration.service';
import { SalesforceService } from './salesforce.service';
import { HubSpotService } from './hubspot.service';
import { PipedriveService } from './pipedrive.service';
import { CRMProvider, SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';

describe('CRMService', () => {
  let service: CRMService;
  let prismaService: PrismaService;
  let integrationService: IntegrationService;
  let salesforceService: SalesforceService;
  let hubspotService: HubSpotService;
  let pipedriveService: PipedriveService;

  const mockPrismaService = {
    integration: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    conversation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
    },
  };

  const mockIntegrationService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockSalesforceService = {
    initialize: jest.fn(),
    testConnection: jest.fn(),
    syncContact: jest.fn(),
    syncLead: jest.fn(),
    getContactByEmail: jest.fn(),
    getLeadByEmail: jest.fn(),
    updateContact: jest.fn(),
    updateLead: jest.fn(),
    enrichContact: jest.fn(),
    trackLeadAttribution: jest.fn(),
    batchSyncContacts: jest.fn(),
    batchSyncLeads: jest.fn(),
  };

  const mockHubSpotService = { ...mockSalesforceService };
  const mockPipedriveService = { ...mockSalesforceService };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CRMService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: IntegrationService, useValue: mockIntegrationService },
        { provide: SalesforceService, useValue: mockSalesforceService },
        { provide: HubSpotService, useValue: mockHubSpotService },
        { provide: PipedriveService, useValue: mockPipedriveService },
      ],
    }).compile();

    service = module.get<CRMService>(CRMService);
    prismaService = module.get<PrismaService>(PrismaService);
    integrationService = module.get<IntegrationService>(IntegrationService);
    salesforceService = module.get<SalesforceService>(SalesforceService);
    hubspotService = module.get<HubSpotService>(HubSpotService);
    pipedriveService = module.get<PipedriveService>(PipedriveService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntegration', () => {
    it('should create a Salesforce integration successfully', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';
      const dto = {
        provider: CRMProvider.SALESFORCE,
        name: 'Salesforce CRM',
        description: 'Main Salesforce instance',
        credentials: {
          clientId: 'client-id',
          clientSecret: 'client-secret',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          domain: 'https://mycompany.salesforce.com',
        },
        scopes: ['read_contacts', 'write_leads'],
      };

      const mockIntegration = {
        id: 'integration-1',
        workspaceId,
        name: dto.name,
        type: 'CRM',
        provider: dto.provider,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegration, status: 'ACTIVE' });

      const result = await service.createIntegration(workspaceId, userId, dto);

      expect(integrationService.create).toHaveBeenCalledWith(workspaceId, userId, expect.any(Object));
      expect(salesforceService.initialize).toHaveBeenCalled();
      expect(salesforceService.testConnection).toHaveBeenCalled();
      expect(integrationService.updateStatus).toHaveBeenCalledWith('integration-1', workspaceId, 'ACTIVE');
      expect(result).toEqual(mockIntegration);
    });

    it('should throw error if connection test fails', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';
      const dto = {
        provider: CRMProvider.HUBSPOT,
        name: 'HubSpot CRM',
        credentials: {
          accessToken: 'invalid-token',
        },
      };

      const mockIntegration = {
        id: 'integration-1',
        workspaceId,
        name: dto.name,
        type: 'CRM',
        provider: dto.provider,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockHubSpotService.testConnection.mockResolvedValue(false);

      await expect(service.createIntegration(workspaceId, userId, dto)).rejects.toThrow(
        'Failed to connect to CRM',
      );
    });
  });

  describe('syncContact', () => {
    it('should sync contact to CRM successfully', async () => {
      const integrationId = 'integration-1';
      const contact: SyncContactDto = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Inc',
        socialProfiles: [
          {
            platform: 'twitter',
            username: 'johndoe',
            url: 'https://twitter.com/johndoe',
            followers: 1000,
          },
        ],
      };

      const mockResult = {
        success: true,
        recordId: 'contact-123',
        action: 'created' as const,
      };

      const mockIntegration = {
        id: integrationId,
        workspaceId: 'workspace-1',
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegration, status: 'ACTIVE' });

      // Initialize the provider first
      await service.createIntegration('workspace-1', 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      mockSalesforceService.syncContact.mockResolvedValue(mockResult);

      const result = await service.syncContact(integrationId, contact);

      expect(result).toEqual(mockResult);
      expect(salesforceService.syncContact).toHaveBeenCalledWith(contact);
    });
  });

  describe('enrichContact', () => {
    it('should enrich contact with social data', async () => {
      const integrationId = 'integration-1';
      const dto = {
        contactId: 'contact-123',
        provider: CRMProvider.SALESFORCE,
        includeSocialData: true,
        includeEngagementHistory: true,
      };

      const mockConversations = [
        {
          id: 'conv-1',
          participantId: 'john@example.com',
          participantName: 'John Doe',
          platform: 'twitter',
          account: {
            platform: 'twitter',
          },
        },
      ];

      const mockMessages = [
        { id: 'msg-1', createdAt: new Date() },
        { id: 'msg-2', createdAt: new Date() },
      ];

      const mockIntegration = {
        id: integrationId,
        workspaceId: 'workspace-1',
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegration, status: 'ACTIVE' });
      mockPrismaService.conversation.findMany.mockResolvedValue(mockConversations);
      mockPrismaService.message.findMany.mockResolvedValue(mockMessages);
      mockSalesforceService.enrichContact.mockResolvedValue({
        success: true,
        recordId: 'contact-123',
        action: 'updated' as const,
      });

      // Initialize the provider
      await service.createIntegration('workspace-1', 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      const result = await service.enrichContact(integrationId, dto);

      expect(result.success).toBe(true);
      expect(prismaService.conversation.findMany).toHaveBeenCalled();
      expect(prismaService.message.findMany).toHaveBeenCalled();
      expect(salesforceService.enrichContact).toHaveBeenCalled();
    });
  });

  describe('trackLeadAttribution', () => {
    it('should track lead attribution from social media', async () => {
      const integrationId = 'integration-1';
      const dto = {
        leadId: 'lead-123',
        source: 'twitter',
        campaign: 'summer-sale',
        postId: 'post-123',
        conversationId: 'conv-123',
      };

      const mockConversation = {
        id: 'conv-123',
        messages: [
          { id: 'msg-1', createdAt: new Date(), direction: 'inbound' },
          { id: 'msg-2', createdAt: new Date(), direction: 'outbound' },
        ],
      };

      const mockPost = {
        id: 'post-123',
        publishedAt: new Date(),
        createdAt: new Date(),
      };

      const mockIntegration = {
        id: integrationId,
        workspaceId: 'workspace-1',
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegration, status: 'ACTIVE' });
      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockSalesforceService.trackLeadAttribution.mockResolvedValue({
        success: true,
        recordId: 'lead-123',
        action: 'updated' as const,
      });

      // Initialize the provider
      await service.createIntegration('workspace-1', 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      const result = await service.trackLeadAttribution(integrationId, dto);

      expect(result.success).toBe(true);
      expect(prismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: dto.conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: dto.postId },
      });
      expect(salesforceService.trackLeadAttribution).toHaveBeenCalled();
    });
  });

  describe('batchSyncContacts', () => {
    it('should batch sync multiple contacts', async () => {
      const integrationId = 'integration-1';
      const contacts: SyncContactDto[] = [
        { email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
        { email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
      ];

      const mockResults = [
        { success: true, recordId: 'contact-1', action: 'created' as const },
        { success: true, recordId: 'contact-2', action: 'created' as const },
      ];

      const mockIntegration = {
        id: integrationId,
        workspaceId: 'workspace-1',
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegration);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegration, status: 'ACTIVE' });
      mockSalesforceService.batchSyncContacts.mockResolvedValue(mockResults);

      // Initialize the provider
      await service.createIntegration('workspace-1', 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      const results = await service.batchSyncContacts(integrationId, contacts);

      expect(results).toEqual(mockResults);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe('syncFromCRM', () => {
    it('should perform bidirectional sync from CRM', async () => {
      const integrationId = 'integration-1';

      const mockIntegration = {
        id: integrationId,
        workspaceId: 'workspace-1',
        provider: 'salesforce',
        status: 'ACTIVE',
      };

      const mockConversations = [
        {
          id: 'conv-1',
          participantId: 'john@example.com',
          participantName: 'John',
          workspaceId: 'workspace-1',
        },
      ];

      const mockCRMContact = {
        id: 'contact-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Inc',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockIntegrationSetup = {
        id: integrationId,
        workspaceId: 'workspace-1',
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegrationSetup);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegrationSetup, status: 'ACTIVE' });
      mockPrismaService.integration.findUnique.mockResolvedValue(mockIntegration);
      mockPrismaService.conversation.findMany.mockResolvedValue(mockConversations);
      mockSalesforceService.getContactByEmail.mockResolvedValue(mockCRMContact);
      mockPrismaService.conversation.updateMany.mockResolvedValue({ count: 1 });

      // Initialize the provider
      await service.createIntegration('workspace-1', 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      const result = await service.syncFromCRM(integrationId);

      expect(result.contactsSynced).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(prismaService.conversation.updateMany).toHaveBeenCalled();
    });
  });

  describe('autoSyncFromConversation', () => {
    it('should auto-sync contact when new conversation is created', async () => {
      const workspaceId = 'workspace-1';
      const conversationId = 'conv-1';

      const mockIntegrations = [
        {
          id: 'integration-1',
          workspaceId,
          type: 'CRM',
          provider: 'salesforce',
          status: 'ACTIVE',
        },
      ];

      const mockConversation = {
        id: conversationId,
        workspaceId,
        participantId: 'john@example.com',
        participantName: 'John Doe',
        platform: 'twitter',
        account: {
          platform: 'twitter',
        },
        messages: [{ id: 'msg-1', createdAt: new Date() }],
      };

      const mockIntegrationSetup = {
        id: 'integration-1',
        workspaceId,
        name: 'Test',
        type: 'CRM',
        provider: CRMProvider.SALESFORCE,
        status: 'PENDING_SETUP',
      };

      mockIntegrationService.create.mockResolvedValue(mockIntegrationSetup);
      mockSalesforceService.testConnection.mockResolvedValue(true);
      mockIntegrationService.updateStatus.mockResolvedValue({ ...mockIntegrationSetup, status: 'ACTIVE' });
      mockPrismaService.integration.findMany.mockResolvedValue(mockIntegrations);
      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockSalesforceService.syncContact.mockResolvedValue({
        success: true,
        recordId: 'contact-123',
        action: 'created' as const,
      });

      // Initialize the provider
      await service.createIntegration(workspaceId, 'user-1', {
        provider: CRMProvider.SALESFORCE,
        name: 'Test',
        credentials: { accessToken: 'token' },
      });

      await service.autoSyncFromConversation(workspaceId, conversationId);

      expect(prismaService.integration.findMany).toHaveBeenCalledWith({
        where: { workspaceId, type: 'CRM', status: 'ACTIVE' },
      });
      expect(salesforceService.syncContact).toHaveBeenCalled();
    });
  });
});
