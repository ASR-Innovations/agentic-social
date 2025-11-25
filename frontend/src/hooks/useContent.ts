import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { toast } from 'react-hot-toast';

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platforms: string[];
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
      // For now, return empty array until backend endpoint is ready
      // TODO: Replace with actual API call when content endpoints are implemented
      return [] as Post[];
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
