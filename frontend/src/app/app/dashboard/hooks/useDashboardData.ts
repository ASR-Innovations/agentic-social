'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import {
  calculateAgentStatistics,
  calculatePostStatusCounts,
  identifyTopPerformer,
  type AgentStatistics,
  type PostStatusCounts,
  type PlatformMetrics,
} from '../utils/calculations';

// Types
export interface SocialAccount {
  id: string;
  platform: string;
  displayName: string;
  username?: string;
  status: 'active' | 'warning' | 'error' | 'disconnected';
  avatarUrl?: string;
  metadata?: Record<string, any>;
  connectedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  active: boolean;
  tasksCompleted: number;
  lastRunAt?: string;
  socialAccountId?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  platforms?: string[];
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  mediaUrls?: string[];
}

export interface AnalyticsData {
  totalImpressions: number;
  totalEngagement: number;
  totalPosts: number;
  averageEngagementRate: number;
  topPosts: Post[];
  byPlatform: Record<string, {
    impressions: number;
    engagement: number;
    engagementRate?: number;
    postCount: number;
  }>;
  timeline?: Array<{
    date: string;
    impressions: number;
    engagement: number;
  }>;
}

export interface AIUsageData {
  totalRequests: number;
  tokensUsed: number;
  totalCost: number;
  budgetLimit: number;
  budgetUsedPercentage: number;
  requestsByType?: Record<string, number>;
}

export interface TrendData {
  id: string;
  name: string;
  category: string;
  popularity: number;
  hashtag?: string;
}

export interface TeamActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface DashboardData {
  analytics: AnalyticsData | null;
  socialAccounts: SocialAccount[];
  agents: Agent[];
  posts: Post[];
  aiUsage: AIUsageData | null;
  trends: TrendData[];
  teamActivity: TeamActivityItem[];
}

export interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  // Computed values
  agentStatistics: AgentStatistics;
  postStatusCounts: PostStatusCounts;
  platformMetrics: PlatformMetrics[];
}

type DashboardSection = 
  | 'analytics' 
  | 'accounts' 
  | 'agents' 
  | 'posts' 
  | 'aiUsage' 
  | 'trends' 
  | 'team';

/**
 * useDashboardData Hook
 * 
 * Fetches and manages all dashboard data with:
 * - Parallel API calls for efficiency
 * - Error handling per section
 * - Refresh functionality
 * - Computed statistics
 */
export function useDashboardData() {
  const { user, tenant } = useAuthStore();
  
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    socialAccounts: [],
    agents: [],
    posts: [],
    aiUsage: null,
    trends: [],
    teamActivity: [],
    loading: true,
    error: null,
    lastFetched: null,
    agentStatistics: { totalAgents: 0, activeAgents: 0, totalTasksCompleted: 0 },
    postStatusCounts: { total: 0, published: 0, scheduled: 0, draft: 0, failed: 0 },
    platformMetrics: [],
  });

  const [sectionLoading, setSectionLoading] = useState<Record<DashboardSection, boolean>>({
    analytics: false,
    accounts: false,
    agents: false,
    posts: false,
    aiUsage: false,
    trends: false,
    team: false,
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Parallel API calls
      const [
        accountsRes,
        agentsRes,
        postsRes,
        analyticsRes,
        aiUsageRes,
      ] = await Promise.allSettled([
        apiClient.client.get('/social-accounts'),
        apiClient.client.get('/agents'),
        apiClient.client.get('/posts', { params: { limit: 10 } }),
        apiClient.client.get('/analytics/tenant'),
        apiClient.client.get('/ai/usage'),
      ]);

      // Extract data with fallbacks
      const socialAccounts = accountsRes.status === 'fulfilled' 
        ? (accountsRes.value.data || []) 
        : [];
      
      const agents = agentsRes.status === 'fulfilled' 
        ? (agentsRes.value.data || []) 
        : [];
      
      const postsData = postsRes.status === 'fulfilled' 
        ? postsRes.value.data 
        : [];
      const posts = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
      
      const analytics = analyticsRes.status === 'fulfilled' 
        ? analyticsRes.value.data 
        : null;
      
      const aiUsage = aiUsageRes.status === 'fulfilled'
        ? aiUsageRes.value.data
        : null;

      // Calculate computed values
      const agentStatistics = calculateAgentStatistics(agents);
      const postStatusCounts = calculatePostStatusCounts(posts);
      
      // Transform platform metrics
      let platformMetrics: PlatformMetrics[] = [];
      if (analytics?.byPlatform) {
        platformMetrics = Object.entries(analytics.byPlatform).map(
          ([platform, data]: [string, any]) => ({
            platform,
            impressions: data.impressions || 0,
            engagement: data.engagement || 0,
            engagementRate: data.engagementRate || 
              (data.impressions > 0 
                ? (data.engagement / data.impressions) * 100 
                : 0),
            postCount: data.postCount || 0,
          })
        );
        platformMetrics = identifyTopPerformer(platformMetrics);
      }

      setState({
        analytics,
        socialAccounts,
        agents,
        posts,
        aiUsage,
        trends: [], // TODO: Implement trends API
        teamActivity: [], // TODO: Implement team activity API
        loading: false,
        error: null,
        lastFetched: new Date(),
        agentStatistics,
        postStatusCounts,
        platformMetrics,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data',
      }));
    }
  }, []);

  // Refresh a specific section
  const refreshSection = useCallback(async (section: DashboardSection) => {
    setSectionLoading(prev => ({ ...prev, [section]: true }));

    try {
      let data: any;

      switch (section) {
        case 'accounts':
          const accountsRes = await apiClient.client.get('/social-accounts');
          data = accountsRes.data || [];
          setState(prev => ({ ...prev, socialAccounts: data }));
          break;

        case 'agents':
          const agentsRes = await apiClient.client.get('/agents');
          data = agentsRes.data || [];
          const agentStatistics = calculateAgentStatistics(data);
          setState(prev => ({ ...prev, agents: data, agentStatistics }));
          break;

        case 'posts':
          const postsRes = await apiClient.client.get('/posts', { 
            params: { limit: 10 } 
          });
          const postsData = postsRes.data;
          data = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
          const postStatusCounts = calculatePostStatusCounts(data);
          setState(prev => ({ ...prev, posts: data, postStatusCounts }));
          break;

        case 'analytics':
          const analyticsRes = await apiClient.client.get('/analytics/tenant');
          data = analyticsRes.data;
          let platformMetrics: PlatformMetrics[] = [];
          if (data?.byPlatform) {
            platformMetrics = Object.entries(data.byPlatform).map(
              ([platform, pData]: [string, any]) => ({
                platform,
                impressions: pData.impressions || 0,
                engagement: pData.engagement || 0,
                engagementRate: pData.engagementRate || 
                  (pData.impressions > 0 
                    ? (pData.engagement / pData.impressions) * 100 
                    : 0),
                postCount: pData.postCount || 0,
              })
            );
            platformMetrics = identifyTopPerformer(platformMetrics);
          }
          setState(prev => ({ ...prev, analytics: data, platformMetrics }));
          break;

        case 'aiUsage':
          const aiRes = await apiClient.client.get('/ai/usage');
          data = aiRes.data;
          setState(prev => ({ ...prev, aiUsage: data }));
          break;

        default:
          break;
      }
    } catch (error: any) {
      console.error(`Failed to refresh ${section}:`, error);
    } finally {
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    ...state,
    sectionLoading,
    refresh: fetchDashboardData,
    refreshSection,
    isTeamPlan: tenant?.planTier && ['professional', 'enterprise'].includes(tenant.planTier),
  };
}

export default useDashboardData;
