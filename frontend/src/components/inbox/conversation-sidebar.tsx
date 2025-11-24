'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Conversation } from '@/types';
import { 
  User, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Tag,
  X,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface ConversationSidebarProps {
  conversation: Conversation;
  onUpdateTags?: (tags: string[]) => void;
  onAddNote?: (note: string) => void;
}

export function ConversationSidebar({
  conversation,
  onUpdateTags,
  onAddNote,
}: ConversationSidebarProps) {
  const [newTag, setNewTag] = useState('');
  const [note, setNote] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddTag = () => {
    if (newTag.trim() && onUpdateTags) {
      const updatedTags = [...conversation.tags, newTag.trim()];
      onUpdateTags(updatedTags);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (onUpdateTags) {
      const updatedTags = conversation.tags.filter(tag => tag !== tagToRemove);
      onUpdateTags(updatedTags);
    }
  };

  const handleAddNote = () => {
    if (note.trim() && onAddNote) {
      onAddNote(note.trim());
      setNote('');
    }
  };

  return (
    <div className="w-80 border-l border-white/10 flex flex-col h-full overflow-y-auto">
      {/* Participant Info */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
              {getInitials(conversation.participantName)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-white mb-1">
            {conversation.participantName}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <User className="h-4 w-4" />
            <span>{conversation.participantId}</span>
          </div>

          <div className="flex gap-2">
            <Badge variant="glass" className="capitalize">
              {conversation.platform}
            </Badge>
            <Badge 
              variant="glass" 
              className={
                conversation.sentiment === 'positive' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : conversation.sentiment === 'negative'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }
            >
              {conversation.sentiment}
            </Badge>
          </div>
        </div>
      </div>

      {/* Conversation Details */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">First Contact</span>
            <span className="text-white">
              {format(new Date(conversation.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Activity</span>
            <span className="text-white">
              {format(new Date(conversation.updatedAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Priority</span>
            <Badge 
              variant="glass"
              className={
                conversation.priority === 'high'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : conversation.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }
            >
              {conversation.priority}
            </Badge>
          </div>

          {conversation.assignedTo && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Assigned To</span>
              <span className="text-white">{conversation.assignedTo}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="text-purple-400 hover:text-purple-300 h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {isAddingTag && (
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  } else if (e.key === 'Escape') {
                    setIsAddingTag(false);
                    setNewTag('');
                  }
                }}
                className="glass-input h-8 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                className="h-8 bg-purple-500 hover:bg-purple-600"
              >
                Add
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {conversation.tags.length === 0 ? (
              <span className="text-sm text-gray-400">No tags</span>
            ) : (
              conversation.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="glass"
                  className="group cursor-pointer hover:bg-white/10"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <Label className="text-white flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Add Note
          </Label>
          <Textarea
            placeholder="Add internal notes about this conversation..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="glass-input min-h-[80px] text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!note.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Save Note
          </Button>
        </div>

        {/* Conversation History Summary */}
        <div className="space-y-3">
          <Label className="text-white">Conversation Summary</Label>
          <div className="glass-card p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Messages</span>
              <span className="text-white font-medium">
                {/* This would come from actual message count */}
                -
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Response Time</span>
              <span className="text-white font-medium">
                {/* This would come from analytics */}
                -
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resolution Status</span>
              <Badge variant="glass" className="text-xs">
                Open
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
