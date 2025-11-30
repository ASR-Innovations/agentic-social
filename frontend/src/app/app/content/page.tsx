'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Plus,
  Calendar,
  Grid3X3,
  List,
  Search,
  FileText,
  Sparkles,
  Clock,
  Zap,
  TrendingUp,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Image,
  Video,
  Layers,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Play,
  Pause,
  ArrowUpRight,
  Hash,
  PenTool,
  Wand2,
  Target,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { usePosts } from '@/hooks/useContent';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

type ViewMode = 'grid' | 'list' | 'calendar';
type TabType = 'all' | 'draft' | 'scheduled' | 'published' | 'failed';

const postTypeIcons = {
  text: FileText,
  image: Image,
  video: Video,
  carousel: Layers,
  story: Play,
  reel: Video,
};

const platformIcons = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
};

const statusConfig = {
  draft: { color: 'gray', icon: FileText, label: 'Draft' },
  scheduled: { color: 'blue', icon: Clock, label: 'Scheduled' },
  publishing: { color: 'amber', icon: RefreshCw, label: 'Publishing' },
  published: { color: 'emerald', icon: CheckCircle, label: 'Published' },
  failed: { color: 'rose', icon: AlertCircle, label: 'Failed' },
  cancelled: { color: 'gray', icon: XCircle, label: 'Cancelled' },
};

