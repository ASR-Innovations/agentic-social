/**
 * Example: Integrating real-time notifications
 * 
 * This example shows how to use the NotificationService to send
 * real-time notifications to users.
 */

import { Injectable } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class NotificationIntegrationExample {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Example: Send mention notification
   * Call this when a user is mentioned on social media
   */
  async sendMentionNotification(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.notificationService.sendMentionNotification(
      userId,
      workspaceId,
      {
        platform: 'Twitter',
        author: '@johndoe',
        content: 'Great product! @yourbrand is amazing!',
        url: 'https://twitter.com/johndoe/status/123456',
      },
    );
  }

  /**
   * Example: Send message notification
   * Call this when a new message arrives
   */
  async sendMessageNotification(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.notificationService.sendMessageNotification(
      userId,
      workspaceId,
      {
        platform: 'Instagram',
        sender: 'jane_smith',
        preview: 'Hi! I have a question about your product...',
        conversationId: 'conv_123',
      },
    );
  }

  /**
   * Example: Send approval notification
   * Call this when a post needs approval
   */
  async sendApprovalNotification(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.notificationService.sendApprovalNotification(
      userId,
      workspaceId,
      {
        postId: 'post_123',
        requester: 'John Doe',
        content: 'Check out our new product launch! 🚀',
      },
    );
  }

  /**
   * Example: Send crisis alert
   * Call this when a potential crisis is detected
   */
  async sendCrisisAlert(workspaceId: string): Promise<void> {
    await this.notificationService.sendCrisisAlert(workspaceId, {
      severity: 'high',
      description: 'Negative sentiment spike detected',
      mentionCount: 150,
      sentimentScore: -0.75,
    });
  }

  /**
   * Example: Send post published notification
   * Call this when a post is successfully published
   */
  async sendPostPublishedNotification(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.notificationService.sendPostPublishedNotification(
      userId,
      workspaceId,
      {
        postId: 'post_123',
        platforms: ['Instagram', 'Twitter', 'Facebook'],
        content: 'Your post has been published successfully!',
      },
    );
  }

  /**
   * Example: Send post failed notification
   * Call this when a post fails to publish
   */
  async sendPostFailedNotification(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.notificationService.sendPostFailedNotification(
      userId,
      workspaceId,
      {
        postId: 'post_123',
        platform: 'Instagram',
        error: 'Invalid access token. Please reconnect your account.',
      },
    );
  }
}

/**
 * Frontend Integration Example (React/TypeScript)
 * 
 * ```typescript
 * import { io, Socket } from 'socket.io-client';
 * import { useEffect, useState } from 'react';
 * 
 * export function useNotifications(userId: string, workspaceId: string) {
 *   const [socket, setSocket] = useState<Socket | null>(null);
 *   const [notifications, setNotifications] = useState<any[]>([]);
 * 
 *   useEffect(() => {
 *     // Connect to notifications namespace
 *     const newSocket = io('http://localhost:3001/notifications', {
 *       auth: {
 *         userId: userId,
 *         workspaceId: workspaceId,
 *       },
 *     });
 * 
 *     // Subscribe to notification types
 *     newSocket.emit('notification:subscribe', {
 *       types: ['mention', 'message', 'approval', 'crisis'],
 *     });
 * 
 *     // Listen for new notifications
 *     newSocket.on('notification', (notification) => {
 *       console.log('New notification:', notification);
 *       setNotifications(prev => [notification, ...prev]);
 *       
 *       // Show browser notification
 *       if (Notification.permission === 'granted') {
 *         new Notification(notification.title, {
 *           body: notification.message,
 *           icon: '/logo.png',
 *         });
 *       }
 *     });
 * 
 *     setSocket(newSocket);
 * 
 *     return () => {
 *       newSocket.close();
 *     };
 *   }, [userId, workspaceId]);
 * 
 *   const markAsRead = (notificationId: string) => {
 *     socket?.emit('notification:read', { notificationId });
 *   };
 * 
 *   const markAllAsRead = () => {
 *     socket?.emit('notification:read:all');
 *   };
 * 
 *   return { notifications, markAsRead, markAllAsRead };
 * }
 * ```
 */
