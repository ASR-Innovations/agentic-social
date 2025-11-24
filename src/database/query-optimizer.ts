/**
 * Query Optimization Utilities
 * 
 * Provides utilities for optimizing database queries, including query analysis,
 * caching strategies, and performance monitoring.
 * 
 * Requirements: 31.2, 31.3
 */

import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Query performance metrics
 */
export interface QueryMetrics {
  query: string;
  duration: number;
  rowCount?: number;
  cached: boolean;
  timestamp: Date;
}

/**
 * Query optimizer configuration
 */
export interface QueryOptimizerConfig {
  enableQueryLogging: boolean;
  slowQueryThreshold: number; // milliseconds
  enableExplainAnalyze: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

/**
 * Query Optimizer class
 */
export class QueryOptimizer {
  private config: QueryOptimizerConfig;
  private queryMetrics: QueryMetrics[] = [];
  private queryCache: Map<string, { data: any; timestamp: Date }> = new Map();
  
  constructor(config: Partial<QueryOptimizerConfig> = {}) {
    this.config = {
      enableQueryLogging: config.enableQueryLogging ?? true,
      slowQueryThreshold: config.slowQueryThreshold ?? 1000, // 1 second
      enableExplainAnalyze: config.enableExplainAnalyze ?? false,
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTL: config.cacheTTL ?? 300, // 5 minutes
    };
  }
  
  /**
   * Execute a query with performance monitoring
   */
  async executeWithMetrics<T>(
    queryFn: () => Promise<T>,
    queryName: string,
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Log metrics
      this.logQueryMetrics({
        query: queryName,
        duration,
        rowCount: Array.isArray(result) ? result.length : undefined,
        cached: false,
        timestamp: new Date(),
      });
      
      // Warn on slow queries
      if (duration > this.config.slowQueryThreshold) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      console.error(`Query failed: ${queryName}`, error);
      throw error;
    }
  }
  
  /**
   * Execute a query with caching
   */
  async executeWithCache<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    ttl?: number,
  ): Promise<T> {
    if (!this.config.cacheEnabled) {
      return queryFn();
    }
    
    // Check cache
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp.getTime();
      const cacheTTL = (ttl || this.config.cacheTTL) * 1000;
      
      if (age < cacheTTL) {
        this.logQueryMetrics({
          query: cacheKey,
          duration: 0,
          cached: true,
          timestamp: new Date(),
        });
        return cached.data;
      }
    }
    
    // Execute query
    const result = await this.executeWithMetrics(queryFn, cacheKey);
    
    // Store in cache
    this.queryCache.set(cacheKey, {
      data: result,
      timestamp: new Date(),
    });
    
    return result;
  }
  
  /**
   * Clear query cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // Clear specific pattern
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      // Clear all
      this.queryCache.clear();
    }
  }
  
  /**
   * Get query metrics
   */
  getMetrics(): QueryMetrics[] {
    return [...this.queryMetrics];
  }
  
  /**
   * Get slow queries
   */
  getSlowQueries(): QueryMetrics[] {
    return this.queryMetrics.filter(
      (m) => m.duration > this.config.slowQueryThreshold,
    );
  }
  
  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.queryMetrics = [];
  }
  
  /**
   * Log query metrics
   */
  private logQueryMetrics(metrics: QueryMetrics): void {
    if (this.config.enableQueryLogging) {
      this.queryMetrics.push(metrics);
      
      // Keep only last 1000 metrics
      if (this.queryMetrics.length > 1000) {
        this.queryMetrics = this.queryMetrics.slice(-1000);
      }
    }
  }
}

/**
 * Pagination helper with cursor-based pagination for better performance
 */
export interface CursorPaginationParams {
  cursor?: string;
  take?: number;
  orderBy?: any;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function cursorPaginate<T extends { id: string }>(
  queryFn: (params: any) => Promise<T[]>,
  params: CursorPaginationParams,
): Promise<CursorPaginationResult<T>> {
  const take = params.take || 20;
  
  const queryParams: any = {
    take: take + 1, // Fetch one extra to check if there are more
    orderBy: params.orderBy || { id: 'desc' },
  };
  
  if (params.cursor) {
    queryParams.cursor = { id: params.cursor };
    queryParams.skip = 1; // Skip the cursor
  }
  
  const results = await queryFn(queryParams);
  
  const hasMore = results.length > take;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;
  
  return {
    data,
    nextCursor,
    hasMore,
  };
}

/**
 * Batch query executor for N+1 problem prevention
 */
export class BatchQueryExecutor {
  private batches: Map<string, Promise<any>[]> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  
  /**
   * Add query to batch
   */
  async addToBatch<T>(
    batchKey: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
    }
    
    const promise = queryFn();
    this.batches.get(batchKey)!.push(promise);
    
    // Schedule batch execution
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.executeBatches(), 10);
    }
    
    return promise;
  }
  
  /**
   * Execute all batched queries
   */
  private async executeBatches(): Promise<void> {
    const batches = new Map(this.batches);
    this.batches.clear();
    this.batchTimeout = null;
    
    for (const [key, promises] of batches) {
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error(`Batch execution failed for ${key}:`, error);
      }
    }
  }
}

/**
 * Query builder helpers for common patterns
 */
