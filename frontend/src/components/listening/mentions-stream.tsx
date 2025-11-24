'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MentionCard } from './mention-card';
import { Mention } from '@/types';
import { Loader2 } from 'lucide-react';

interface MentionsStreamProps {
  mentions: Mention[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onEngage?: (mentionId: string) => void;
  onSave?: (mentionId: string) => void;
}

export function MentionsStream({
  mentions,
  isLoading,
  hasMore,
  onLoadMore,
  onEngage,
  onSave,
}: MentionsStreamProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'engagement' | 'reach'>('recent');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Filter and sort mentions
  const filteredMentions = mentions
    .filter((mention) => {
      if (filterSentiment === 'all') return true;
      return mention.sentiment === filterSentiment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagement - a.engagement;
        case 'reach':
          return b.reach - a.reach;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between glass-card p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            <Select value={filterSentiment} onValueChange={(value: any) => setFilterSentiment(value)}>
              <SelectTrigger className="w-32 glass-card border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="all" className="text-white">All</SelectItem>
                <SelectItem value="positive" className="text-white">Positive</SelectItem>
                <SelectItem value="neutral" className="text-white">Neutral</SelectItem>
                <SelectItem value="negative" className="text-white">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sort:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32 glass-card border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="recent" className="text-white">Most Recent</SelectItem>
                <SelectItem value="engagement" className="text-white">Most Engaged</SelectItem>
                <SelectItem value="reach" className="text-white">Highest Reach</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {filteredMentions.length} mention{filteredMentions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Mentions List */}
      <div className="space-y-4">
        {filteredMentions.map((mention) => (
          <MentionCard
            key={mention.id}
            mention={mention}
            onEngage={onEngage}
            onSave={onSave}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={observerTarget} className="h-4" />

      {/* No More Results */}
      {!hasMore && mentions.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          No more mentions to load
        </div>
      )}

      {/* Empty State */}
      {!isLoading && mentions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No mentions found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your query or filters
          </p>
        </div>
      )}
    </div>
  );
}
