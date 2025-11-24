'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker, DateRange } from '@/components/analytics/date-range-picker';
import {
  QuerySelector,
  QueryBuilder,
  QueryFormData,
  MentionsStream,
  SentimentAnalysis,
  TrendingTopics,
  InfluencerSpotlight,
  CompetitorTracking,
  AlertsPanel,
} from '@/components/listening';
import { ListeningQuery, Mention, SentimentData, Trend, Influencer, CompetitorData, Alert } from '@/types';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import apiClient from '@/lib/api';

export default function ListeningPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<ListeningQuery | null>(null);
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    preset: '7d',
  });
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
      },
    });

    socketRef.current = socket;

    // Listen for new mentions
    socket.on('new_mention', (data: { queryId: string; mention: Mention }) => {
      if (selectedQuery?.id === data.queryId) {
        queryClient.invalidateQueries({ queryKey: ['mentions', data.queryId] });
        toast('New mention detected', { icon: '🔔' });
      }
    });

    // Listen for trend updates
    socket.on('trend_update', () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    });

    // Listen for crisis alerts
    socket.on('crisis_alert', (data: { message: string }) => {
      toast.error(data.message, { duration: 10000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, selectedQuery]);

  // Fetch listening queries
  const { data: queries = [], isLoading: isLoadingQueries } = useQuery({
    queryKey: ['listening-queries'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getListeningQueries();
        return getMockQueries();
      } catch (error) {
        console.error('Failed to fetch queries:', error);
        return getMockQueries();
      }
    },
  });

  // Fetch mentions
  const { data: mentionsData, isLoading: isLoadingMentions } = useQuery({
    queryKey: ['mentions', selectedQuery?.id, page],
    queryFn: async () => {
      if (!selectedQuery) return { mentions: [], hasMore: false };
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getMentions(selectedQuery.id, { page, limit: 20 });
        return getMockMentions();
      } catch (error) {
        console.error('Failed to fetch mentions:', error);
        return getMockMentions();
      }
    },
    enabled: !!selectedQuery,
  });

  // Fetch sentiment data
  const { data: sentimentData, isLoading: isLoadingSentiment } = useQuery({
    queryKey: ['sentiment', selectedQuery?.id, dateRange],
    queryFn: async () => {
      if (!selectedQuery) return null;
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getSentiment(selectedQuery.id, dateRange);
        return getMockSentimentData();
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
        return getMockSentimentData();
      }
    },
    enabled: !!selectedQuery,
  });

  // Fetch trends
  const { data: trends = [], isLoading: isLoadingTrends } = useQuery({
    queryKey: ['trends'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getTrends();
        return getMockTrends();
      } catch (error) {
        console.error('Failed to fetch trends:', error);
        return getMockTrends();
      }
    },
  });

  // Fetch influencers
  const { data: influencers = [], isLoading: isLoadingInfluencers } = useQuery({
    queryKey: ['influencers', selectedQuery?.id],
    queryFn: async () => {
      if (!selectedQuery) return [];
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getInfluencers(selectedQuery.id);
        return getMockInfluencers();
      } catch (error) {
        console.error('Failed to fetch influencers:', error);
        return getMockInfluencers();
      }
    },
    enabled: !!selectedQuery,
  });

  // Fetch competitors
  const { data: competitors = [], isLoading: isLoadingCompetitors } = useQuery({
    queryKey: ['competitors'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getCompetitors();
        return getMockCompetitors();
      } catch (error) {
        console.error('Failed to fetch competitors:', error);
        return getMockCompetitors();
      }
    },
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API call
        // return await apiClient.getAlerts();
        return getMockAlerts();
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        return getMockAlerts();
      }
    },
  });

  // Create query mutation
  const createQueryMutation = useMutation({
    mutationFn: async (data: QueryFormData) => {
      // TODO: Replace with actual API call
      // return await apiClient.createListeningQuery(data);
      return { id: Date.now().toString(), ...data, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listening-queries'] });
      toast.success('Query created successfully');
      setIsQueryBuilderOpen(false);
    },
    onError: () => {
      toast.error('Failed to create query');
    },
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleEngage = (mentionId: string) => {
    toast.info('Engagement feature coming soon');
  };

  const handleSave = (mentionId: string) => {
    toast.success('Mention saved');
  };

  const handleCreateAlert = () => {
    toast.info('Alert creation coming soon');
  };

  const handleToggleAlert = (alertId: string, isActive: boolean) => {
    toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleEditAlert = (alertId: string) => {
    toast.info('Alert editing coming soon');
  };

  const handleAddCompetitor = () => {
    toast.info('Competitor addition coming soon');
  };

  const handleViewProfile = (influencerId: string) => {
    toast.info('Profile viewing coming soon');
  };

  if (!mounted) {
    return null;
  }

  // Auto-select first query if none selected
  useEffect(() => {
    if (queries.length > 0 && !selectedQuery) {
      setSelectedQuery(queries[0]);
    }
  }, [queries, selectedQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Listening</h1>
          <p className="text-gray-400">Monitor brand mentions, sentiment, and trends across social media</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Query Selector */}
      <QuerySelector
        queries={queries}
        selectedQuery={selectedQuery}
        onSelectQuery={setSelectedQuery}
        onCreateQuery={() => setIsQueryBuilderOpen(true)}
      />

      {/* Query Builder Dialog */}
      <QueryBuilder
        open={isQueryBuilderOpen}
        onClose={() => setIsQueryBuilderOpen(false)}
        onSave={(data) => createQueryMutation.mutate(data)}
      />

      {/* Main Content */}
      {selectedQuery ? (
        <Tabs defaultValue="mentions" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Mentions Tab */}
          <TabsContent value="mentions" className="space-y-6">
            <MentionsStream
              mentions={mentionsData?.mentions || []}
              isLoading={isLoadingMentions}
              hasMore={mentionsData?.hasMore || false}
              onLoadMore={handleLoadMore}
              onEngage={handleEngage}
              onSave={handleSave}
            />
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            {sentimentData && (
              <SentimentAnalysis data={sentimentData} loading={isLoadingSentiment} />
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <TrendingTopics trends={trends} loading={isLoadingTrends} />
          </TabsContent>

          {/* Influencers Tab */}
          <TabsContent value="influencers" className="space-y-6">
            <InfluencerSpotlight
              influencers={influencers}
              loading={isLoadingInfluencers}
              onViewProfile={handleViewProfile}
            />
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-6">
            <CompetitorTracking
              competitors={competitors}
              loading={isLoadingCompetitors}
              onAddCompetitor={handleAddCompetitor}
            />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel
              alerts={alerts}
              loading={isLoadingAlerts}
              onCreateAlert={handleCreateAlert}
              onToggleAlert={handleToggleAlert}
              onEditAlert={handleEditAlert}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 mb-4">No listening query selected</p>
          <p className="text-sm text-gray-500 mb-6">
            Create a query to start monitoring social media conversations
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Mock data functions (to be replaced with actual API calls)
function getMockQueries(): ListeningQuery[] {
  return [
    {
      id: '1',
      tenantId: '1',
      name: 'Brand Mentions',
      keywords: ['@brandname', 'brand name', 'our product'],
      platforms: ['instagram' as any, 'twitter' as any, 'facebook' as any],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      tenantId: '1',
      name: 'Product Feedback',
      keywords: ['product feedback', 'feature request', 'bug report'],
      platforms: ['twitter' as any, 'reddit' as any],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

function getMockMentions() {
  const mentions: Mention[] = Array.from({ length: 10 }, (_, i) => ({
    id: `mention-${i}`,
    queryId: '1',
    platform: 'twitter' as any,
    author: {
      id: `user-${i}`,
      username: `user${i}`,
      name: `User ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i}`,
      followers: Math.floor(Math.random() * 10000),
      isInfluencer: Math.random() > 0.7,
    },
    content: `This is a sample mention about the brand. It contains some interesting feedback and thoughts. #brand #social`,
    url: `https://twitter.com/user${i}/status/${i}`,
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
    sentimentScore: Math.random() * 2 - 1,
    reach: Math.floor(Math.random() * 50000),
    engagement: Math.floor(Math.random() * 5000),
    language: 'en',
    tags: ['brand', 'feedback'],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    fetchedAt: new Date(),
  }));
  return { mentions, hasMore: true };
}

function getMockSentimentData(): SentimentData {
  const timeline = Array.from({ length: 7 }, (_, i) => ({
    timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
    score: Math.random() * 2 - 1,
    volume: Math.floor(Math.random() * 1000),
    positive: Math.floor(Math.random() * 500),
    neutral: Math.floor(Math.random() * 300),
    negative: Math.floor(Math.random() * 200),
  }));

  return {
    overall: {
      score: 0.65,
      sentiment: 'positive',
      volume: 5420,
    },
    timeline,
    topics: [
      { topic: 'Product Quality', sentiment: 0.8, volume: 1200 },
      { topic: 'Customer Service', sentiment: 0.6, volume: 800 },
      { topic: 'Pricing', sentiment: -0.2, volume: 600 },
      { topic: 'Features', sentiment: 0.7, volume: 900 },
      { topic: 'Support', sentiment: 0.5, volume: 500 },
    ],
    breakdown: {
      positive: 3250,
      neutral: 1570,
      negative: 600,
    },
  };
}

function getMockTrends(): Trend[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `trend-${i}`,
    topic: `Trending Topic ${i + 1}`,
    hashtag: `trend${i + 1}`,
    volume: Math.floor(Math.random() * 100000),
    growthRate: Math.random() * 200 - 50,
    sentiment: Math.random() * 2 - 1,
    relatedTopics: ['related1', 'related2', 'related3'],
    platforms: ['twitter' as any, 'instagram' as any],
  }));
}

function getMockInfluencers(): Influencer[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `influencer-${i}`,
    username: `influencer${i}`,
    name: `Influencer ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
    platform: 'instagram' as any,
    followers: Math.floor(Math.random() * 1000000),
    engagement: Math.floor(Math.random() * 50000),
    engagementRate: Math.random() * 10,
    reach: Math.floor(Math.random() * 500000),
    mentions: Math.floor(Math.random() * 100),
    sentiment: Math.random() * 2 - 1,
    topics: ['tech', 'lifestyle', 'business'],
    isVerified: Math.random() > 0.5,
  }));
}

function getMockCompetitors(): CompetitorData[] {
  return Array.from({ length: 2 }, (_, i) => ({
    id: `competitor-${i}`,
    name: `Competitor ${i + 1}`,
    platform: 'instagram' as any,
    username: `competitor${i}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 20}`,
    followers: Math.floor(Math.random() * 500000),
    posts: Math.floor(Math.random() * 1000),
    engagement: Math.floor(Math.random() * 50000),
    engagementRate: Math.random() * 10,
    shareOfVoice: Math.random() * 50,
    sentiment: Math.random() * 2 - 1,
    topPosts: [],
    activity: Array.from({ length: 7 }, (_, j) => ({
      date: new Date(Date.now() - (6 - j) * 24 * 60 * 60 * 1000),
      posts: Math.floor(Math.random() * 10),
      engagement: Math.floor(Math.random() * 5000),
    })),
  }));
}

function getMockAlerts(): Alert[] {
  return [
    {
      id: '1',
      tenantId: '1',
      name: 'Negative Sentiment Spike',
      queryId: '1',
      conditions: [
        { type: 'sentiment_drop', threshold: -0.5 },
        { type: 'volume_spike', threshold: 200 },
      ],
      notifications: {
        email: ['admin@example.com'],
        sms: ['+1234567890'],
      },
      isActive: true,
      lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}