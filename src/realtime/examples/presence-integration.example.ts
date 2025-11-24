/**
 * Example: Integrating team presence and collaboration
 * 
 * This example shows how to use the PresenceService and PresenceGateway
 * to track team member presence and activity.
 */

import { Injectable } from '@nestjs/common';
import { PresenceService } from '../services/presence.service';

@Injectable()
export class PresenceIntegrationExample {
  constructor(private readonly presenceService: PresenceService) {}

  /**
   * Example: Check if user is online
   */
  async checkUserOnline(userId: string, workspaceId: string): Promise<boolean> {
    return this.presenceService.isUserOnline(userId, workspaceId);
  }

  /**
   * Example: Get all online users in workspace
   */
  async getOnlineUsers(workspaceId: string) {
    return this.presenceService.getWorkspacePresence(workspaceId);
  }

  /**
   * Example: Get online user count
   */
  async getOnlineCount(workspaceId: string): Promise<number> {
    return this.presenceService.getOnlineUserCount(workspaceId);
  }

  /**
   * Example: Get user's current activity
   */
  async getUserActivity(userId: string, workspaceId: string) {
    const presence = await this.presenceService.getUserPresence(userId, workspaceId);
    
    if (!presence) {
      return { online: false };
    }

    return {
      online: presence.status === 'online',
      status: presence.status,
      currentPage: presence.currentPage,
      lastSeen: presence.lastSeen,
    };
  }
}

/**
 * Frontend Integration Example (React/TypeScript)
 * 
 * ```typescript
 * import { io, Socket } from 'socket.io-client';
 * import { useEffect, useState } from 'react';
 * 
 * interface PresenceInfo {
 *   userId: string;
 *   status: 'online' | 'away' | 'offline';
 *   currentPage?: string;
 *   lastSeen: Date;
 * }
 * 
 * export function usePresence(workspaceId: string) {
 *   const [socket, setSocket] = useState<Socket | null>(null);
 *   const [onlineUsers, setOnlineUsers] = useState<PresenceInfo[]>([]);
 *   const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
 * 
 *   useEffect(() => {
 *     // Connect to presence namespace
 *     const newSocket = io('http://localhost:3001/presence', {
 *       auth: {
 *         userId: 'user-id',
 *         workspaceId: workspaceId,
 *       },
 *     });
 * 
 *     // Get initial online users
 *     newSocket.emit('presence:online');
 * 
 *     // Listen for presence updates
 *     newSocket.on('presence:update', (presence: PresenceInfo[]) => {
 *       console.log('Presence update:', presence);
 *       setOnlineUsers(presence);
 *     });
 * 
 *     // Listen for online users list
 *     newSocket.on('presence:online:list', (presence: PresenceInfo[]) => {
 *       setOnlineUsers(presence);
 *     });
 * 
 *     // Listen for typing indicators
 *     newSocket.on('presence:typing', (data) => {
 *       if (data.isTyping) {
 *         setTypingUsers(prev => new Map(prev).set(data.conversationId, data.userId));
 *       } else {
 *         setTypingUsers(prev => {
 *           const next = new Map(prev);
 *           next.delete(data.conversationId);
 *           return next;
 *         });
 *       }
 *     });
 * 
 *     // Listen for user activity
 *     newSocket.on('presence:activity', (data) => {
 *       console.log('User activity:', data);
 *     });
 * 
 *     setSocket(newSocket);
 * 
 *     return () => {
 *       newSocket.close();
 *     };
 *   }, [workspaceId]);
 * 
 *   const updateStatus = (status: 'online' | 'away' | 'offline') => {
 *     socket?.emit('presence:status', { status });
 *   };
 * 
 *   const sendTyping = (conversationId: string, isTyping: boolean) => {
 *     socket?.emit('presence:typing', { conversationId, isTyping });
 *   };
 * 
 *   const sendActivity = (
 *     type: 'viewing' | 'editing' | 'commenting',
 *     resourceId: string,
 *     resourceType: 'post' | 'conversation' | 'campaign'
 *   ) => {
 *     socket?.emit('presence:activity', { type, resourceId, resourceType });
 *   };
 * 
 *   return {
 *     onlineUsers,
 *     typingUsers,
 *     updateStatus,
 *     sendTyping,
 *     sendActivity,
 *   };
 * }
 * ```
 * 
 * Example: Display online team members
 * 
 * ```typescript
 * function OnlineTeamMembers() {
 *   const { onlineUsers } = usePresence('workspace-123');
 * 
 *   return (
 *     <div className="online-users">
 *       <h3>Team Online ({onlineUsers.length})</h3>
 *       <ul>
 *         {onlineUsers.map(user => (
 *           <li key={user.userId}>
 *             <span className={`status-dot ${user.status}`} />
 *             {user.userId}
 *             {user.currentPage && (
 *               <span className="current-page"> - {user.currentPage}</span>
 *             )}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Example: Typing indicator in conversation
 * 
 * ```typescript
 * function ConversationTypingIndicator({ conversationId }: { conversationId: string }) {
 *   const { typingUsers, sendTyping } = usePresence('workspace-123');
 *   const [isTyping, setIsTyping] = useState(false);
 * 
 *   useEffect(() => {
 *     if (isTyping) {
 *       sendTyping(conversationId, true);
 *       const timeout = setTimeout(() => {
 *         sendTyping(conversationId, false);
 *         setIsTyping(false);
 *       }, 3000);
 *       return () => clearTimeout(timeout);
 *     }
 *   }, [isTyping, conversationId]);
 * 
 *   const typingUserId = typingUsers.get(conversationId);
 * 
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         onChange={() => setIsTyping(true)}
 *         placeholder="Type a message..."
 *       />
 *       {typingUserId && (
 *         <div className="typing-indicator">
 *           {typingUserId} is typing...
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
