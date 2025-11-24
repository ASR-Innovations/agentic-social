import { Injectable } from '@nestjs/common';

/**
 * Service for batching multiple requests into a single operation
 * Reduces database queries and API calls by grouping similar requests
 */
@Injectable()
export class RequestBatcherService {
  private batches: Map<string, BatchQueue<any, any>> = new Map();
  private readonly defaultBatchWindow = 10; // milliseconds
  private readonly defaultMaxBatchSize = 100;

  /**
   * Add a request to a batch queue
   * @param batchKey Unique identifier for the batch type
   * @param request The request data
   * @param executor Function to execute the batch
   * @param options Batching options
   */
  async addToBatch<TRequest, TResponse>(
    batchKey: string,
    request: TRequest,
    executor: (requests: TRequest[]) => Promise<TResponse[]>,
    options?: BatchOptions,
  ): Promise<TResponse> {
    const queue = this.getOrCreateQueue(batchKey, executor, options);
    return queue.add(request);
  }

  /**
   * Get or create a batch queue
   */
  private getOrCreateQueue<TRequest, TResponse>(
    batchKey: string,
    executor: (requests: TRequest[]) => Promise<TResponse[]>,
    options?: BatchOptions,
  ): BatchQueue<TRequest, TResponse> {
    if (!this.batches.has(batchKey)) {
      const queue = new BatchQueue<TRequest, TResponse>(
        executor,
        options?.batchWindow || this.defaultBatchWindow,
        options?.maxBatchSize || this.defaultMaxBatchSize,
      );
      this.batches.set(batchKey, queue);
    }
    return this.batches.get(batchKey)!;
  }

  /**
   * Clear all batch queues
   */
  clearAll(): void {
    this.batches.forEach((queue) => queue.clear());
    this.batches.clear();
  }
}

/**
 * Options for request batching
 */
export interface BatchOptions {
  batchWindow?: number; // Time window in milliseconds
  maxBatchSize?: number; // Maximum number of requests per batch
}

/**
 * Queue for batching requests
 */
class BatchQueue<TRequest, TResponse> {
  private queue: Array<{
    request: TRequest;
    resolve: (value: TResponse) => void;
    reject: (error: any) => void;
  }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly executor: (requests: TRequest[]) => Promise<TResponse[]>,
    private readonly batchWindow: number,
    private readonly maxBatchSize: number,
  ) {}

  /**
   * Add a request to the queue
   */
  add(request: TRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      // Execute immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.executeBatch();
      } else if (!this.timer) {
        // Schedule batch execution
        this.timer = setTimeout(() => {
          this.executeBatch();
        }, this.batchWindow);
      }
    });
  }

  /**
   * Execute the current batch
   */
  private async executeBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.maxBatchSize);
    const requests = batch.map((item) => item.request);

    try {
      const responses = await this.executor(requests);

      // Resolve each promise with its corresponding response
      batch.forEach((item, index) => {
        if (responses[index] !== undefined) {
          item.resolve(responses[index]);
        } else {
          item.reject(new Error('No response for request'));
        }
      });
    } catch (error) {
      // Reject all promises in the batch
      batch.forEach((item) => item.reject(error));
    }

    // If there are more items in queue, schedule next batch
    if (this.queue.length > 0) {
      this.timer = setTimeout(() => {
        this.executeBatch();
      }, this.batchWindow);
    }
  }

  /**
   * Clear the queue
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }
}
