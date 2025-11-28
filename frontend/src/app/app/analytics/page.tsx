'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share,
  Download,
  BarChart3,
  Activity,
  Target,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabGroup } from '@/components/ui/tab-group';
import { LoadingState, Skeleton } from '@/components/ui/loading-state';

const metrics = [
  {
    title: 'Total Reach',
    value: '124.5K',
    change: '+12.3%',
    trend: 'up' as const,
    icon: <Eye className="w-5 h-5" />,
    description: 'Total impressions across all platforms'
  },
  {
    title: 'Engagement Rate',
    value: '8.2%',
    change: '+2.1%',
    trend: 'up' as const,
    icon: <Heart className="w-5 h-5" />,
    description: 'Average engagement across posts'
  },
  {
    title: 'New Followers',
    value: '2,847',
    change: '+18.7%',
    trend: 'up' as const,
    icon: <Users className="w-5 h-5" />,
    description: 'New followers this period'
  },
  {
    title: 'Total Posts',
    value: '156',
    change: '+5.2%',
    trend: 'up' as const,
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Published posts this period'
  }
];

const topPosts = [
  {
    id: 1,
    content: 'AI-powered social media automation is here! 🚀',
    platform: 'Instagram',
    engagement: 1247,
    reach: 15600,
    likes: 892,
    comments: 234,
    shares: 121,
    date: '2024-01-14'
  },
  {
    id: 2,
    content: 'Behind the scenes: How we build amazing products',
    platform: 'LinkedIn',
    engagement: 892,
    reach: 12300,
    likes: 654,
    comments: 178,
    shares: 60,
    date: '2024-01-13'
  },
  {
    id: 3,
    content: 'Quick tip: Optimize your posting times with AI',
    platform: 'Twitter',
    engagement: 634,
    reach: 8900,
    likes: 445,
    comments: 123,
    shares: 66,
    date: '2024-01-12'
  }
];

const platformData = [
  { platform: 'Instagram', engagement: 45, posts: 42, reach: '56.2K' },
  { platform: 'LinkedIn', engagement: 28, posts: 38, reach: '34.8K' },
  { platform: 'Twitter', engagement: 18, posts: 52, reach: '22.4K' },
  { platform: 'Facebook', engagement: 9, posts: 24, reach: '11.1K' },
];

const aiInsights = [
  {
    id: 1,
    type: 'optimization',
    title: 'Optimization Tip',
    message: 'Post between 2-4 PM for 23% higher engagement',
    icon: Target
  },
  {
    id: 2,
    type: 'trend',
    title: 'Trend Alert',
    message: 'Video content performing 40% better this week',
    icon: TrendingUp
  },
  {
    id: 3,
    type: 'insight',
    title: 'Audience Insight',
    message: 'Your audience is most active on weekdays',
    icon: Activity
  },
  {
    id: 4,
    type: 'warning',
    title: 'Engagement Drop',
    message: 'Weekend posts show 15% lower engagement',
    icon: TrendingDown
  }
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [platformProgress, setPlatformProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Animate progress bars when data loads
  useEffect(() => {
    if (!isLoading) {
      platformData.forEach((platform, index) => {
        setTimeout(() => {
          setPlatformProgress(prev => ({
            ...prev,
            [platform.platform]: platform.engagement
          }));
        }, index * 150);
      });
    }
  }, [isLoading]);

  const timeRangeTabs = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-page p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-gray-100"
      >
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight truncate">
            Analytics
          </h1>
          <p className="text-sm text-gray-500">Performance insights and metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <TabGroup
            tabs={timeRangeTabs}
            activeTab={timeRange}
            onChange={setTimeRange}
            variant="pills"
          />
          <Button className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none min-h-[44px] sm:min-h-[36px]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50/50 rounded-lg border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                </div>
              </div>
            ))}
          </>
        ) : (
          metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative bg-gray-50/50 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 p-6 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-light text-gray-900 tracking-tight">
                    {metric.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-gray-400">vs last period</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-900">Performance Overview</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Engagement and reach trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-64 flex items-center justify-center"
                  >
                    <LoadingState variant="spinner" size="lg" text="Loading chart data..." />
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-100"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      </motion.div>
                      <p className="text-sm text-gray-600 font-medium">Chart visualization</p>
                      <p className="text-xs text-gray-400 mt-1">Recharts integration placeholder</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-900">Top Posts</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Best performing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white border border-gray-100">
                        <Skeleton className="h-3 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-2/3 mb-3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    {topPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="default" size="sm" className="bg-gray-900 text-white border-0">
                            {post.platform}
                          </Badge>
                          <span className="text-xs text-gray-400">{post.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="w-3 h-3" />
                            <span>{post.shares}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />
                            <span>{post.reach.toLocaleString()} reach</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-900">Platform Performance</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Engagement by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="platforms"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {platformData.map((item, index) => (
                      <motion.div
                        key={item.platform}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.platform}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{item.posts} posts</span>
                            <span>•</span>
                            <span>{item.reach}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gray-900"
                              initial={{ width: 0 }}
                              animate={{ width: `${platformProgress[item.platform] || 0}%` }}
                              transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 font-medium w-10 text-right">{item.engagement}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-400" />
                <CardTitle className="text-base font-medium text-gray-900">AI Insights</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-500">
                Recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white border border-gray-100">
                        <div className="flex items-start gap-3">
                          <Skeleton variant="circular" className="w-6 h-6 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-1/3" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center flex-shrink-0"
                          >
                            <insight.icon className="w-3 h-3 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900 mb-1">
                              {insight.title}
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}