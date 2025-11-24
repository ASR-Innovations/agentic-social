'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SentimentData } from '@/types';
import { Smile, Meh, Frown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface SentimentAnalysisProps {
  data: SentimentData;
  loading?: boolean;
}

export function SentimentAnalysis({ data, loading }: SentimentAnalysisProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-6 w-6 text-green-400" />;
      case 'negative':
        return <Frown className="h-6 w-6 text-red-400" />;
      default:
        return <Meh className="h-6 w-6 text-gray-400" />;
    }
  };

  const pieData = [
    { name: 'Positive', value: data.breakdown.positive, color: '#10b981' },
    { name: 'Neutral', value: data.breakdown.neutral, color: '#6b7280' },
    { name: 'Negative', value: data.breakdown.negative, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading sentiment data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getSentimentIcon(data.overall.sentiment)}
              <div>
                <div className="text-3xl font-bold text-white">
                  {(data.overall.score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 capitalize">
                  {data.overall.sentiment} sentiment
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-white">
                {data.overall.volume.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total mentions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Breakdown */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sentiment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2">
                  <Smile className="h-5 w-5 text-green-400" />
                  <span className="text-white">Positive</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {data.breakdown.positive.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {((data.breakdown.positive / data.overall.volume) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2">
                  <Meh className="h-5 w-5 text-gray-400" />
                  <span className="text-white">Neutral</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {data.breakdown.neutral.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {((data.breakdown.neutral / data.overall.volume) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center space-x-2">
                  <Frown className="h-5 w-5 text-red-400" />
                  <span className="text-white">Negative</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {data.breakdown.negative.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {((data.breakdown.negative / data.overall.volume) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Trend */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sentiment Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="timestamp"
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
                  dataKey="positive"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Topics */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sentiment by Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topics.slice(0, 5).map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-medium">{topic.topic}</div>
                  <div className="text-sm text-gray-400">{topic.volume} mentions</div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getSentimentColor(
                      topic.sentiment > 0.3 ? 'positive' : topic.sentiment < -0.3 ? 'negative' : 'neutral'
                    )}20`,
                    color: getSentimentColor(
                      topic.sentiment > 0.3 ? 'positive' : topic.sentiment < -0.3 ? 'negative' : 'neutral'
                    ),
                  }}
                >
                  {(topic.sentiment * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
