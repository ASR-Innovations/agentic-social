import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  MemoryEntry,
  MemoryQuery,
  MemorySearchResult,
  MemoryType,
  IAgentMemory,
} from '../interfaces/memory.interface';
import { AgentMemoryEntity } from '../entities/agent-memory.entity';

/**
 * Agent Memory Service
 * 
 * Manages agent memory storage and retrieval.
 * Supports short-term, long-term, shared, and episodic memory.
 */
@Injectable()
export class AgentMemoryService implements IAgentMemory {
  private readonly logger = new Logger(AgentMemoryService.name);

  constructor(
    @InjectRepository(AgentMemoryEntity)
    private memoryRepository: Repository<AgentMemoryEntity>,
  ) {}

  /**
   * Store memory
   */
  async store(
    entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'accessCount'>,
  ): Promise<MemoryEntry> {
    const memory = this.memoryRepository.create({
      ...entry,
      accessCount: 0,
      createdAt: new Date(),
    });

    const saved = await this.memoryRepository.save(memory);
    this.logger.debug(`Stored memory: ${saved.key} for agent ${saved.agentId}`);

    return saved as MemoryEntry;
  }

  /**
   * Retrieve memory
   */
  async retrieve(agentId: string, key: string): Promise<MemoryEntry | null> {
    const memory = await this.memoryRepository.findOne({
      where: { agentId, key },
    });

    if (!memory) {
      return null;
    }

    // Check if expired
    if (memory.expiresAt && memory.expiresAt < new Date()) {
      await this.delete(memory.id);
      return null;
    }

    // Update access count
    memory.accessCount++;
    memory.lastAccessedAt = new Date();
    await this.memoryRepository.save(memory);

    return memory as MemoryEntry;
  }

  /**
   * Search memory
   */
  async search(query: MemoryQuery): Promise<MemorySearchResult> {
    const where: any = {};

    if (query.agentId) {
      where.agentId = query.agentId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.keys && query.keys.length > 0) {
      where.key = In(query.keys);
    }

    let queryBuilder = this.memoryRepository
      .createQueryBuilder('memory')
      .where(where);

    // Filter by relevance
    if (query.minRelevance) {
      queryBuilder = queryBuilder.andWhere('memory.relevanceScore >= :minRelevance', {
        minRelevance: query.minRelevance,
      });
    }

    // Filter expired
    if (!query.includeExpired) {
      queryBuilder = queryBuilder.andWhere(
        '(memory.expiresAt IS NULL OR memory.expiresAt > :now)',
        { now: new Date() },
      );
    }

    // Order by relevance and recency
    queryBuilder = queryBuilder
      .orderBy('memory.relevanceScore', 'DESC')
      .addOrderBy('memory.lastAccessedAt', 'DESC')
      .addOrderBy('memory.createdAt', 'DESC');

    // Limit results
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    const [entries, totalCount] = await queryBuilder.getManyAndCount();

    // Calculate relevance scores
    const relevanceScores = new Map<string, number>();
    entries.forEach(entry => {
      relevanceScores.set(entry.id, entry.relevanceScore || 0);
    });

    return {
      entries: entries as MemoryEntry[],
      totalCount,
      relevanceScores,
    };
  }

  /**
   * Update memory
   */
  async update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry> {
    const memory = await this.memoryRepository.findOne({ where: { id } });

    if (!memory) {
      throw new Error(`Memory not found: ${id}`);
    }

    Object.assign(memory, updates);
    const updated = await this.memoryRepository.save(memory);

    return updated as MemoryEntry;
  }

  /**
   * Delete memory
   */
  async delete(id: string): Promise<void> {
    await this.memoryRepository.delete(id);
    this.logger.debug(`Deleted memory: ${id}`);
  }

  /**
   * Clear expired memory
   */
  async clearExpired(): Promise<number> {
    const result = await this.memoryRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    const count = result.affected || 0;
    this.logger.log(`Cleared ${count} expired memories`);

    return count;
  }

  /**
   * Compress memory (reduce storage size)
   */
  async compress(agentId: string): Promise<void> {
    // Get all memories for agent
    const memories = await this.memoryRepository.find({
      where: { agentId },
      order: { accessCount: 'ASC', createdAt: 'ASC' },
    });

    // Delete least accessed memories if over threshold
    const threshold = 1000;
    if (memories.length > threshold) {
      const toDelete = memories.slice(0, memories.length - threshold);
      await this.memoryRepository.remove(toDelete);
      this.logger.log(`Compressed ${toDelete.length} memories for agent ${agentId}`);
    }
  }

  /**
   * Store shared memory (accessible by all agents)
   */
  async storeShared(
    key: string,
    value: any,
    ttl?: number,
  ): Promise<MemoryEntry> {
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : undefined;

    return await this.store({
      agentId: 'shared',
      type: MemoryType.SHARED,
      key,
      value,
      expiresAt,
    });
  }

  /**
   * Retrieve shared memory
   */
  async retrieveShared(key: string): Promise<any> {
    const memory = await this.retrieve('shared', key);
    return memory?.value;
  }

  /**
   * Store episodic memory (task execution history)
   */
  async storeEpisode(
    agentId: string,
    taskId: string,
    result: any,
  ): Promise<MemoryEntry> {
    return await this.store({
      agentId,
      type: MemoryType.EPISODIC,
      key: `episode_${taskId}`,
      value: result,
      metadata: {
        taskId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get agent's episodic memory
   */
  async getEpisodes(agentId: string, limit: number = 10): Promise<MemoryEntry[]> {
    const result = await this.search({
      agentId,
      type: MemoryType.EPISODIC,
      limit,
    });

    return result.entries;
  }
}

// Helper function for In operator
function In(values: any[]): any {
  return { $in: values };
}
