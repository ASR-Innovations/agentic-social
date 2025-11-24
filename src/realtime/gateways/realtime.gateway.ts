import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RealtimeService } from '../services/realtime.service';
import { PresenceService } from '../services/presence.service';

/**
 * Main WebSocket gateway handling real-time connections
 * Manages authentication, presence, and core real-time features
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly presenceService: PresenceService,
  ) {}

  /**
   * Initialize gateway
   */
  afterInit(server: Server): void {
    this.realtimeService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      // Extract user info from handshake (assuming JWT auth middleware)
      const userId = client.handshake.auth?.userId;
      const workspaceId = client.handshake.auth?.workspaceId;

      if (!userId || !workspaceId) {
        this.logger.warn('Client connection rejected: missing auth data');
        client.disconnect();
        return;
      }

      // Join workspace room
      await client.join(`workspace:${workspaceId}`);
      await client.join(`user:${userId}`);

      // Set user online
      await this.presenceService.setUserOnline(
        userId,
        workspaceId,
        client.id,
      );

      // Broadcast presence update to workspace
      const presence = await this.presenceService.getWorkspacePresence(workspaceId);
      this.server.to(`workspace:${workspaceId}`).emit('presence:update', presence);

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Workspace: ${workspaceId})`,
      );

      // Send connection confirmation
      client.emit('connected', {
        socketId: client.id,
        userId,
        workspaceId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error handling connection', error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket): Promise<void> {
    try {
      const userId = client.handshake.auth?.userId;
      const workspaceId = client.handshake.auth?.workspaceId;

      if (userId && workspaceId) {
        // Set user offline
        await this.presenceService.setUserOffline(client.id);

        // Broadcast presence update to workspace
        const presence = await this.presenceService.getWorkspacePresence(workspaceId);
        this.server.to(`workspace:${workspaceId}`).emit('presence:update', presence);

        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
      }
    } catch (error) {
      this.logger.error('Error handling disconnection', error);
    }
  }

  /**
   * Handle page navigation
   */
  @SubscribeMessage('page:navigate')
  async handlePageNavigate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page: string },
  ): Promise<void> {
    try {
      await this.presenceService.updateUserPage(client.id, data.page);
      
      const workspaceId = client.handshake.auth?.workspaceId;
      if (workspaceId) {
        const presence = await this.presenceService.getWorkspacePresence(workspaceId);
        this.server.to(`workspace:${workspaceId}`).emit('presence:update', presence);
      }
    } catch (error) {
      this.logger.error('Error handling page navigate', error);
    }
  }

  /**
   * Handle ping for connection health check
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date() });
  }

  /**
   * Get workspace presence
   */
  @SubscribeMessage('presence:get')
  async handleGetPresence(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const workspaceId = client.handshake.auth?.workspaceId;
      if (!workspaceId) {
        return;
      }

      const presence = await this.presenceService.getWorkspacePresence(workspaceId);
      client.emit('presence:list', presence);
    } catch (error) {
      this.logger.error('Error getting presence', error);
    }
  }
}