'use client';

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Eye,
  MessageSquare,
  Plus,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

// Types
interface MetricCardData {
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

interface Post {
  id: string;
  content: string;
  platforms: string[];
  engagement: number;
  reach: number;
  publishedAt: string;
  imageUrl?: string;
}

interface Activity {
  id: string;
  type: 'post' | 'comment' | 'mention' | 'follower';
  message: string;
  timestamp: string;
  platform?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  
  // Fetch engagement trend data
  const { data: engagementTrendData, isLoading: trendLoading } = useQuery({
    queryKey: ['engagementTrend', dateRange],
    queryFn: () => apiClient.getEngagementTrend({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      granularity: 'daily',
    }),
  });

  // Fetch platform breakdown
  const { data: platformData, isLoading: platformLoading } = useQuery({
    queryKey: ['platformBreakdown', dateRange],
    queryFn: () => apiClient.getPlatformBreakdown({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
  });

  // Fetch top performing posts
  const { data: topPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ['topPosts', dateRange],
    queryFn: () => apiClient.getTopPosts({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 6,
      sortBy: 'engagement',
    }),
  });

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('metrics:update', (data) => {
      setRealtimeMetrics(data);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Merge real-time metrics with fetched data
  const metrics = realtimeMetrics || analyticsData || {};
  
  // Transform time series data for the engagement trend chart
  const engagementTrend = (engagementTrendData || []).map((item: any) => ({
    date: item.timestamp,
    likes: item.metrics?.likes || 0,
    comments: item.metrics?.comments || 0,
    shares: item.metrics?.shares || 0,
  }));
  
  // Transform platform breakdown data for the pie chart
  const platformBreakdown = (platformData || []).map((item: any) => ({
    name: item.platform,
    value: item.engagement || 0,
  }));
  
  const topPosts = topPostsData || [];
  
  const recentActivity: Activity[] = [
    // Mock recent activity - this would come from a real endpoint
    {
      id: '1',
      type: 'post',
      message: 'New post published on Instagram',
      timestamp: new Date().toISOString(),
      platform: 'instagram',
    },
    {
      id: '2',
      type: 'follower',
      message: '50 new followers on Twitter',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      platform: 'twitter',
    },
    {
      id: '3',
      type: 'comment',
      message: 'New comment on your latest Facebook post',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      platform: 'facebook',
    },
  ];

  // KPI Metrics
  const formatChange = (value: number) => {
    if (value > 0) return `+${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const formatPercentChange = (value: number) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    return `${value.toFixed(1)}%`;
  };

  const kpiMetrics: MetricCardData[] = [
    {
      label: 'Total Followers',
      value: metrics.totalFollowers?.toLocaleString() || '0',
      change: formatChange(metrics.followerGrowth || 0),
      icon: Users,
      trend: (metrics.followerGrowth || 0) > 0 ? 'up' : (metrics.followerGrowth || 0) < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Engagement Rate',
      value: `${metrics.engagementRate?.toFixed(1) || '0'}%`,
      change: formatChange(metrics.engagementGrowth || 0),
      icon: Heart,
      trend: (metrics.engagementGrowth || 0) > 0 ? 'up' : (metrics.engagementGrowth || 0) < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Total Reach',
      value: metrics.totalReach?.toLocaleString() || '0',
      change: formatChange(metrics.reachGrowth || 0),
      icon: Eye,
      trend: (metrics.reachGrowth || 0) > 0 ? 'up' : (metrics.reachGrowth || 0) < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Posts Published',
      value: metrics.totalPosts?.toLocaleString() || '0',
      change: formatChange(metrics.postsGrowth || 0),
      icon: MessageSquare,
      trend: (metrics.postsGrowth || 0) > 0 ? 'up' : (metrics.postsGrowth || 0) < 0 ? 'down' : 'neutral',
    },
  ];

  // Platform colors for pie chart
  const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    youtube: '#FF0000',
    pinterest: '#E60023',
  };

  const handleRefresh = () => {
    refetchAnalytics();
  };

  if (analyticsLoading && !realtimeMetrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your social media performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/app/content')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>
              Daily engagement over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementTrendChart data={engagementTrend} loading={analyticsLoading} />
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>
              Engagement by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformBreakdownChart 
              data={platformBreakdown} 
              colors={PLATFORM_COLORS}
              loading={analyticsLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Posts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>
                  Your best content this month
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/app/analytics')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TopPerformingPosts posts={topPosts} loading={postsLoading} />
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed activities={recentActivity} loading={analyticsLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={Plus}
              label="Create Post"
              onClick={() => router.push('/app/content')}
            />
            <QuickActionButton
              icon={Calendar}
              label="Schedule Content"
              onClick={() => router.push('/app/content?view=calendar')}
            />
            <QuickActionButton
              icon={BarChart3}
              label="View Analytics"
              onClick={() => router.push('/app/analytics')}
            />
            <QuickActionButton
              icon={MessageSquare}
              label="Check Inbox"
              onClick={() => router.push('/app/inbox')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, change, icon: Icon, trend }: MetricCardData) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendBg = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Engagement Trend Chart Component
function EngagementTrendChart({ data, loading }: { data: any[]; loading: boolean }) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="likes" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="comments" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="shares" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Platform Breakdown Chart Component
function PlatformBreakdownChart({ 
  data, 
  colors, 
  loading 
}: { 
  data: any[]; 
  colors: Record<string, string>; 
  loading: boolean;
}) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.name.toLowerCase()] || '#8b5cf6'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Top Performing Posts Component
function TopPerformingPosts({ posts, loading }: { posts: Post[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="w-full h-32 object-cover rounded-md mb-3"
            />
          )}
          <p className="text-sm line-clamp-2 mb-3">{post.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {post.engagement?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.reach?.toLocaleString() || 0}
              </span>
            </div>
            <span>{format(new Date(post.publishedAt), 'MMM d')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Recent Activity Feed Component
function RecentActivityFeed({ activities, loading }: { activities: Activity[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {activity.type === 'post' && <MessageSquare className="w-4 h-4 text-primary" />}
            {activity.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-600" />}
            {activity.type === 'mention' && <TrendingUp className="w-4 h-4 text-green-600" />}
            {activity.type === 'follower' && <Users className="w-4 h-4 text-purple-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{activity.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <Button 
      variant="outline" 
      className="h-24 flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
      onClick={onClick}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

// Dashboard Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
