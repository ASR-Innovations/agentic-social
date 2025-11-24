import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

/**
 * WebSocket gateway for real-time notifications
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Mark notification as read
   */
  @SubscribeMessage('notification:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        return;
      }

      // Acknowledge read status
      client.emit('notification:read:ack', {
        notificationId: data.notificationId,
        timestamp: new Date(),
      });

      this.logger.debug(`Notification ${data.notificationId} marked as read by user ${userId}`);
    } catch (error) {
      this.logger.error('Error marking notification as read', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  @SubscribeMessage('notification:read:all')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        return;
      }

      client.emit('notification:read:all:ack', {
        timestamp: new Date(),
      });

      this.logger.debug(`All notifications marked as read by user ${userId}`);
    } catch (error) {
      this.logger.error('Error marking all notifications as read', error);
    }
  }

  /**
   * Subscribe to notification types
   */
  @SubscribeMessage('notification:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { types: string[] },
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        return;
      }

      // Join notification type rooms
      for (const type of data.types) {
        await client.join(`notification:${type}`);
      }

      client.emit('notification:subscribe:ack', {
        types: data.types,
        timestamp: new Date(),
      });

      this.logger.debug(`User ${userId} subscribed to notification types: ${data.types.join(', ')}`);
    } catch (error) {
      this.logger.error('Error subscribing to notifications', error);
    }
  }
}
