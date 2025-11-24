'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trend } from '@/types';
import { TrendingUp, TrendingDown, Hash } from 'lucide-react';

interface TrendingTopicsProps {
  trends: Trend[];
  loading?: boolean;
}

export function TrendingTopics({ trends, loading }: TrendingTopicsProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-500/20 border-green-500/30';
    if (sentiment < -0.3) return 'bg-red-500/20 border-red-500/30';
    return 'bg-gray-500/20 border-gray-500/30';
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading trends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Trending Topics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div
              key={trend.id}
              className="p-4 glass-card rounded-lg hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-semibold text-white">#{index + 1}</span>
                    {trend.hashtag ? (
                      <div className="flex items-center space-x-1">
                        <Hash className="h-4 w-4 text-purple-400" />
                        <span className="text-white font-medium">{trend.hashtag}</span>
                      </div>
                    ) : (
                      <span className="text-white font-medium">{trend.topic}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {trend.volume.toLocaleString()} mentions
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div
                    className={`flex items-center space-x-1 ${
                      trend.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {trend.growthRate > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(trend.growthRate).toFixed(1)}%
                    </span>
                  </div>
                  <Badge className={getSentimentBg(trend.sentiment)}>
                    {trend.sentiment > 0.3
                      ? 'Positive'
                      : trend.sentiment < -0.3
                      ? 'Negative'
                      : 'Neutral'}
                  </Badge>
                </div>
              </div>

              {/* Related Topics */}
              {trend.relatedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {trend.relatedTopics.slice(0, 3).map((related) => (
                    <Badge
                      key={related}
                      variant="outline"
                      className="text-xs border-white/10 text-gray-400"
                    >
                      {related}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Platforms */}
              <div className="flex items-center space-x-2 mt-3">
                {trend.platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant="secondary"
                    className="text-xs bg-purple-500/20 text-purple-400"
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {trends.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            No trending topics found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
