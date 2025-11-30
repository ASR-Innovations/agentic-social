'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Filter,
  Clock,
  Star,
  Archive,
  Trash2,
  Reply,
  MoreVertical,
  CheckCircle2,
  Inbox as InboxIcon,
  Send,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bot,
  Bell,
  ChevronDown,
  RefreshCw,
  Heart,
  MessageCircle,
  AtSign,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Meh,
  X,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

const platformIcons: Record<string, any> = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
};

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: 'emerald', label: 'Positive' },
  negative: { icon: ThumbsDown, color: 'rose', label: 'Negative' },
  neutral: { icon: Meh, color: 'gray', label: 'Neutral' },
};

type MessageType = 'comment' | 'mention' | 'dm' | 'reply';
type SentimentType = 'positive' | 'negative' | 'neutral';

interface Message {
  id: string;
  platform: string;
  type: MessageType;
  author: { name: string; username: string; avatar?: string };
  content: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  sentiment: SentimentType;
  priority: 'high' | 'medium' | 'low';
  postContext?: string;
}

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    platform: 'twitter',
    type: 'mention',
    author: { name: 'John Doe', username: 'johndoe' },
    content: 'Love your latest post! The insights about AI are spot on 🔥',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    starred: true,
    sentiment: 'positive',
    priority: 'high',
  },
  {
    id: '2',
    platform: 'instagram',
    type: 'comment',
    author: { name: 'Jane Smith', username: 'janesmith' },
    content: 'This is exactly what I needed to hear today. Thank you!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    starred: false,
    sentiment: 'positive',
    priority: 'medium',
    postContext: 'Morning motivation post',
  },
  {
    id: '3',
    platform: 'linkedin',
    type: 'comment',
    author: { name: 'Mike Johnson', username: 'mikej' },
    content: 'Interesting perspective. Would love to discuss this further.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    starred: false,
    sentiment: 'neutral',
    priority: 'medium',
  },
  {
    id: '4',
    platform: 'facebook',
    type: 'dm',
    author: { name: 'Sarah Wilson', username: 'sarahw' },
    content: 'Hi! I have a question about your services.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    starred: false,
    sentiment: 'neutral',
    priority: 'high',
  },
];

export default function InboxPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.read;
    if (filter === 'starred') return msg.starred;
    if (filter === 'priority') return msg.priority === 'high';
    if (filter !== 'all' && msg.platform !== filter) return false;
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;
  const highPriorityCount = messages.filter(m => m.priority === 'high').length;
  const positiveCount = messages.filter(m => m.sentiment === 'positive').length;
  const negativeCount = messages.filter(m => m.sentiment === 'negative').length;
  const totalMessages = messages.length;

  const handleMarkAsRead = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleToggleStar = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const handleDelete = (id: string) => {
    setMessages(msgs => msgs.filter(m => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <InboxIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Social Inbox</h1>
            <p className="text-sm text-gray-500">Unified engagement center</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsLoading(true)} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white h-10">
            <Send className="w-4 h-4 mr-2" />Compose
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Total</p>
                <p className="text-lg font-bold text-gray-900">{totalMessages}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Unread</p>
                <p className="text-lg font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Priority</p>
                <p className="text-lg font-bold text-rose-600">{highPriorityCount}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <Flag className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Positive</p>
                <p className="text-lg font-bold text-emerald-600">{positiveCount}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Negative</p>
                <p className="text-lg font-bold text-rose-600">{negativeCount}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'starred', label: 'Starred' },
            { id: 'priority', label: 'Priority' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Button variant="outline" onClick={() => setShowFilterMenu(!showFilterMenu)} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
              <Filter className="w-4 h-4 mr-2" />Platform
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10 py-2">
                {['all', 'twitter', 'instagram', 'linkedin', 'facebook'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => { setFilter(platform); setShowFilterMenu(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${filter === platform ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}
                  >
                    {platform !== 'all' && (() => {
                      const Icon = platformIcons[platform];
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filteredMessages.length === 0 ? (
            <EmptyState
              icon={<InboxIcon className="w-10 h-10" />}
              title="No Messages"
              description="Your inbox is empty or no messages match your filters."
              iconGradient="from-gray-100 to-gray-200"
            />
          ) : (
            filteredMessages.map((message) => {
              const PlatformIcon = platformIcons[message.platform] || MessageSquare;
              const SentimentIcon = sentimentConfig[message.sentiment].icon;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ x: 4 }}
                  onClick={() => { setSelectedMessage(message); handleMarkAsRead(message.id); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : message.read
                      ? 'border-gray-100 bg-white hover:border-gray-200'
                      : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.platform === 'twitter' ? 'bg-blue-100 text-blue-500' :
                      message.platform === 'instagram' ? 'bg-pink-100 text-pink-500' :
                      message.platform === 'linkedin' ? 'bg-blue-100 text-blue-700' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <PlatformIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{message.author.name}</span>
                        <span className="text-xs text-gray-400">@{message.author.username}</span>
                        {!message.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        {message.priority === 'high' && <Flag className="w-3 h-3 text-rose-500" />}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{message.content}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        <Badge className={`text-[10px] bg-${sentimentConfig[message.sentiment].color}-50 text-${sentimentConfig[message.sentiment].color}-600 border-${sentimentConfig[message.sentiment].color}-200`}>
                          <SentimentIcon className="w-3 h-3 mr-1" />
                          {sentimentConfig[message.sentiment].label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleStar(message.id); }} className={`p-1.5 rounded-lg transition-colors ${message.starred ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}>
                        <Star className={`w-4 h-4 ${message.starred ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(message.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Message Detail Panel */}
        <div className="hidden lg:block">
          <Card className="bg-white border border-gray-100 shadow-sm sticky top-6">
            <CardContent className="p-6">
              {selectedMessage ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedMessage.platform === 'twitter' ? 'bg-blue-100 text-blue-500' :
                        selectedMessage.platform === 'instagram' ? 'bg-pink-100 text-pink-500' :
                        selectedMessage.platform === 'linkedin' ? 'bg-blue-100 text-blue-700' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {(() => {
                          const Icon = platformIcons[selectedMessage.platform];
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedMessage.author.name}</h3>
                        <p className="text-xs text-gray-500">@{selectedMessage.author.username}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">{selectedMessage.content}</p>
                  <div className="flex items-center gap-2 mb-6">
                    <Badge className={`text-xs bg-${sentimentConfig[selectedMessage.sentiment].color}-50 text-${sentimentConfig[selectedMessage.sentiment].color}-600`}>
                      {sentimentConfig[selectedMessage.sentiment].label}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatTime(selectedMessage.timestamp)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10">
                      <Reply className="w-4 h-4 mr-2" />Reply
                    </Button>
                    <Button variant="outline" className="w-full bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
                      <Sparkles className="w-4 h-4 mr-2" />AI Suggest Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">No Message Selected</h3>
                  <p className="text-sm text-gray-500">Click on a message to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
