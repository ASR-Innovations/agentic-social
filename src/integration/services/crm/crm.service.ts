import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SalesforceService } from './salesforce.service';
import { HubSpotService } from './hubspot.service';
import { PipedriveService } from './pipedrive.service';
import { BaseCRMService, CRMSyncResult, CRMContact, CRMLead } from './base-crm.service';
import {
  CRMProvider,
  CreateCRMIntegrationDto,
  SyncContactDto,
  SyncLeadDto,
  ContactEnrichmentDto,
  LeadAttributionDto,
} from '../../dto/crm-sync.dto';
import { IntegrationService } from '../integration.service';

@Injectable()
export class CRMService {
  private readonly logger = new Logger(CRMService.name);
  private readonly crmProviders: Map<string, BaseCRMService> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationService: IntegrationService,
    private readonly salesforceService: SalesforceService,
    private readonly hubspotService: HubSpotService,
    private readonly pipedriveService: PipedriveService,
  ) {}

  /**
   * Create a new CRM integration
   */
  async createIntegration(
    workspaceId: string,
    userId: string,
    dto: CreateCRMIntegrationDto,
  ): Promise<any> {
    this.logger.log(`Creating CRM integration for workspace ${workspaceId}`);

    // Create integration record
    const integration = await this.integrationService.create(workspaceId, userId, {
      name: dto.name,
      type: 'CRM' as any,
      provider: dto.provider,
      description: dto.description,
      scopes: dto.scopes,
      config: {
        ...dto.credentials,
        syncConfig: dto.syncConfig,
      },
    });

    // Initialize the CRM service
    await this.initializeCRMProvider(integration.id, dto.provider, dto.credentials);

    // Test connection
    const crmService = this.getCRMProvider(integration.id);
    const connectionTest = await crmService.testConnection();

    if (!connectionTest) {
      throw new BadRequestException('Failed to connect to CRM. Please check your credentials.');
    }

    // Update integration status
    await this.integrationService.updateStatus(integration.id, workspaceId, 'ACTIVE');

    return integration;
  }

  /**
   * Sync contact to CRM
   */
  async syncContact(
    integrationId: string,
    contact: SyncContactDto,
  ): Promise<CRMSyncResult> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.syncContact(contact);
  }

  /**
   * Sync lead to CRM
   */
  async syncLead(
    integrationId: string,
    lead: SyncLeadDto,
  ): Promise<CRMSyncResult> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.syncLead(lead);
  }

  /**
   * Get contact from CRM by email
   */
  async getContactByEmail(
    integrationId: string,
    email: string,
  ): Promise<CRMContact | null> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.getContactByEmail(email);
  }

  /**
   * Get lead from CRM by email
   */
  async getLeadByEmail(
    integrationId: string,
    email: string,
  ): Promise<CRMLead | null> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.getLeadByEmail(email);
  }

  /**
   * Enrich contact with social media data
   */
  async enrichContact(
    integrationId: string,
    dto: ContactEnrichmentDto,
  ): Promise<CRMSyncResult> {
    const crmService = this.getCRMProvider(integrationId);

    // Gather social data from our platform
    const socialData: any = {};

    if (dto.includeSocialData) {
      // Get social profiles from conversations
      // Note: participantId is the external user ID, we'll use it as a proxy for email matching
      const conversations = await this.prisma.conversation.findMany({
        where: {
          participantId: dto.contactId,
        },
        include: {
          account: true,
        },
      });

      socialData.socialProfiles = conversations.map((conv) => ({
        platform: conv.platform,
        username: conv.participantName,
        url: `https://${conv.platform.toLowerCase()}.com/${conv.participantName}`,
      }));
    }

    if (dto.includeEngagementHistory) {
      // Calculate engagement score from message history
      const messages = await this.prisma.message.findMany({
        where: {
          conversation: {
            participantId: dto.contactId,
          },
        },
      });

      socialData.engagementScore = this.calculateEngagementScore(messages);
    }

    return await crmService.enrichContact(dto.contactId, socialData);
  }

  /**
   * Track lead attribution from social media
   */
  async trackLeadAttribution(
    integrationId: string,
    dto: LeadAttributionDto,
  ): Promise<CRMSyncResult> {
    const crmService = this.getCRMProvider(integrationId);

    // Build attribution data
    const attribution: any = {
      source: dto.source,
      campaign: dto.campaign,
    };

    // Get touchpoints from our platform
    if (dto.conversationId) {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: dto.conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (conversation) {
        attribution.touchpoints = conversation.messages.map((msg) => ({
          timestamp: msg.createdAt,
          platform: dto.source,
          type: msg.direction === 'INBOUND' ? 'message' : 'response',
        }));
      }
    }

    if (dto.postId) {
      // Get post engagement data
      const post = await this.prisma.post.findUnique({
        where: { id: dto.postId },
      });

      if (post) {
        attribution.touchpoints = attribution.touchpoints || [];
        attribution.touchpoints.push({
          timestamp: post.publishedAt || post.createdAt,
          platform: dto.source,
          type: 'post_view',
          postId: dto.postId,
        });
      }
    }

    return await crmService.trackLeadAttribution(dto.leadId, attribution);
  }

  /**
   * Batch sync contacts
   */
  async batchSyncContacts(
    integrationId: string,
    contacts: SyncContactDto[],
  ): Promise<CRMSyncResult[]> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.batchSyncContacts(contacts);
  }

  /**
   * Batch sync leads
   */
  async batchSyncLeads(
    integrationId: string,
    leads: SyncLeadDto[],
  ): Promise<CRMSyncResult[]> {
    const crmService = this.getCRMProvider(integrationId);
    return await crmService.batchSyncLeads(leads);
  }

  /**
   * Bidirectional sync - sync from CRM to our platform
   */
  async syncFromCRM(integrationId: string): Promise<{
    contactsSynced: number;
    leadsSynced: number;
    errors: string[];
  }> {
    this.logger.log(`Starting bidirectional sync from CRM for integration ${integrationId}`);

    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const crmService = this.getCRMProvider(integrationId);
    const errors: string[] = [];
    let contactsSynced = 0;
    let leadsSynced = 0;

    try {
      // Get all contacts from our conversations
      const conversations = await this.prisma.conversation.findMany({
        where: {
          workspaceId: integration.workspaceId,
        },
        distinct: ['participantId'],
      });

      // For each contact, check if they exist in CRM and sync
      for (const conv of conversations) {
        if (!conv.participantId) continue;

        try {
          // Try to get contact by participant ID (which might be an email)
          const crmContact = await crmService.getContactByEmail(conv.participantId);

          if (crmContact) {
            // Update our local data with CRM data
            await this.prisma.conversation.updateMany({
              where: {
                participantId: conv.participantId,
                workspaceId: integration.workspaceId,
              },
              data: {
                participantName: `${crmContact.firstName || ''} ${crmContact.lastName || ''}`.trim(),
              },
            });

            contactsSynced++;
          }
        } catch (error: any) {
          errors.push(`Failed to sync contact ${conv.participantId}: ${error.message}`);
        }
      }

      this.logger.log(`Bidirectional sync completed: ${contactsSynced} contacts, ${leadsSynced} leads`);
    } catch (error) {
      this.logger.error('Bidirectional sync failed', error);
      throw error;
    }

    return {
      contactsSynced,
      leadsSynced,
      errors,
    };
  }

  /**
   * Auto-sync contacts from conversations
   */
  async autoSyncFromConversation(
    workspaceId: string,
    conversationId: string,
  ): Promise<void> {
    // Get active CRM integrations for workspace
    const integrations = await this.prisma.integration.findMany({
      where: {
        workspaceId,
        type: 'CRM',
        status: 'ACTIVE',
      },
    });

    if (integrations.length === 0) {
      return;
    }

    // Get conversation details
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        account: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation || !conversation.participantId) {
      return;
    }

    // Build contact/lead data
    // Note: participantId might be an email or social media ID
    const contactData: SyncContactDto = {
      email: conversation.participantId, // Assuming participantId is email-like
      firstName: conversation.participantName?.split(' ')[0],
      lastName: conversation.participantName?.split(' ').slice(1).join(' '),
      socialProfiles: [
        {
          platform: conversation.platform,
          username: conversation.participantName,
          url: `https://${conversation.platform.toLowerCase()}.com/${conversation.participantName}`,
        },
      ],
    };

    // Sync to all active CRM integrations
    for (const integration of integrations) {
      try {
        await this.syncContact(integration.id, contactData);
        this.logger.log(`Auto-synced contact from conversation ${conversationId} to ${integration.provider}`);
      } catch (error) {
        this.logger.error(`Failed to auto-sync contact to ${integration.provider}`, error);
      }
    }
  }

  /**
   * Initialize CRM provider
   */
  private async initializeCRMProvider(
    integrationId: string,
    provider: CRMProvider,
    credentials: any,
  ): Promise<void> {
    let crmService: BaseCRMService;

    switch (provider) {
      case CRMProvider.SALESFORCE:
        crmService = this.salesforceService;
        this.salesforceService.initialize({
          instanceUrl: credentials.domain || 'https://login.salesforce.com',
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        });
        break;

      case CRMProvider.HUBSPOT:
        crmService = this.hubspotService;
        this.hubspotService.initialize({
          accessToken: credentials.accessToken,
          portalId: credentials.portalId,
        });
        break;

      case CRMProvider.PIPEDRIVE:
        crmService = this.pipedriveService;
        this.pipedriveService.initialize({
          apiToken: credentials.apiKey,
          companyDomain: credentials.domain,
        });
        break;

      default:
        throw new BadRequestException(`Unsupported CRM provider: ${provider}`);
    }

    this.crmProviders.set(integrationId, crmService);
  }

  /**
   * Get CRM provider instance
   */
  private getCRMProvider(integrationId: string): BaseCRMService {
    const crmService = this.crmProviders.get(integrationId);

    if (!crmService) {
      throw new NotFoundException('CRM integration not initialized');
    }

    return crmService;
  }

  /**
   * Calculate engagement score from messages
   */
  private calculateEngagementScore(messages: any[]): number {
    if (messages.length === 0) return 0;

    // Simple engagement score based on message count and recency
    const recentMessages = messages.filter(
      (msg) => new Date(msg.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    );

    const score = Math.min(100, recentMessages.length * 10);
    return score;
  }
}