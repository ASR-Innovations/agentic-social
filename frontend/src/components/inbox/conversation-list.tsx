'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationCard } from './conversation-card';
import { Conversation } from '@/types';
import { Search, Filter, SortAsc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading?: boolean;
}

type FilterTab = 'all' | 'unread' | 'assigned' | 'urgent';
type SortOption = 'recent' | 'oldest' | 'priority' | 'unread';

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        conv.participantName.toLowerCase().includes(query) ||
        conv.lastMessage.content.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter
    switch (activeFilter) {
      case 'unread':
        return conv.unreadCount > 0;
      case 'assigned':
        return !!conv.assignedTo;
      case 'urgent':
        return conv.priority === 'high';
      default:
        return true;
    }
  });

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'oldest':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'unread':
        return b.unreadCount - a.unreadCount;
      default:
        return 0;
    }
  });

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;
  const assignedCount = conversations.filter((c) => c.assignedTo).length;
  const urgentCount = conversations.filter((c) => c.priority === 'high').length;

  return (
    <div className="flex flex-col h-full border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Inbox</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/10">
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('priority')}>
                  By Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('unread')}>
                  By Unread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
          <TabsList className="glass w-full grid grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
              <span className="ml-1 text-gray-400">({conversations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="text-xs">
              Assigned
              <span className="ml-1 text-gray-400">({assignedCount})</span>
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">
              Urgent
              {urgentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                  {urgentCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading conversations...</div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-gray-400 mb-2">No conversations found</div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-purple-400 hover:text-purple-300"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
}
