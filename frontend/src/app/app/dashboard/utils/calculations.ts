/**
 * Dashboard Calculation Utilities
 * 
 * Pure functions for calculating dashboard metrics and statistics.
 * These functions are designed to be easily testable with property-based tests.
 */

/**
 * Calculate percentage change between two values
 * 
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change rounded to 1 decimal place
 * 
 * @example
 * calculatePercentageChange(110, 100) // returns 10.0
 * calculatePercentageChange(90, 100)  // returns -10.0
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate engagement rate from impressions and engagements
 * 
 * @param engagements - Total engagements (likes + comments + shares)
 * @param impressions - Total impressions
 * @returns Engagement rate as percentage (0-100)
 * 
 * @example
 * calculateEngagementRate(50, 1000) // returns 5.0
 */
export function calculateEngagementRate(
  engagements: number,
  impressions: number
): number {
  if (impressions === 0) {
    return 0;
  }
  
  const rate = (engagements / impressions) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate budget usage percentage
 * 
 * @param used - Amount used
 * @param limit - Budget limit
 * @returns Percentage used, capped at 100
 * 
 * @example
 * calculateBudgetPercentage(80, 100) // returns 80
 * calculateBudgetPercentage(120, 100) // returns 100 (capped)
 */
export function calculateBudgetPercentage(
  used: number,
  limit: number
): number {
  if (limit <= 0) {
    return 0;
  }
  
  const percentage = (used / limit) * 100;
  return Math.min(Math.round(percentage), 100); // Cap at 100
}

/**
 * Identify the top performing platform by engagement rate
 * 
 * @param platforms - Array of platform metrics
 * @returns Platform metrics array with isTopPerformer flag set
 * 
 * @example
 * identifyTopPerformer([
 *   { platform: 'twitter', engagementRate: 5.0 },
 *   { platform: 'instagram', engagementRate: 7.5 }
 * ])
 * // Returns array with instagram marked as top performer
 */
export interface PlatformMetrics {
  platform: string;
  impressions: number;
  engagement: number;
  engagementRate: number;
  postCount: number;
  isTopPerformer?: boolean;
}

export function identifyTopPerformer(
  platforms: PlatformMetrics[]
): PlatformMetrics[] {
  if (platforms.length === 0) {
    return [];
  }

  // Find the highest engagement rate
  let maxRate = -1;
  let topIndex = -1;

  platforms.forEach((platform, index) => {
    if (platform.engagementRate > maxRate) {
      maxRate = platform.engagementRate;
      topIndex = index;
    }
  });

  // Return new array with isTopPerformer flag
  return platforms.map((platform, index) => ({
    ...platform,
    isTopPerformer: index === topIndex && maxRate > 0,
  }));
}

/**
 * Calculate agent statistics from agent list
 * 
 * @param agents - Array of agents
 * @returns Statistics object with totals
 */
export interface Agent {
  id: string;
  name: string;
  type: string;
  active: boolean;
  tasksCompleted: number;
}

export interface AgentStatistics {
  totalAgents: number;
  activeAgents: number;
  totalTasksCompleted: number;
}

export function calculateAgentStatistics(agents: Agent[]): AgentStatistics {
  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(agent => agent.active).length,
    totalTasksCompleted: agents.reduce(
      (sum, agent) => sum + (agent.tasksCompleted || 0),
      0
    ),
  };
}

/**
 * Calculate posts by status
 * 
 * @param posts - Array of posts
 * @returns Object with counts by status
 */
export interface Post {
  id: string;
  status: string;
  [key: string]: any;
}

export interface PostStatusCounts {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  failed: number;
}

export function calculatePostStatusCounts(posts: Post[]): PostStatusCounts {
  return {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    draft: posts.filter(p => p.status === 'draft').length,
    failed: posts.filter(p => p.status === 'failed').length,
  };
}

/**
 * Calculate total engagement from individual metrics
 * 
 * @param likes - Number of likes
 * @param comments - Number of comments
 * @param shares - Number of shares
 * @param clicks - Number of clicks (optional)
 * @returns Total engagement count
 */
export function calculateTotalEngagement(
  likes: number,
  comments: number,
  shares: number,
  clicks: number = 0
): number {
  return likes + comments + shares + clicks;
}

/**
 * Determine trend direction from percentage change
 * 
 * @param change - Percentage change value
 * @param threshold - Minimum change to be considered up/down (default 0.5)
 * @returns 'up' | 'down' | 'neutral'
 */
export function getTrendDirection(
  change: number,
  threshold: number = 0.5
): 'up' | 'down' | 'neutral' {
  if (change >= threshold) {
    return 'up';
  }
  if (change <= -threshold) {
    return 'down';
  }
  return 'neutral';
}

/**
 * Check if budget is in warning state (>= 80%)
 * 
 * @param usedPercentage - Budget usage percentage
 * @param warningThreshold - Threshold for warning (default 80)
 * @returns Whether budget is in warning state
 */
export function isBudgetWarning(
  usedPercentage: number,
  warningThreshold: number = 80
): boolean {
  return usedPercentage >= warningThreshold;
}

/**
 * Calculate posts per day for a date range
 * 
 * @param posts - Array of posts with dates
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Map of date strings to post counts
 */
export function calculatePostsPerDay(
  posts: Array<{ scheduledAt?: string; publishedAt?: string; createdAt: string }>,
  startDate: Date,
  endDate: Date
): Map<string, number> {
  const postsPerDay = new Map<string, number>();

  // Initialize all days in range with 0
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateKey = current.toISOString().split('T')[0];
    postsPerDay.set(dateKey, 0);
    current.setDate(current.getDate() + 1);
  }

  // Count posts per day
  posts.forEach(post => {
    const postDate = post.scheduledAt || post.publishedAt || post.createdAt;
    if (postDate) {
      const dateKey = new Date(postDate).toISOString().split('T')[0];
      if (postsPerDay.has(dateKey)) {
        postsPerDay.set(dateKey, (postsPerDay.get(dateKey) || 0) + 1);
      }
    }
  });

  return postsPerDay;
}

/**
 * Get the current week's date range
 * 
 * @param referenceDate - Reference date (defaults to now)
 * @returns Object with start and end dates of the week
 */
export function getCurrentWeekRange(referenceDate: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(referenceDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
