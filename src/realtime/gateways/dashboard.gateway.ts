import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket gateway for real-time dashboard updates
 * Broadcasts analytics, metrics, and performance data
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/dashboard',
})
export class DashboardGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const workspaceId = client.handshake.auth?.workspaceId;
      if (!workspaceId) {
        client.disconnect();
        return;
      }

      // Join workspace dashboard room
      await client.join(`dashboard:${workspaceId}`);

      this.logger.log(`Dashboard client connected: ${client.id} (Workspace: ${workspaceId})`);
    } catch (error) {
      this.logger.error('Error handling dashboard connection', error);
      client.disconnect();
    }
  }

  /**
   * Subscribe to specific metric updates
   */
  @SubscribeMessage('dashboard:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const workspaceId = client.handshake.auth?.workspaceId;
      if (!workspaceId) {
        return;
      }

      // Join metric-specific rooms
      await client.join(`metrics:${workspaceId}`);
      await client.join(`posts:${workspaceId}`);
      await client.join(`analytics:${workspaceId}`);

      client.emit('dashboard:subscribe:ack', {
        workspaceId,
        timestamp: new Date(),
      });

      this.logger.debug(`Client ${client.id} subscribed to dashboard updates`);
    } catch (error) {
      this.logger.error('Error subscribing to dashboard', error);
    }
  }

  /**
   * Broadcast metric update to workspace
   */
  broadcastMetricUpdate(workspaceId: string, metric: any): void {
    this.server.to(`metrics:${workspaceId}`).emit('dashboard:metric:update', {
      metric,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast post status update
   */
  broadcastPostUpdate(workspaceId: string, post: any): void {
    this.server.to(`posts:${workspaceId}`).emit('dashboard:post:update', {
      post,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast analytics update
   */
  broadcastAnalyticsUpdate(workspaceId: string, analytics: any): void {
    this.server.to(`analytics:${workspaceId}`).emit('dashboard:analytics:update', {
      analytics,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast follower count update
   */
  broadcastFollowerUpdate(workspaceId: string, data: {
    platform: string;
    accountId: string;
    followers: number;
    change: number;
  }): void {
    this.server.to(`dashboard:${workspaceId}`).emit('dashboard:followers:update', {
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast engagement update
   */
  broadcastEngagementUpdate(workspaceId: string, data: {
    postId: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }): void {
    this.server.to(`dashboard:${workspaceId}`).emit('dashboard:engagement:update', {
      ...data,
      timestamp: new Date(),
    });
  }
}
