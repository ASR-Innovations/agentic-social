import { Injectable, Logger } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface Notification {
  id: string;
  userId: string;
  workspaceId: string;
  type: 'mention' | 'message' | 'approval' | 'alert' | 'post_published' | 'post_failed' | 'crisis' | 'review';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

/**
 * Service managing real-time notifications
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Send notification to user
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      read: false,
      createdAt: new Date(),
    };

    // Broadcast to user via WebSocket
    this.realtimeService.broadcastToUser(
      notification.userId,
      'notification',
      fullNotification,
    );

    this.logger.debug(
      `Sent ${notification.type} notification to user ${notification.userId}`,
    );
  }

  /**
   * Send notification to all users in workspace
   */
  async sendWorkspaceNotification(
    workspaceId: string,
    notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>,
  ): Promise<void> {
    // Get all users in workspace
    const users = await this.prisma.user.findMany({
      where: { workspaceId },
      select: { id: true },
    });

    // Send to each user
    for (const user of users) {
      await this.sendNotification({
        ...notification,
        userId: user.id,
      });
    }

    this.logger.debug(
      `Sent ${notification.type} notification to ${users.length} users in workspace ${workspaceId}`,
    );
  }

  /**
   * Send mention notification
   */
  async sendMentionNotification(
    userId: string,
    workspaceId: string,
    mentionData: {
      platform: string;
      author: string;
      content: string;
      url: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'mention',
      title: 'New Mention',
      message: `${mentionData.author} mentioned you on ${mentionData.platform}`,
      data: mentionData,
    });
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    userId: string,
    workspaceId: string,
    messageData: {
      platform: string;
      sender: string;
      preview: string;
      conversationId: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'message',
      title: 'New Message',
      message: `${messageData.sender} sent you a message on ${messageData.platform}`,
      data: messageData,
    });
  }

  /**
   * Send approval request notification
   */
  async sendApprovalNotification(
    userId: string,
    workspaceId: string,
    approvalData: {
      postId: string;
      requester: string;
      content: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'approval',
      title: 'Approval Required',
      message: `${approvalData.requester} submitted a post for your approval`,
      data: approvalData,
    });
  }

  /**
   * Send crisis alert notification
   */
  async sendCrisisAlert(
    workspaceId: string,
    crisisData: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mentionCount: number;
      sentimentScore: number;
    },
  ): Promise<void> {
    await this.sendWorkspaceNotification(workspaceId, {
      workspaceId,
      type: 'crisis',
      title: 'Crisis Alert',
      message: `Potential crisis detected: ${crisisData.description}`,
      data: crisisData,
    });
  }

  /**
   * Send post published notification
   */
  async sendPostPublishedNotification(
    userId: string,
    workspaceId: string,
    postData: {
      postId: string;
      platforms: string[];
      content: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'post_published',
      title: 'Post Published',
      message: `Your post was successfully published to ${postData.platforms.join(', ')}`,
      data: postData,
    });
  }

  /**
   * Send post failed notification
   */
  async sendPostFailedNotification(
    userId: string,
    workspaceId: string,
    postData: {
      postId: string;
      platform: string;
      error: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'post_failed',
      title: 'Post Failed',
      message: `Failed to publish post to ${postData.platform}: ${postData.error}`,
      data: postData,
    });
  }

  /**
   * Send review notification
   */
  async sendReviewNotification(
    userId: string,
    workspaceId: string,
    reviewData: {
      platform: string;
      rating: number;
      author: string;
      sentiment: string;
    },
  ): Promise<void> {
    await this.sendNotification({
      userId,
      workspaceId,
      type: 'review',
      title: 'New Review',
      message: `New ${reviewData.rating}-star review from ${reviewData.author} on ${reviewData.platform}`,
      data: reviewData,
    });
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
