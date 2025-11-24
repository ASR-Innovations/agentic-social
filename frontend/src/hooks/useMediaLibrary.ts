import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface MediaAsset {
  id: string;
  workspaceId: string;
  type: 'IMAGE' | 'VIDEO' | 'GIF';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  metadata?: any;
  tags: string[];
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  children?: MediaFolder[];
  assetCount: number;
}

export function useMediaLibrary(
  folder?: string | null,
  search?: string,
  sortBy?: 'name' | 'date' | 'size'
) {
  const queryClient = useQueryClient();

  // Fetch media assets
  const {
    data: assetsData,
    isLoading: assetsLoading,
    refetch: refetchAssets,
  } = useQuery({
    queryKey: ['media-assets', folder, search, sortBy],
    queryFn: async () => {
      const params: any = {};
      if (folder) params.folder = folder;
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      
      return await apiClient.getMediaLibrary(params);
    },
  });

  // Fetch folders
  const { data: foldersData, isLoading: foldersLoading } = useQuery({
    queryKey: ['media-folders'],
    queryFn: async () => {
      // This would call a backend endpoint to get folder structure
      // For now, we'll return mock data
      return {
        folders: [
          {
            id: 'root',
            name: 'All Media',
            path: '/',
            assetCount: 0,
            children: [],
          },
        ],
      };
    },
  });

  // Upload assets mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map((file) =>
        apiClient.uploadMedia(file, folder || undefined)
      );
      return await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      toast.success('Files uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload files');
    },
  });

  // Delete assets mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetIds: string[]) => {
      const deletePromises = assetIds.map((id) => apiClient.deleteMedia(id));
      return await Promise.all(deletePromises);
    },
    onSuccess: () => {
      toast.success('Assets deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete assets');
    },
  });

  // Update asset mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MediaAsset> }) => {
      // This would call a backend endpoint to update asset metadata
      return { id, ...data };
    },
    onSuccess: () => {
      toast.success('Asset updated successfully');
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update asset');
    },
  });

  // Move assets mutation
  const moveMutation = useMutation({
    mutationFn: async ({ assetIds, targetFolder }: { assetIds: string[]; targetFolder: string }) => {
      // This would call a backend endpoint to move assets
      return { assetIds, targetFolder };
    },
    onSuccess: () => {
      toast.success('Assets moved successfully');
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to move assets');
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: string }) => {
      // This would call a backend endpoint to create folder
      return { name, parentId };
    },
    onSuccess: () => {
      toast.success('Folder created successfully');
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create folder');
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      // This would call a backend endpoint to delete folder
      return folderId;
    },
    onSuccess: () => {
      toast.success('Folder deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete folder');
    },
  });

  return {
    assets: assetsData?.assets || [],
    folders: foldersData?.folders || [],
    isLoading: assetsLoading || foldersLoading,
    uploadAssets: (files: File[]) => uploadMutation.mutate(files),
    deleteAssets: (assetIds: string[]) => deleteMutation.mutate(assetIds),
    updateAsset: (id: string, data: Partial<MediaAsset>) =>
      updateMutation.mutate({ id, data }),
    moveAssets: (assetIds: string[], targetFolder: string) =>
      moveMutation.mutate({ assetIds, targetFolder }),
    createFolder: (name: string, parentId?: string) =>
      createFolderMutation.mutate({ name, parentId }),
    deleteFolder: (folderId: string) => deleteFolderMutation.mutate(folderId),
    refetch: refetchAssets,
  };
}
