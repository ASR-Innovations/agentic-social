import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'react-hot-toast';

export interface PostPlatform {
  id: string;
  platform: string;
  socialAccountId: string;
  status: string;
  platformPostId?: string;
  platformPostUrl?: string;
  customContent?: string;
  publishedAt?: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel';
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  platforms: PostPlatform[];
  scheduledAt?: Date;
  publishedAt?: Date;
  mediaUrls: string[];
  mediaMetadata?: Record<string, any>;
  metadata?: Record<string, any>;
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
  platforms: string[];
  scheduledAt?: Date;
  mediaUrls?: string[];
}

/**
 * Hook to fetch all posts
 */
export function usePosts() {
  return useQuery({
    queryKey: queryKeys.content.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.client.get('/posts');
        return (response.data.posts || response.data || []) as Post[];
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
      // TODO: Replace with actual API call when content endpoints are implemented
      toast.success('Post creation will be available soon!');
      return {} as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
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
      // TODO: Replace with actual API call when content endpoints are implemented
      toast.success('Post deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.list() });
    },
  });
}
