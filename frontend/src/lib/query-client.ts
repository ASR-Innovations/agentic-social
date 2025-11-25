import { QueryClient } from '@tanstack/react-query';

// Error types for better error handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
}

export class APIError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create and configure the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error instanceof APIError && error.type === ErrorType.AUTH_ERROR) {
          return false;
        }
        // Don't retry on validation errors
        if (error instanceof APIError && error.type === ErrorType.VALIDATION_ERROR) {
          return false;
        }
        // Don't retry on not found errors
        if (error instanceof APIError && error.type === ErrorType.NOT_FOUND_ERROR) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Default stale time (data considered fresh for this duration)
      staleTime: 30000, // 30 seconds
      
      // GC time (how long unused data stays in cache before garbage collection)
      gcTime: 300000, // 5 minutes
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Agent keys
  agents: {
    all: ['agents'] as const,
    list: () => [...queryKeys.agents.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.agents.all, 'detail', id] as const,
    statistics: () => [...queryKeys.agents.all, 'statistics'] as const,
    activity: () => [...queryKeys.agents.all, 'activity'] as const,
  },
  
  // Analytics keys
  analytics: {
    all: ['analytics'] as const,
    overview: (params?: any) => [...queryKeys.analytics.all, 'overview', params] as const,
    trends: (params?: any) => [...queryKeys.analytics.all, 'trends', params] as const,
    platform: (platform: string, params?: any) => 
      [...queryKeys.analytics.all, 'platform', platform, params] as const,
    competitors: (params?: any) => [...queryKeys.analytics.all, 'competitors', params] as const,
  },
  
  // AI keys
  ai: {
    all: ['ai'] as const,
    insights: () => [...queryKeys.ai.all, 'insights'] as const,
    usage: () => [...queryKeys.ai.all, 'usage'] as const,
  },
  
  // Post keys
  posts: {
    all: ['posts'] as const,
    list: (params?: any) => [...queryKeys.posts.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
    scheduled: (params?: any) => [...queryKeys.posts.all, 'scheduled', params] as const,
  },
  
  // Social account keys
  socialAccounts: {
    all: ['social-accounts'] as const,
    list: () => [...queryKeys.socialAccounts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.socialAccounts.all, 'detail', id] as const,
    status: (id: string) => [...queryKeys.socialAccounts.all, 'status', id] as const,
  },
  
  // Inbox keys
  inbox: {
    all: ['inbox'] as const,
    conversations: (params?: any) => [...queryKeys.inbox.all, 'conversations', params] as const,
    messages: (conversationId: string, params?: any) => 
      [...queryKeys.inbox.all, 'messages', conversationId, params] as const,
    suggestedResponse: (conversationId: string) => 
      [...queryKeys.inbox.all, 'suggested-response', conversationId] as const,
  },
  
  // Team keys
  team: {
    all: ['team'] as const,
    members: () => [...queryKeys.team.all, 'members'] as const,
    activity: () => [...queryKeys.team.all, 'activity'] as const,
  },
  
  // Media keys
  media: {
    all: ['media'] as const,
    library: (params?: any) => [...queryKeys.media.all, 'library', params] as const,
  },
};
