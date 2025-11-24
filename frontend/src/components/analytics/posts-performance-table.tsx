'use client';

import { useState } from 'react';
import { ArrowUpDown, Eye, Heart, MessageSquare, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PostPerformance {
  id: string;
  content: string;
  platform: string;
  publishedAt: string;
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

interface PostsPerformanceTableProps {
  posts: PostPerformance[];
  loading?: boolean;
}

type SortField = 'engagement' | 'reach' | 'impressions' | 'engagementRate';
type SortDirection = 'asc' | 'desc';

export function PostsPerformanceTable({ posts, loading = false }: PostsPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('engagement');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Post Performance</CardTitle>
          <CardDescription className="text-gray-400">
            Detailed metrics for each post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Post Performance</CardTitle>
        <CardDescription className="text-gray-400">
          Detailed metrics for each post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Post
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Platform
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('impressions')}
                    className="text-gray-400 hover:text-white"
                  >
                    Impressions
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('reach')}
                    className="text-gray-400 hover:text-white"
                  >
                    Reach
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('engagement')}
                    className="text-gray-400 hover:text-white"
                  >
                    Engagement
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('engagementRate')}
                    className="text-gray-400 hover:text-white"
                  >
                    Rate
                    <ArrowUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-white line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.publishedAt}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="glass" className="text-xs">
                      {post.platform}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-white">
                        {post.impressions.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-white">
                      {post.reach.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        <span className="text-xs text-gray-400">{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-400">{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-gray-400">{post.shares}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge
                      variant={post.engagementRate > 5 ? 'success' : 'glass'}
                      className="text-xs"
                    >
                      {post.engagementRate.toFixed(2)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
