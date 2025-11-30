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
  Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCard } from '@/components/ui/loading-state';
import { TabGroup } from '@/components/ui/tab-group';

const mockMessages = [
  { id: 1, platform: 'Instagram', platformIcon: Instagram, sender: 'Sarah Johnson', senderHandle: '@sarahjohnson', avatar: 'SJ', message: 'Love your recent post about AI automation! Can you share more details about the implementation?', timestamp: '2 minutes ago', unread: true, starred: false, type: 'direct' },
  { id: 2, platform: 'Twitter', platformIcon: Twitter, sender: 'Mike Chen', senderHandle: '@mikechen', avatar: 'MC', message: 'Great insights on social media strategy! Would love to collaborate on a project.', timestamp: '15 minutes ago', unread: true, starred: true, type: 'mention' },
  { id: 3, platform: 'LinkedIn', platformIcon: Linkedin, sender: 'Emily Rodriguez', senderHandle: 'emily-rodriguez', avatar: 'ER', message: "Thank you for connecting! I'm interested in learning more about your AI solutions.", timestamp: '1 hour ago', unread: false, starred: false, type: 'direct' },
  { id: 4, platform: 'Facebook', platformIcon: Facebook, sender: 'David Park', senderHandle: 'david.park', avatar: 'DP', message: 'Your content is amazing! How do you manage to post so consistently?', timestamp: '3 hours ago', unread: false, starred: false, type: 'comment' },
  { id: 5, platform: 'Instagram', platformIcon: Instagram, sender: 'Lisa Anderson', senderHandle: '@lisaanderson', avatar: 'LA', message: 'This is exactly what I needed! Do you offer consulting services?', timestamp: '5 hours ago', unread: false, starred: true, type: 'direct' },
  { id: 6, platform: 'Twitter', platformIcon: Twitter, sender: 'James Wilson', senderHandle: '@jameswilson', avatar: 'JW', message: 'Retweeted your post! The AI tips were super helpful.', timestamp: '1 day ago', unread: false, starred: false, type: 'mention' },
];

export default function InboxPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filterTabs = [
    { id: 'all', label: 'All Messages', count: messages.length },
    { id: 'unread', label: 'Unread', count: messages.filter(m => m.unread).length },
    { id: 'starred', label: 'Starred', count: messages.filter(m => m.starred).length },
  ];

  const filteredMessages = messages.filter(message => {
    if (activeFilter === 'unread' && !message.unread) return false;
    if (activeFilter === 'starred' && !message.starred) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return message.sender.toLowerCase().includes(query) || message.message.toLowerCase().includes(query) || message.platform.toLowerCase().includes(query);
    }
    return true;
  });

  const handleStarToggle = (messageId: number) => setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, starred: !msg.starred } : msg));
  const handleMarkAsRead = (messageId: number) => setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, unread: false } : msg));
  const handleArchive = (messageId: number) => setMessages(prev => prev.filter(msg => msg.id !== messageId));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <InboxIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Social Inbox</h1>
            <p className="text-sm text-gray-500">Unified message center across all platforms</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white border-gray-200 hover:bg-gray-50 shadow-sm">
            <Filter className="w-4 h-4 mr-2" />Filters
          </Button>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm">
            <Send className="w-4 h-4 mr-2" />Compose
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search messages, senders, or platforms..." onClear={() => setSearchQuery('')} />
        </div>
        <TabGroup tabs={filterTabs} activeTab={activeFilter} onChange={setActiveFilter} variant="pills" />
      </motion.div>

      {/* Messages List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : filteredMessages.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-12">
                  <EmptyState
                    icon={<InboxIcon className="w-12 h-12" />}
                    title={searchQuery ? 'No messages found' : 'Your inbox is empty'}
                    description={searchQuery ? "Try adjusting your search or filters." : "When you receive messages, they'll appear here."}
                    iconGradient="from-gray-100 to-gray-200"
                  />
                </motion.div>
              ) : (
                <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-gray-100">
                  {filteredMessages.map((message, index) => {
                    const PlatformIcon = message.platformIcon;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-5 cursor-pointer transition-all hover:bg-gray-50 ${message.unread ? 'bg-emerald-50/30' : ''} ${selectedMessage === message.id ? 'bg-gray-50' : ''}`}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium text-sm">{message.avatar}</div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200">
                              <PlatformIcon className="w-3 h-3 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-sm font-medium text-gray-900 ${message.unread ? 'font-semibold' : ''}`}>{message.sender}</h3>
                                <span className="text-xs text-gray-400">{message.senderHandle}</span>
                                <Badge variant="default" size="sm" className="bg-gray-900 text-white border-0 text-xs">{message.type}</Badge>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{message.timestamp}</span>
                              </div>
                            </div>
                            <p className={`text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed ${message.unread ? 'font-medium' : ''}`}>{message.message}</p>
                            <div className="flex items-center gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); handleStarToggle(message.id); }} className={`p-1.5 rounded-lg transition-all ${message.starred ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                <Star className={`w-3.5 h-3.5 ${message.starred ? 'fill-current' : ''}`} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(message.id); }} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleArchive(message.id); }} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleArchive(message.id); }} className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Footer */}
      {!isLoading && filteredMessages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
          <p>Showing {filteredMessages.length} of {messages.length} messages</p>
          <p>{messages.filter(m => m.unread).length} unread</p>
        </motion.div>
      )}
    </div>
  );
}
