'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  TrendingUp, 
  MessageSquare, 
  Hash, 
  AtSign,
  Heart,
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  Users,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const listeningMetrics = [
  {
    title: 'Brand Mentions',
    value: '1,247',
    change: '+18%',
    icon: AtSign,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Sentiment Score',
    value: '87%',
    change: '+5%',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Trending Topics',
    value: '23',
    change: '+12%',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Engagement Rate',
    value: '12.4%',
    change: '+3%',
    icon: MessageSquare,
    color: 'from-purple-500 to-indigo-500'
  }
];

const mentions = [
  {
    id: 1,
    author: '@techinfluencer',
    platform: 'Twitter',
    content: 'Just discovered this amazing AI social media tool! Game changer for content creators 🚀',
    sentiment: 'positive',
    engagement: 245,
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    author: '@marketingpro',
    platform: 'LinkedIn',
    content: 'The AI automation features are impressive. Saved us 10+ hours per week on content planning.',
    sentiment: 'positive',
    engagement: 189,
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    author: '@socialmediaguru',
    platform: 'Instagram',
    content: 'Anyone else using this for their social strategy? Would love to hear your experience!',
    sentiment: 'neutral',
    engagement: 92,
    timestamp: '6 hours ago'
  },
  {
    id: 4,
    author: '@digitalmarketer',
    platform: 'Twitter',
    content: 'The analytics dashboard could use some improvements, but overall solid platform.',
    sentiment: 'neutral',
    engagement: 67,
    timestamp: '8 hours ago'
  },
];

const trendingTopics = [
  { topic: '#AIMarketing', mentions: 1247, trend: 'up' },
  { topic: '#SocialMediaAutomation', mentions: 892, trend: 'up' },
  { topic: '#ContentCreation', mentions: 634, trend: 'stable' },
  { topic: '#DigitalMarketing', mentions: 521, trend: 'up' },
  { topic: '#MarketingTools', mentions: 389, trend: 'down' },
];

export default function ListeningPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Social Listening
          </h1>
          <p className="text-gray-600">Monitor brand mentions, sentiment, and trending topics</p>
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
          <Button className="border-gray-300 text-gray-700 hover:bg-gray-100" variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listeningMetrics.map((metric, index) => (
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
        {/* Recent Mentions */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Recent Mentions</CardTitle>
                  <CardDescription className="text-gray-600">
                    Latest conversations about your brand
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Search mentions..."
                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mentions.map((mention, index) => (
                  <motion.div
                    key={mention.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold">{mention.author}</span>
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                          {mention.platform}
                        </Badge>
                      </div>
                      <Badge
                        className={`text-xs ${
                          mention.sentiment === 'positive' ? 'bg-green-100 text-green-700 border-green-200' :
                          mention.sentiment === 'negative' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {mention.sentiment}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{mention.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-pink-500" />
                          {mention.engagement}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          {mention.engagement * 10}
                        </span>
                      </div>
                      <span className="text-gray-500">{mention.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Topics */}
        <div>
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900">Trending Topics</CardTitle>
              <CardDescription className="text-gray-600">
                Popular hashtags and keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.topic}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Hash className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{topic.topic}</p>
                        <p className="text-gray-600 text-xs">{topic.mentions} mentions</p>
                      </div>
                    </div>
                    <TrendingUp
                      className={`w-4 h-4 ${
                        topic.trend === 'up' ? 'text-green-500' :
                        topic.trend === 'down' ? 'text-red-500 rotate-180' :
                        'text-gray-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Sentiment Analysis</CardTitle>
              <CardDescription className="text-gray-600">
                Overall brand sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Positive', value: 72, color: 'from-green-500 to-emerald-500' },
                  { label: 'Neutral', value: 21, color: 'from-gray-400 to-gray-500' },
                  { label: 'Negative', value: 7, color: 'from-red-500 to-rose-500' },
                ].map((sentiment) => (
                  <div key={sentiment.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{sentiment.label}</span>
                      <span className="text-sm font-bold text-gray-900">{sentiment.value}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div
                        className={`h-full bg-gradient-to-r ${sentiment.color}`}
                        style={{ width: `${sentiment.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
