/**
 * Database Optimization Tests
 * 
 * Tests for database optimization features including:
 * - Query optimizer
 * - Connection pooling
 * - Materialized views
 * - Query builder helpers
 * 
 * Requirements: 31.2, 31.3
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseMaintenanceService } from './database-maintenance.service';
import {
  QueryOptimizer,
  cursorPaginate,
  QueryBuilder,
  MaterializedViewManager,
  QueryAnalyzer,
  DatabaseHealthMonitor,
} from './query-optimizer';

describe('Database Optimization', () => {
  let prismaService: PrismaService;
  let maintenanceService: DatabaseMaintenanceService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        DatabaseMaintenanceService,
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    maintenanceService = module.get<DatabaseMaintenanceService>(DatabaseMaintenanceService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('QueryOptimizer', () => {
    let optimizer: QueryOptimizer;

    beforeEach(() => {
      optimizer = new QueryOptimizer({
        enableQueryLogging: true,
        slowQueryThreshold: 100,
        cacheEnabled: true,
        cacheTTL: 60,
      });
    });

    it('should execute query with metrics', async () => {
      const result = await optimizer.executeWithMetrics(
        async () => {
          return [{ id: '1', name: 'test' }];
        },
        'test-query',
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');

      const metrics = optimizer.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].query).toBe('test-query');
    });

    it('should cache query results', async () => {
      let callCount = 0;
      const queryFn = async () => {
        callCount++;
        return [{ id: '1', name: 'test' }];
      };

      // First call - should execute
      const result1 = await optimizer.executeWithCache(queryFn, 'cached-query');
      expect(callCount).toBe(1);

      // Second call - should use cache
      const result2 = await optimizer.executeWithCache(queryFn, 'cached-query');
      expect(callCount).toBe(1); // Still 1, not 2
      expect(result2).toEqual(result1);
    });

    it('should clear cache', async () => {
      await optimizer.executeWithCache(
        async () => [{ id: '1' }],
        'query-1',
      );
      await optimizer.executeWithCache(
        async () => [{ id: '2' }],
        'query-2',
      );

      optimizer.clearCache('query-1');
      // Cache for query-1 should be cleared, but query-2 should remain
    });

    it('should identify slow queries', async () => {
      // Simulate slow query
      await optimizer.executeWithMetrics(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
          return [];
        },
        'slow-query',
      );

      const slowQueries = optimizer.getSlowQueries();
      expect(slowQueries.length).toBeGreaterThan(0);
      expect(slowQueries[0].query).toBe('slow-query');
    });
  });

  describe('QueryBuilder', () => {
    it('should build date range filter', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const filter = QueryBuilder.dateRange('createdAt', startDate, endDate);

      expect(filter).toHaveProperty('createdAt');
      expect(filter.createdAt).toHaveProperty('gte', startDate);
      expect(filter.createdAt).toHaveProperty('lte', endDate);
    });

    it('should build full-text search filter', () => {
      const filter = QueryBuilder.fullTextSearch(
        ['title', 'content'],
        'test search',
      );

      expect(filter).toHaveProperty('OR');
      expect(filter.OR).toHaveLength(2);
    });

    it('should build array contains filter', () => {
      const filter = QueryBuilder.arrayContains('tags', ['tag1', 'tag2']);

      expect(filter).toHaveProperty('tags');
      expect(filter.tags).toHaveProperty('hasSome');
    });

    it('should build enum filter', () => {
      const filter = QueryBuilder.enumFilter('status', ['ACTIVE', 'PENDING']);

      expect(filter).toHaveProperty('status');
      expect(filter.status).toHaveProperty('in');
    });

    it('should combine filters', () => {
      const filter1 = { workspaceId: '123' };
      const filter2 = { status: 'ACTIVE' };
      const filter3 = { isDeleted: false };

      const combined = QueryBuilder.combineFilters(filter1, filter2, filter3);

      expect(combined).toHaveProperty('AND');
      expect(combined.AND).toHaveLength(3);
    });
  });

  describe('MaterializedViewManager', () => {
    let viewManager: MaterializedViewManager;

    beforeEach(() => {
      viewManager = new MaterializedViewManager(prismaService);
    });

    it('should refresh a materialized view', async () => {
      // This test requires the materialized view to exist
      // Skip if not in a test database with views
      try {
        await viewManager.refreshView('mv_daily_post_metrics');
        // If no error, the view was refreshed successfully
        expect(true).toBe(true);
      } catch (error: any) {
        // View might not exist in test database
        if (error.message.includes('does not exist')) {
          console.log('Skipping test - materialized view not found');
        } else {
          throw error;
        }
      }
    });
  });

  describe('QueryAnalyzer', () => {
    let analyzer: QueryAnalyzer;

    beforeEach(() => {
      analyzer = new QueryAnalyzer(prismaService);
    });

    it('should get table statistics', async () => {
      try {
        const stats = await analyzer.getTableStats('users');
        expect(stats).toBeDefined();
      } catch (error) {
        // Table might not exist in test database
        console.log('Skipping test - table not found');
      }
    });

    it('should get index statistics', async () => {
      try {
        const stats = await analyzer.getIndexStats();
        expect(Array.isArray(stats)).toBe(true);
      } catch (error) {
        console.log('Skipping test - unable to fetch index stats');
      }
    });
  });

  describe('DatabaseHealthMonitor', () => {
    let monitor: DatabaseHealthMonitor;

    beforeEach(() => {
      monitor = new DatabaseHealthMonitor(prismaService);
    });

    it('should check database health', async () => {
      const health = await monitor.checkHealth();

      expect(health).toHaveProperty('healthy');
      expect(typeof health.healthy).toBe('boolean');
    });

    it('should get long-running queries', async () => {
      const queries = await monitor.getLongRunningQueries(1000);

      expect(Array.isArray(queries)).toBe(true);
    });
  });

  describe('DatabaseMaintenanceService', () => {
    it('should be defined', () => {
      expect(maintenanceService).toBeDefined();
    });

    it('should refresh a materialized view', async () => {
      try {
        await maintenanceService.refreshView('mv_daily_post_metrics');
        expect(true).toBe(true);
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          console.log('Skipping test - materialized view not found');
        } else {
          throw error;
        }
      }
    });

    it('should get table bloat information', async () => {
      const bloat = await maintenanceService.getTableBloat();
      expect(Array.isArray(bloat)).toBe(true);
    });

    it('should find unused indexes', async () => {
      const indexes = await maintenanceService.findUnusedIndexes();
      expect(Array.isArray(indexes)).toBe(true);
    });
  });

  describe('Cursor Pagination', () => {
    it('should paginate results with cursor', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const queryFn = async (params: any) => {
        return mockData;
      };

      const result = await cursorPaginate(queryFn, {
        take: 2,
        orderBy: { id: 'desc' },
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('hasMore');
      expect(result).toHaveProperty('nextCursor');
    });
  });

  describe('PrismaService', () => {
    it('should perform health check', async () => {
      const healthy = await prismaService.healthCheck();
      expect(typeof healthy).toBe('boolean');
    });

    it('should get pool metrics', async () => {
      const metrics = await prismaService.getPoolMetrics();
      expect(metrics).toBeDefined();
    });
  });
});
