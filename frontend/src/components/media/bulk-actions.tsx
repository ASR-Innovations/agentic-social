import { useState } from 'react';
import { CheckSquare, Trash2, FolderInput, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaFolder } from '@/hooks/useMediaLibrary';

interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
  onMove: (targetFolder: string) => void;
  onTag: (tags: string[]) => void;
  onClearSelection: () => void;
  folders: MediaFolder[];
}

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDelete,
  onMove,
  onTag,
  onClearSelection,
  folders,
}: BulkActionsProps) {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [targetFolder, setTargetFolder] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleMove = () => {
    if (targetFolder) {
      onMove(targetFolder);
      setShowMoveDialog(false);
      setTargetFolder('');
    }
  };

  const handleTag = () => {
    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    
    if (tags.length > 0) {
      onTag(tags);
      setShowTagDialog(false);
      setNewTags('');
    }
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="bg-blue-900/20 border-b border-blue-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-400 font-medium">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Select All
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoveDialog(true)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <FolderInput className="w-4 h-4 mr-2" />
              Move
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagDialog(true)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <Tag className="w-4 h-4 mr-2" />
              Tag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-900 text-red-400 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Move {selectedCount} Item{selectedCount !== 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Select destination folder
            </label>
            <Select value={targetFolder} onValueChange={setTargetFolder}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Choose folder..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {folders.map((folder) => (
                  <SelectItem
                    key={folder.id}
                    value={folder.id}
                    className="text-white hover:bg-gray-700"
                  >
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowMoveDialog(false);
                setTargetFolder('');
              }}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={!targetFolder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Tags to {selectedCount} Item{selectedCount !== 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Enter tags (comma-separated)
            </label>
            <Input
              placeholder="e.g. product, campaign, summer"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTag();
                }
              }}
              className="bg-gray-800 border-gray-700 text-white"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              These tags will be added to all selected items
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowTagDialog(false);
                setNewTags('');
              }}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTag}
              disabled={!newTags.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} Item{selectedCount !== 1 ? 's' : ''}?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-400">
              Are you sure you want to delete {selectedCount} item{selectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
