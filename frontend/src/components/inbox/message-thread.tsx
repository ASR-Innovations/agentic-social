'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

interface MessageThreadProps {
  messages: Message[];
  participantName: string;
  participantAvatar?: string;
  isLoading?: boolean;
}

export function MessageThread({
  messages,
  participantName,
  participantAvatar,
  isLoading = false,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSentimentColor = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">No messages yet</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => {
        const isFromUser = message.isFromUser;
        const showDate =
          index === 0 ||
          format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !==
            format(new Date(message.createdAt), 'yyyy-MM-dd');

        return (
          <div key={message.id}>
            {/* Date Separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
                  {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            )}

            {/* Message */}
            <div
              className={cn(
                'flex gap-3',
                isFromUser ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              {!isFromUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={participantAvatar} alt={participantName} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                    {getInitials(participantName)}
                  </AvatarFallback>
                </Avatar>
              )}

              {isFromUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Content */}
              <div
                className={cn(
                  'flex flex-col max-w-[70%]',
                  isFromUser ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2',
                    isFromUser
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'glass-card border border-white/10 text-white'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Media */}
                  {message.mediaUrls && message.mediaUrls.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.mediaUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Message attachment"
                          className="rounded-lg max-w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Meta */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-gray-400">
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </span>

                  {message.aiSuggested && (
                    <Badge variant="glass" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Bot className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}

                  {message.sentiment && !isFromUser && (
                    <span className={cn('text-xs', getSentimentColor(message.sentiment))}>
                      {message.sentiment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
