/**
 * Example: Integrating real-time dashboard updates
 * 
 * This example shows how to use the DashboardGateway to broadcast
 * real-time analytics and metrics updates to connected clients.
 */

import { Injectable } from '@nestjs/common';
import { DashboardGateway } from '../gateways/dashboard.gateway';

@Injectable()
export class DashboardIntegrationExample {
  constructor(private readonly dashboardGateway: DashboardGateway) {}

  /**
   * Example: Broadcast new follower count
   * Call this when follower count changes
   */
  async broadcastFollowerUpdate(
    workspaceId: string,
    platform: string,
    accountId: string,
    followers: number,
    change: number,
  ): Promise<void> {
    this.dashboardGateway.broadcastFollowerUpdate(workspaceId, {
      platform,
      accountId,
      followers,
      change,
    });
  }

  /**
   * Example: Broadcast post engagement update
   * Call this when post metrics are updated
   */
  async broadcastPostEngagement(
    workspaceId: string,
    postId: string,
    metrics: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    },
  ): Promise<void> {
    this.dashboardGateway.broadcastEngagementUpdate(workspaceId, {
      postId,
      ...metrics,
    });
  }

  /**
   * Example: Broadcast analytics update
   * Call this when analytics data is refreshed
   */
  async broadcastAnalytics(
    workspaceId: string,
    analytics: {
      totalEngagement: number;
      totalReach: number;
      totalImpressions: number;
      engagementRate: number;
    },
  ): Promise<void> {
    this.dashboardGateway.broadcastAnalyticsUpdate(workspaceId, analytics);
  }

  /**
   * Example: Broadcast metric update
   * Call this when any metric changes
   */
  async broadcastMetric(
    workspaceId: string,
    metric: {
      name: string;
      value: number;
      change: number;
      changePercent: number;
    },
  ): Promise<void> {
    this.dashboardGateway.broadcastMetricUpdate(workspaceId, metric);
  }
}

/**
 * Frontend Integration Example (React/TypeScript)
 * 
 * ```typescript
 * import { io, Socket } from 'socket.io-client';
 * import { useEffect, useState } from 'react';
 * 
 * export function useDashboardRealtime(workspaceId: string) {
 *   const [socket, setSocket] = useState<Socket | null>(null);
 *   const [metrics, setMetrics] = useState<any>(null);
 * 
 *   useEffect(() => {
 *     // Connect to dashboard namespace
 *     const newSocket = io('http://localhost:3001/dashboard', {
 *       auth: {
 *         userId: 'user-id',
 *         workspaceId: workspaceId,
 *       },
 *     });
 * 
 *     // Subscribe to updates
 *     newSocket.emit('dashboard:subscribe');
 * 
 *     // Listen for metric updates
 *     newSocket.on('dashboard:metric:update', (data) => {
 *       console.log('Metric update:', data);
 *       setMetrics(data.metric);
 *     });
 * 
 *     // Listen for follower updates
 *     newSocket.on('dashboard:followers:update', (data) => {
 *       console.log('Followers update:', data);
 *     });
 * 
 *     // Listen for engagement updates
 *     newSocket.on('dashboard:engagement:update', (data) => {
 *       console.log('Engagement update:', data);
 *     });
 * 
 *     setSocket(newSocket);
 * 
 *     return () => {
 *       newSocket.close();
 *     };
 *   }, [workspaceId]);
 * 
 *   return { socket, metrics };
 * }
 * ```
 */
