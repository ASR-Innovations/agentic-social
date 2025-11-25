/**
 * Agent Interface
 * 
 * Core interface for all AI agents in the system.
 * Each agent (Content Creator, Strategy, Engagement, etc.) implements this interface.
 */

import { AIProviderType } from '../../ai/providers/ai-provider.interface';

export enum AgentType {
  CONTENT_CREATOR = 'content_creator',
  STRATEGY = 'strategy',
  ENGAGEMENT = 'engagement',
  ANALYTICS = 'analytics',
  TREND_DETECTION = 'trend_detection',
  COMPETITOR_ANALYSIS = 'competitor_analysis',
}

export enum AgentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AgentCapability {
  name: string;
  description: string;
  requiredInputs: string[];
  outputs: string[];
}

export interface AgentTask {
  id: string;
  type: string;
  input: Record<string, any>;
  context?: AgentContext;
  constraints?: TaskConstraints;
}

export interface AgentContext {
  tenantId: string;
  userId: string;
  brandVoice?: string;
  previousResults?: Record<string, any>;
  sharedMemory?: Record<string, any>;
}

export interface TaskConstraints {
  maxCost?: number;
  maxDuration?: number;
  qualityThreshold?: number;
  platforms?: string[];
}

export interface AgentResult {
  success: boolean;
  output: Record<string, any>;
  metadata: {
    tokensUsed: number;
    cost: number;
    duration: number;
    model: string;
    provider: AIProviderType;
    [key: string]: any; // Allow additional custom metadata
  };
  error?: string;
}

export interface AgentConfig {
  id: string;
  tenantId: string;
  name: string;
  type: AgentType;
  aiProvider: AIProviderType;
  model: string;
  personalityConfig: {
    tone?: string;
    style?: string;
    brandVoice?: string;
    creativity?: number; // 0-1
  };
  active: boolean;
  costBudget: number;
  fallbackProvider?: AIProviderType;
  usageStats?: {
    totalTasks?: number;
    successfulTasks?: number;
    failedTasks?: number;
    totalCost?: number;
    averageDuration?: number;
    lastUsedAt?: Date;
    lastFeedback?: AgentFeedback;
    lastFeedbackAt?: Date;
  };
  metadata?: Record<string, any>;
}

export interface AgentMemory {
  agentId: string;
  key: string;
  value: any;
  ttl?: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PartialContext {
  relevantData: Record<string, any>;
  relevanceScore: number;
  compressed: boolean;
}

/**
 * Base Agent Interface
 * All agents must implement these methods
 */
export interface Agent {
  /**
   * Agent identification
   */
  readonly id: string;
  readonly type: AgentType;
  readonly capabilities: AgentCapability[];
  readonly config: AgentConfig;

  /**
   * Core execution method
   */
  execute(task: AgentTask): Promise<AgentResult>;

  /**
   * Context management
   */
  shareContext(targetAgentId: string, context: PartialContext): Promise<void>;
  receiveContext(sourceAgentId: string, context: PartialContext): Promise<void>;

  /**
   * Learning and adaptation
   */
  updateFromFeedback(feedback: AgentFeedback): Promise<void>;

  /**
   * Cost estimation
   */
  estimateCost(task: AgentTask): Promise<number>;

  /**
   * Health check
   */
  checkHealth(): Promise<boolean>;
}

export interface AgentFeedback {
  taskId: string;
  rating: number; // 1-5
  qualityScore: number; // 0-1
  userComments?: string;
  engagementMetrics?: Record<string, number>;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  totalTasks: number;
  successRate: number;
  averageCost: number;
  averageDuration: number;
  averageQuality: number;
  totalCost: number;
}
