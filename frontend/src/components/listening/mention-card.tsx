'use client';

import { useState } from 'react';
import { ExternalLink, Heart, MessageCircle, Share2, Bookmark, MoreVertical, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mention } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface MentionCardProps {
  mention: Mention;
  onEngage?: (mentionId: string) => void;
  onSave?: (mentionId: string) => void;
}

export function MentionCard({ mention, onEngage, onSave }: MentionCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'from-green-500 to-emerald-500';
      case 'negative':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'negative':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave(mention.id);
  };

  return (
    <Card className="glass-card border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-4">
        {/* Author Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={mention.author.avatar || '/default-avatar.png'}
              alt={mention.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{mention.author.name}</span>
                {mention.author.isInfluencer && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                    Influencer
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>@{mention.author.username}</span>
                <span>•</span>
                <span>{mention.author.followers.toLocaleString()} followers</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuItem className="text-white">View Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-white">Add to List</DropdownMenuItem>
              <DropdownMenuItem className="text-white">Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-white mb-3 leading-relaxed">{mention.content}</p>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{mention.engagement.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{mention.reach.toLocaleString()}</span>
            </div>
            <span>{formatDistanceToNow(new Date(mention.createdAt), { addSuffix: true })}</span>
          </div>
          <Badge className={getSentimentBadgeColor(mention.sentiment)}>
            {mention.sentiment}
          </Badge>
        </div>

        {/* Tags */}
        {mention.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {mention.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-white/10">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEngage?.(mention.id)}
              className="text-gray-400 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Engage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={isSaved ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(mention.url, '_blank')}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
