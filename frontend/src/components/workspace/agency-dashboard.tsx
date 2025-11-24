'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/hooks/useApi';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Building2,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AgencyDashboardData {
  overview: {
    totalClients: number;
    activeClients: number;
    totalWorkspaces: number;
    totalPosts: number;
    totalEngagement: number;
    totalReach: number;
    totalFollowers: number;
    averageEngagementRate: number;
    totalSocialAccounts: number;
    averageHealthScore: number;
    monthlyRecurringRevenue?: number;
    averageRevenuePerWorkspace?: number;
    totalRevenue?: number;
  };
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    clientCount: number;
    healthScore: number;
    issues: string[];
  }>;
  recentActivity: any[];
  performanceMetrics: Array<{
    workspaceId: string;
    workspaceName: string;
    metrics: any;
    trends: any;
    topPlatforms: any[];
  }>;
  topPerformers: any[];
  workspaceHealth: Array<{
    workspaceId: string;
    workspaceName: string;
    healthScore: number;
    issues: string[];
  }>;
  timeSeriesData: any;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AgencyDashboard() {
  const [data, setData] = useState<AgencyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });
  const { get } = useApi();

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await get(
        `/api/workspaces/agency-dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setData(result);
    } catch (error) {
      console.error('Failed to load agency dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading agency dashboard...</p>
        </div>
      </div>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
    if (score >= 60) return <Badge variant="default" className="bg-yellow-600">Good</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your client workspaces
          </p>
        </div>
        <Button onClick={loadDashboardData}>Refresh</Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalWorkspaces}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeClients} active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalEngagement.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overview.averageEngagementRate.toFixed(2)}% avg rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalReach.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overview.totalPosts} posts published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(data.overview.averageHealthScore)}`}>
              {data.overview.averageHealthScore.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all workspaces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="workspaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Workspaces</CardTitle>
              <CardDescription>
                Overview of all client workspaces and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{workspace.name}</h3>
                        <Badge variant="outline">{workspace.plan}</Badge>
                        {getHealthBadge(workspace.healthScore)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workspace.clientCount} client{workspace.clientCount !== 1 ? 's' : ''}
                      </p>
                      {workspace.issues.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {workspace.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-orange-600">
                              <AlertCircle className="h-3 w-3" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getHealthColor(workspace.healthScore)}`}>
                          {workspace.healthScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">Health</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/app/workspaces/${workspace.id}`}>View</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Workspaces</CardTitle>
                <CardDescription>By total engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPerformers.map((performer, idx) => (
                    <div key={performer.workspaceId} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{performer.workspaceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.metrics.totalEngagement.toLocaleString()} engagement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Aggregated across all workspaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Posts</span>
                      <span className="text-sm font-bold">{data.overview.totalPosts}</span>
                    </div>
                    <Progress value={100} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Followers</span>
                      <span className="text-sm font-bold">
                        {data.overview.totalFollowers.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={100} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Social Accounts</span>
                      <span className="text-sm font-bold">{data.overview.totalSocialAccounts}</span>
                    </div>
                    <Progress value={100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Status Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Health Overview</CardTitle>
              <CardDescription>
                Monitor the health and status of all workspaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.workspaceHealth.map((health) => (
                  <div key={health.workspaceId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{health.workspaceName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {health.issues.length} issue{health.issues.length !== 1 ? 's' : ''} detected
                        </p>
                      </div>
                      <div className={`text-2xl font-bold ${getHealthColor(health.healthScore)}`}>
                        {health.healthScore}%
                      </div>
                    </div>
                    <Progress value={health.healthScore} className="h-2" />
                    {health.issues.length > 0 && (
                      <div className="mt-2 space-y-1 pl-4">
                        {health.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Workspace Analytics</CardTitle>
              <CardDescription>
                Aggregated performance data across all workspaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workspaceName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="metrics.totalPosts" fill="#8884d8" name="Posts" />
                    <Bar dataKey="metrics.totalEngagement" fill="#82ca9d" name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
