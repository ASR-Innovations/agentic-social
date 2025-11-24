'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Conversation } from '@/types';
import { 
  UserPlus, 
  Tag, 
  MoreVertical, 
  Archive, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ConversationHeaderProps {
  conversation: Conversation;
  onAssign?: () => void;
  onTag?: () => void;
  onStatusChange?: (status: string) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function ConversationHeader({
  conversation,
  onAssign,
  onTag,
  onStatusChange,
  onArchive,
  onDelete,
}: ConversationHeaderProps) {
  return (
    <div className="border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {conversation.participantName}
          </h2>
          
          <Badge variant="glass" className="capitalize">
            {conversation.platform}
          </Badge>

          {conversation.unreadCount > 0 && (
            <Badge variant="glass" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {conversation.unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Assign Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssign}
            className="text-gray-400 hover:text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {conversation.assignedTo ? 'Reassign' : 'Assign'}
          </Button>

          {/* Tag Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTag}
            className="text-gray-400 hover:text-white"
          >
            <Tag className="h-4 w-4 mr-2" />
            Tag
          </Button>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuItem onClick={() => onStatusChange?.('open')}>
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('pending')}>
                <Clock className="h-4 w-4 mr-2 text-blue-400" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('resolved')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
