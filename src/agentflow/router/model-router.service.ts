import { Injectable, Logger } from '@nestjs/common';
import { AIProviderFactory } from '../../ai/providers/provider.factory';
import {
  AIProvider,
  AIProviderType,
  ProviderSelectionCriteria,
} from '../../ai/providers/ai-provider.interface';
import { AgentTask } from '../interfaces/agent.interface';

/**
 * Model Router Service
 * 
 * Intelligently routes AI requests to the optimal provider/model
 * based on task complexity, cost constraints, and performance.
 */
@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);

  constructor(private readonly providerFactory: AIProviderFactory) {}

  /**
   * Select optimal provider for a task
   */
  async selectProvider(task: AgentTask): Promise<AIProvider> {
    const criteria = this.buildSelectionCriteria(task);
    
    const provider = await this.providerFactory.getOptimalProvider(criteria);
    
    this.logger.debug(
      `Selected provider: ${provider.name} for task ${task.type} (complexity: ${criteria.taskComplexity})`,
    );

    return provider;
  }

  /**
   * Build selection criteria from task
   */
  private buildSelectionCriteria(task: AgentTask): ProviderSelectionCriteria {
    const complexity = this.analyzeComplexity(task);
    
    return {
      taskComplexity: complexity,
      maxBudget: task.constraints?.maxCost,
      preferredProvider: this.getPreferredProvider(task),
      requiresImageGeneration: this.requiresImageGeneration(task),
      maxLatency: task.constraints?.maxDuration,
    };
  }

  /**
   * Analyze task complexity
   */
  private analyzeComplexity(task: AgentTask): 'low' | 'medium' | 'high' {
    const factors = {
      inputSize: JSON.stringify(task.input).length,
      contextSize: task.context ? JSON.stringify(task.context).length : 0,
      taskType: task.type,
    };

    // Simple tasks
    if (
      factors.inputSize < 500 &&
      factors.contextSize < 1000 &&
      this.isSimpleTask(task.type)
    ) {
      return 'low';
    }

    // Complex tasks
    if (
      factors.inputSize > 2000 ||
      factors.contextSize > 5000 ||
      this.isComplexTask(task.type)
    ) {
      return 'high';
    }

    // Medium complexity
    return 'medium';
  }

  /**
   * Check if task type is simple
   */
  private isSimpleTask(taskType: string): boolean {
    const simpleTasks = [
      'generate_caption',
      'generate_hashtags',
      'simple_response',
      'format_content',
    ];

    return simpleTasks.includes(taskType);
  }

  /**
   * Check if task type is complex
   */
  private isComplexTask(taskType: string): boolean {
    const complexTasks = [
      'analyze_strategy',
      'competitor_analysis',
      'trend_detection',
      'content_planning',
      'performance_analysis',
    ];

    return complexTasks.includes(taskType);
  }

  /**
   * Get preferred provider from task
   */
  private getPreferredProvider(task: AgentTask): AIProviderType | undefined {
    // Check if task input specifies a provider
    if (task.input?.aiProvider) {
      return task.input.aiProvider as AIProviderType;
    }

    return undefined;
  }

  /**
   * Check if task requires image generation
   */
  private requiresImageGeneration(task: AgentTask): boolean {
    const imageTaskTypes = [
      'generate_image',
      'create_visual',
      'design_graphic',
    ];

    return imageTaskTypes.includes(task.type);
  }

  /**
   * Get fallback provider
   */
  getFallbackProvider(failedProvider: AIProviderType): AIProvider {
    return this.providerFactory.getFallbackProvider(failedProvider);
  }

  /**
   * Estimate cost for all providers
   */
  async estimateCostAllProviders(task: AgentTask): Promise<Map<AIProviderType, number>> {
    const request = {
      prompt: JSON.stringify(task.input),
      type: 'text' as const,
      complexity: this.analyzeComplexity(task),
    };

    return await this.providerFactory.estimateCostAllProviders(request);
  }

  /**
   * Get cheapest provider for task
   */
  async getCheapestProvider(task: AgentTask): Promise<AIProvider> {
    const costs = await this.estimateCostAllProviders(task);
    
    let cheapest: AIProviderType | null = null;
    let lowestCost = Infinity;

    for (const [provider, cost] of costs) {
      if (cost < lowestCost) {
        lowestCost = cost;
        cheapest = provider;
      }
    }

    if (!cheapest) {
      // Fallback to default
      return this.providerFactory.getDefaultProvider();
    }

    return this.providerFactory.getProvider(cheapest);
  }
}
