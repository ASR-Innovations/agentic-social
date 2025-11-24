/**
 * Database Maintenance Service
 * 
 * Handles automated database maintenance tasks including:
 * - Materialized view refreshes
 * - Partition management
 * - Vacuum and analyze operations
 * - Index maintenance
 * 
 * Requirements: 31.2, 31.3
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DatabaseMaintenanceService {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);
  
  constructor(private readonly prisma: PrismaService) {}
  
  /**
   * Refresh materialized views every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshMaterializedViews(): Promise<void> {
    this.logger.log('Starting materialized view refresh');
    
    const views = [
      'mv_daily_post_metrics',
      'mv_daily_workspace_activity',
      'mv_conversation_metrics',
      'mv_listening_sentiment_trends',
      'mv_influencer_metrics',
    ];
    
    for (const view of views) {
      try {
        await this.refreshView(view);
        this.logger.log(`Refreshed materialized view: ${view}`);
      } catch (error) {
        this.logger.error(`Failed to refresh view ${view}:`, error);
      }
    }
    
    this.logger.log('Materialized view refresh completed');
  }
  
  /**
   * Refresh a specific materialized view
   */
  async refreshView(viewName: string, concurrent: boolean = true): Promise<void> {
    const sql = concurrent
      ? `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`
      : `REFRESH MATERIALIZED VIEW ${viewName}`;
    
    await this.prisma.$executeRawUnsafe(sql);
  }
  
  /**
   * Create new partitions for upcoming months (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createUpcomingPartitions(): Promise<void> {
    this.logger.log('Creating upcoming partitions');
    
    try {
      await this.prisma.$executeRawUnsafe(`
        SELECT create_monthly_partitions()
      `);
      this.logger.log('Successfully created upcoming partitions');
    } catch (error) {
      this.logger.error('Failed to create partitions:', error);
    }
  }
  
  /**
   * Drop old partitions (runs weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async dropOldPartitions(): Promise<void> {
    this.logger.log('Dropping old partitions');
    
    const retentionMonths = parseInt(process.env.PARTITION_RETENTION_MONTHS || '24');
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    
    try {
      // Get list of old partitions
      const partitions = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          schemaname,
          tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND (
            tablename LIKE 'security_audit_logs_y%'
            OR tablename LIKE 'listening_mentions_y%'
          )
      `);
      
      for (const partition of partitions) {
        // Extract date from partition name (e.g., security_audit_logs_y2023m01)
        const match = partition.tablename.match(/y(\d{4})m(\d{2})/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]);
          const partitionDate = new Date(year, month - 1, 1);
          
          if (partitionDate < cutoffDate) {
            this.logger.log(`Dropping old partition: ${partition.tablename}`);
            await this.prisma.$executeRawUnsafe(
              `DROP TABLE IF EXISTS ${partition.tablename}`,
            );
          }
        }
      }
      
      this.logger.log('Old partitions dropped successfully');
    } catch (error) {
      this.logger.error('Failed to drop old partitions:', error);
    }
  }
  
  /**
   * Vacuum and analyze tables (runs weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async vacuumAndAnalyze(): Promise<void> {
    this.logger.log('Starting vacuum and analyze');
    
    const tables = [
      'posts',
      'platform_posts',
      'conversations',
      'messages',
      'listening_mentions',
      'security_audit_logs',
    ];
    
    for (const table of tables) {
      try {
        this.logger.log(`Vacuuming table: ${table}`);
        await this.prisma.$executeRawUnsafe(`VACUUM ANALYZE ${table}`);
      } catch (error) {
        this.logger.error(`Failed to vacuum table ${table}:`, error);
      }
    }
    
    this.logger.log('Vacuum and analyze completed');
  }
  
  /**
   * Reindex tables (runs monthly)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async reindexTables(): Promise<void> {
    this.logger.log('Starting table reindexing');
    
    const tables = [
      'posts',
      'conversations',
      'listening_mentions',
    ];
    
    for (const table of tables) {
      try {
        this.logger.log(`Reindexing table: ${table}`);
        await this.prisma.$executeRawUnsafe(`REINDEX TABLE ${table}`);
      } catch (error) {
        this.logger.error(`Failed to reindex table ${table}:`, error);
      }
    }
    
    this.logger.log('Table reindexing completed');
  }
  
  /**
   * Update table statistics (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateStatistics(): Promise<void> {
    this.logger.log('Updating table statistics');
    
    try {
      await this.prisma.$executeRawUnsafe('ANALYZE');
      this.logger.log('Table statistics updated successfully');
    } catch (error) {
      this.logger.error('Failed to update statistics:', error);
    }
  }
  
  /**
   * Monitor and log database health metrics
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorDatabaseHealth(): Promise<void> {
    try {
      // Get connection stats
      const connections = await this.prisma.$queryRaw<any[]>`
        SELECT 
          count(*) as total,
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;
      
      // Get database size
      const size = await this.prisma.$queryRaw<any[]>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      
      // Get cache hit ratio
      const cacheHitRatio = await this.prisma.$queryRaw<any[]>`
        SELECT 
          sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 as cache_hit_ratio
        FROM pg_statio_user_tables
      `;
      
      // Log metrics
      this.logger.debug('Database health metrics:', {
        connections: connections[0],
        size: size[0],
        cacheHitRatio: cacheHitRatio[0],
      });
      
      // Alert on issues
      const conn = connections[0] as any;
      if (conn.idle_in_transaction > 10) {
        this.logger.warn(`High number of idle in transaction connections: ${conn.idle_in_transaction}`);
      }
      
      const ratio = (cacheHitRatio[0] as any)?.cache_hit_ratio;
      if (ratio && ratio < 90) {
        this.logger.warn(`Low cache hit ratio: ${ratio}%`);
      }
    } catch (error) {
      this.logger.error('Failed to monitor database health:', error);
    }
  }
  
  /**
   * Check for long-running queries
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkLongRunningQueries(): Promise<void> {
    try {
      const longQueries = await this.prisma.$queryRaw<any[]>`
        SELECT 
          pid,
          now() - query_start as duration,
          state,
          query
        FROM pg_stat_activity
        WHERE state != 'idle'
          AND now() - query_start > interval '30 seconds'
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY duration DESC
      `;
      
      if (longQueries.length > 0) {
        this.logger.warn(`Found ${longQueries.length} long-running queries`);
        longQueries.forEach((q) => {
          this.logger.warn(`Long query (PID ${q.pid}): ${q.duration}`, {
            query: q.query.substring(0, 200),
          });
        });
      }
    } catch (error) {
      this.logger.error('Failed to check long-running queries:', error);
    }
  }
  
  /**
   * Identify unused indexes
   */
  async findUnusedIndexes(): Promise<any[]> {
    try {
      const unusedIndexes = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
          AND indexrelname NOT LIKE '%_pkey'
        ORDER BY pg_relation_size(indexrelid) DESC
      `;
      
      return unusedIndexes;
    } catch (error) {
      this.logger.error('Failed to find unused indexes:', error);
      return [];
    }
  }
  
  /**
   * Get table bloat information
   */
  async getTableBloat(): Promise<any[]> {
    try {
      const bloat = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
          n_dead_tup as dead_tuples,
          n_live_tup as live_tuples,
          round(n_dead_tup * 100.0 / nullif(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_percent
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
        LIMIT 20
      `;
      
      return bloat;
    } catch (error) {
      this.logger.error('Failed to get table bloat:', error);
      return [];
    }
  }
  
  /**
   * Manual maintenance trigger
   */
  async runFullMaintenance(): Promise<{
    success: boolean;
    results: any;
  }> {
    this.logger.log('Starting full database maintenance');
    
    const results: any = {
      materializedViews: { success: false },
      partitions: { success: false },
      vacuum: { success: false },
      statistics: { success: false },
    };
    
    try {
      // Refresh materialized views
      await this.refreshMaterializedViews();
      results.materializedViews.success = true;
    } catch (error: any) {
      results.materializedViews.error = error.message;
    }
    
    try {
      // Create partitions
      await this.createUpcomingPartitions();
      results.partitions.success = true;
    } catch (error: any) {
      results.partitions.error = error.message;
    }
    
    try {
      // Vacuum and analyze
      await this.vacuumAndAnalyze();
      results.vacuum.success = true;
    } catch (error: any) {
      results.vacuum.error = error.message;
    }
    
    try {
      // Update statistics
      await this.updateStatistics();
      results.statistics.success = true;
    } catch (error: any) {
      results.statistics.error = error.message;
    }
    
    const success = Object.values(results).every((r: any) => r.success);
    
    this.logger.log('Full database maintenance completed', { success, results });
    
    return { success, results };
  }
}
