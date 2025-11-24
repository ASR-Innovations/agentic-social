import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataLoaderService } from '../dataloader/dataloader.service';
import { CursorPaginationService } from '../pagination/cursor-pagination.service';
import { RequestBatcherService } from '../batching/request-batcher.service';
import { PerformanceModule } from './performance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheModule } from '../../cache/cache.module';
import { ConfigModule } from '@nestjs/config';

describe('Performance Optimization Integration', () => {
  let app: INestApplication;
  let dataLoaderService: DataLoaderService;
  let paginationService: CursorPaginationService;
  let batcherService: RequestBatcherService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CacheModule,
        PerformanceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataLoaderService = moduleFixture.get<DataLoaderService>(DataLoaderService);
    paginationService = moduleFixture.get<CursorPaginationService>(CursorPaginationService);
    batcherService = moduleFixture.get<RequestBatcherService>(RequestBatcherService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DataLoader', () => {
    it('should be defined', () => {
      expect(dataLoaderService).toBeDefined();
    });

    it('should provide user loader', () => {
      const loader = dataLoaderService.getUserLoader();
      expect(loader).toBeDefined();
    });

    it('should provide workspace loader', () => {
      const loader = dataLoaderService.getWorkspaceLoader();
      expect(loader).toBeDefined();
    });
  });

  describe('Cursor Pagination', () => {
    it('should be defined', () => {
      expect(paginationService).toBeDefined();
    });

    it('should encode and decode cursor', () => {
      const cursor = paginationService.encodeCursor('test-id', new Date('2024-01-01'));
      expect(cursor).toBeTruthy();

      const decoded = paginationService.decodeCursor(cursor);
      expect(decoded.id).toBe('test-id');
      expect(decoded.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should build pagination query', () => {
      const query = paginationService.buildPaginationQuery(
        undefined,
        20,
        'forward',
        { status: 'published' },
      );

      expect(query.where).toEqual({ status: 'published' });
      expect(query.take).toBe(21); // limit + 1
      expect(query.orderBy).toBeDefined();
    });

    it('should create paginated response', () => {
      const items = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-01-02') },
      ];

      const response = paginationService.createResponse(items, 10, 'forward');

      expect(response.data).toHaveLength(2);
      expect(response.pageInfo.hasNextPage).toBe(false);
      expect(response.pageInfo.startCursor).toBeTruthy();
      expect(response.pageInfo.endCursor).toBeTruthy();
    });
  });

  describe('Request Batcher', () => {
    it('should be defined', () => {
      expect(batcherService).toBeDefined();
    });

    it('should batch requests', async () => {
      const executor = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `result-${req}`);
      });

      const results = await Promise.all([
        batcherService.addToBatch('test-batch', 'req1', executor, { batchWindow: 50 }),
        batcherService.addToBatch('test-batch', 'req2', executor, { batchWindow: 50 }),
        batcherService.addToBatch('test-batch', 'req3', executor, { batchWindow: 50 }),
      ]);

      // Wait for batch to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(executor).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['result-req1', 'result-req2', 'result-req3']);
    });
  });

  describe('Combined Performance Features', () => {
    it('should work together efficiently', async () => {
      // This test demonstrates how all features work together
      // In a real scenario, this would query actual data

      // 1. Use cursor pagination to get a page of data
      const paginationQuery = paginationService.buildPaginationQuery(
        undefined,
        10,
        'forward',
      );

      expect(paginationQuery).toBeDefined();

      // 2. DataLoader would batch-load related entities
      const userLoader = dataLoaderService.getUserLoader();
      expect(userLoader).toBeDefined();

      // 3. Request batcher would group similar operations
      const batchExecutor = jest.fn(async (ids: string[]) => {
        return ids.map((id) => ({ id, data: 'test' }));
      });

      const batchResult = await batcherService.addToBatch(
        'combined-test',
        'test-id',
        batchExecutor,
        { batchWindow: 10 },
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(batchResult).toEqual({ id: 'test-id', data: 'test' });
    });
  });
});
