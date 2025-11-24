import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateMarketingAutomationIntegrationDto,
  SyncAudienceDto,
  CreateListDto,
  AddToListDto,
  UpdateContactDto,
  TrackEventDto,
  MarketingAutomationProvider,
  CreateWorkflowTriggerDto,
  TriggerEvent,
} from '../../dto/marketing-automation.dto';
import { MailchimpService } from './mailchimp.service';
import { ActiveCampaignService } from './activecampaign.service';
import {
  BaseMarketingAutomationService,
  MarketingAutomationContact,
  MarketingAutomationList,
  MarketingAutomationCampaign,
  SyncResult,
  AudienceStats,
} from './base-marketing-automation.service';

@Injectable()
export class MarketingAutomationService {
  private readonly logger = new Logger(MarketingAutomationService.name);
  private readonly serviceCache = new Map<string, BaseMarketingAutomationService>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailchimpService: MailchimpService,
    private readonly activeCampaignService: ActiveCampaignService,
  ) {}

  /**
   * Create a new marketing automation integration
   */
  async createIntegration(
    workspaceId: string,
    userId: string,
    dto: CreateMarketingAutomationIntegrationDto,
  ) {
    // Test connection first
    const service = this.getServiceInstance(dto.provider);
    if ('initialize' in service && typeof service.initialize === 'function') {
      service.initialize(dto.credentials as any);
    }
    
    const isConnected = await service.testConnection();
    
    if (!isConnected) {
      throw new Error(`Failed to connect to ${dto.provider}`);
    }

    // Store integration in database
    const integration = await this.prisma.integration.create({
      data: {
        workspaceId,
        type: 'MARKETING_AUTOMATION' as any,
        provider: dto.provider,
        name: dto.name,
        description: dto.description,
        credentials: dto.credentials as any,
        config: dto.syncConfig as any,
        status: 'ACTIVE' as any,
        createdBy: userId,
      },
    });

    return integration;
  }

  /**
   * Sync contact to marketing automation platform
   */
  async syncContact(integrationId: string, contact: SyncAudienceDto): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.syncContact(contact);
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(
    integrationId: string,
    email: string,
  ): Promise<MarketingAutomationContact | null> {
    const service = await this.getService(integrationId);
    return await service.getContactByEmail(email);
  }

  /**
   * Update contact
   */
  async updateContact(
    integrationId: string,
    contactId: string,
    data: Partial<UpdateContactDto>,
  ): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.updateContact(contactId, data);
  }

  /**
   * Create a new list/audience
   */
  async createList(
    integrationId: string,
    list: CreateListDto,
  ): Promise<MarketingAutomationList> {
    const service = await this.getService(integrationId);
    return await service.createList(list);
  }

  /**
   * Get all lists
   */
  async getLists(integrationId: string): Promise<MarketingAutomationList[]> {
    const service = await this.getService(integrationId);
    return await service.getLists();
  }

  /**
   * Add contacts to a list
   */
  async addToList(integrationId: string, data: AddToListDto): Promise<SyncResult[]> {
    const service = await this.getService(integrationId);
    return await service.addToList(data);
  }

  /**
   * Remove contact from list
   */
  async removeFromList(
    integrationId: string,
    listId: string,
    email: string,
  ): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.removeFromList(listId, email);
  }

  /**
   * Track custom event
   */
  async trackEvent(integrationId: string, event: TrackEventDto): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.trackEvent(event);
  }

  /**
   * Get audience statistics
   */
  async getAudienceStats(integrationId: string, listId?: string): Promise<AudienceStats> {
    const service = await this.getService(integrationId);
    return await service.getAudienceStats(listId);
  }

  /**
   * Get campaigns
   */
  async getCampaigns(integrationId: string): Promise<MarketingAutomationCampaign[]> {
    const service = await this.getService(integrationId);
    return await service.getCampaigns();
  }

  /**
   * Batch sync contacts
   */
  async batchSyncContacts(
    integrationId: string,
    contacts: SyncAudienceDto[],
  ): Promise<SyncResult[]> {
    const service = await this.getService(integrationId);
    return await service.batchSyncContacts(contacts);
  }

  /**
   * Add tags to contact
   */
  async addTags(integrationId: string, email: string, tags: string[]): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.addTags(email, tags);
  }

  /**
   * Remove tags from contact
   */
  async removeTags(integrationId: string, email: string, tags: string[]): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.removeTags(email, tags);
  }

  /**
   * Subscribe contact to list
   */
  async subscribeToList(
    integrationId: string,
    email: string,
    listId: string,
  ): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.subscribeToList(email, listId);
  }

  /**
   * Unsubscribe contact from list
   */
  async unsubscribeFromList(
    integrationId: string,
    email: string,
    listId: string,
  ): Promise<SyncResult> {
    const service = await this.getService(integrationId);
    return await service.unsubscribeFromList(email, listId);
  }

  /**
   * Create workflow trigger
   */
  async createWorkflowTrigger(
    workspaceId: string,
    integrationId: string,
    dto: CreateWorkflowTriggerDto,
  ) {
    const trigger = await this.prisma.workflowTrigger.create({
      data: {
        workspaceId,
        integrationId,
        name: dto.name,
        description: dto.description,
        event: dto.event,
        conditions: dto.conditions as any,
        action: dto.action as any,
        isActive: dto.isActive ?? true,
      },
    });

    return trigger;
  }

  /**
   * Execute workflow trigger based on social event
   */
  async executeWorkflowTrigger(
    workspaceId: string,
    event: TriggerEvent,
    eventData: any,
  ): Promise<void> {
    // Find active triggers for this event
    const triggers = await this.prisma.workflowTrigger.findMany({
      where: {
        workspaceId,
        event,
        isActive: true,
      },
      include: {
        integration: true,
      },
    });

    for (const trigger of triggers) {
      try {
        // Check if conditions match
        if (!this.checkTriggerConditions(trigger.conditions as any, eventData)) {
          continue;
        }

        // Execute action
        await this.executeTriggerAction(
          trigger.integration.id,
          trigger.action as any,
          eventData,
        );

        // Log execution
        await this.prisma.workflowExecution.create({
          data: {
            triggerId: trigger.id,
            workspaceId,
            eventData: eventData as any,
            status: 'success',
            executedAt: new Date(),
          },
        });
      } catch (error: any) {
        this.logger.error(`Failed to execute workflow trigger ${trigger.id}`, error);
        
        // Log failure
        await this.prisma.workflowExecution.create({
          data: {
            triggerId: trigger.id,
            workspaceId,
            eventData: eventData as any,
            status: 'failed',
            error: error.message,
            executedAt: new Date(),
          },
        });
      }
    }
  }

  /**
   * Sync audience from social platform to marketing automation
   */
  async syncAudienceFromSocial(
    workspaceId: string,
    integrationId: string,
    socialAccountId: string,
    listId: string,
  ): Promise<{ synced: number; failed: number }> {
    // Get followers/audience from social account
    // This would integrate with the social account service
    // For now, we'll return a placeholder
    
    this.logger.log(`Syncing audience from social account ${socialAccountId} to list ${listId}`);
    
    return {
      synced: 0,
      failed: 0,
    };
  }

  /**
   * Get service instance for provider
   */
  private getServiceInstance(provider: MarketingAutomationProvider): BaseMarketingAutomationService {
    switch (provider) {
      case MarketingAutomationProvider.MAILCHIMP:
        return this.mailchimpService;
      case MarketingAutomationProvider.ACTIVECAMPAIGN:
        return this.activeCampaignService;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get initialized service for integration
   */
  private async getService(integrationId: string): Promise<BaseMarketingAutomationService> {
    // Check cache
    if (this.serviceCache.has(integrationId)) {
      return this.serviceCache.get(integrationId)!;
    }

    // Load integration from database
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException(`Integration ${integrationId} not found`);
    }

    // Get service instance
    const service = this.getServiceInstance(integration.provider as MarketingAutomationProvider);
    
    // Initialize with credentials
    if ('initialize' in service && typeof service.initialize === 'function') {
      service.initialize(integration.credentials as any);
    }

    // Cache service
    this.serviceCache.set(integrationId, service);

    return service;
  }

  /**
   * Check if trigger conditions match event data
   */
  private checkTriggerConditions(conditions: any, eventData: any): boolean {
    if (!conditions) return true;

    // Check platform filter
    if (conditions.platform && conditions.platform.length > 0) {
      if (!conditions.platform.includes(eventData.platform)) {
        return false;
      }
    }

    // Check sentiment filter
    if (conditions.sentiment && conditions.sentiment.length > 0) {
      if (!conditions.sentiment.includes(eventData.sentiment)) {
        return false;
      }
    }

    // Check engagement minimum
    if (conditions.engagementMin !== undefined) {
      if (eventData.engagement < conditions.engagementMin) {
        return false;
      }
    }

    // Check keywords
    if (conditions.keywords && conditions.keywords.length > 0) {
      const content = (eventData.content || '').toLowerCase();
      const hasKeyword = conditions.keywords.some((keyword: string) =>
        content.includes(keyword.toLowerCase()),
      );
      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute trigger action
   */
  private async executeTriggerAction(
    integrationId: string,
    action: any,
    eventData: any,
  ): Promise<void> {
    const service = await this.getService(integrationId);

    switch (action.type) {
      case 'add_to_list':
        if (action.listId && eventData.email) {
          await service.subscribeToList(eventData.email, action.listId);
        }
        break;

      case 'add_tag':
        if (action.tags && eventData.email) {
          await service.addTags(eventData.email, action.tags);
        }
        break;

      case 'update_contact':
        if (eventData.email) {
          const updateData: Partial<UpdateContactDto> = {
            customFields: action.customFields,
          };
          
          const contact = await service.getContactByEmail(eventData.email);
          if (contact) {
            await service.updateContact(contact.id, updateData);
          }
        }
        break;

      case 'start_automation':
        // This would trigger an automation in the marketing platform
        // Implementation depends on platform capabilities
        this.logger.log(`Starting automation ${action.automationId} for ${eventData.email}`);
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }
}
