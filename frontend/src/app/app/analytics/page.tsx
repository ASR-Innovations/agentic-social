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
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabGroup } from '@/components/ui/tab-group';
import { LoadingState, Skeleton } from '@/components/ui/loading-state';

const metrics = [
  { title: 'Total Reach', value: '124.5K', change: '+12.3%', trend: 'up' as const, icon: Eye },
  { title: 'Engagement Rate', value: '8.2%', change: '+2.1%', trend: 'up' as const, icon: Heart },
  { title: 'New Followers', value: '2,847', change: '+18.7%', trend: 'up' as const, icon: Users },
  { title: 'Total Posts', value: '156', change: '+5.2%', trend: 'up' as const, icon: BarChart3 }
];

const topPosts = [
  { id: 1, content: 'AI-powered social media automation is here! 🚀', platform: 'Instagram', engagement: 1247, reach: 15600, likes: 892, comments: 234, shares: 121, date: '2024-01-14' },
  { id: 2, content: 'Behind the scenes: How we build amazing products', platform: 'LinkedIn', engagement: 892, reach: 12300, likes: 654, comments: 178, shares: 60, date: '2024-01-13' },
  { id: 3, content: 'Quick tip: Optimize your posting times with AI', platform: 'Twitter', engagement: 634, reach: 8900, likes: 445, comments: 123, shares: 66, date: '2024-01-12' }
];

const platformData = [
  { platform: 'Instagram', engagement: 45, posts: 42, reach: '56.2K' },
  { platform: 'LinkedIn', engagement: 28, posts: 38, reach: '34.8K' },
  { platform: 'Twitter', engagement: 18, posts: 52, reach: '22.4K' },
  { platform: 'Facebook', engagement: 9, posts: 24, reach: '11.1K' },
];

const aiInsights = [
  { id: 1, type: 'optimization', title: 'Optimization Tip', message: 'Post between 2-4 PM for 23% higher engagement', icon: Target },
  { id: 2, type: 'trend', title: 'Trend Alert', message: 'Video content performing 40% better this week', icon: TrendingUp },
  { id: 3, type: 'insight', title: 'Audience Insight', message: 'Your audience is most active on weekdays', icon: Activity },
  { id: 4, type: 'warning', title: 'Engagement Drop', message: 'Weekend posts show 15% lower engagement', icon: TrendingDown }
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [platformProgress, setPlatformProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      platformData.forEach((platform, index) => {
        setTimeout(() => setPlatformProgress(prev => ({ ...prev, [platform.platform]: platform.engagement })), index * 150);
      });
    }
  }, [isLoading]);

  const timeRangeTabs = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-500">Performance insights and metrics</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <TabGroup tabs={timeRangeTabs} activeTab={timeRange} onChange={setTimeRange} variant="pills" />
          <Button className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm min-h-[44px] sm:min-h-[40px]">
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-1/2 bg-gray-100" />
                  <Skeleton className="h-7 w-3/4 bg-gray-100" />
                  <Skeleton className="h-4 w-1/3 bg-gray-100" />
                </div>
                <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0 bg-gray-100" />
              </div>
            </div>
          ))
        ) : (
          metrics.map((metric, index) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }} className="group">
                <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${metric.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                        <TrendIcon className="w-3 h-3" />{metric.change}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Performance Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Performance Overview</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Engagement and reach trends</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-64 flex items-center justify-center">
                    <LoadingState variant="spinner" size="lg" text="Loading chart data..." />
                  </motion.div>
                ) : (
                  <motion.div key="chart" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Chart visualization</p>
                      <p className="text-xs text-gray-500 mt-1">Interactive charts coming soon</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Posts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Top Posts</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Best performing content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <Skeleton className="h-3 w-1/3 mb-2 bg-gray-200" />
                        <Skeleton className="h-3 w-full mb-2 bg-gray-200" />
                        <Skeleton className="h-3 w-2/3 bg-gray-200" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {topPosts.map((post, index) => (
                      <motion.div key={post.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ x: 4 }} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-gray-900 text-white border-0 text-xs">{post.platform}</Badge>
                          <span className="text-xs text-gray-400">{post.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments}</span>
                          <span className="flex items-center gap-1"><Share className="w-3 h-3" />{post.shares}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Eye className="w-3 h-3" /><span>{post.reach.toLocaleString()} reach</span></div>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Platform Performance</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Engagement by platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-3 w-20 bg-gray-100" />
                        <Skeleton className="h-2 flex-1 bg-gray-100" />
                        <Skeleton className="h-3 w-10 bg-gray-100" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="platforms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {platformData.map((item, index) => (
                      <motion.div key={item.platform} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.platform}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{item.posts} posts</span>
                            <span>•</span>
                            <span>{item.reach}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${platformProgress[item.platform] || 0}%` }} transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }} />
                          </div>
                          <span className="text-xs text-gray-900 font-bold w-10 text-right">{item.engagement}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-gray-900 text-white border-0 shadow-lg">
            <CardHeader className="pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-white">AI Insights</CardTitle>
                  <CardDescription className="text-sm text-gray-400">Smart recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0 bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-1/3 bg-white/10" />
                            <Skeleton className="h-3 w-full bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {aiInsights.map((insight, index) => (
                      <motion.div key={insight.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} whileHover={{ x: 4 }} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <insight.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-white mb-1">{insight.title}</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{insight.message}</p>
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