export class QueryBuilder {
  /**
   * Build date range filter
   */
  static dateRange(
    field: string,
    startDate?: Date,
    endDate?: Date,
  ): any {
    const filter: any = {};
    
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].gte = startDate;
      if (endDate) filter[field].lte = endDate;
    }
    
    return filter;
  }
  
  /**
   * Build full-text search filter
   */
  static fullTextSearch(
    fields: string[],
    searchTerm: string,
  ): any {
    if (!searchTerm) return {};
    
    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    };
  }
  
  /**
   * Build array contains filter
   */
  static arrayContains(
    field: string,
    values: string[],
  ): any {
    if (!values || values.length === 0) return {};
    
    return {
      [field]: {
        hasSome: values,
      },
    };
  }
  
  /**
   * Build enum filter
   */
  static enumFilter(
    field: string,
    values: string[],
  ): any {
    if (!values || values.length === 0) return {};
    
    if (values.length === 1) {
      return { [field]: values[0] };
    }
    
    return {
      [field]: {
        in: values,
      },
    };
  }
  
  /**
   * Build workspace isolation filter
   */
  static workspaceFilter(workspaceId: string): any {
    return { workspaceId };
  }
  
  /**
   * Combine filters with AND
   */
  static combineFilters(...filters: any[]): any {
    const validFilters = filters.filter(
      (f) => f && Object.keys(f).length > 0,
    );
    
    if (validFilters.length === 0) return {};
    if (validFilters.length === 1) return validFilters[0];
    
    return {
      AND: validFilters,
    };
  }
}

/**
 * Materialized view refresh utilities
 */
export class MaterializedViewManager {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Refresh a specific materialized view
   */
  async refreshView(viewName: string, concurrent: boolean = true): Promise<void> {
    const sql = concurrent
      ? `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`
      : `REFRESH MATERIALIZED VIEW ${viewName}`;
    
    try {
      await this.prisma.$executeRawUnsafe(sql);
      console.log(`Materialized view ${viewName} refreshed successfully`);
    } catch (error) {
      console.error(`Failed to refresh materialized view ${viewName}:`, error);
      throw error;
    }
  }
  
  /**
   * Refresh all materialized views
   */
  async refreshAllViews(): Promise<void> {
    const views = [
      'mv_daily_post_metrics',
      'mv_daily_workspace_activity',
      'mv_conversation_metrics',
      'mv_listening_sentiment_trends',
      'mv_influencer_metrics',
    ];
    
    for (const view of views) {
      await this.refreshView(view);
    }
  }
  
  /**
   * Schedule automatic refresh
   */
  scheduleRefresh(intervalMs: number = 3600000): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        await this.refreshAllViews();
      } catch (error) {
        console.error('Scheduled materialized view refresh failed:', error);
      }
    }, intervalMs);
  }
}

/**
 * Query performance analyzer
 */
export class QueryAnalyzer {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Analyze query execution plan
   */
  async explainQuery(sql: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRawUnsafe(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`,
      );
      return result;
    } catch (error) {
      console.error('Query analysis failed:', error);
      throw error;
    }
  }
  
  /**
   * Get slow queries from PostgreSQL logs
   */
  async getSlowQueries(minDuration: number = 1000): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time,
          stddev_time
        FROM pg_stat_statements
        WHERE mean_time > ${minDuration}
        ORDER BY mean_time DESC
        LIMIT 50
      `;
      return result as any[];
    } catch (error) {
      console.error('Failed to fetch slow queries:', error);
      return [];
    }
  }
  
  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE tablename = '${tableName}'
      `);
      return result;
    } catch (error) {
      console.error(`Failed to fetch stats for table ${tableName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get index usage statistics
   */
  async getIndexStats(tableName?: string): Promise<any[]> {
    try {
      const whereClause = tableName ? `WHERE tablename = '${tableName}'` : '';
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        ${whereClause}
        ORDER BY idx_scan DESC
      `);
      return result as any[];
    } catch (error) {
      console.error('Failed to fetch index stats:', error);
      return [];
    }
  }
  
  /**
   * Identify missing indexes
   */
  async suggestIndexes(): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname as column_name,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public'
          AND n_distinct > 100
          AND correlation < 0.1
        ORDER BY n_distinct DESC
        LIMIT 20
      `;
      return result as any[];
    } catch (error) {
      console.error('Failed to suggest indexes:', error);
      return [];
    }
  }
}

/**
 * Database health monitor
 */
export class DatabaseHealthMonitor {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Check database health
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    metrics: any;
  }> {
    try {
      // Test connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Get connection stats
      const connections = await this.prisma.$queryRaw`
        SELECT 
          count(*) as total,
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;
      
      // Get database size
      const size = await this.prisma.$queryRaw`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      
      return {
        healthy: true,
        metrics: {
          connections,
          size,
        },
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        healthy: false,
        metrics: null,
      };
    }
  }
  
  /**
   * Monitor long-running queries
   */
  async getLongRunningQueries(minDuration: number = 30000): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          pid,
          now() - query_start as duration,
          state,
          query
        FROM pg_stat_activity
        WHERE state != 'idle'
          AND now() - query_start > interval '${minDuration} milliseconds'
        ORDER BY duration DESC
      `;
      return result as any[];
    } catch (error) {
      console.error('Failed to fetch long-running queries:', error);
      return [];
    }
  }
}

export default {
  QueryOptimizer,
  cursorPaginate,
  BatchQueryExecutor,
  QueryBuilder,
  MaterializedViewManager,
  QueryAnalyzer,
  DatabaseHealthMonitor,
};
