'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Conversation, Message } from '@/types';
import {
  ConversationList,
  MessageThread,
  ReplyComposer,
  ConversationSidebar,
  ConversationHeader,
  InboxStats,
} from '@/components/inbox';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

// Mock reply templates
const REPLY_TEMPLATES = [
  {
    id: '1',
    name: 'Thank You',
    content: 'Thank you for reaching out! We appreciate your message and will get back to you shortly.',
  },
  {
    id: '2',
    name: 'More Information',
    content: 'Thank you for your interest! Could you please provide more details so we can better assist you?',
  },
  {
    id: '3',
    name: 'Issue Resolution',
    content: 'We apologize for any inconvenience. Our team is looking into this and will resolve it as soon as possible.',
  },
];

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      },
    });

    socketRef.current = socket;

    // Listen for new messages
    socket.on('new_message', (data: { conversationId: string; message: Message }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Show notification if not the selected conversation
      if (selectedConversation?.id !== data.conversationId) {
        toast('New message received', {
          icon: '💬',
        });
      }
    });

    // Listen for conversation updates
    socket.on('conversation_updated', (data: { conversation: Conversation }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, selectedConversation]);

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const response = await apiClient.getConversations();
        return response || [];
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // Return mock data for development
        if (process.env.NODE_ENV === 'development') {
          const { mockConversations } = await import('@/components/inbox/mock-data');
          return mockConversations;
        }
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      try {
        const response = await apiClient.getMessages(selectedConversation.id);
        return response || [];
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Return mock data for development
        if (process.env.NODE_ENV === 'development') {
          const { getMockMessages } = await import('@/components/inbox/mock-data');
          return getMockMessages(selectedConversation.id);
        }
        return [];
      }
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, mediaFiles }: { 
      conversationId: string; 
      content: string; 
      mediaFiles?: File[] 
    }) => {
      // Upload media files if any
      let mediaUrls: string[] = [];
      if (mediaFiles && mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(file => apiClient.uploadMedia(file));
        const uploadResults = await Promise.all(uploadPromises);
        mediaUrls = uploadResults.map(result => result.url);
      }

      return apiClient.sendMessage(conversationId, {
        content,
        mediaUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    },
  });

  // Calculate stats
  const stats = {
    avgResponseTime: '2.5h',
    resolutionRate: 87,
    totalConversations: conversations.length,
    activeConversations: conversations.filter((c: Conversation) => c.unreadCount > 0).length,
  };

  const handleSendMessage = async (content: string, mediaFiles?: File[]) => {
    if (!selectedConversation) return;
    
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation.id,
      content,
      mediaFiles,
    });
  };

  const handleUpdateTags = async (tags: string[]) => {
    // TODO: Implement API call to update tags
    toast.success('Tags updated');
  };

  const handleAddNote = async (note: string) => {
    // TODO: Implement API call to add note
    toast.success('Note added');
  };

  const handleAssign = () => {
    // TODO: Implement assignment modal
    toast.info('Assignment feature coming soon');
  };

  const handleTag = () => {
    // TODO: Implement tagging modal
    toast.info('Tagging feature coming soon');
  };

  const handleStatusChange = (status: string) => {
    // TODO: Implement API call to change status
    toast.success(`Status changed to ${status}`);
  };

  const handleArchive = () => {
    // TODO: Implement API call to archive
    toast.success('Conversation archived');
  };

  const handleDelete = () => {
    // TODO: Implement API call to delete
    toast.success('Conversation deleted');
  };

  const handleAIAssist = () => {
    // TODO: Implement AI assistance
    toast.info('AI assistance feature coming soon');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Stats */}
      <div className="p-6 pb-0">
        <InboxStats stats={stats} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-96 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={setSelectedConversation}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* Conversation View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <ConversationHeader
              conversation={selectedConversation}
              onAssign={handleAssign}
              onTag={handleTag}
              onStatusChange={handleStatusChange}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />

            {/* Messages */}
            <MessageThread
              messages={messages}
              participantName={selectedConversation.participantName}
              participantAvatar={selectedConversation.participantAvatar}
              isLoading={isLoadingMessages}
            />

            {/* Reply Composer */}
            <ReplyComposer
              onSend={handleSendMessage}
              onAIAssist={handleAIAssist}
              templates={REPLY_TEMPLATES}
              isLoading={sendMessageMutation.isPending}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">Select a conversation to view messages</div>
              <p className="text-sm text-gray-500">
                Choose from the list on the left to start responding
              </p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {selectedConversation && (
          <ConversationSidebar
            conversation={selectedConversation}
            onUpdateTags={handleUpdateTags}
            onAddNote={handleAddNote}
          />
        )}
      </div>
    </div>
  );
}