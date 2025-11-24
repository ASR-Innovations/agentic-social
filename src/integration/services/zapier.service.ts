import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookService } from './webhook.service';
import * as crypto from 'crypto';

@Injectable()
export class ZapierService {
  constructor(
    private prisma: PrismaService,
    private webhookService: WebhookService,
  ) {}

  // ============================================
  // Zapier Authentication
  // ============================================

  /**
   * Authenticate Zapier using API key
   * This is called by Zapier during the authentication test
   */
  async authenticate(apiKey: string): Promise<{ success: boolean; workspace?: any }> {
    const key = await this.prisma.apiKey.findFirst({
      where: {
        key: this.hashApiKey(apiKey),
        status: 'ACTIVE',
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!key) {
      throw new BadRequestException('Invalid API key');
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: { id: key.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return {
      success: true,
      workspace: key.workspace,
    };
  }

  // ============================================
  // Zapier Triggers (Webhooks)
  // ============================================

  /**
   * Subscribe to a Zapier trigger
   * This is called when a user sets up a Zap with one of our triggers
   */
  async subscribeTrigger(
    workspaceId: string,
    userId: string,
    triggerKey: string,
    targetUrl: string,
    subscriptionId?: string,
  ) {
    // Validate trigger key
    const validTriggers = this.getAvailableTriggers();
    const trigger = validTriggers.find((t) => t.key === triggerKey);

    if (!trigger) {
      throw new BadRequestException(`Invalid trigger key: ${triggerKey}`);
    }

    // Create or update Zapier trigger subscription
    const zapierTrigger = await this.prisma.zapierTrigger.upsert({
      where: {
        workspaceId_triggerKey_subscriptionId: {
          workspaceId,
          triggerKey,
          subscriptionId: subscriptionId || '',
        },
      },
      create: {
        workspaceId,
        name: trigger.name,
        triggerKey,
        description: trigger.description,
        subscriptionId,
        targetUrl,
        isActive: true,
        createdBy: userId,
      },
      update: {
        targetUrl,
        isActive: true,
      },
    });

    return {
      id: zapierTrigger.id,
      message: 'Successfully subscribed to trigger',
    };
  }

  /**
   * Unsubscribe from a Zapier trigger
   * This is called when a user deletes or turns off a Zap
   */
  async unsubscribeTrigger(
    workspaceId: string,
    triggerKey: string,
    subscriptionId?: string,
  ) {
    const trigger = await this.prisma.zapierTrigger.findFirst({
      where: {
        workspaceId,
        triggerKey,
        subscriptionId,
      },
    });

    if (!trigger) {
      throw new NotFoundException('Trigger subscription not found');
    }

    await this.prisma.zapierTrigger.update({
      where: { id: trigger.id },
      data: { isActive: false },
    });

    return { message: 'Successfully unsubscribed from trigger' };
  }

  /**
   * Get sample data for a trigger
   * This is used by Zapier to show users what data they'll receive
   */
  async getTriggerSample(triggerKey: string, workspaceId: string) {
    const samples = {
      post_published: {
        id: 'post_123',
        content: 'Check out our new product launch! 🚀',
        platforms: ['INSTAGRAM', 'FACEBOOK'],
        publishedAt: new Date().toISOString(),
        author: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        campaign: {
          id: 'campaign_123',
          name: 'Product Launch 2024',
        },
        analytics: {
          likes: 150,
          comments: 25,
          shares: 10,
        },
      },
      mention_received: {
        id: 'mention_123',
        platform: 'TWITTER',
        author: {
          username: 'customer123',
          name: 'Happy Customer',
          followers: 1500,
        },
        content: 'Love this product! @yourbrand',
        sentiment: 'POSITIVE',
        sentimentScore: 0.85,
        url: 'https://twitter.com/customer123/status/123',
        publishedAt: new Date().toISOString(),
      },
      message_received: {
        id: 'message_123',
        platform: 'INSTAGRAM',
        type: 'DM',
        from: {
          username: 'customer456',
          name: 'Potential Customer',
        },
        content: 'Hi, I have a question about your product...',
        sentiment: 'NEUTRAL',
        priority: 'MEDIUM',
        receivedAt: new Date().toISOString(),
      },
      post_scheduled: {
        id: 'post_456',
        content: 'Coming soon: Our biggest sale of the year! 🎉',
        platforms: ['INSTAGRAM', 'FACEBOOK', 'TWITTER'],
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        author: {
          id: 'user_123',
          name: 'Marketing Team',
        },
      },
      alert_triggered: {
        id: 'alert_123',
        type: 'SENTIMENT_SHIFT',
        severity: 'HIGH',
        title: 'Negative sentiment spike detected',
        description: 'Sentiment has dropped by 30% in the last hour',
        mentionCount: 45,
        sentimentShift: -0.3,
        triggeredAt: new Date().toISOString(),
      },
    };

    return samples[triggerKey as keyof typeof samples] || { message: 'No sample data available' };
  }

  /**
   * Trigger a Zapier webhook
   * This is called internally when an event occurs that should trigger Zaps
   */
  async triggerWebhook(
    workspaceId: string,
    triggerKey: string,
    data: any,
  ) {
    // Find all active subscriptions for this trigger
    const subscriptions = await this.prisma.zapierTrigger.findMany({
      where: {
        workspaceId,
        triggerKey,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return { triggered: 0 };
    }

    // Send webhook to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          if (!subscription.targetUrl) {
            throw new Error('Target URL is missing');
          }
          const response = await fetch(subscription.targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Zapier-Trigger': triggerKey,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          const err = error as Error;
          console.error(`Failed to trigger Zapier webhook for ${subscription.id}:`, err);
          return { success: false, subscriptionId: subscription.id, error: err.message };
        }
      }),
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;

    return {
      triggered: successful,
      total: subscriptions.length,
    };
  }

  /**
   * Get list of available triggers
   */
  getAvailableTriggers() {
    return [
      {
        key: 'post_published',
        name: 'Post Published',
        description: 'Triggers when a post is successfully published to social media',
        noun: 'Post',
      },
      {
        key: 'post_scheduled',
        name: 'Post Scheduled',
        description: 'Triggers when a post is scheduled for future publishing',
        noun: 'Post',
      },
      {
        key: 'mention_received',
        name: 'Mention Received',
        description: 'Triggers when your brand is mentioned on social media',
        noun: 'Mention',
      },
      {
        key: 'message_received',
        name: 'Message Received',
        description: 'Triggers when a new message or comment is received',
        noun: 'Message',
      },
      {
        key: 'alert_triggered',
        name: 'Alert Triggered',
        description: 'Triggers when a listening alert is activated',
        noun: 'Alert',
      },
      {
        key: 'campaign_started',
        name: 'Campaign Started',
        description: 'Triggers when a campaign is activated',
        noun: 'Campaign',
      },
      {
        key: 'campaign_completed',
        name: 'Campaign Completed',
        description: 'Triggers when a campaign ends',
        noun: 'Campaign',
      },
    ];
  }

  // ============================================
  // Zapier Actions
  // ============================================

  /**
   * Create a post via Zapier action
   */
  async createPost(workspaceId: string, userId: string, data: any) {
    try {
      // Validate required fields
      if (!data.content) {
        throw new BadRequestException('Content is required');
      }

      if (!data.platforms || data.platforms.length === 0) {
        throw new BadRequestException('At least one platform is required');
      }

      // Map Zapier data to our post format
      const postData = {
        workspaceId,
        authorId: userId,
        content: {
          text: data.content,
          hashtags: data.hashtags || [],
          mentions: data.mentions || [],
          link: data.link,
          firstComment: data.firstComment,
          media: data.mediaUrls ? data.mediaUrls.map((url: string) => ({ url })) : [],
        },
        platforms: data.platforms.map((platform: string) => ({
          platform: platform.toUpperCase(),
          accountId: data.accountIds?.[platform],
        })),
        status: data.publishNow ? 'PUBLISHING' : 'DRAFT',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        tags: data.tags || [],
        aiGenerated: false,
      };

      // Create the post
      const post = await this.prisma.post.create({
        data: {
          workspaceId: postData.workspaceId,
          authorId: postData.authorId,
          content: postData.content,
          status: postData.status as any, // Type assertion for Prisma enum
          scheduledAt: postData.scheduledAt,
          tags: postData.tags,
          aiGenerated: postData.aiGenerated,
        },
      });

      // Log the action
      await this.prisma.zapierAction.create({
        data: {
          workspaceId,
          actionKey: 'create_post',
          inputData: data,
          outputData: { postId: post.id },
          status: 'SUCCESS',
          executedBy: userId,
        },
      });

      return {
        id: post.id,
        status: post.status,
        scheduledAt: post.scheduledAt,
        createdAt: post.createdAt,
      };
    } catch (error) {
      const err = error as Error;
      // Log failed action
      await this.prisma.zapierAction.create({
        data: {
          workspaceId,
          actionKey: 'create_post',
          inputData: data,
          status: 'FAILED',
          error: err.message,
          executedBy: userId,
        },
      });

      throw error;
    }
  }

  /**
   * Schedule a post via Zapier action
   */
  async schedulePost(workspaceId: string, userId: string, data: any) {
    try {
      if (!data.scheduledAt) {
        throw new BadRequestException('scheduledAt is required for scheduling');
      }

      const result = await this.createPost(workspaceId, userId, {
        ...data,
        publishNow: false,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get list of available actions
   */
  getAvailableActions() {
    return [
      {
        key: 'create_post',
        name: 'Create Post',
        description: 'Create and optionally publish a social media post',
        noun: 'Post',
      },
      {
        key: 'schedule_post',
        name: 'Schedule Post',
        description: 'Schedule a post for future publishing',
        noun: 'Post',
      },
    ];
  }

  // ============================================
  // Helper Methods
  // ============================================

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Map internal event to Zapier trigger data
   */
  mapEventToTriggerData(event: string, data: any) {
    const mappings = {
      POST_PUBLISHED: (data: any) => ({
        id: data.id,
        content: data.content?.text || '',
        platforms: data.platformPosts?.map((p: any) => p.platform) || [],
        publishedAt: data.publishedAt,
        author: {
          id: data.authorId,
          name: data.author?.name,
          email: data.author?.email,
        },
        campaign: data.campaign ? {
          id: data.campaignId,
          name: data.campaign.name,
        } : null,
        url: data.url,
      }),
      MENTION_RECEIVED: (data: any) => ({
        id: data.id,
        platform: data.platform,
        author: {
          username: data.authorUsername,
          name: data.authorName,
          followers: data.authorFollowers,
        },
        content: data.content,
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        url: data.url,
        publishedAt: data.publishedAt,
      }),
      MESSAGE_RECEIVED: (data: any) => ({
        id: data.id,
        platform: data.platform,
        type: data.type,
        from: {
          id: data.participantId,
          username: data.participantName,
        },
        content: data.messages?.[0]?.content || '',
        sentiment: data.sentiment,
        priority: data.priority,
        receivedAt: data.createdAt,
      }),
      ALERT_TRIGGERED: (data: any) => ({
        id: data.id,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        mentionCount: data.mentionCount,
        sentimentShift: data.sentimentShift,
        triggeredAt: data.createdAt,
      }),
    };

    const mapper = mappings[event as keyof typeof mappings];
    return mapper ? mapper(data) : data;
  }
}
