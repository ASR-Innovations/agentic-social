import { Injectable, Logger } from '@nestjs/common';
import { AgentTask, AgentResult } from '../interfaces/agent.interface';

/**
 * Cost Optimizer Service
 * 
 * Optimizes AI costs through caching, batching, and smart routing.
 */
@Injectable()
export class CostOptimizerService {
  private readonly logger = new Logger(CostOptimizerService.name);
  private readonly cache = new Map<string, { result: any; timestamp: number; cost: number }>();
  private readonly cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Check if task result is cached
   */
  async checkCache(task: AgentTask): Promise<AgentResult | null> {
    const cacheKey = this.generateCacheKey(task);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    this.logger.debug(`Cache hit for task ${task.type} - saved $${cached.cost.toFixed(4)}`);

    return {
      success: true,
      output: cached.result,
      metadata: {
        tokensUsed: 0,
        cost: 0, // Cached, no cost
        duration: 0,
        model: 'cached',
        provider: null as any,
      },
    };
  }

  /**
   * Store result in cache
   */
  async storeInCache(task: AgentTask, result: AgentResult): Promise<void> {
    const cacheKey = this.generateCacheKey(task);
    
    this.cache.set(cacheKey, {
      result: result.output,
      timestamp: Date.now(),
      cost: result.metadata.cost,
    });

    this.logger.debug(`Cached result for task ${task.type}`);
  }

  /**
   * Generate cache key for task
   */
  private generateCacheKey(task: AgentTask): string {
    // Create deterministic key from task
    const key = JSON.stringify({
      type: task.type,
      input: task.input,
      // Don't include context in cache key as it may vary
    });

    return this.hashString(key);
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Optimize prompt to reduce tokens
   */
  optimizePrompt(prompt: string): string {
    // Remove extra whitespace
    let optimized = prompt.replace(/\s+/g, ' ').trim();

    // Remove common filler words if prompt is long
    if (optimized.length > 1000) {
      const fillers = ['basically', 'actually', 'literally', 'very', 'really'];
      fillers.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        optimized = optimized.replace(regex, '');
      });
    }

    return optimized;
  }

  /**
   * Batch multiple tasks for cost savings
   */
  async batchTasks(tasks: AgentTask[]): Promise<AgentTask[]> {
    // Group similar tasks
    const grouped = new Map<string, AgentTask[]>();

    for (const task of tasks) {
      const key = task.type;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(task);
    }

    // Combine tasks where possible
    const batched: AgentTask[] = [];

    for (const [type, taskGroup] of grouped) {
      if (taskGroup.length === 1) {
        batched.push(taskGroup[0]);
      } else {
        // Combine multiple tasks into one
        batched.push({
          id: `batch_${type}_${Date.now()}`,
          type: `batch_${type}`,
          input: {
            tasks: taskGroup.map(t => t.input),
          },
          context: taskGroup[0].context,
        });
      }
    }

    this.logger.log(`Batched ${tasks.length} tasks into ${batched.length} requests`);

    return batched;
  }

  /**
   * Calculate potential savings
   */
  calculateSavings(
    originalCost: number,
    optimizedCost: number,
  ): { savings: number; percentage: number } {
    const savings = originalCost - optimizedCost;
    const percentage = (savings / originalCost) * 100;

    return { savings, percentage };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalSavings: number;
  } {
    let totalSavings = 0;
    
    for (const cached of this.cache.values()) {
      totalSavings += cached.cost;
    }

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      totalSavings,
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.cache) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.logger.log(`Cleared ${cleared} expired cache entries`);
    }

    return cleared;
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.logger.log('Cleared all cache');
  }
}
