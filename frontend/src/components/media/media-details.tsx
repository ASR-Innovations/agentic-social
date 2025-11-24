import { useState } from 'react';
import { X, Download, Trash2, Tag, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/hooks/useMediaLibrary';
import { formatBytes, formatDuration } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface MediaDetailsProps {
  asset: MediaAsset;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<MediaAsset>) => void;
  onDelete: () => void;
}

export function MediaDetails({ asset, onClose, onUpdate, onDelete }: MediaDetailsProps) {
  const [tags, setTags] = useState<string[]>(asset.tags || []);
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onUpdate(asset.id, { tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    onUpdate(asset.id, { tags: updatedTags });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Preview */}
        <div className="bg-gray-950 rounded-lg overflow-hidden">
          {asset.type === 'VIDEO' ? (
            <video
              src={asset.url}
              className="w-full"
              controls
              poster={asset.thumbnailUrl}
            />
          ) : (
            <img
              src={asset.url}
              alt={asset.filename}
              className="w-full"
            />
          )}
        </div>

        {/* File Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">File Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Filename:</span>
              <span className="text-white font-medium truncate ml-2" title={asset.filename}>
                {asset.filename}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{asset.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size:</span>
              <span className="text-white">{formatBytes(asset.size)}</span>
            </div>
            {asset.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-400">Dimensions:</span>
                <span className="text-white">
                  {asset.dimensions.width} × {asset.dimensions.height}
                </span>
              </div>
            )}
            {asset.duration && (
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{formatDuration(asset.duration)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Uploaded:</span>
              <span className="text-white">
                {new Date(asset.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">URL</h4>
          <div className="flex gap-2">
            <Input
              value={asset.url}
              readOnly
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="border-gray-700 hover:bg-gray-800 flex-shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(asset.url, '_blank')}
              className="border-gray-700 hover:bg-gray-800 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="border-gray-700 hover:bg-gray-800 flex-shrink-0"
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Usage History (placeholder) */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Usage History</h4>
          <p className="text-sm text-gray-500">
            This media has been used in 0 posts
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button
          variant="outline"
          className="w-full border-gray-700 text-white hover:bg-gray-800"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          className="w-full border-red-900 text-red-400 hover:bg-red-900/20"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
