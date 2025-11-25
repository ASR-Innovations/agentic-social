import { Injectable, Logger } from '@nestjs/common';
import {
  StreamingContext,
  IContextStream,
  ContextRequirements,
} from '../interfaces/memory.interface';
import { AgentMemoryService } from './agent-memory.service';

/**
 * Context Stream Service
 * 
 * Efficiently streams context between agents without full duplication.
 * Compresses and filters context to reduce costs.
 */
@Injectable()
export class ContextStreamService implements IContextStream {
  private readonly logger = new Logger(ContextStreamService.name);

  constructor(private readonly memoryService: AgentMemoryService) {}

  /**
   * Stream context from one agent to another
   */
  async streamContext(
    fromAgentId: string,
    toAgentId: string,
    context: any,
  ): Promise<void> {
    this.logger.debug(`Streaming context from ${fromAgentId} to ${toAgentId}`);

    // Compress context
    const compressed = await this.compressContext(context);

    // Calculate relevance score
    const relevanceScore = this.calculateRelevance(context);

    // Store in shared memory with TTL
    const streamKey = `context_stream_${fromAgentId}_${toAgentId}_${Date.now()}`;
    
    await this.memoryService.storeShared(streamKey, compressed, 300); // 5 minutes TTL

    this.logger.debug(
      `Streamed context: ${JSON.stringify(context).length} bytes → ${JSON.stringify(compressed).length} bytes`,
    );
  }

  /**
   * Extract relevant context based on requirements
   */
  async extractRelevantContext(
    fullContext: any,
    requirements: ContextRequirements,
  ): Promise<any> {
    const relevant: any = {};

    // Extract required fields
    for (const field of requirements.requiredFields) {
      if (fullContext[field] !== undefined) {
        relevant[field] = fullContext[field];
      }
    }

    // Extract optional fields if available
    if (requirements.optionalFields) {
      for (const field of requirements.optionalFields) {
        if (fullContext[field] !== undefined) {
          relevant[field] = fullContext[field];
        }
      }
    }

    // Check size constraint
    if (requirements.maxSize) {
      const size = JSON.stringify(relevant).length;
      if (size > requirements.maxSize) {
        // Truncate or compress further
        return this.truncateContext(relevant, requirements.maxSize);
      }
    }

    return relevant;
  }

  /**
   * Compress context to reduce size
   */
  async compressContext(context: any): Promise<any> {
    if (!context || typeof context !== 'object') {
      return context;
    }

    const compressed: any = {};

    for (const [key, value] of Object.entries(context)) {
      // Skip null/undefined
      if (value === null || value === undefined) {
        continue;
      }

      // Compress strings
      if (typeof value === 'string') {
        // Keep only first 500 chars for long strings
        compressed[key] = value.length > 500 ? value.substring(0, 500) + '...' : value;
      }
      // Compress arrays
      else if (Array.isArray(value)) {
        // Keep only first 10 items
        compressed[key] = value.slice(0, 10);
      }
      // Recursively compress objects
      else if (typeof value === 'object') {
        compressed[key] = await this.compressContext(value);
      }
      // Keep primitives as-is
      else {
        compressed[key] = value;
      }
    }

    return compressed;
  }

  /**
   * Decompress context
   */
  async decompressContext(compressed: any): Promise<any> {
    // For now, just return as-is
    // In production, implement actual decompression logic
    return compressed;
  }

  /**
   * Calculate relevance score for context
   */
  private calculateRelevance(context: any): number {
    // Simple heuristic: more data = more relevant
    const size = JSON.stringify(context).length;
    
    if (size < 100) return 0.3;
    if (size < 500) return 0.5;
    if (size < 2000) return 0.7;
    return 0.9;
  }

  /**
   * Truncate context to fit size limit
   */
  private truncateContext(context: any, maxSize: number): any {
    let current = JSON.stringify(context);
    
    if (current.length <= maxSize) {
      return context;
    }

    // Progressively remove fields until under limit
    const truncated: any = {};
    let size = 2; // {}

    for (const [key, value] of Object.entries(context)) {
      const fieldSize = JSON.stringify({ [key]: value }).length;
      
      if (size + fieldSize <= maxSize) {
        truncated[key] = value;
        size += fieldSize;
      } else {
        break;
      }
    }

    return truncated;
  }

  /**
   * Stream context with delta (only changed fields)
   */
  async streamDelta(
    fromAgentId: string,
    toAgentId: string,
    previousContext: any,
    newContext: any,
  ): Promise<void> {
    const delta = this.calculateDelta(previousContext, newContext);
    
    if (Object.keys(delta).length > 0) {
      await this.streamContext(fromAgentId, toAgentId, delta);
    }
  }

  /**
   * Calculate delta between two contexts
   */
  private calculateDelta(previous: any, current: any): any {
    const delta: any = {};

    for (const [key, value] of Object.entries(current)) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(value)) {
        delta[key] = value;
      }
    }

    return delta;
  }
}
