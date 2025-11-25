import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'react-hot-toast';

/**
 * Hook to generate content using AI
 */
export function useGenerateContent() {
  return useMutation({
    mutationFn: (data: {
      prompt: string;
      type: 'text' | 'image' | 'caption' | 'hashtags';
      platform?: string;
      tone?: string;
      length?: 'short' | 'medium' | 'long';
    }) => apiClient.generateContent(data),
    onSuccess: () => {
      toast.success('Content generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate content');
    },
  });
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      content: string;
      platforms: string[];
      scheduledAt?: string;
      mediaUrls?: string[];
      firstComment?: string;
      location?: string;
      tags?: string[];
    }) => apiClient.createPost(data),
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(queryKeys.posts.list());
      
      // Optimistically update to the new value
      if (previousPosts) {
        queryClient.setQueryData(queryKeys.posts.list(), (old: any) => [
          { ...newPost, id: 'temp-' + Date.now(), status: 'draft', createdAt: new Date().toISOString() },
          ...old,
        ]);
      }
      
      // Return context with the snapshot
      return { previousPosts };
    },
    onError: (error: any, newPost, context) => {
      // Rollback to the previous value on error
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts.list(), context.previousPosts);
      }
      toast.error(error.message || 'Failed to create post');
    },
    onSuccess: (data) => {
      toast.success('Post created successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

/**
 * Hook to upload media files
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      apiClient.uploadMedia(file, folder),
    onSuccess: () => {
      toast.success('Media uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload media');
    },
  });
}

/**
 * Hook to get scheduled posts
 */
export function useScheduledPosts(params?: any) {
  return useQuery({
    queryKey: queryKeys.posts.scheduled(params),
    queryFn: () => apiClient.getPosts({ ...params, status: 'scheduled' }),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to publish a post immediately
 */
export function usePublishPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => apiClient.publishPost(postId),
    onSuccess: () => {
      toast.success('Post published successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish post');
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => apiClient.deletePost(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(queryKeys.posts.list());
      
      // Optimistically remove the post
      if (previousPosts) {
        queryClient.setQueryData(queryKeys.posts.list(), (old: any) =>
          old.filter((post: any) => post.id !== postId)
        );
      }
      
      // Return context with the snapshot
      return { previousPosts };
    },
    onError: (error: any, postId, context) => {
      // Rollback to the previous value on error
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts.list(), context.previousPosts);
      }
      toast.error(error.message || 'Failed to delete post');
    },
    onSuccess: () => {
      toast.success('Post deleted successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
