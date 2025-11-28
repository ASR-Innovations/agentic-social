'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  MessageSquare, 
  Hash, 
  AtSign,
  Heart,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/ui/scroll-reveal';
import ScrollStagger from '@/components/ui/scroll-stagger';

const listeningMetrics = [
  {
    title: 'Brand Mentions',
    value: '1,247',
    change: '+18%',
    icon: AtSign
  },
  {
    title: 'Sentiment Score',
    value: '87%',
    change: '+5%',
    icon: Heart
  },
  {
    title: 'Trending Topics',
    value: '23',
    change: '+12%',
    icon: TrendingUp
  },
  {
    title: 'Engagement Rate',
    value: '12.4%',
    change: '+3%',
    icon: MessageSquare
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
    <div className="min-h-screen bg-white p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="min-w-0">
          <h1 className="text-4xl font-light text-gray-900 mb-1 tracking-tight">
            Social Listening
          </h1>
          <p className="text-sm text-gray-500">Monitor brand mentions and sentiment</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button className="border-gray-200 text-gray-700 hover:bg-gray-50 min-h-[44px] sm:min-h-[36px]" variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <ScrollStagger className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {listeningMetrics.map((metric) => (
          <ScrollStagger.Item key={metric.title}>
            <Card className="bg-gray-50/50 border border-gray-100 shadow-none hover:border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{metric.title}</p>
                    <p className="text-3xl font-light text-gray-900 tracking-tight">{metric.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                    <metric.icon className="w-5 h-5" />
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  {metric.change}
                </Badge>
              </CardContent>
            </Card>
          </ScrollStagger.Item>
        ))}
      </ScrollStagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mentions */}
        <ScrollReveal variant="fadeInUp" className="lg:col-span-2">
          <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-gray-900">Recent Mentions</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Latest brand conversations
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm text-gray-900"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollStagger className="space-y-3" staggerDelay={0.05}>
                {mentions.map((mention) => (
                  <ScrollStagger.Item
                    key={mention.id}
                    className="p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{mention.author}</span>
                        <Badge className="bg-gray-900 text-white border-0 text-xs">
                          {mention.platform}
                        </Badge>
                      </div>
                      <Badge
                        className={`text-xs ${
                          mention.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          mention.sentiment === 'negative' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {mention.sentiment}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-xs mb-3 leading-relaxed">{mention.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {mention.engagement}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {mention.engagement * 10}
                        </span>
                      </div>
                      <span>{mention.timestamp}</span>
                    </div>
                  </ScrollStagger.Item>
                ))}
              </ScrollStagger>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Trending Topics */}
        <div className="space-y-6">
          <ScrollReveal variant="fadeInRight">
            <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Trending Topics</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Popular hashtags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingTopics.map((topic) => (
                    <div
                      key={topic.topic}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                          <Hash className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium text-xs">{topic.topic}</p>
                          <p className="text-gray-400 text-xs">{topic.mentions} mentions</p>
                        </div>
                      </div>
                      <TrendingUp
                        className={`w-4 h-4 ${
                          topic.trend === 'up' ? 'text-emerald-500' :
                          topic.trend === 'down' ? 'text-rose-500 rotate-180' :
                          'text-gray-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Sentiment Analysis */}
          <ScrollReveal variant="fadeInRight" delay={0.2}>
            <Card className="bg-gray-50/50 border border-gray-100 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Sentiment Analysis</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Overall brand sentiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[
                    { label: 'Positive', value: 72, color: 'bg-emerald-500' },
                    { label: 'Neutral', value: 21, color: 'bg-gray-400' },
                    { label: 'Negative', value: 7, color: 'bg-rose-500' },
                  ].map((sentiment) => (
                    <div key={sentiment.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">{sentiment.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{sentiment.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${sentiment.color}`}
                          style={{ width: `${sentiment.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
