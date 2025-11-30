import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'react-hot-toast';

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'publishing';
  platforms: any[];
  scheduledAt?: Date;
  publishedAt?: Date;
  mediaUrls: string[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  socialAccountIds: string[];
  scheduledAt?: string;
  mediaUrls?: string[];
  type?: string;
}

export interface GenerateContentRequest {
  agentId: string;
  taskType: string;
  topic: string;
  tone?: string;
  variations?: number;
}

/**
 * Hook to fetch all posts
 */
export function usePosts(status?: string) {
  return useQuery({
    queryKey: queryKeys.content.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.getPosts({ status });
        return (response?.posts || []) as Post[];
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [] as Post[];
      }
    },
    staleTime: 30000,
  });
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const response = await apiClient.createPost(data);
      return response as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
}

/**
 * Hook to publish a post immediately
 */
export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.publishPost(postId);
      return response as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
      toast.success('Post published successfully!');
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
    mutationFn: async (postId: string) => {
      await apiClient.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
      toast.success('Post deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
}

/**
 * Hook to generate AI content using an agent
 */
export function useGenerateContent() {
  return useMutation({
    mutationFn: async (data: GenerateContentRequest) => {
      const response = await apiClient.executeAgent(data.agentId, data.taskType, {
        topic: data.topic,
        tone: data.tone || 'engaging',
        variations: data.variations || 3,
      });
      return response;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate content');
    },
  });
}
