import { Logger } from '@nestjs/common';
import {
  Agent,
  AgentType,
  AgentCapability,
  AgentConfig,
  AgentTask,
  AgentResult,
  AgentFeedback,
  PartialContext,
  AgentStatus,
} from '../interfaces/agent.interface';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import { AIProvider } from '../../ai/providers/ai-provider.interface';

/**
 * Base Agent Class
 * 
 * All agents extend this class and implement the execute() method.
 * Provides common functionality for all agents.
 */
export abstract class BaseAgent implements Agent {
  protected readonly logger: Logger;
  protected provider: AIProvider;
  protected status: AgentStatus = AgentStatus.IDLE;

  constructor(
    public readonly id: string,
    public readonly type: AgentType,
    public readonly config: AgentConfig,
    protected readonly providerFactory: AIProviderFactory,
  ) {
    this.logger = new Logger(`${this.constructor.name}:${id}`);
    this.initializeProvider();
  }

  /**
   * Initialize AI provider
   */
  private initializeProvider(): void {
    try {
      this.provider = this.providerFactory.getProvider(this.config.aiProvider);
      this.logger.log(`Initialized with provider: ${this.config.aiProvider}`);
    } catch (error) {
      this.logger.error(`Failed to initialize provider: ${error.message}`);
      // Try fallback provider
      if (this.config.fallbackProvider) {
        this.provider = this.providerFactory.getProvider(this.config.fallbackProvider);
        this.logger.warn(`Using fallback provider: ${this.config.fallbackProvider}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Abstract method - must be implemented by each agent
   */
  abstract execute(task: AgentTask): Promise<AgentResult>;

  /**
   * Get agent capabilities
   */
  abstract get capabilities(): AgentCapability[];

  /**
   * Share context with another agent
   */
  async shareContext(targetAgentId: string, context: PartialContext): Promise<void> {
    this.logger.debug(`Sharing context with agent ${targetAgentId}`);
    // Implementation will be handled by AgentMemory service
  }

  /**
   * Receive context from another agent
   */
  async receiveContext(sourceAgentId: string, context: PartialContext): Promise<void> {
    this.logger.debug(`Received context from agent ${sourceAgentId}`);
    // Implementation will be handled by AgentMemory service
  }

  /**
   * Update agent based on feedback
   */
  async updateFromFeedback(feedback: AgentFeedback): Promise<void> {
    this.logger.log(`Received feedback for task ${feedback.taskId}: ${feedback.rating}/5`);
    
    // Update usage stats
    if (this.config.metadata) {
      this.config.metadata.lastFeedback = feedback;
      this.config.metadata.lastFeedbackAt = new Date();
    }

    // Learning logic will be implemented by LearningEngine
  }

  /**
   * Estimate cost for a task
   */
  async estimateCost(task: AgentTask): Promise<number> {
    try {
      const estimate = await this.provider.estimateCost({
        prompt: JSON.stringify(task.input),
        type: 'text',
        complexity: this.determineComplexity(task),
      });

      return estimate.estimatedCost;
    } catch (error) {
      this.logger.warn(`Cost estimation failed: ${error.message}`);
      return 0.01; // Default estimate
    }
  }

  /**
   * Check agent health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const health = await this.provider.checkHealth();
      return health.available;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute with automatic retry and fallback
   */
  protected async executeWithRetry(
    task: AgentTask,
    maxRetries: number = 3,
  ): Promise<AgentResult> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.status = AgentStatus.PROCESSING;
        const result = await this.execute(task);
        this.status = AgentStatus.COMPLETED;
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);

        // Try fallback provider on last attempt
        if (attempt === maxRetries && this.config.fallbackProvider) {
          this.logger.log('Trying fallback provider...');
          try {
            this.provider = this.providerFactory.getProvider(this.config.fallbackProvider);
            const result = await this.execute(task);
            this.status = AgentStatus.COMPLETED;
            return result;
          } catch (fallbackError) {
            this.logger.error(`Fallback also failed: ${fallbackError.message}`);
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    this.status = AgentStatus.FAILED;
    throw lastError;
  }

  /**
   * Generate text using the configured AI provider
   */
  protected async generateText(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    },
  ): Promise<{ text: string; cost: number; tokensUsed: number }> {
    const startTime = Date.now();

    try {
      const response = await this.provider.generateText(prompt, {
        model: this.config.model,
        maxTokens: options?.maxTokens || 1000,
        temperature: options?.temperature || this.config.personalityConfig.creativity || 0.7,
        systemPrompt: options?.systemPrompt || this.buildSystemPrompt(),
      });

      const duration = Date.now() - startTime;
      this.logger.debug(`Generated text in ${duration}ms, cost: $${response.cost.toFixed(4)}`);

      return {
        text: response.text,
        cost: response.cost,
        tokensUsed: response.tokensUsed,
      };
    } catch (error) {
      this.logger.error(`Text generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build system prompt based on personality config
   */
  protected buildSystemPrompt(): string {
    const { tone, style, brandVoice } = this.config.personalityConfig;

    let prompt = 'You are an AI assistant helping with social media management.';

    if (tone) {
      prompt += ` Use a ${tone} tone.`;
    }

    if (style) {
      prompt += ` Write in a ${style} style.`;
    }

    if (brandVoice) {
      prompt += ` Follow this brand voice: ${brandVoice}`;
    }

    return prompt;
  }

  /**
   * Determine task complexity
   */
  protected determineComplexity(task: AgentTask): 'low' | 'medium' | 'high' {
    const inputSize = JSON.stringify(task.input).length;

    if (inputSize < 500) return 'low';
    if (inputSize < 2000) return 'medium';
    return 'high';
  }

  /**
   * Check if within cost budget
   */
  protected async checkBudget(estimatedCost: number): Promise<boolean> {
    const currentUsage = this.config.usageStats?.totalCost || 0;
    return (currentUsage + estimatedCost) <= this.config.costBudget;
  }

  /**
   * Update usage statistics
   */
  protected updateUsageStats(result: AgentResult): void {
    if (!this.config.usageStats) {
      this.config.usageStats = {};
    }

    this.config.usageStats.totalTasks = (this.config.usageStats.totalTasks || 0) + 1;
    
    if (result.success) {
      this.config.usageStats.successfulTasks = (this.config.usageStats.successfulTasks || 0) + 1;
    } else {
      this.config.usageStats.failedTasks = (this.config.usageStats.failedTasks || 0) + 1;
    }

    this.config.usageStats.totalCost = (this.config.usageStats.totalCost || 0) + result.metadata.cost;
    this.config.usageStats.lastUsedAt = new Date();

    // Calculate average duration
    const totalDuration = (this.config.usageStats.averageDuration || 0) * (this.config.usageStats.totalTasks - 1);
    this.config.usageStats.averageDuration = (totalDuration + result.metadata.duration) / this.config.usageStats.totalTasks;
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current status
   */
  getStatus(): AgentStatus {
    return this.status;
  }
}
