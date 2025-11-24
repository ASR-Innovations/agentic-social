import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PresenceInfo {
  userId: string;
  workspaceId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  socketId: string;
}

/**
 * Service managing user presence and online status
 */
@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private presenceMap = new Map<string, PresenceInfo>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mark user as online
   */
  async setUserOnline(
    userId: string,
    workspaceId: string,
    socketId: string,
    currentPage?: string,
  ): Promise<PresenceInfo> {
    const presence: PresenceInfo = {
      userId,
      workspaceId,
      status: 'online',
      lastSeen: new Date(),
      currentPage,
      socketId,
    };

    this.presenceMap.set(socketId, presence);
    this.logger.debug(`User ${userId} is now online in workspace ${workspaceId}`);

    return presence;
  }

  /**
   * Mark user as offline
   */
  async setUserOffline(socketId: string): Promise<void> {
    const presence = this.presenceMap.get(socketId);
    if (presence) {
      presence.status = 'offline';
      presence.lastSeen = new Date();
      this.presenceMap.delete(socketId);
      this.logger.debug(`User ${presence.userId} is now offline`);
    }
  }

  /**
   * Update user's current page
   */
  async updateUserPage(socketId: string, currentPage: string): Promise<void> {
    const presence = this.presenceMap.get(socketId);
    if (presence) {
      presence.currentPage = currentPage;
      presence.lastSeen = new Date();
    }
  }

  /**
   * Get all online users in a workspace
   */
  async getWorkspacePresence(workspaceId: string): Promise<PresenceInfo[]> {
    const presenceList: PresenceInfo[] = [];
    
    for (const presence of this.presenceMap.values()) {
      if (presence.workspaceId === workspaceId && presence.status === 'online') {
        presenceList.push(presence);
      }
    }

    return presenceList;
  }

  /**
   * Get user's presence info
   */
  async getUserPresence(userId: string, workspaceId: string): Promise<PresenceInfo | null> {
    for (const presence of this.presenceMap.values()) {
      if (presence.userId === userId && presence.workspaceId === workspaceId) {
        return presence;
      }
    }

    return null;
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId: string, workspaceId: string): Promise<boolean> {
    const presence = await this.getUserPresence(userId, workspaceId);
    return presence?.status === 'online';
  }

  /**
   * Get count of online users in workspace
   */
  async getOnlineUserCount(workspaceId: string): Promise<number> {
    const presence = await this.getWorkspacePresence(workspaceId);
    return presence.length;
  }

  /**
   * Clean up stale presence data (users who haven't been seen in 5 minutes)
   */
  async cleanupStalePresence(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const staleSocketIds: string[] = [];

    for (const [socketId, presence] of this.presenceMap.entries()) {
      if (presence.lastSeen < fiveMinutesAgo) {
        staleSocketIds.push(socketId);
      }
    }

    for (const socketId of staleSocketIds) {
      this.presenceMap.delete(socketId);
    }

    if (staleSocketIds.length > 0) {
      this.logger.debug(`Cleaned up ${staleSocketIds.length} stale presence records`);
    }
  }
}
