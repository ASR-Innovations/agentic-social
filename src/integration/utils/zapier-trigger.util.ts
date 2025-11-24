import { Injectable } from '@nestjs/common';
import { ZapierService } from '../services/zapier.service';

/**
 * Utility class for triggering Zapier webhooks from anywhere in the application
 * 
 * Usage:
 * ```typescript
 * // In your service
 * constructor(private zapierTrigger: ZapierTriggerUtil) {}
 * 
 * // When an event occurs
 * await this.zapierTrigger.postPublished(workspaceId, postData);
 * ```
 */
@Injectable()
export class ZapierTriggerUtil {
  constructor(private zapierService: ZapierService) {}

  /**
   * Trigger when a post is published
   */
  async postPublished(workspaceId: string, post: any) {
    const data = this.zapierService.mapEventToTriggerData('POST_PUBLISHED', post);
    return this.zapierService.triggerWebhook(workspaceId, 'post_published', data);
  }

  /**
   * Trigger when a post is scheduled
   */
  async postScheduled(workspaceId: string, post: any) {
    const data = {
      id: post.id,
      content: post.content?.text || '',
      platforms: post.platformPosts?.map((p: any) => p.platform) || [],
      scheduledAt: post.scheduledAt,
      author: {
        id: post.authorId,
        name: post.author?.name,
      },
    };
    return this.zapierService.triggerWebhook(workspaceId, 'post_scheduled', data);
  }

  /**
   * Trigger when a mention is received
   */
  async mentionReceived(workspaceId: string, mention: any) {
    const data = this.zapierService.mapEventToTriggerData('MENTION_RECEIVED', mention);
    return this.zapierService.triggerWebhook(workspaceId, 'mention_received', data);
  }

  /**
   * Trigger when a message is received
   */
  async messageReceived(workspaceId: string, message: any) {
    const data = this.zapierService.mapEventToTriggerData('MESSAGE_RECEIVED', message);
    return this.zapierService.triggerWebhook(workspaceId, 'message_received', data);
  }

  /**
   * Trigger when an alert is triggered
   */
  async alertTriggered(workspaceId: string, alert: any) {
    const data = this.zapierService.mapEventToTriggerData('ALERT_TRIGGERED', alert);
    return this.zapierService.triggerWebhook(workspaceId, 'alert_triggered', data);
  }

  /**
   * Trigger when a campaign starts
   */
  async campaignStarted(workspaceId: string, campaign: any) {
    const data = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget,
      goals: campaign.goals,
    };
    return this.zapierService.triggerWebhook(workspaceId, 'campaign_started', data);
  }

  /**
   * Trigger when a campaign completes
   */
  async campaignCompleted(workspaceId: string, campaign: any) {
    const data = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      analytics: campaign.analytics,
    };
    return this.zapierService.triggerWebhook(workspaceId, 'campaign_completed', data);
  }
}
