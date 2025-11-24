'use client';

import { useState } from 'react';
import { MediaHeader } from '@/components/media/media-header';
import { FolderTree } from '@/components/media/folder-tree';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaUploader } from '@/components/media/media-uploader';
import { MediaEditor } from '@/components/media/media-editor';
import { MediaDetails } from '@/components/media/media-details';
import { BulkActions } from '@/components/media/bulk-actions';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';

export default function MediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [showUploader, setShowUploader] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const {
    assets,
    folders,
    isLoading,
    uploadAssets,
    deleteAssets,
    updateAsset,
    moveAssets,
    createFolder,
    deleteFolder,
    refetch,
  } = useMediaLibrary(selectedFolder, searchQuery, sortBy);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((asset: any) => asset.id));
    }
  };

  const handleBulkDelete = async () => {
    await deleteAssets(selectedAssets);
    setSelectedAssets([]);
  };

  const handleBulkMove = async (targetFolder: string) => {
    await moveAssets(selectedAssets, targetFolder);
    setSelectedAssets([]);
  };

  const handleBulkTag = async (tags: string[]) => {
    for (const assetId of selectedAssets) {
      const asset = assets.find((a: any) => a.id === assetId);
      if (asset) {
        await updateAsset(assetId, {
          tags: [...new Set([...asset.tags, ...tags])],
        });
      }
    }
    setSelectedAssets([]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-950">
      {/* Folder Tree Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900/50 overflow-y-auto">
        <FolderTree
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MediaHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onUploadClick={() => setShowUploader(true)}
        />

        {/* Bulk Actions Bar */}
        {selectedAssets.length > 0 && (
          <BulkActions
            selectedCount={selectedAssets.length}
            onSelectAll={handleSelectAll}
            onDelete={handleBulkDelete}
            onMove={handleBulkMove}
            onTag={handleBulkTag}
            onClearSelection={() => setSelectedAssets([])}
            folders={folders}
          />
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <MediaGrid
            assets={assets}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onSelectAsset={handleSelectAsset}
            onEditAsset={setEditingAsset}
            onViewDetails={setSelectedAsset}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Media Details Sidebar */}
      {selectedAsset && (
        <div className="w-96 border-l border-gray-800 bg-gray-900/50 overflow-y-auto">
          <MediaDetails
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onUpdate={updateAsset}
            onDelete={async () => {
              await deleteAssets([selectedAsset.id]);
              setSelectedAsset(null);
            }}
          />
        </div>
      )}

      {/* Media Uploader Modal */}
      {showUploader && (
        <MediaUploader
          folder={selectedFolder}
          onUpload={uploadAssets}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Media Editor Modal */}
      {editingAsset && (
        <MediaEditor
          asset={editingAsset}
          onSave={async (editedAsset) => {
            await updateAsset(editingAsset.id, editedAsset);
            setEditingAsset(null);
            refetch();
          }}
          onClose={() => setEditingAsset(null)}
        />
      )}
    </div>
  );
}
