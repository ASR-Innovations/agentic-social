import { Test, TestingModule } from '@nestjs/testing';
import { RequestBatcherService } from './request-batcher.service';

describe('RequestBatcherService', () => {
  let service: RequestBatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestBatcherService],
    }).compile();

    service = module.get<RequestBatcherService>(RequestBatcherService);
  });

  afterEach(() => {
    service.clearAll();
  });

  describe('addToBatch', () => {
    it('should batch multiple requests', async () => {
      const executor = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `result-${req}`);
      });

      const results = await Promise.all([
        service.addToBatch('test', 'req1', executor, { batchWindow: 50 }),
        service.addToBatch('test', 'req2', executor, { batchWindow: 50 }),
        service.addToBatch('test', 'req3', executor, { batchWindow: 50 }),
      ]);

      // Wait for batch to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(executor).toHaveBeenCalledTimes(1);
      expect(executor).toHaveBeenCalledWith(['req1', 'req2', 'req3']);
      expect(results).toEqual(['result-req1', 'result-req2', 'result-req3']);
    });

    it('should execute immediately when batch is full', async () => {
      const executor = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `result-${req}`);
      });

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          service.addToBatch('test', `req${i}`, executor, {
            batchWindow: 1000,
            maxBatchSize: 50,
          }),
        );
      }

      await Promise.all(promises);

      // Should execute twice (50 + 50)
      expect(executor).toHaveBeenCalledTimes(2);
    });

    it('should handle errors in batch execution', async () => {
      const executor = jest.fn(async () => {
        throw new Error('Batch execution failed');
      });

      await expect(
        service.addToBatch('test', 'req1', executor, { batchWindow: 10 }),
      ).rejects.toThrow('Batch execution failed');
    });

    it('should create separate batches for different keys', async () => {
      const executor1 = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `batch1-${req}`);
      });

      const executor2 = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `batch2-${req}`);
      });

      await Promise.all([
        service.addToBatch('batch1', 'req1', executor1, { batchWindow: 50 }),
        service.addToBatch('batch2', 'req2', executor2, { batchWindow: 50 }),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(executor1).toHaveBeenCalledTimes(1);
      expect(executor2).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all batch queues', async () => {
      const executor = jest.fn(async (requests: string[]) => {
        return requests.map((req) => `result-${req}`);
      });

      service.addToBatch('test', 'req1', executor, { batchWindow: 1000 });
      service.clearAll();

      // After clearing, new batches should be independent
      await service.addToBatch('test', 'req2', executor, { batchWindow: 10 });
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(executor).toHaveBeenCalledTimes(1);
      expect(executor).toHaveBeenCalledWith(['req2']);
    });
  });
});
