'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, TrendingUp, Users } from 'lucide-react';

interface InboxStatsProps {
  stats: {
    avgResponseTime: string;
    resolutionRate: number;
    totalConversations: number;
    activeConversations: number;
  };
}

export function InboxStats({ stats }: InboxStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Avg Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.avgResponseTime}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Last 7 days
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolution Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.resolutionRate}%
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {stats.resolutionRate >= 90 ? 'Excellent' : stats.resolutionRate >= 70 ? 'Good' : 'Needs improvement'}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.activeConversations}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Currently open
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.totalConversations}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            All time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
