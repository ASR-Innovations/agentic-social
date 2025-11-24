'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CrossWorkspaceAnalyticsProps {
  workspaceIds?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export function CrossWorkspaceAnalytics({ workspaceIds }: CrossWorkspaceAnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(workspaceIds || []);
  const [showFilters, setShowFilters] = useState(false);
  const { get } = useApi();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedWorkspaces]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedWorkspaces.length > 0) {
        selectedWorkspaces.forEach(id => params.append('workspaceIds', id));
      }
      
      params.append('startDate', dateRange.from.toISOString());
      params.append('endDate', dateRange.to.toISOString());

      const result = await get(`/api/workspaces/analytics/cross-workspace?${params.toString()}`);
      setData(result);
    } catch (error) {
      console.error('Failed to load cross-workspace analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceToggle = (workspaceId: string) => {
    setSelectedWorkspaces(prev =>
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const exportData = () => {
    // Export analytics data as CSV
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cross-workspace-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion
    const headers = ['Workspace', 'Posts', 'Engagement', 'Reach', 'Followers'];
    const rows = data?.analytics?.map((a: any) => [
      a.workspaceName,
      a.metrics.totalPosts,
      a.metrics.totalEngagement,
      a.metrics.totalReach,
      a.metrics.totalFollowers,
    ]) || [];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cross-Workspace Analytics</h2>
          <p className="text-muted-foreground">
            Compare performance across {data.workspaces.length} workspace{data.workspaces.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('justify-start text-left font-normal')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Workspace Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Workspaces</CardTitle>
            <CardDescription>Select which workspaces to include in the analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.workspaces.map((workspace: any) => (
                <div key={workspace.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={workspace.id}
                    checked={selectedWorkspaces.length === 0 || selectedWorkspaces.includes(workspace.id)}
                    onCheckedChange={() => handleWorkspaceToggle(workspace.id)}
                  />
                  <Label htmlFor={workspace.id} className="text-sm font-normal cursor-pointer">
                    {workspace.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.averageEngagementRate.toFixed(2)}% avg rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Impressions delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined audience
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Workspace</CardTitle>
            <CardDescription>Total engagement across selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workspaceName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="metrics.totalEngagement" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts by Workspace</CardTitle>
            <CardDescription>Distribution of published posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.analytics}
                    dataKey="metrics.totalPosts"
                    nameKey="workspaceName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.analytics.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reach Comparison</CardTitle>
            <CardDescription>Total reach per workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.analytics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="workspaceName" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="metrics.totalReach" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>Engagement and reach growth rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workspaceName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trends.engagementGrowth" fill="#8884d8" name="Engagement Growth %" />
                  <Bar dataKey="trends.reachGrowth" fill="#82ca9d" name="Reach Growth %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Complete breakdown by workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Workspace</th>
                  <th className="text-right p-2">Posts</th>
                  <th className="text-right p-2">Engagement</th>
                  <th className="text-right p-2">Reach</th>
                  <th className="text-right p-2">Followers</th>
                  <th className="text-right p-2">Eng. Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.analytics.map((workspace: any) => (
                  <tr key={workspace.workspaceId} className="border-b hover:bg-accent">
                    <td className="p-2 font-medium">{workspace.workspaceName}</td>
                    <td className="text-right p-2">{workspace.metrics.totalPosts}</td>
                    <td className="text-right p-2">{workspace.metrics.totalEngagement.toLocaleString()}</td>
                    <td className="text-right p-2">{workspace.metrics.totalReach.toLocaleString()}</td>
                    <td className="text-right p-2">{workspace.metrics.totalFollowers.toLocaleString()}</td>
                    <td className="text-right p-2">{workspace.metrics.engagementRate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
