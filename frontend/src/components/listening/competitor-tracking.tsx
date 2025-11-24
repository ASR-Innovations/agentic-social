'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompetitorData } from '@/types';
import { Target, TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface CompetitorTrackingProps {
  competitors: CompetitorData[];
  loading?: boolean;
  onAddCompetitor?: () => void;
}

export function CompetitorTracking({ competitors, loading, onAddCompetitor }: CompetitorTrackingProps) {
  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Competitor Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading competitors...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Competitor Tracking</span>
            </CardTitle>
            <Button
              onClick={onAddCompetitor}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Add Competitor
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Competitors List */}
      {competitors.map((competitor) => (
        <Card key={competitor.id} className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <img
                src={competitor.avatar || '/default-avatar.png'}
                alt={competitor.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{competitor.name}</div>
                <div className="text-sm text-gray-400">
                  @{competitor.username} • {competitor.platform}
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-400"
              >
                {competitor.shareOfVoice.toFixed(1)}% Share of Voice
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                  <Users className="h-3 w-3" />
                  <span>Followers</span>
                </div>
                <div className="text-white font-semibold text-lg">
                  {competitor.followers >= 1000000
                    ? `${(competitor.followers / 1000000).toFixed(1)}M`
                    : competitor.followers >= 1000
                    ? `${(competitor.followers / 1000).toFixed(1)}K`
                    : competitor.followers}
                </div>
              </div>
              <div className="p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>Posts</span>
                </div>
                <div className="text-white font-semibold text-lg">
                  {competitor.posts}
                </div>
              </div>
              <div className="p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                  <Heart className="h-3 w-3" />
                  <span>Engagement</span>
                </div>
                <div className="text-white font-semibold text-lg">
                  {competitor.engagement >= 1000
                    ? `${(competitor.engagement / 1000).toFixed(1)}K`
                    : competitor.engagement}
                </div>
              </div>
              <div className="p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Eng. Rate</span>
                </div>
                <div className="text-white font-semibold text-lg">
                  {competitor.engagementRate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Activity Trend</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={competitor.activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      stroke="#9ca3af"
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      name="Posts"
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={false}
                      name="Engagement"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Posts */}
            {competitor.topPosts.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">Top Performing Posts</h4>
                <div className="space-y-2">
                  {competitor.topPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="p-3 glass-card rounded-lg hover:border-white/20 transition-all"
                    >
                      <p className="text-white text-sm mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {post.analytics?.engagement.toLocaleString()} engagements
                        </span>
                        <span>
                          {format(new Date(post.publishedAt || ''), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {competitors.length === 0 && !loading && (
        <Card className="glass-card border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No competitors tracked yet</p>
              <Button
                onClick={onAddCompetitor}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Add Your First Competitor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
