import { Conversation, Message } from '@/types';

// Mock conversations for development and testing
export const mockConversations: Conversation[] = [
  {
    id: '1',
    platform: 'instagram',
    participantId: '@johndoe',
    participantName: 'John Doe',
    participantAvatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: {
      id: 'm1',
      conversationId: '1',
      content: 'Hey! I love your recent post about social media marketing. Can you share more tips?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    unreadCount: 2,
    sentiment: 'positive',
    priority: 'medium',
    assignedTo: undefined,
    tags: ['marketing', 'inquiry'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    platform: 'twitter',
    participantId: '@sarahsmith',
    participantName: 'Sarah Smith',
    participantAvatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: {
      id: 'm2',
      conversationId: '2',
      content: 'I had an issue with my recent order. Can someone help?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'negative',
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    unreadCount: 1,
    sentiment: 'negative',
    priority: 'high',
    assignedTo: 'Support Team',
    tags: ['support', 'urgent'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    platform: 'linkedin',
    participantId: 'mike-johnson',
    participantName: 'Mike Johnson',
    participantAvatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: {
      id: 'm3',
      conversationId: '3',
      content: 'Thank you for the quick response! That solved my problem.',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    unreadCount: 0,
    sentiment: 'positive',
    priority: 'low',
    assignedTo: undefined,
    tags: ['resolved'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: '4',
    platform: 'facebook',
    participantId: 'emily.davis',
    participantName: 'Emily Davis',
    participantAvatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: {
      id: 'm4',
      conversationId: '4',
      content: 'When will the new product be available?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'neutral',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    unreadCount: 1,
    sentiment: 'neutral',
    priority: 'medium',
    assignedTo: undefined,
    tags: ['product', 'inquiry'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '5',
    platform: 'tiktok',
    participantId: '@creativecreator',
    participantName: 'Creative Creator',
    participantAvatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: {
      id: 'm5',
      conversationId: '5',
      content: 'Would love to collaborate on a project! Are you interested?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    unreadCount: 3,
    sentiment: 'positive',
    priority: 'medium',
    assignedTo: undefined,
    tags: ['collaboration', 'opportunity'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

// Mock messages for a conversation
export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1-1',
      conversationId: '1',
      content: 'Hi there! I saw your post about social media strategies.',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: 'm1-2',
      conversationId: '1',
      content: 'Hello! Thank you for reaching out. I\'d be happy to share more insights!',
      mediaUrls: [],
      isFromUser: true,
      aiSuggested: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    },
    {
      id: 'm1-3',
      conversationId: '1',
      content: 'That would be amazing! Specifically, I\'m interested in content scheduling.',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    },
    {
      id: 'm1-4',
      conversationId: '1',
      content: 'Great question! Content scheduling is crucial for maintaining consistency. I recommend using tools that support multiple platforms and have AI-powered optimal posting time suggestions.',
      mediaUrls: [],
      isFromUser: true,
      aiSuggested: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21 hours ago
    },
    {
      id: 'm1-5',
      conversationId: '1',
      content: 'Hey! I love your recent post about social media marketing. Can you share more tips?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
  ],
  '2': [
    {
      id: 'm2-1',
      conversationId: '2',
      content: 'I had an issue with my recent order. Can someone help?',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'negative',
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
  ],
  '3': [
    {
      id: 'm3-1',
      conversationId: '3',
      content: 'I\'m having trouble accessing my account.',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'negative',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      id: 'm3-2',
      conversationId: '3',
      content: 'I apologize for the inconvenience. Let me help you with that. Can you provide your account email?',
      mediaUrls: [],
      isFromUser: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
    },
    {
      id: 'm3-3',
      conversationId: '3',
      content: 'Sure, it\'s mike.johnson@example.com',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'neutral',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 'm3-4',
      conversationId: '3',
      content: 'Thank you! I\'ve reset your password and sent you an email with instructions.',
      mediaUrls: [],
      isFromUser: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
    },
    {
      id: 'm3-5',
      conversationId: '3',
      content: 'Thank you for the quick response! That solved my problem.',
      mediaUrls: [],
      isFromUser: false,
      sentiment: 'positive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
  ],
};

// Helper function to get mock messages for a conversation
export function getMockMessages(conversationId: string): Message[] {
  return mockMessages[conversationId] || [];
}
