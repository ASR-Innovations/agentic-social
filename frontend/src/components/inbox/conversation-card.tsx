'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Youtube,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected?: boolean;
  onClick?: () => void;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: TrendingUp,
  pinterest: TrendingUp,
  threads: MessageCircle,
  reddit: MessageCircle,
};

const sentimentColors = {
  positive: 'bg-green-500/20 text-green-400 border-green-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function ConversationCard({ 
  conversation, 
  isSelected = false, 
  onClick 
}: ConversationCardProps) {
  const PlatformIcon = platformIcons[conversation.platform] || MessageCircle;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/5',
        isSelected && 'bg-white/10 border-l-4 border-l-purple-500'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {getInitials(conversation.participantName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {conversation.participantName}
              </h3>
              <PlatformIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Message Preview */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
            {conversation.lastMessage.content}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {conversation.unreadCount > 0 && (
              <Badge variant="glass" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {conversation.unreadCount} new
              </Badge>
            )}
            
            <Badge 
              variant="glass" 
              className={sentimentColors[conversation.sentiment]}
            >
              {conversation.sentiment}
            </Badge>

            {conversation.priority === 'high' && (
              <Badge 
                variant="glass" 
                className={priorityColors[conversation.priority]}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                {conversation.priority}
              </Badge>
            )}

            {conversation.assignedTo && (
              <Badge variant="glass" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Assigned
              </Badge>
            )}

            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="glass" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
