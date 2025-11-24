import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from '../services/presence.service';

/**
 * WebSocket gateway for team presence and collaboration
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/presence',
})
export class PresenceGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PresenceGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  /**
   * Update user status
   */
  @SubscribeMessage('presence:status')
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status: 'online' | 'away' | 'offline' },
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      const workspaceId = client.handshake.auth?.workspaceId;

      if (!userId || !workspaceId) {
        return;
      }

      // Update presence based on status
      if (data.status === 'offline') {
        await this.presenceService.setUserOffline(client.id);
      } else {
        await this.presenceService.setUserOnline(userId, workspaceId, client.id);
      }

      // Broadcast to workspace
      const presence = await this.presenceService.getWorkspacePresence(workspaceId);
      this.server.to(`workspace:${workspaceId}`).emit('presence:update', presence);

      this.logger.debug(`User ${userId} status updated to ${data.status}`);
    } catch (error) {
      this.logger.error('Error updating presence status', error);
    }
  }

  /**
   * Broadcast typing indicator
   */
  @SubscribeMessage('presence:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      const workspaceId = client.handshake.auth?.workspaceId;

      if (!userId || !workspaceId) {
        return;
      }

      // Broadcast typing indicator to conversation participants
      this.server.to(`workspace:${workspaceId}`).emit('presence:typing', {
        userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
        timestamp: new Date(),
      });

      this.logger.debug(
        `User ${userId} ${data.isTyping ? 'started' : 'stopped'} typing in conversation ${data.conversationId}`,
      );
    } catch (error) {
      this.logger.error('Error broadcasting typing indicator', error);
    }
  }

  /**
   * Broadcast user activity (viewing a post, editing content, etc.)
   */
  @SubscribeMessage('presence:activity')
  async handleActivity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { 
      type: 'viewing' | 'editing' | 'commenting';
      resourceId: string;
      resourceType: 'post' | 'conversation' | 'campaign';
    },
  ): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      const workspaceId = client.handshake.auth?.workspaceId;

      if (!userId || !workspaceId) {
        return;
      }

      // Broadcast activity to workspace
      this.server.to(`workspace:${workspaceId}`).emit('presence:activity', {
        userId,
        ...data,
        timestamp: new Date(),
      });

      this.logger.debug(
        `User ${userId} is ${data.type} ${data.resourceType} ${data.resourceId}`,
      );
    } catch (error) {
      this.logger.error('Error broadcasting activity', error);
    }
  }

  /**
   * Get online users in workspace
   */
  @SubscribeMessage('presence:online')
  async handleGetOnlineUsers(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const workspaceId = client.handshake.auth?.workspaceId;
      if (!workspaceId) {
        return;
      }

      const presence = await this.presenceService.getWorkspacePresence(workspaceId);
      client.emit('presence:online:list', presence);
    } catch (error) {
      this.logger.error('Error getting online users', error);
    }
  }
}
