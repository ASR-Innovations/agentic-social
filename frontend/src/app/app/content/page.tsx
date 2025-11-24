'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Calendar as CalendarIcon,
  Grid3x3,
  List,
  Columns,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarGrid, CalendarView, Post } from '@/components/content/calendar-grid';
import { PostPreviewModal } from '@/components/content/post-preview-modal';
import { PostCreationSidebar } from '@/components/content/post-creation-sidebar';
import { BulkActionsToolbar } from '@/components/content/bulk-actions-toolbar';
import { CalendarFilters, CalendarFilters as FilterType } from '@/components/content/calendar-filters';
import { toast } from 'react-hot-toast';

// Mock data for demonstration
const generateMockPosts = (): Post[] => {
  const posts: Post[] = [];
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const daysOffset = Math.floor(Math.random() * 30) - 15;
    const hoursOffset = Math.floor(Math.random() * 24);
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
    scheduledDate.setHours(hoursOffset, 0, 0, 0);
    
    posts.push({
      id: `post-${i + 1}`,
      content: [
        'Excited to announce our new AI-powered features! 🚀 Transform your social media strategy with intelligent automation.',
        'Behind the scenes: How our team builds amazing products. Check out our latest blog post for insights! 💡',
        'Quick tip: Use AI to optimize your posting times for maximum engagement. Here\'s what we learned...',
        'Customer success story: How @company increased their social media ROI by 300% using our platform 📈',
        'Join us for our upcoming webinar on social media marketing trends! Register now 🎯',
        'New blog post: 10 ways to boost your social media engagement in 2024 📱',
      ][i % 6],
      platforms: [
        ['instagram', 'twitter'],
        ['linkedin', 'facebook'],
        ['twitter', 'instagram', 'linkedin'],
        ['facebook'],
        ['instagram'],
        ['linkedin', 'twitter'],
      ][i % 6],
      scheduledAt: scheduledDate,
      status: ['scheduled', 'published', 'draft', 'failed'][Math.floor(Math.random() * 4)] as any,
      mediaType: ['image', 'video', 'carousel'][Math.floor(Math.random() * 3)] as any,
      aiGenerated: Math.random() > 0.5,
    });
  }
  
  return posts;
};

export default function ContentPage() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreationSidebar, setShowCreationSidebar] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    platforms: [],
    status: [],
    dateRange: { start: null, end: null },
    tags: [],
  });

  useEffect(() => {
    setMounted(true);
    setPosts(generateMockPosts());
  }, []);

  if (!mounted) {
    return null;
  }

  // Apply filters
  const filteredPosts = posts.filter(post => {
    // Search filter
    if (filters.search && !post.content.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Platform filter
    if (filters.platforms.length > 0 && !post.platforms.some(p => filters.platforms.includes(p))) {
      return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(post.status)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.start && new Date(post.scheduledAt) < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && new Date(post.scheduledAt) > filters.dateRange.end) {
      return false;
    }
    
    return true;
  });

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowPreviewModal(true);
  };

  const handlePostDrop = (postId: string, newDate: Date) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, scheduledAt: newDate }
          : post
      )
    );
    toast.success('Post rescheduled successfully');
  };

  const handleSavePost = (post: Post) => {
    if (editingPost) {
      setPosts(prevPosts =>
        prevPosts.map(p => (p.id === post.id ? post : p))
      );
      toast.success('Post updated successfully');
    } else {
      setPosts(prevPosts => [...prevPosts, post]);
      toast.success('Post created successfully');
    }
    setEditingPost(undefined);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowCreationSidebar(true);
  };

  const handleDuplicatePost = (post: Post) => {
    const newPost = {
      ...post,
      id: `post-${Date.now()}`,
      status: 'draft' as const,
    };
    setPosts(prevPosts => [...prevPosts, newPost]);
    toast.success('Post duplicated successfully');
  };

  const handleDeletePost = (post: Post) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
    toast.success('Post deleted successfully');
  };

  const handleSelectAll = () => {
    setSelectedPostIds(filteredPosts.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPostIds([]);
  };

  const handleBulkDelete = (postIds: string[]) => {
    setPosts(prevPosts => prevPosts.filter(p => !postIds.includes(p.id)));
    setSelectedPostIds([]);
    toast.success(`${postIds.length} post(s) deleted successfully`);
  };

  const handleBulkReschedule = (postIds: string[], newDate: Date) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        postIds.includes(post.id)
          ? { ...post, scheduledAt: newDate }
          : post
      )
    );
    setSelectedPostIds([]);
    toast.success(`${postIds.length} post(s) rescheduled successfully`);
  };

  const handleBulkDuplicate = (postIds: string[]) => {
    const newPosts = posts
      .filter(p => postIds.includes(p.id))
      .map(post => ({
        ...post,
        id: `post-${Date.now()}-${Math.random()}`,
        status: 'draft' as const,
      }));
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    setSelectedPostIds([]);
    toast.success(`${postIds.length} post(s) duplicated successfully`);
  };

  const handleBulkExport = (postIds: string[]) => {
    // TODO: Implement CSV export
    toast.success(`Exporting ${postIds.length} post(s)...`);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      platforms: [],
      status: [],
      dateRange: { start: null, end: null },
      tags: [],
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Calendar</h1>
          <p className="text-gray-400">Schedule and manage your social media content</p>
        </div>
        <Button
          className="gradient-primary"
          onClick={() => {
            setEditingPost(undefined);
            setShowCreationSidebar(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* View Selector and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 glass-card p-1">
          <button
            onClick={() => setView('month')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'month'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>Month</span>
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'week'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Week</span>
          </button>
          <button
            onClick={() => setView('day')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'day'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Day</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="glass">
            {filteredPosts.length} posts
          </Badge>
          <Badge variant="glass">
            {filteredPosts.filter(p => p.status === 'scheduled').length} scheduled
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        posts={filteredPosts}
        onDateChange={setCurrentDate}
        onPostClick={handlePostClick}
        onPostDrop={handlePostDrop}
      />

      {/* Post Preview Modal */}
      <PostPreviewModal
        post={selectedPost}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onEdit={handleEditPost}
        onDuplicate={handleDuplicatePost}
        onDelete={handleDeletePost}
      />

      {/* Post Creation Sidebar */}
      <PostCreationSidebar
        isOpen={showCreationSidebar}
        onClose={() => {
          setShowCreationSidebar(false);
          setEditingPost(undefined);
        }}
        onSave={handleSavePost}
        editingPost={editingPost}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        posts={filteredPosts}
        selectedPostIds={selectedPostIds}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkDelete={handleBulkDelete}
        onBulkReschedule={handleBulkReschedule}
        onBulkDuplicate={handleBulkDuplicate}
        onBulkExport={handleBulkExport}
      />
    </div>
  );
}