import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

/**
 * Core real-time service managing WebSocket connections and broadcasts
 */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server;

  /**
   * Set the Socket.IO server instance
   */
  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.IO server initialized');
  }

  /**
   * Broadcast event to all clients in a workspace
   */
  broadcastToWorkspace(workspaceId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO server not initialized');
      return;
    }

    const room = `workspace:${workspaceId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Broadcast ${event} to workspace ${workspaceId}`);
  }

  /**
   * Broadcast event to specific user
   */
  broadcastToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO server not initialized');
      return;
    }

    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Broadcast ${event} to user ${userId}`);
  }

  /**
   * Broadcast event to all clients
   */
  broadcastToAll(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO server not initialized');
      return;
    }

    this.server.emit(event, data);
    this.logger.debug(`Broadcast ${event} to all clients`);
  }

  /**
   * Get connected clients count for a workspace
   */
  getWorkspaceConnectionCount(workspaceId: string): number {
    if (!this.server) {
      return 0;
    }

    const room = `workspace:${workspaceId}`;
    const sockets = this.server.sockets.adapter.rooms.get(room);
    return sockets ? sockets.size : 0;
  }

  /**
   * Get all connected clients count
   */
  getTotalConnectionCount(): number {
    if (!this.server) {
      return 0;
    }

    return this.server.sockets.sockets.size;
  }
}
