/**
 * Memory Interface
 * 
 * Defines how agents store and retrieve information.
 * Supports both short-term (context) and long-term (learning) memory.
 */

export enum MemoryType {
  SHORT_TERM = 'short_term', // Context for current task
  LONG_TERM = 'long_term', // Learned patterns and preferences
  SHARED = 'shared', // Shared between agents
  EPISODIC = 'episodic', // Historical task executions
}

export interface MemoryEntry {
  id: string;
  agentId: string;
  type: MemoryType;
  key: string;
  value: any;
  metadata?: Record<string, any>;
  relevanceScore?: number;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface MemoryQuery {
  agentId?: string;
  type?: MemoryType;
  keys?: string[];
  minRelevance?: number;
  limit?: number;
  includeExpired?: boolean;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  totalCount: number;
  relevanceScores: Map<string, number>;
}

/**
 * Agent Memory Service Interface
 */
export interface IAgentMemory {
  /**
   * Store memory
   */
  store(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'accessCount'>): Promise<MemoryEntry>;

  /**
   * Retrieve memory
   */
  retrieve(agentId: string, key: string): Promise<MemoryEntry | null>;

  /**
   * Search memory
   */
  search(query: MemoryQuery): Promise<MemorySearchResult>;

  /**
   * Update memory
   */
  update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry>;

  /**
   * Delete memory
   */
  delete(id: string): Promise<void>;

  /**
   * Clear expired memory
   */
  clearExpired(): Promise<number>;

  /**
   * Compress memory (reduce storage size)
   */
  compress(agentId: string): Promise<void>;
}

/**
 * Context Streaming Interface
 */
export interface StreamingContext {
  sourceAgentId: string;
  targetAgentId: string;
  data: any;
  relevanceScore: number;
  compressed: boolean;
  timestamp: Date;
}

export interface IContextStream {
  /**
   * Stream context from one agent to another
   */
  streamContext(
    fromAgentId: string,
    toAgentId: string,
    context: any,
  ): Promise<void>;

  /**
   * Extract relevant context
   */
  extractRelevantContext(
    fullContext: any,
    requirements: ContextRequirements,
  ): Promise<any>;

  /**
   * Compress context
   */
  compressContext(context: any): Promise<any>;

  /**
   * Decompress context
   */
  decompressContext(compressed: any): Promise<any>;
}

export interface ContextRequirements {
  requiredFields: string[];
  optionalFields?: string[];
  maxSize?: number;
  minRelevance?: number;
}

/**
 * Learning and Adaptation
 */
export interface LearningPattern {
  id: string;
  agentId: string;
  pattern: string;
  successRate: number;
  sampleSize: number;
  confidence: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningEngine {
  /**
   * Learn from execution results
   */
  learnFromExecution(
    agentId: string,
    task: any,
    result: any,
    feedback?: any,
  ): Promise<void>;

  /**
   * Get learned patterns
   */
  getPatterns(agentId: string): Promise<LearningPattern[]>;

  /**
   * Apply learned patterns to improve performance
   */
  applyPatterns(agentId: string, task: any): Promise<any>;

  /**
   * Update pattern based on new data
   */
  updatePattern(patternId: string, outcome: any): Promise<void>;
}
