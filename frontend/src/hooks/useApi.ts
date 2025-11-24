import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Generic useApi hook for simple data fetching
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

// Query Keys
export const queryKeys = {
  // Auth
  profile: ['profile'] as const,
  
  // Posts
  posts: (params?: any) => ['posts', params] as const,
  post: (id: string) => ['posts', id] as const,
  
  // Analytics
  analytics: (params?: any) => ['analytics', params] as const,
  platformAnalytics: (platform: string, params?: any) => ['analytics', 'platform', platform, params] as const,
  competitorAnalytics: (params?: any) => ['analytics', 'competitors', params] as const,
  
  // Social Accounts
  socialAccounts: ['socialAccounts'] as const,
  
  // Inbox
  conversations: (params?: any) => ['conversations', params] as const,
  messages: (conversationId: string, params?: any) => ['messages', conversationId, params] as const,
  
  // Team
  teamMembers: ['teamMembers'] as const,
  
  // Settings
  settings: ['settings'] as const,
  
  // AI
  aiAgents: ['aiAgents'] as const,
  aiUsage: ['aiUsage'] as const,
  
  // Media
  mediaLibrary: (params?: any) => ['media', params] as const,
  
  // Notifications
  notifications: (params?: any) => ['notifications', params] as const,
  
  // Webhooks
  webhooks: ['webhooks'] as const,
};

// Posts Hooks
export function usePosts(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.posts(params),
    queryFn: () => apiClient.getPosts(params),
    ...options,
  });
}

export function usePost(id: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => apiClient.getPosts({ id }),
    enabled: !!id,
    ...options,
  });
}

export function useCreatePost(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      toast.success('Post created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
    ...options,
  });
}

export function useUpdatePost(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.updatePost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(variables.id) });
      toast.success('Post updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
    ...options,
  });
}

export function useDeletePost(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      toast.success('Post deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
    ...options,
  });
}

export function usePublishPost(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      toast.success('Post published successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    },
    ...options,
  });
}

// Analytics Hooks
export function useAnalytics(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.analytics(params),
    queryFn: () => apiClient.getAnalytics(params),
    ...options,
  });
}

export function usePlatformAnalytics(platform: string, params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.platformAnalytics(platform, params),
    queryFn: () => apiClient.getPlatformAnalytics(platform, params),
    enabled: !!platform,
    ...options,
  });
}

export function useCompetitorAnalytics(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.competitorAnalytics(params),
    queryFn: () => apiClient.getCompetitorAnalytics(params),
    ...options,
  });
}

// Social Accounts Hooks
export function useSocialAccounts(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.socialAccounts,
    queryFn: () => apiClient.getSocialAccounts(),
    ...options,
  });
}

export function useConnectSocialAccount(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.connectSocialAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socialAccounts });
      toast.success('Social account connected successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to connect social account');
    },
    ...options,
  });
}

export function useDisconnectSocialAccount(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.disconnectSocialAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socialAccounts });
      toast.success('Social account disconnected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disconnect social account');
    },
    ...options,
  });
}

// Inbox Hooks
export function useConversations(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.conversations(params),
    queryFn: () => apiClient.getConversations(params),
    ...options,
  });
}

export function useMessages(conversationId: string, params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId, params),
    queryFn: () => apiClient.getMessages(conversationId, params),
    enabled: !!conversationId,
    ...options,
  });
}

export function useSendMessage(options?: UseMutationOptions<any, any, { conversationId: string; data: any }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: any }) => 
      apiClient.sendMessage(conversationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
      toast.success('Message sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
    ...options,
  });
}

// AI Hooks
export function useAIAgents(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.aiAgents,
    queryFn: () => apiClient.getAIAgents(),
    ...options,
  });
}

export function useGenerateContent(options?: UseMutationOptions<any, any, any>) {
  return useMutation({
    mutationFn: (data: any) => apiClient.generateContent(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    },
    ...options,
  });
}

export function useAIUsage(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.aiUsage,
    queryFn: () => apiClient.getAIUsage(),
    ...options,
  });
}

// Media Hooks
export function useMediaLibrary(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.mediaLibrary(params),
    queryFn: () => apiClient.getMediaLibrary(params),
    ...options,
  });
}

export function useUploadMedia(options?: UseMutationOptions<any, any, { file: File; folder?: string }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) => 
      apiClient.uploadMedia(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary() });
      toast.success('Media uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload media');
    },
    ...options,
  });
}

export function useDeleteMedia(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (key: string) => apiClient.deleteMedia(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary() });
      toast.success('Media deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete media');
    },
    ...options,
  });
}

// Team Hooks
export function useTeamMembers(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: () => apiClient.getTeamMembers(),
    ...options,
  });
}

export function useInviteTeamMember(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
      toast.success('Team member invited');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to invite team member');
    },
    ...options,
  });
}

export function useRemoveTeamMember(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
      toast.success('Team member removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    },
    ...options,
  });
}

// Settings Hooks
export function useSettings(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiClient.getSettings(),
    ...options,
  });
}

export function useUpdateSettings(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
    ...options,
  });
}

// Notifications Hooks
export function useNotifications(params?: any, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => apiClient.getNotifications(params),
    ...options,
  });
}

export function useMarkNotificationRead(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
    ...options,
  });
}

export function useMarkAllNotificationsRead(options?: UseMutationOptions<any, any, void>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      toast.success('All notifications marked as read');
    },
    ...options,
  });
}

// Webhooks Hooks
export function useWebhooks(options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.webhooks,
    queryFn: () => apiClient.getWebhooks(),
    ...options,
  });
}

export function useCreateWebhook(options?: UseMutationOptions<any, any, any>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks });
      toast.success('Webhook created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create webhook');
    },
    ...options,
  });
}

export function useDeleteWebhook(options?: UseMutationOptions<any, any, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks });
      toast.success('Webhook deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete webhook');
    },
    ...options,
  });
}
