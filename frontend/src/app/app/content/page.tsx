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

  const handleCreatePost = async (publishImmediately = false) => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    
    if (publishImmediately && newPost.socialAccountIds.length === 0) {
      toast.error('Please select at least one platform to publish');
      return;
    }
    
    try {
      setCreating(true);
      
      // Create post first (always as draft initially)
      const response = await apiClient.client.post('/posts', {
        ...newPost,
        scheduledAt: publishImmediately ? undefined : (newPost.scheduledAt || undefined),
        // Don't set status to publishing here - let the publish endpoint handle it
      });
      
      // If publishing immediately, trigger the publish endpoint AFTER creating as draft
      if (publishImmediately && response.data?.id) {
        try {
          await apiClient.client.post(`/posts/${response.data.id}/publish`);
          toast.success('🚀 Post is being published!');
        } catch (publishError: any) {
          // If publish fails, the post is still saved as draft
          toast.error(publishError.response?.data?.message || 'Failed to publish, saved as draft');
        }
      } else {
        toast.success(newPost.scheduledAt ? '📅 Post scheduled successfully!' : '💾 Post saved as draft!');
      }
      
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

        {/* Content Views - Redesigned Cards */}
        <AnimatePresence mode="wait">
          {!isLoading && filteredPosts.length > 0 && (
            <motion.div key={viewMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <LayoutGroup>
                {viewMode === 'grid' && (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredPosts.map((post) => {
                      const status = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;
                      const TypeIcon = postTypeIcons[post.type as keyof typeof postTypeIcons] || FileText;
                      const statusColors: Record<string, string> = {
                        draft: 'bg-gray-100 text-gray-600 border-gray-200',
                        scheduled: 'bg-blue-50 text-blue-600 border-blue-200',
                        publishing: 'bg-amber-50 text-amber-600 border-amber-200',
                        published: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                        failed: 'bg-red-50 text-red-600 border-red-200',
                        cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
                      };
                      return (
                        <motion.div key={post.id} layout variants={itemVariants} whileHover={!prefersReducedMotion ? { y: -6, scale: 1.01 } : {}} className="group">
                          <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl h-full transition-all duration-300 overflow-hidden">
                            {/* Status Banner */}
                            <div className={`px-4 py-2 flex items-center justify-between ${
                              post.status === 'published' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100' :
                              post.status === 'scheduled' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                              post.status === 'failed' ? 'bg-gradient-to-r from-red-50 to-red-100' :
                              post.status === 'publishing' ? 'bg-gradient-to-r from-amber-50 to-amber-100' :
                              'bg-gradient-to-r from-gray-50 to-gray-100'
                            }`}>
                              <div className="flex items-center gap-2">
                                <status.icon className={`w-4 h-4 ${
                                  post.status === 'published' ? 'text-emerald-500' :
                                  post.status === 'scheduled' ? 'text-blue-500' :
                                  post.status === 'failed' ? 'text-red-500' :
                                  post.status === 'publishing' ? 'text-amber-500 animate-spin' :
                                  'text-gray-500'
                                }`} />
                                <span className={`text-xs font-bold uppercase tracking-wide ${
                                  post.status === 'published' ? 'text-emerald-700' :
                                  post.status === 'scheduled' ? 'text-blue-700' :
                                  post.status === 'failed' ? 'text-red-700' :
                                  post.status === 'publishing' ? 'text-amber-700' :
                                  'text-gray-600'
                                }`}>{status.label}</span>
                              </div>
                              <div className="relative">
                                <button
                                  onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                                  className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                                {selectedPost === post.id && (
                                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-2 overflow-hidden">
                                    <button onClick={() => { setSelectedPost(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                                      <Edit className="w-4 h-4" />Edit Post
                                    </button>
                                    <button onClick={() => { handleDuplicatePost(post.id); setSelectedPost(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors">
                                      <Copy className="w-4 h-4" />Duplicate
                                    </button>
                                    {post.status === 'draft' && (
                                      <button onClick={() => { handlePublishNow(post.id); setSelectedPost(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-3 text-emerald-600 font-medium transition-colors">
                                        <Send className="w-4 h-4" />Publish Now
                                      </button>
                                    )}
                                    {post.status === 'scheduled' && (
                                      <button onClick={() => { handleCancelScheduled(post.id); setSelectedPost(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 flex items-center gap-3 text-amber-600 transition-colors">
                                        <XCircle className="w-4 h-4" />Cancel Schedule
                                      </button>
                                    )}
                                    <div className="border-t border-gray-100 my-1" />
                                    <button onClick={() => { handleDeletePost(post.id); setSelectedPost(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors">
                                      <Trash2 className="w-4 h-4" />Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Card Content */}
                            <div className="p-5">
                              {/* Title */}
                              <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base group-hover:text-emerald-600 transition-colors">{post.title}</h4>
                              
                              {/* Content Preview */}
                              <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{post.content}</p>
                              
                              {/* Meta Info */}
                              <div className="flex items-center gap-3 mb-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[post.status] || statusColors.draft}`}>
                                  <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
                                  {post.type}
                                </span>
                                {post.scheduledAt && post.status === 'scheduled' && (
                                  <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {new Date(post.scheduledAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              
                              {/* Platform badges */}
                              {post.platforms && post.platforms.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-xs text-gray-400">Platforms:</span>
                                  <div className="flex items-center gap-1">
                                    {post.platforms.slice(0, 4).map((platform: any, i: number) => {
                                      const PlatformIcon = platformIcons[platform.platform as keyof typeof platformIcons] || Target;
                                      const platformStatus = platform.status;
                                      return (
                                        <div 
                                          key={i} 
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                            platformStatus === 'published' ? 'bg-emerald-100 text-emerald-600' :
                                            platformStatus === 'failed' ? 'bg-red-100 text-red-600' :
                                            'bg-gray-100 text-gray-600'
                                          }`}
                                          title={`${platform.platform} - ${platformStatus}`}
                                        >
                                          <PlatformIcon className="w-4 h-4" />
                                        </div>
                                      );
                                    })}
                                    {post.platforms.length > 4 && (
                                      <span className="text-xs text-gray-400 ml-1">+{post.platforms.length - 4}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
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
                          </div>
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

      {/* Create Post Modal - ULTIMATE Enhanced */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-emerald-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50, rotateX: -10 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="bg-white rounded-[2rem] shadow-[0_25px_100px_-12px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-white/20"
            >
              {/* Header - Stunning Gradient with Animation */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 flex-shrink-0 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="absolute bottom-0 left-10 w-32 h-32 bg-cyan-300/20 rounded-full translate-y-1/2 blur-xl" />
                  <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-emerald-300/10 rounded-full blur-lg" />
                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <motion.div 
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 ring-4 ring-white/10"
                    >
                      <Plus className="w-8 h-8 text-white drop-shadow-lg" />
                    </motion.div>
                    <div>
                      <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-black text-white tracking-tight drop-shadow-lg"
                      >
                        Create New Post
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 text-sm font-medium"
                      >
                        ✨ Share your content across all platforms
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/20 shadow-lg"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                
                {/* Progress indicator */}
                <div className="relative mt-5 flex items-center gap-3">
                  <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${newPost.title.trim() ? 'bg-white' : 'bg-white/30'}`} />
                  <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${newPost.content.trim() ? 'bg-white' : 'bg-white/30'}`} />
                  <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${newPost.socialAccountIds.length > 0 ? 'bg-white' : 'bg-white/30'}`} />
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-slate-50 via-white to-slate-50">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Content */}
                  <div className="space-y-6">
                    {/* Title Input - Stunning */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="group bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-6 border border-purple-100/50 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-gray-900">Post Title</span>
                          <p className="text-xs font-normal text-gray-500">Make it catchy and engaging</p>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="✍️ Enter your amazing title..."
                        className="w-full px-5 py-4 rounded-2xl border-2 border-purple-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 outline-none text-lg font-medium bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-300"
                      />
                    </motion.div>

                    {/* Content Textarea - Stunning */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="group bg-gradient-to-br from-white to-orange-50/30 rounded-3xl p-6 border border-orange-100/50 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
                    >
                      <label className="flex items-center justify-between text-sm font-bold text-gray-800 mb-4">
                        <span className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <PenTool className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-gray-900">Content</span>
                            <p className="text-xs font-normal text-gray-500">Write something amazing</p>
                          </div>
                        </span>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setShowCreateModal(false); setShowAIModal(true); }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          ✨ AI Magic
                        </motion.button>
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="💭 What's on your mind? Share your thoughts..."
                        rows={7}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-orange-100 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 outline-none text-base resize-none bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-300 leading-relaxed"
                      />
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${newPost.content.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-semibold text-gray-600">{newPost.content.length} characters</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                          newPost.content.length > 280 
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700' 
                            : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                        }`}>
                          <Twitter className="w-3.5 h-3.5" />
                          {newPost.content.length > 280 ? `${newPost.content.length - 280} over` : `${280 - newPost.content.length} left`}
                        </div>
                      </div>
                    </motion.div>

                    {/* Post Type - Stunning */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="group bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-6 border border-blue-100/50 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-gray-900">Content Type</span>
                          <p className="text-xs font-normal text-gray-500">Choose your format</p>
                        </div>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(postTypeIcons).map(([type, Icon]) => (
                          <motion.button
                            key={type}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewPost({ ...newPost, type })}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                              newPost.type === type
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/20'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <Icon className={`w-6 h-6 ${newPost.type === type ? 'text-blue-600' : ''}`} />
                            <span className="text-xs font-bold capitalize">{type}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column - Settings */}
                  <div className="space-y-6">
                    {/* Platform Selection - Stunning */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="group bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl p-6 border border-indigo-100/50 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900">Publish To</span>
                          <p className="text-xs font-normal text-gray-500">Select your platforms</p>
                        </div>
                        {newPost.socialAccountIds.length > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full font-bold shadow-lg shadow-emerald-500/30"
                          >
                            {newPost.socialAccountIds.length} selected ✓
                          </motion.span>
                        )}
                      </label>
                      {socialAccounts.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 border-2 border-dashed border-indigo-200 text-center">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Target className="w-10 h-10 text-indigo-400" />
                          </div>
                          <p className="text-lg font-bold text-gray-800 mb-2">No accounts connected</p>
                          <p className="text-sm text-gray-500 mb-5">Connect your social media accounts to start publishing</p>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/app/settings'} 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                            Connect Account
                          </motion.button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {socialAccounts.map((account, index) => {
                            const PlatformIcon = platformIcons[account.platform as keyof typeof platformIcons] || Target;
                            const isSelected = newPost.socialAccountIds.includes(account.id);
                            const platformColors: Record<string, string> = {
                              twitter: 'from-sky-400 to-blue-500',
                              instagram: 'from-pink-500 via-purple-500 to-orange-400',
                              linkedin: 'from-blue-600 to-blue-700',
                              facebook: 'from-blue-500 to-blue-600',
                            };
                            return (
                              <motion.button
                                key={account.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (isSelected) {
                                    setNewPost({ ...newPost, socialAccountIds: newPost.socialAccountIds.filter(id => id !== account.id) });
                                  } else {
                                    setNewPost({ ...newPost, socialAccountIds: [...newPost.socialAccountIds, account.id] });
                                  }
                                }}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                  isSelected
                                    ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                                    : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/30'
                                }`}
                              >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                                  isSelected 
                                    ? `bg-gradient-to-br ${platformColors[account.platform] || 'from-gray-500 to-gray-600'} text-white` 
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500'
                                }`}>
                                  <PlatformIcon className="w-7 h-7" />
                                </div>
                                <div className="text-left flex-1">
                                  <p className="text-base font-bold text-gray-900">{account.displayName || account.platform}</p>
                                  <p className="text-sm text-gray-500">@{account.username}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs text-emerald-600 font-semibold">Connected & Ready</span>
                                  </div>
                                </div>
                                <motion.div 
                                  className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'border-gray-300 bg-white'}`}
                                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                >
                                  {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                                </motion.div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>

                    {/* Schedule - Stunning */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="group bg-gradient-to-br from-white to-cyan-50/30 rounded-3xl p-6 border border-cyan-100/50 shadow-lg shadow-cyan-500/5 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                    >
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-gray-900">When to Publish</span>
                          <p className="text-xs font-normal text-gray-500">Schedule or save for later</p>
                        </div>
                      </label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setNewPost({ ...newPost, scheduledAt: '' })}
                          className={`p-5 rounded-2xl border-2 text-center transition-all ${
                            !newPost.scheduledAt 
                              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10' 
                              : 'border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${!newPost.scheduledAt ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg' : 'bg-gray-100'}`}>
                            <FileText className={`w-6 h-6 ${!newPost.scheduledAt ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <p className={`text-sm font-bold ${!newPost.scheduledAt ? 'text-emerald-700' : 'text-gray-600'}`}>Save as Draft</p>
                          <p className={`text-xs mt-1 ${!newPost.scheduledAt ? 'text-emerald-600' : 'text-gray-400'}`}>Edit later</p>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(9, 0, 0, 0);
                            setNewPost({ ...newPost, scheduledAt: tomorrow.toISOString().slice(0, 16) });
                          }}
                          className={`p-5 rounded-2xl border-2 text-center transition-all ${
                            newPost.scheduledAt 
                              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10' 
                              : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${newPost.scheduledAt ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg' : 'bg-gray-100'}`}>
                            <Clock className={`w-6 h-6 ${newPost.scheduledAt ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <p className={`text-sm font-bold ${newPost.scheduledAt ? 'text-blue-700' : 'text-gray-600'}`}>Schedule Post</p>
                          <p className={`text-xs mt-1 ${newPost.scheduledAt ? 'text-blue-600' : 'text-gray-400'}`}>Pick a time</p>
                        </motion.button>
                      </div>
                      {newPost.scheduledAt && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="overflow-hidden"
                        >
                          <input
                            type="datetime-local"
                            value={newPost.scheduledAt}
                            onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base bg-gradient-to-r from-blue-50 to-cyan-50 text-gray-900 transition-all font-medium"
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Footer - ULTIMATE Actions */}
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 border-t border-gray-200 flex-shrink-0">
                {/* Status indicators - Stunning */}
                <div className="flex items-center justify-center gap-4 mb-5">
                  <motion.div 
                    animate={newPost.title.trim() && newPost.content.trim() ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm ${
                      newPost.title.trim() && newPost.content.trim() 
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 ring-2 ring-emerald-500/20' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      newPost.title.trim() && newPost.content.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    ✓ Content Ready
                  </motion.div>
                  <motion.div 
                    animate={newPost.socialAccountIds.length > 0 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm ${
                      newPost.socialAccountIds.length > 0 
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 ring-2 ring-blue-500/20' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      newPost.socialAccountIds.length > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    {newPost.socialAccountIds.length} Platform{newPost.socialAccountIds.length !== 1 ? 's' : ''} Selected
                  </motion.div>
                </div>
                
                {/* Warning message - Enhanced */}
                {newPost.socialAccountIds.length === 0 && socialAccounts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-center justify-center gap-3 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 px-5 py-4 rounded-2xl shadow-sm"
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                    <span className="font-medium">Select at least one platform to enable <strong className="text-amber-900">Publish Now</strong></span>
                  </motion.div>
                )}
                
                {/* Action Buttons - ULTIMATE */}
                <div className="flex items-center gap-4">
                  {/* Cancel Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-16 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </motion.button>
                  
                  {/* Save/Schedule Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreatePost(false)}
                    disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
                    className={`flex-1 h-16 px-6 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                      creating || !newPost.title.trim() || !newPost.content.trim()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                    }`}
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : newPost.scheduledAt ? (
                      <>
                        <Clock className="w-5 h-5" />
                        📅 Schedule
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        💾 Save Draft
                      </>
                    )}
                  </motion.button>
                  
                  {/* Publish Now Button - ULTIMATE */}
                  <motion.button
                    whileHover={creating || !newPost.title.trim() || !newPost.content.trim() || newPost.socialAccountIds.length === 0 ? {} : { scale: 1.03, y: -2 }}
                    whileTap={creating || !newPost.title.trim() || !newPost.content.trim() || newPost.socialAccountIds.length === 0 ? {} : { scale: 0.98 }}
                    onClick={() => handleCreatePost(true)}
                    disabled={creating || !newPost.title.trim() || !newPost.content.trim() || newPost.socialAccountIds.length === 0}
                    className={`flex-1 h-16 px-8 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-3 ${
                      creating || !newPost.title.trim() || !newPost.content.trim() || newPost.socialAccountIds.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/60 ring-4 ring-emerald-500/20'
                    }`}
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        🚀 Publish Now
                      </>
                    )}
                  </motion.button>
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
