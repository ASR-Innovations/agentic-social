'use client';

import { useState } from 'react';
import { CheckSquare, Square, Trash2, Calendar, Copy, Edit, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Post } from './calendar-grid';

interface BulkActionsToolbarProps {
  posts: Post[];
  selectedPostIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: (postIds: string[]) => void;
  onBulkReschedule: (postIds: string[], newDate: Date) => void;
  onBulkDuplicate: (postIds: string[]) => void;
  onBulkExport: (postIds: string[]) => void;
}

export function BulkActionsToolbar({
  posts,
  selectedPostIds,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkReschedule,
  onBulkDuplicate,
  onBulkExport,
}: BulkActionsToolbarProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const selectedCount = selectedPostIds.length;
  const allSelected = selectedCount === posts.length && posts.length > 0;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="glass-card px-6 py-4 rounded-full shadow-2xl border border-white/20">
        <div className="flex items-center space-x-4">
          {/* Selection Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <Badge variant="glass" className="text-sm">
              {selectedCount} selected
            </Badge>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRescheduleModal(true)}
              title="Reschedule"
            >
              <Calendar className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkDuplicate(selectedPostIds)}
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkExport(selectedPostIds)}
              title="Export"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/20" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedCount} post(s)?`)) {
                  onBulkDelete(selectedPostIds);
                }
              }}
              className="text-red-400 hover:text-red-300"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* Close */}
          <button
            onClick={onDeselectAll}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">Clear</span>
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Reschedule {selectedCount} Post(s)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  New Date
                </label>
                <input
                  type="date"
                  className="w-full glass-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  New Time
                </label>
                <input
                  type="time"
                  className="w-full glass-input"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gradient-primary"
                  onClick={() => {
                    // TODO: Implement bulk reschedule
                    setShowRescheduleModal(false);
                  }}
                >
                  Reschedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
