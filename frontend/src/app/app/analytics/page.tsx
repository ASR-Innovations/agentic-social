'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const metrics = [
  {
    title: 'Total Reach',
    value: '124.5K',
    change: '+12.3%',
    icon: Eye,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Engagement Rate',
    value: '8.2%',
    change: '+2.1%',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'New Followers',
    value: '2,847',
    change: '+18.7%',
    icon: Users,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Total Posts',
    value: '156',
    change: '+5.2%',
    icon: BarChart3,
    color: 'from-purple-500 to-indigo-500'
  }
];

const topPosts = [
  {
    id: 1,
    content: 'AI-powered social media automation is here! 🚀',
    platform: 'Instagram',
    engagement: 1247,
    reach: 15600,
    date: '2024-01-14'
  },
  {
    id: 2,
    content: 'Behind the scenes: How we build amazing products',
    platform: 'LinkedIn',
    engagement: 892,
    reach: 12300,
    date: '2024-01-13'
  },
  {
    id: 3,
    content: 'Quick tip: Optimize your posting times with AI',
    platform: 'Twitter',
    engagement: 634,
    reach: 8900,
    date: '2024-01-12'
  }
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Track your social media performance and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg`}>
                    <metric.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Performance Overview</CardTitle>
              <CardDescription className="text-gray-600">
                Engagement and reach trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                  <p className="text-gray-700 font-medium">Interactive chart would be rendered here</p>
                  <p className="text-sm text-gray-500 mt-1">Using Recharts or similar library</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Posts */}
        <div>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Top Performing Posts</CardTitle>
              <CardDescription className="text-gray-600">
                Your best content this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:border-indigo-300 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                        {post.platform}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">{post.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg">
                          <Heart className="w-3.5 h-3.5 text-pink-500" />
                          {post.engagement}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          {post.reach.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Platform Performance</CardTitle>
            <CardDescription className="text-gray-600">
              Engagement by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { platform: 'Instagram', engagement: '45%', color: 'from-pink-500 to-purple-500' },
                { platform: 'LinkedIn', engagement: '28%', color: 'from-blue-600 to-blue-800' },
                { platform: 'Twitter', engagement: '18%', color: 'from-blue-400 to-blue-600' },
                { platform: 'Facebook', engagement: '9%', color: 'from-blue-500 to-indigo-600' },
              ].map((item) => (
                <div key={item.platform} className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium w-24">{item.platform}</span>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} shadow-sm`}
                        style={{ width: item.engagement }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 font-semibold w-12">{item.engagement}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">AI Insights</CardTitle>
            <CardDescription className="text-gray-600">
              AI-generated recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-semibold mb-1">Optimization Tip</p>
                    <p className="text-xs text-gray-700">Post between 2-4 PM for 23% higher engagement</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-semibold mb-1">Trend Alert</p>
                    <p className="text-xs text-gray-700">Video content performing 40% better this week</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 font-semibold mb-1">Audience Insight</p>
                    <p className="text-xs text-gray-700">Your audience is most active on weekdays</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}