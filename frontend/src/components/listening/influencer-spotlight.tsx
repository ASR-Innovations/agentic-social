'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Influencer } from '@/types';
import { Users, TrendingUp, Heart, ExternalLink } from 'lucide-react';

interface InfluencerSpotlightProps {
  influencers: Influencer[];
  loading?: boolean;
  onViewProfile?: (influencerId: string) => void;
}

export function InfluencerSpotlight({ influencers, loading, onViewProfile }: InfluencerSpotlightProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Top Influencers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading influencers...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Top Influencers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {influencers.map((influencer, index) => (
            <div
              key={influencer.id}
              className="p-4 glass-card rounded-lg hover:border-white/20 transition-all"
            >
              <div className="flex items-start space-x-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Avatar */}
                <img
                  src={influencer.avatar || '/default-avatar.png'}
                  alt={influencer.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold truncate">
                      {influencer.name}
                    </span>
                    {influencer.isVerified && (
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    @{influencer.username} • {influencer.platform}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs mb-1">
                        <Users className="h-3 w-3" />
                        <span>Followers</span>
                      </div>
                      <div className="text-white font-semibold">
                        {influencer.followers >= 1000000
                          ? `${(influencer.followers / 1000000).toFixed(1)}M`
                          : influencer.followers >= 1000
                          ? `${(influencer.followers / 1000).toFixed(1)}K`
                          : influencer.followers}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs mb-1">
                        <Heart className="h-3 w-3" />
                        <span>Engagement</span>
                      </div>
                      <div className="text-white font-semibold">
                        {influencer.engagementRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Mentions</span>
                      </div>
                      <div className="text-white font-semibold">
                        {influencer.mentions}
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  {influencer.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {influencer.topics.slice(0, 3).map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-xs border-white/10 text-gray-400"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Sentiment */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">Sentiment:</span>
                      <span className={`text-xs font-medium ${getSentimentColor(influencer.sentiment)}`}>
                        {influencer.sentiment > 0.3
                          ? 'Positive'
                          : influencer.sentiment < -0.3
                          ? 'Negative'
                          : 'Neutral'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile?.(influencer.id)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {influencers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            No influencers found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
