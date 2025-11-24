import DataLoader from 'dataloader';

/**
 * Factory for creating DataLoader instances
 * DataLoaders batch and cache database queries to prevent N+1 problems
 */
export class DataLoaderFactory {
  /**
   * Create a generic DataLoader for batching database queries
   * @param batchLoadFn Function that loads multiple items by IDs
   * @param options DataLoader options
   */
  static createLoader<K, V>(
    batchLoadFn: (keys: readonly K[]) => Promise<V[]>,
    options?: DataLoader.Options<K, V>,
  ): DataLoader<K, V> {
    return new DataLoader<K, V>(batchLoadFn, {
      cache: true,
      maxBatchSize: 100,
      ...options,
    });
  }

  /**
   * Create a DataLoader that maps results by ID
   * Useful when the batch function returns items that need to be matched to keys
   */
  static createByIdLoader<T extends { id: string }>(
    batchLoadFn: (ids: readonly string[]) => Promise<T[]>,
  ): DataLoader<string, T | null> {
    return new DataLoader<string, T | null>(
      async (ids) => {
        const items = await batchLoadFn(ids);
        const itemMap = new Map(items.map((item) => [item.id, item]));
        return ids.map((id) => itemMap.get(id) || null);
      },
      { cache: true, maxBatchSize: 100 },
    );
  }

  /**
   * Create a DataLoader for one-to-many relationships
   * Returns an array of items for each key
   */
  static createOneToManyLoader<K, V>(
    batchLoadFn: (keys: readonly K[]) => Promise<V[][]>,
  ): DataLoader<K, V[]> {
    return new DataLoader<K, V[]>(batchLoadFn, {
      cache: true,
      maxBatchSize: 100,
    });
  }
}
