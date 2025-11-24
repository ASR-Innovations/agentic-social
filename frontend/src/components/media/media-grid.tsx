import { Image, Video, FileImage, Edit, Eye, MoreVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MediaAsset } from '@/hooks/useMediaLibrary';
import { formatBytes, formatDuration } from '@/lib/utils';

interface MediaGridProps {
  assets: MediaAsset[];
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onSelectAsset: (assetId: string) => void;
  onEditAsset: (asset: MediaAsset) => void;
  onViewDetails: (asset: MediaAsset) => void;
  isLoading: boolean;
}

export function MediaGrid({
  assets,
  viewMode,
  selectedAssets,
  onSelectAsset,
  onEditAsset,
  onViewDetails,
  isLoading,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <FileImage className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No media files</p>
        <p className="text-sm">Upload files to get started</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {assets.map((asset) => (
          <MediaCard
            key={asset.id}
            asset={asset}
            isSelected={selectedAssets.includes(asset.id)}
            onSelect={() => onSelectAsset(asset.id)}
            onEdit={() => onEditAsset(asset)}
            onViewDetails={() => onViewDetails(asset)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assets.map((asset) => (
        <MediaListItem
          key={asset.id}
          asset={asset}
          isSelected={selectedAssets.includes(asset.id)}
          onSelect={() => onSelectAsset(asset.id)}
          onEdit={() => onEditAsset(asset)}
          onViewDetails={() => onViewDetails(asset)}
        />
      ))}
    </div>
  );
}

interface MediaCardProps {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
}

function MediaCard({ asset, isSelected, onSelect, onEdit, onViewDetails }: MediaCardProps) {
  const getTypeIcon = () => {
    switch (asset.type) {
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'GIF':
        return <FileImage className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`group relative bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-700'
      }`}
    >
      {/* Selection Checkbox */}
      <div
        className="absolute top-2 left-2 z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'bg-gray-900/50 border-gray-400 group-hover:border-gray-300'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-gray-900/80 hover:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700">
            <DropdownMenuItem onClick={onViewDetails} className="text-white hover:bg-gray-700">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {asset.type !== 'GIF' && (
              <DropdownMenuItem onClick={onEdit} className="text-white hover:bg-gray-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail */}
      <div
        className="aspect-square bg-gray-900 cursor-pointer"
        onClick={onViewDetails}
      >
        {asset.type === 'VIDEO' ? (
          <div className="relative w-full h-full">
            <img
              src={asset.thumbnailUrl || asset.url}
              alt={asset.filename}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Video className="w-12 h-12 text-white opacity-80" />
            </div>
            {asset.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {formatDuration(asset.duration)}
              </div>
            )}
          </div>
        ) : (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.filename}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">{getTypeIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate" title={asset.filename}>
              {asset.filename}
            </p>
            <p className="text-xs text-gray-400">{formatBytes(asset.size)}</p>
          </div>
        </div>
        {asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{asset.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MediaListItemProps {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
}

function MediaListItem({ asset, isSelected, onSelect, onEdit, onViewDetails }: MediaListItemProps) {
  const getTypeIcon = () => {
    switch (asset.type) {
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'GIF':
        return <FileImage className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-gray-800 rounded-lg border-2 transition-all ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-700'
      }`}
    >
      {/* Selection Checkbox */}
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'bg-gray-900 border-gray-400 hover:border-gray-300'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Thumbnail */}
      <div
        className="w-16 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onViewDetails}
      >
        <img
          src={asset.thumbnailUrl || asset.url}
          alt={asset.filename}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-gray-400">{getTypeIcon()}</div>
          <p className="text-sm text-white truncate font-medium">{asset.filename}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{formatBytes(asset.size)}</span>
          {asset.dimensions && (
            <span>
              {asset.dimensions.width} × {asset.dimensions.height}
            </span>
          )}
          {asset.duration && <span>{formatDuration(asset.duration)}</span>}
          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
        </div>
        {asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-700"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-700">
          <DropdownMenuItem onClick={onViewDetails} className="text-white hover:bg-gray-700">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {asset.type !== 'GIF' && (
            <DropdownMenuItem onClick={onEdit} className="text-white hover:bg-gray-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
