import { Injectable, Logger } from '@nestjs/common';
import { CRMService } from './crm.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncContactDto, SyncLeadDto } from '../../dto/crm-sync.dto';

@Injectable()
export class CRMWebhookService {
  private readonly logger = new Logger(CRMWebhookService.name);

  constructor(
    private readonly crmService: CRMService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle new conversation event - auto-sync contact to CRM
   */
  async handleNewConversation(conversationId: string): Promise<void> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          account: true,
        },
      });

      if (!conversation || !conversation.participantId) {
        return;
      }

      // Auto-sync to CRM
      await this.crmService.autoSyncFromConversation(
        conversation.workspaceId,
        conversationId,
      );
    } catch (error) {
      this.logger.error('Failed to handle new conversation for CRM sync', error);
    }
  }

  /**
   * Handle message sent event - track engagement
   */
  async handleMessageSent(messageId: string): Promise<void> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: {
              account: true,
            },
          },
        },
      });

      if (!message || !message.conversation.participantId) {
        return;
      }

      // Get active CRM integrations
      const integrations = await this.prisma.integration.findMany({
        where: {
          workspaceId: message.conversation.workspaceId,
          type: 'CRM',
          status: 'ACTIVE',
        },
      });

      // Update engagement data in CRM
      for (const integration of integrations) {
        try {
          const contact = await this.crmService.getContactByEmail(
            integration.id,
            message.conversation.participantId,
          );

          if (contact) {
            // Enrich with latest engagement data
            await this.crmService.enrichContact(integration.id, {
              contactId: contact.id,
              provider: integration.provider as any,
              includeEngagementHistory: true,
            });
          }
        } catch (error) {
          this.logger.error(`Failed to update engagement in ${integration.provider}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle message sent for CRM sync', error);
    }
  }

  /**
   * Handle post engagement - track lead attribution
   */
  async handlePostEngagement(
    postId: string,
    userId: string,
    engagementType: 'view' | 'click' | 'comment' | 'share',
  ): Promise<void> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return;
      }

      // Get active CRM integrations
      const integrations = await this.prisma.integration.findMany({
        where: {
          workspaceId: post.workspaceId,
          type: 'CRM',
          status: 'ACTIVE',
        },
      });

      // Track attribution for each integration
      for (const integration of integrations) {
        try {
          // Find if this user is a lead in CRM
          const lead = await this.crmService.getLeadByEmail(integration.id, userId);

          if (lead) {
            await this.crmService.trackLeadAttribution(integration.id, {
              leadId: lead.id,
              source: (post as any).platforms?.[0]?.platform || 'social',
              campaign: (post as any).campaign || null,
              postId: postId,
              touchpoints: [
                {
                  timestamp: new Date(),
                  platform: (post as any).platforms?.[0]?.platform || 'social',
                  type: engagementType,
                  postId: postId,
                },
              ],
            });
          }
        } catch (error) {
          this.logger.error(`Failed to track attribution in ${integration.provider}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to handle post engagement for CRM attribution', error);
    }
  }

  /**
   * Scheduled job to sync all contacts from conversations
   */
  async scheduledContactSync(workspaceId: string): Promise<void> {
    this.logger.log(`Starting scheduled contact sync for workspace ${workspaceId}`);

    try {
      // Get all active CRM integrations
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

      // Get all unique contacts from conversations
      const conversations = await this.prisma.conversation.findMany({
        where: {
          workspaceId,
          participantId: {
            not: null as any,
          },
        },
        distinct: ['participantId'],
        include: {
          account: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      const contacts: SyncContactDto[] = conversations.map((conv) => ({
        email: conv.participantId!,
        firstName: conv.participantName?.split(' ')[0],
        lastName: conv.participantName?.split(' ').slice(1).join(' '),
        socialProfiles: [
          {
            platform: conv.platform,
            username: conv.participantName || '',
            url: `https://${conv.platform.toLowerCase()}.com/${conv.participantName}`,
          },
        ],
      }));

      // Batch sync to all integrations
      for (const integration of integrations) {
        try {
          const results = await this.crmService.batchSyncContacts(integration.id, contacts);
          const successCount = results.filter((r) => r.success).length;
          this.logger.log(
            `Synced ${successCount}/${contacts.length} contacts to ${integration.provider}`,
          );
        } catch (error) {
          this.logger.error(`Failed to batch sync contacts to ${integration.provider}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Scheduled contact sync failed', error);
    }
  }

  /**
   * Bidirectional sync - pull contacts from CRM and update our platform
   */
  async scheduledBidirectionalSync(workspaceId: string): Promise<void> {
    this.logger.log(`Starting scheduled bidirectional sync for workspace ${workspaceId}`);

    try {
      const integrations = await this.prisma.integration.findMany({
        where: {
          workspaceId,
          type: 'CRM',
          status: 'ACTIVE',
        },
      });

      for (const integration of integrations) {
        try {
          const result = await this.crmService.syncFromCRM(integration.id);
          this.logger.log(
            `Bidirectional sync completed for ${integration.provider}: ${result.contactsSynced} contacts, ${result.leadsSynced} leads`,
          );

          if (result.errors.length > 0) {
            this.logger.warn(`Sync errors: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          this.logger.error(`Failed bidirectional sync for ${integration.provider}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Scheduled bidirectional sync failed', error);
    }
  }
}
