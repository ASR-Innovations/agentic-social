import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { queryClient } from './query-client';
import { queryKeys } from './query-client';

// WebSocket event types
export interface AgentTaskEvent {
  agentId: string;
  agentName: string;
  taskId: string;
  taskDescription: string;
  status: 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface AgentStatusEvent {
  agentId: string;
  agentName: string;
  status: 'active' | 'idle' | 'error';
  timestamp: string;
}

export interface NewMessageEvent {
  conversationId: string;
  messageId: string;
  platform: string;
  sender: string;
  preview: string;
  timestamp: string;
}

export interface PostPublishedEvent {
  postId: string;
  platform: string;
  platformPostId: string;
  status: 'published' | 'failed';
  error?: string;
  timestamp: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  /**
   * Connect to the WebSocket server
   */
  connect(token: string) {
    if (this.socket?.connected || this.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    console.log('Connecting to WebSocket:', wsUrl);

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
    this.isConnecting = false;
  }

  /**
   * Set up all WebSocket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      toast.success('Connected to real-time updates');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Agent events
    this.socket.on('agent:task:completed', (data: AgentTaskEvent) => {
      this.handleAgentTaskCompleted(data);
      this.emitToHandlers('agent:task:completed', data);
    });

    this.socket.on('agent:status:changed', (data: AgentStatusEvent) => {
      this.handleAgentStatusChanged(data);
      this.emitToHandlers('agent:status:changed', data);
    });

    // Inbox events
    this.socket.on('inbox:message:new', (data: NewMessageEvent) => {
      this.handleNewMessage(data);
      this.emitToHandlers('inbox:message:new', data);
    });

    // Post events
    this.socket.on('post:published', (data: PostPublishedEvent) => {
      this.handlePostPublished(data);
      this.emitToHandlers('post:published', data);
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Lost connection to server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }

  /**
   * Handle agent task completed event
   */
  private handleAgentTaskCompleted(data: AgentTaskEvent) {
    console.log('Agent task completed:', data);

    // Invalidate agent-related queries
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.statistics() });
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.activity() });

    // Show notification
    if (data.status === 'completed') {
      toast.success(`${data.agentName} completed: ${data.taskDescription}`);
    } else {
      toast.error(`${data.agentName} failed: ${data.error || 'Unknown error'}`);
    }
  }

  /**
   * Handle agent status changed event
   */
  private handleAgentStatusChanged(data: AgentStatusEvent) {
    console.log('Agent status changed:', data);

    // Invalidate agent queries
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(data.agentId) });

    // Show notification for errors
    if (data.status === 'error') {
      toast.error(`${data.agentName} encountered an error`);
    }
  }

  /**
   * Handle new message event
   */
  private handleNewMessage(data: NewMessageEvent) {
    console.log('New message received:', data);

    // Invalidate inbox queries
    queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.inbox.conversations() });

    // Show notification
    toast(`New message from ${data.platform}: ${data.preview}`, {
      duration: 6000,
      icon: '💬',
    });
  }

  /**
   * Handle post published event
   */
  private handlePostPublished(data: PostPublishedEvent) {
    console.log('Post published:', data);

    // Invalidate post queries
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(data.postId) });

    // Show notification
    if (data.status === 'published') {
      toast.success(`Post published successfully on ${data.platform}`);
    } else {
      toast.error(`Failed to publish post on ${data.platform}: ${data.error}`);
    }
  }

  /**
   * Register a custom event handler
   */
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister a custom event handler
   */
  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emitToHandlers(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.eventHandlers.clear();
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get the socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient();

// Export default
export default wsClient;
