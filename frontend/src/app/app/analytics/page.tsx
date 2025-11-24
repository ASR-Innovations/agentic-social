'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Target,
  DollarSign,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker, DateRange } from '@/components/analytics/date-range-picker';
import { KPICard } from '@/components/analytics/kpi-card';
import { EngagementChart } from '@/components/analytics/engagement-chart';
import { PostsPerformanceTable } from '@/components/analytics/posts-performance-table';
import { AudienceDemographics } from '@/components/analytics/audience-demographics';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { ExportMenu } from '@/components/analytics/export-menu';
import { useApi } from '@/hooks/useApi';
import apiClient from '@/lib/api';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: '30d',
  });

  // Fetch analytics data
  const { data: overviewData, loading: overviewLoading } = useApi(
    () => apiClient.getAnalytics({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    }),
    [dateRange]
  );

  const { data: engagementData, loading: engagementLoading } = useApi(
    () => apiClient.getEngagementTrend({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    }),
    [dateRange]
  );

  const { data: topPostsData, loading: postsLoading } = useApi(
    () => apiClient.getTopPosts({
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      limit: 20,
    }),
    [dateRange]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    const blob = await apiClient.exportData({
      type: 'analytics',
      format,
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!mounted) {
    return null;
  }

  // Mock data for demonstration
  const kpiData = overviewData || {
    totalReach: 124500,
    reachChange: 12.3,
    engagementRate: 8.2,
    engagementChange: 2.1,
    newFollowers: 2847,
    followersChange: 18.7,
    totalPosts: 156,
    postsChange: 5.2,
  };

  const chartData = engagementData || [
    { date: '2024-01-01', engagement: 1200, reach: 15000, impressions: 25000 },
    { date: '2024-01-02', engagement: 1350, reach: 16500, impressions: 27000 },
    { date: '2024-01-03', engagement: 1100, reach: 14000, impressions: 23000 },
    { date: '2024-01-04', engagement: 1500, reach: 18000, impressions: 30000 },
    { date: '2024-01-05', engagement: 1650, reach: 19500, impressions: 32000 },
    { date: '2024-01-06', engagement: 1400, reach: 17000, impressions: 28000 },
    { date: '2024-01-07', engagement: 1800, reach: 21000, impressions: 35000 },
  ];

  const postsData = topPostsData || [
    {
      id: '1',
      content: 'AI-powered social media automation is here! 🚀',
      platform: 'Instagram',
      publishedAt: '2024-01-14',
      impressions: 25000,
      reach: 18000,
      engagement: 1800,
      likes: 1200,
      comments: 450,
      shares: 150,
      engagementRate: 10.0,
    },
    {
      id: '2',
      content: 'Behind the scenes: How we build amazing products',
      platform: 'LinkedIn',
      publishedAt: '2024-01-13',
      impressions: 18000,
      reach: 14000,
      engagement: 1200,
      likes: 850,
      comments: 280,
      shares: 70,
      engagementRate: 8.57,
    },
    {
      id: '3',
      content: 'Quick tip: Optimize your posting times with AI',
      platform: 'Twitter',
      publishedAt: '2024-01-12',
      impressions: 12000,
      reach: 9500,
      engagement: 750,
      likes: 520,
      comments: 180,
      shares: 50,
      engagementRate: 7.89,
    },
  ];

  const ageData = [
    { name: '18-24', value: 2400 },
    { name: '25-34', value: 4567 },
    { name: '35-44', value: 3200 },
    { name: '45-54', value: 1800 },
    { name: '55+', value: 1200 },
  ];

  const genderData = [
    { name: 'Male', value: 6500 },
    { name: 'Female', value: 5800 },
    { name: 'Other', value: 867 },
  ];

  const locationData = [
    { name: 'United States', value: 5200 },
    { name: 'United Kingdom', value: 3100 },
    { name: 'Canada', value: 2400 },
    { name: 'Australia', value: 1800 },
    { name: 'Germany', value: 1500 },
  ];

  const funnelData = [
    { name: 'Impressions', value: 125000, percentage: 100 },
    { name: 'Reach', value: 85000, percentage: 68 },
    { name: 'Engagement', value: 12500, percentage: 10 },
    { name: 'Clicks', value: 3200, percentage: 2.56 },
    { name: 'Conversions', value: 450, percentage: 0.36 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportMenu onExport={handleExport} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <KPICard
                title="Total Reach"
                value={kpiData.totalReach.toLocaleString()}
                change={kpiData.reachChange}
                icon={Eye}
                color="from-blue-500 to-cyan-500"
                loading={overviewLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <KPICard
                title="Engagement Rate"
                value={`${kpiData.engagementRate}%`}
                change={kpiData.engagementChange}
                icon={Heart}
                color="from-pink-500 to-rose-500"
                loading={overviewLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <KPICard
                title="New Followers"
                value={kpiData.newFollowers.toLocaleString()}
                change={kpiData.followersChange}
                icon={Users}
                color="from-green-500 to-emerald-500"
                loading={overviewLoading}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <KPICard
                title="Total Posts"
                value={kpiData.totalPosts.toString()}
                change={kpiData.postsChange}
                icon={TrendingUp}
                color="from-purple-500 to-indigo-500"
                loading={overviewLoading}
              />
            </motion.div>
          </div>

          {/* Engagement Chart */}
          <EngagementChart data={chartData} loading={engagementLoading} />

          {/* Top Posts Preview */}
          <PostsPerformanceTable posts={postsData.slice(0, 5)} loading={postsLoading} />
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <PostsPerformanceTable posts={postsData} loading={postsLoading} />
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <AudienceDemographics
            ageData={ageData}
            genderData={genderData}
            locationData={locationData}
            loading={false}
          />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <EngagementChart data={chartData} loading={engagementLoading} />
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionFunnel stages={funnelData} loading={false} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <KPICard
                title="Total Revenue"
                value="$12,450"
                change={24.5}
                icon={DollarSign}
                color="from-green-500 to-emerald-500"
              />
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}