export default function ContentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postTypeFilter, setPostTypeFilter] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { data: posts = [], isLoading, refetch } = usePosts();

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'text',
    scheduledAt: '',
    socialAccountIds: [] as string[],
  });
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  
  // AI Generation state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiPlatform, setAiPlatform] = useState('twitter');
  const [aiTone, setAiTone] = useState('engaging');
  const [aiVariations, setAiVariations] = useState<string[]>([]);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);

  useEffect(() => {
    loadSocialAccounts();
  }, []);

  const loadSocialAccounts = async () => {
    try {
      const response = await apiClient.client.get('/social-accounts');
      setSocialAccounts(response.data);
    } catch (error) {
      console.error('Failed to load social accounts:', error);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Posts', count: posts.length },
    { id: 'draft', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
    { id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
    { id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
    { id: 'failed', label: 'Failed', count: posts.filter(p => p.status === 'failed').length },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'all' || post.status === activeTab;
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !postTypeFilter || post.type === postTypeFilter;
    return matchesTab && matchesSearch && matchesType;
  });

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    
    try {
      setCreating(true);
      await apiClient.client.post('/posts', {
        ...newPost,
        scheduledAt: newPost.scheduledAt || undefined,
      });
      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'text', scheduledAt: '', socialAccountIds: [] });
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.client.delete(`/posts/${postId}`);
      toast.success('Post deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleDuplicatePost = async (postId: string) => {
    try {
      await apiClient.client.post(`/posts/${postId}/duplicate`);
      toast.success('Post duplicated');
      refetch();
    } catch (error) {
      toast.error('Failed to duplicate post');
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      await apiClient.client.post(`/posts/${postId}/publish`);
      toast.success('Publishing post...');
      refetch();
    } catch (error) {
      toast.error('Failed to publish post');
    }
  };

  const handleCancelScheduled = async (postId: string) => {
    try {
      await apiClient.client.post(`/posts/${postId}/cancel`);
      toast.success('Scheduled post cancelled');
      refetch();
    } catch (error) {
      toast.error('Failed to cancel post');
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setAiGenerating(true);
      const response = await apiClient.client.post('/agents/generate-content', {
        platform: aiPlatform,
        topic: aiTopic,
        tone: aiTone,
        variations: 3,
        includeHashtags: true,
        includeEmojis: true,
      });

      const data = response.data;
      setAiVariations(data.variations || [data.content]);
      setAiHashtags(data.hashtags || []);
      toast.success('Content generated successfully!');
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate content');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSelectAIContent = (content: string) => {
    const hashtagString = aiHashtags.length > 0 ? '\n\n' + aiHashtags.join(' ') : '';
    setNewPost({
      ...newPost,
      content: content + hashtagString,
      title: aiTopic.slice(0, 50) + (aiTopic.length > 50 ? '...' : ''),
    });
    setShowAIModal(false);
    setShowCreateModal(true);
    toast.success('Content added to post');
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

  // Stats calculations
  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const publishedThisWeek = posts.filter(p => {
    if (p.status !== 'published') return false;
    const publishedDate = new Date(p.publishedAt || p.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return publishedDate >= weekAgo;
  }).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Content Hub</h1>
              <p className="text-sm text-gray-500">Create, schedule, and manage your posts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10">
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm h-10 px-6">
              <Plus className="w-4 h-4 mr-2" />Create Post
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduledPosts}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Published This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{publishedThisWeek}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Connected Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{socialAccounts.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs and Controls */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/50 text-gray-500'}`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 w-full md:w-72 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all caret-gray-900"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-10 ${postTypeFilter ? 'border-emerald-500' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {postTypeFilter ? postTypeFilter : 'Filter'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10 py-2">
                  <button
                    onClick={() => { setPostTypeFilter(null); setShowFilterMenu(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!postTypeFilter ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}
                  >
                    All Types
                  </button>
                  {['text', 'image', 'video', 'carousel', 'story', 'reel'].map(type => (
                    <button
                      key={type}
                      onClick={() => { setPostTypeFilter(type); setShowFilterMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${postTypeFilter === type ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}
                    >
                      {(() => {
                        const Icon = postTypeIcons[type as keyof typeof postTypeIcons];
                        return <Icon className="w-4 h-4" />;
                      })()}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('calendar')} className={`min-w-[36px] min-h-[36px] rounded-lg ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-xs text-gray-500">Create content faster with AI-powered tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { icon: PenTool, label: 'Write Caption', desc: 'AI-generated captions', color: 'emerald', action: 'ai' },
                  { icon: Hash, label: 'Find Hashtags', desc: 'Trending hashtags', color: 'blue', action: 'ai' },
                  { icon: Image, label: 'Create Image', desc: 'AI image generation', color: 'purple', action: 'create' },
                  { icon: Wand2, label: 'Improve Content', desc: 'Enhance your text', color: 'amber', action: 'ai' },
                  { icon: Calendar, label: 'Schedule Post', desc: 'Plan ahead', color: 'rose', action: 'create' },
                  { icon: Sparkles, label: 'AI Assistant', desc: 'Get suggestions', color: 'cyan', action: 'ai' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => action.action === 'ai' ? setShowAIModal(true) : setShowCreateModal(true)}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-colors`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-500`} />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-1">{action.label}</h4>
                    <p className="text-[10px] text-gray-500">{action.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <EmptyState icon={<FileText className="w-10 h-10" />} title="No Content Yet" description="Start creating engaging content for your social media channels." iconGradient="from-gray-100 to-gray-200">
            <div className="mt-8 w-full">
              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">AI-Powered</h4>
                  <p className="text-xs text-gray-500">Generate captions and hashtags</p>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:bg-gray-200 transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Smart Scheduling</h4>
                  <p className="text-xs text-gray-500">Post at optimal times</p>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:bg-gray-200 transition-colors">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Analytics</h4>
                  <p className="text-xs text-gray-500">Track performance</p>
                </motion.div>
              </motion.div>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-8">
                  <Plus className="w-4 h-4 mr-2" />Create Your First Post
                </Button>
              </div>
            </div>
          </EmptyState>
        )}

        {/* No Results State */}
        {!isLoading && posts.length > 0 && filteredPosts.length === 0 && (
          <EmptyState icon={<Search className="w-10 h-10" />} title="No Results Found" description={`No posts match your ${searchQuery ? 'search query' : 'filter criteria'}.`} iconGradient="from-gray-100 to-gray-200" action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setActiveTab('all'); setPostTypeFilter(null); } }} />
        )}

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {!isLoading && filteredPosts.length > 0 && (
            <motion.div key={viewMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <LayoutGroup>
                {viewMode === 'grid' && (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredPosts.map((post) => {
                      const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;
                      const TypeIcon = postTypeIcons[post.type as keyof typeof postTypeIcons] || FileText;
                      return (
                        <motion.div key={post.id} layout variants={itemVariants} whileHover={!prefersReducedMotion ? { y: -4 } : {}} className="group">
                          <Card className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md h-full transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-${status.color}-50 text-${status.color}-600`}>
                                    <status.icon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-600">
                                    <TypeIcon className="w-3 h-3 mr-1" />
                                    {post.type}
                                  </span>
                                </div>
                                <div className="relative">
                                  <button
                                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                  </button>
                                  {selectedPost === post.id && (
                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg z-10 py-1">
                                      <button onClick={() => { setSelectedPost(null); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                        <Edit className="w-3.5 h-3.5" />Edit
                                      </button>
                                      <button onClick={() => { handleDuplicatePost(post.id); setSelectedPost(null); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                        <Copy className="w-3.5 h-3.5" />Duplicate
                                      </button>
                                      {post.status === 'draft' && (
                                        <button onClick={() => { handlePublishNow(post.id); setSelectedPost(null); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-emerald-600">
                                          <Send className="w-3.5 h-3.5" />Publish Now
                                        </button>
                                      )}
                                      {post.status === 'scheduled' && (
                                        <button onClick={() => { handleCancelScheduled(post.id); setSelectedPost(null); }} className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-amber-600">
                                          <XCircle className="w-3.5 h-3.5" />Cancel Schedule
                                        </button>
                                      )}
                                      <button onClick={() => { handleDeletePost(post.id); setSelectedPost(null); }} className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600">
                                        <Trash2 className="w-3.5 h-3.5" />Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{post.content}</p>
                              
                              {/* Platform badges */}
                              {post.platforms && post.platforms.length > 0 && (
                                <div className="flex items-center gap-1 mb-4">
                                  {post.platforms.slice(0, 3).map((platform: any, i: number) => {
                                    const PlatformIcon = platformIcons[platform.platform as keyof typeof platformIcons] || Target;
                                    return (
                                      <div key={i} className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <PlatformIcon className="w-3 h-3 text-gray-600" />
                                      </div>
                                    );
                                  })}
                                  {post.platforms.length > 3 && (
                                    <span className="text-[10px] text-gray-500">+{post.platforms.length - 3}</span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {post.scheduledAt
                                      ? `Scheduled: ${new Date(post.scheduledAt).toLocaleDateString()}`
                                      : new Date(post.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {post.status === 'published' && post.platforms?.[0]?.platformPostUrl && (
                                  <a href={post.platforms[0].platformPostUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    View <ArrowUpRight className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {viewMode === 'list' && (
                  <motion.div layout className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredPosts.map((post) => {
                      const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;
                      const TypeIcon = postTypeIcons[post.type as keyof typeof postTypeIcons] || FileText;
                      return (
                        <motion.div key={post.id} layout variants={itemVariants} whileHover={!prefersReducedMotion ? { x: 4 } : {}} className="group">
                          <Card className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-${status.color}-50`}>
                                  <TypeIcon className={`w-5 h-5 text-${status.color}-500`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-${status.color}-50 text-${status.color}-600`}>
                                      {status.label}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <Clock className="w-3 h-3" />
                                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {post.scheduledAt && (
                                      <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                                        Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{post.title}</h4>
                                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.content}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {post.status === 'draft' && (
                                    <Button size="sm" variant="outline" onClick={() => handlePublishNow(post.id)} className="h-8 px-3 text-xs bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100">
                                      <Send className="w-3 h-3 mr-1" />Publish
                                    </Button>
                                  )}
                                  <button onClick={() => handleDuplicatePost(post.id)} className="p-2 hover:bg-gray-100 rounded-lg"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
                                  <button onClick={() => handleDeletePost(post.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </LayoutGroup>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar View */}
        {viewMode === 'calendar' && !isLoading && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Content Calendar</CardTitle>
                  <CardDescription className="text-xs text-gray-500">View and manage your scheduled posts</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">{scheduledPosts} Scheduled</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const scheduledForDay = posts.filter(p => {
                    if (!p.scheduledAt) return false;
                    return new Date(p.scheduledAt).toDateString() === date.toDateString();
                  });
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-2 rounded-xl border transition-all ${
                        isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {date.getDate()}
                      </div>
                      {scheduledForDay.slice(0, 2).map((post, idx) => (
                        <div key={idx} className="text-[10px] bg-blue-100 text-blue-700 rounded px-1 py-0.5 mb-1 truncate">
                          {post.title}
                        </div>
                      ))}
                      {scheduledForDay.length > 2 && (
                        <div className="text-[10px] text-gray-500">+{scheduledForDay.length - 2} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Create New Post</h2>
                      <p className="text-xs text-gray-500">Compose and schedule your content</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Post Type</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(postTypeIcons).map(([type, Icon]) => (
                      <button
                        key={type}
                        onClick={() => setNewPost({ ...newPost, type })}
                        className={`p-3 rounded-xl border transition-all text-center ${
                          newPost.type === type
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${newPost.type === type ? 'text-emerald-500' : 'text-gray-500'}`} />
                        <span className="text-[10px] font-medium text-gray-700">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm bg-white text-gray-900 placeholder:text-gray-400 caret-gray-900"
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Write your post content..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm resize-none bg-white text-gray-900 placeholder:text-gray-400 caret-gray-900"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{newPost.content.length} characters</span>
                    <button 
                      onClick={() => { setShowCreateModal(false); setShowAIModal(true); }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />Generate with AI
                    </button>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Publish To</label>
                  {socialAccounts.length === 0 ? (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 mb-2">No social accounts connected</p>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/app/settings'} className="text-xs">
                        Connect Account
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {socialAccounts.map((account) => {
                        const PlatformIcon = platformIcons[account.platform as keyof typeof platformIcons] || Target;
                        const isSelected = newPost.socialAccountIds.includes(account.id);
                        return (
                          <button
                            key={account.id}
                            onClick={() => {
                              if (isSelected) {
                                setNewPost({ ...newPost, socialAccountIds: newPost.socialAccountIds.filter(id => id !== account.id) });
                              } else {
                                setNewPost({ ...newPost, socialAccountIds: [...newPost.socialAccountIds, account.id] });
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <PlatformIcon className="w-4 h-4" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{account.displayName || account.platform}</p>
                              <p className="text-[10px] text-gray-500 truncate">@{account.username}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledAt}
                    onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm bg-white text-gray-900 caret-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to save as draft</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : newPost.scheduledAt ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Schedule Post
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Content Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">AI Content Generator</h2>
                      <p className="text-xs text-gray-500">Generate engaging content with AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Platform Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Platform</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'blue' },
                      { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' },
                      { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
                      { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
                      { id: 'tiktok', label: 'TikTok', icon: Play, color: 'gray' },
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => setAiPlatform(platform.id)}
                        className={`p-3 rounded-xl border transition-all text-center ${
                          aiPlatform === platform.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <platform.icon className={`w-5 h-5 mx-auto mb-1 ${aiPlatform === platform.id ? 'text-emerald-500' : 'text-gray-500'}`} />
                        <span className="text-[10px] font-medium text-gray-700">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Topic / Subject</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., New product launch, Industry trends, Tips for productivity..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm bg-white text-gray-900 placeholder:text-gray-400 caret-gray-900"
                  />
                </div>

                {/* Tone Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tone</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['engaging', 'professional', 'casual', 'humorous', 'inspirational', 'educational', 'promotional', 'storytelling'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setAiTone(tone)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          aiTone === tone
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 mb-6"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>

                {/* Generated Variations */}
                {aiVariations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Generated Variations</h3>
                      <span className="text-xs text-gray-500">{aiVariations.length} options</span>
                    </div>
                    
                    {aiVariations.map((variation, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                        onClick={() => handleSelectAIContent(variation)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                              <span className="text-xs text-gray-400">{variation.length} chars</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{variation}</p>
                          </div>
                          <button className="p-2 rounded-lg bg-emerald-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Hashtags */}
                    {aiHashtags.length > 0 && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Suggested Hashtags</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiHashtags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Back to Create */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => { setShowAIModal(false); setShowCreateModal(true); }}
                    className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    Back to Create Post
                  </Button>
                  <p className="text-xs text-gray-400">Click on a variation to use it</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
