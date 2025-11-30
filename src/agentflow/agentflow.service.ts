import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentConfigEntity } from './entities/agent-config.entity';
import { AgentType, AgentConfig, AgentTask } from './interfaces/agent.interface';
import { AIProviderType } from '../ai/providers/ai-provider.interface';
import { AIProviderFactory } from '../ai/providers/provider.factory';
import { ContentCreatorAgent } from './agents/content-creator.agent';

/**
 * AgentFlow Service
 * 
 * Main service for managing AI agents.
 * Handles CRUD operations for agent configurations.
 */
@Injectable()
export class AgentFlowService {
  private readonly logger = new Logger(AgentFlowService.name);

  constructor(
    @InjectRepository(AgentConfigEntity)
    private agentConfigRepository: Repository<AgentConfigEntity>,
    private providerFactory: AIProviderFactory,
  ) {}

  /**
   * Create a new agent configuration
   */
  async createAgent(
    tenantId: string,
    data: {
      name: string;
      type: AgentType;
      socialAccountId?: string;
      aiProvider?: AIProviderType;
      model?: string;
      personalityConfig?: any;
      costBudget?: number;
      fallbackProvider?: AIProviderType;
    },
  ): Promise<AgentConfigEntity> {
    const agent = this.agentConfigRepository.create({
      tenantId,
      socialAccountId: data.socialAccountId || null,
      name: data.name,
      type: data.type,
      aiProvider: data.aiProvider || AIProviderType.DEEPSEEK,
      model: data.model || this.getDefaultModel(data.type, data.aiProvider),
      personalityConfig: data.personalityConfig || this.getDefaultPersonality(data.type),
      costBudget: data.costBudget || 10.0,
      fallbackProvider: data.fallbackProvider || AIProviderType.CLAUDE,
      active: true,
      usageStats: {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        totalCost: 0,
      },
    });

    const saved = await this.agentConfigRepository.save(agent);
    this.logger.log(`Created agent: ${saved.name} (${saved.type}) for tenant ${tenantId}`);

    return saved;
  }

  /**
   * Create agent instantly with defaults
   */
  async createAgentInstant(
    tenantId: string,
    socialAccountId: string,
    type: AgentType,
  ): Promise<AgentConfigEntity> {
    const name = this.generateAgentName(type);
    
    return this.createAgent(tenantId, {
      name,
      type,
      socialAccountId,
    });
  }

  /**
   * Get agents by social account
   */
  async findBySocialAccount(tenantId: string, socialAccountId: string): Promise<AgentConfigEntity[]> {
    return await this.agentConfigRepository.find({
      where: { tenantId, socialAccountId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Generate a default agent name
   */
  private generateAgentName(type: AgentType): string {
    const names = {
      [AgentType.CONTENT_CREATOR]: 'Content Creator',
      [AgentType.STRATEGY]: 'Strategy Advisor',
      [AgentType.ENGAGEMENT]: 'Engagement Manager',
      [AgentType.ANALYTICS]: 'Analytics Expert',
      [AgentType.TREND_DETECTION]: 'Trend Detector',
      [AgentType.COMPETITOR_ANALYSIS]: 'Competitor Analyst',
    };

    return names[type] || 'AI Agent';
  }

  /**
   * Get all agents for a tenant
   */
  async findAll(
    tenantId: string,
    filters?: {
      type?: AgentType;
      active?: boolean;
    },
  ): Promise<AgentConfigEntity[]> {
    const where: any = { tenantId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    return await this.agentConfigRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single agent
   */
  async findOne(tenantId: string, agentId: string): Promise<AgentConfigEntity> {
    const agent = await this.agentConfigRepository.findOne({
      where: { id: agentId, tenantId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent ${agentId} not found`);
    }

    return agent;
  }

  /**
   * Update an agent
   */
  async update(
    tenantId: string,
    agentId: string,
    updates: Partial<AgentConfigEntity>,
  ): Promise<AgentConfigEntity> {
    const agent = await this.findOne(tenantId, agentId);

    Object.assign(agent, updates);

    const updated = await this.agentConfigRepository.save(agent);
    this.logger.log(`Updated agent: ${updated.name}`);

    return updated;
  }

  /**
   * Delete an agent
   */
  async delete(tenantId: string, agentId: string): Promise<void> {
    const agent = await this.findOne(tenantId, agentId);
    await this.agentConfigRepository.remove(agent);
    this.logger.log(`Deleted agent: ${agent.name}`);
  }

  /**
   * Activate/deactivate an agent
   */
  async setActive(tenantId: string, agentId: string, active: boolean): Promise<AgentConfigEntity> {
    return await this.update(tenantId, agentId, { active });
  }

  /**
   * Update agent usage statistics
   */
  async updateUsageStats(
    agentId: string,
    stats: {
      success: boolean;
      cost: number;
      duration: number;
    },
  ): Promise<void> {
    const agent = await this.agentConfigRepository.findOne({ where: { id: agentId } });
    
    if (!agent) return;

    if (!agent.usageStats) {
      agent.usageStats = {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        totalCost: 0,
      };
    }

    agent.usageStats.totalTasks = (agent.usageStats.totalTasks || 0) + 1;
    
    if (stats.success) {
      agent.usageStats.successfulTasks = (agent.usageStats.successfulTasks || 0) + 1;
    } else {
      agent.usageStats.failedTasks = (agent.usageStats.failedTasks || 0) + 1;
    }

    agent.usageStats.totalCost = (agent.usageStats.totalCost || 0) + stats.cost;
    agent.usageStats.lastUsedAt = new Date();

    await this.agentConfigRepository.save(agent);
  }

  /**
   * Get default model for agent type and provider
   */
  private getDefaultModel(type: AgentType, provider?: AIProviderType): string {
    const prov = provider || AIProviderType.DEEPSEEK;

    const modelMap = {
      [AIProviderType.DEEPSEEK]: {
        [AgentType.CONTENT_CREATOR]: 'deepseek-chat',
        [AgentType.STRATEGY]: 'deepseek-chat',
        [AgentType.ENGAGEMENT]: 'deepseek-chat',
        [AgentType.ANALYTICS]: 'deepseek-chat',
        [AgentType.TREND_DETECTION]: 'deepseek-chat',
        [AgentType.COMPETITOR_ANALYSIS]: 'deepseek-chat',
      },
      [AIProviderType.GEMINI]: {
        [AgentType.CONTENT_CREATOR]: 'gemini-1.5-flash',
        [AgentType.STRATEGY]: 'gemini-1.5-pro',
        [AgentType.ENGAGEMENT]: 'gemini-1.5-flash',
        [AgentType.ANALYTICS]: 'gemini-1.5-pro',
        [AgentType.TREND_DETECTION]: 'gemini-pro',
        [AgentType.COMPETITOR_ANALYSIS]: 'gemini-1.5-pro',
      },
      [AIProviderType.CLAUDE]: {
        [AgentType.CONTENT_CREATOR]: 'claude-3-haiku',
        [AgentType.STRATEGY]: 'claude-3-5-sonnet-20241022',
        [AgentType.ENGAGEMENT]: 'claude-3-haiku',
        [AgentType.ANALYTICS]: 'claude-3-5-sonnet-20241022',
        [AgentType.TREND_DETECTION]: 'claude-3-5-sonnet-20241022',
        [AgentType.COMPETITOR_ANALYSIS]: 'claude-3-5-sonnet-20241022',
      },
      [AIProviderType.OPENAI]: {
        [AgentType.CONTENT_CREATOR]: 'gpt-3.5-turbo',
        [AgentType.STRATEGY]: 'gpt-4-turbo',
        [AgentType.ENGAGEMENT]: 'gpt-3.5-turbo',
        [AgentType.ANALYTICS]: 'gpt-4-turbo',
        [AgentType.TREND_DETECTION]: 'gpt-4-turbo',
        [AgentType.COMPETITOR_ANALYSIS]: 'gpt-4-turbo',
      },
    };

    return modelMap[prov][type] || 'deepseek-chat';
  }

  /**
   * Get default personality configuration for agent type
   */
  private getDefaultPersonality(type: AgentType): any {
    const personalities = {
      [AgentType.CONTENT_CREATOR]: {
        tone: 'engaging',
        style: 'creative',
        creativity: 0.8,
        formality: 0.5,
        humor: 0.6,
      },
      [AgentType.STRATEGY]: {
        tone: 'analytical',
        style: 'professional',
        creativity: 0.5,
        formality: 0.8,
        humor: 0.2,
      },
      [AgentType.ENGAGEMENT]: {
        tone: 'friendly',
        style: 'conversational',
        creativity: 0.6,
        formality: 0.4,
        humor: 0.7,
      },
      [AgentType.ANALYTICS]: {
        tone: 'objective',
        style: 'data-driven',
        creativity: 0.3,
        formality: 0.9,
        humor: 0.1,
      },
      [AgentType.TREND_DETECTION]: {
        tone: 'insightful',
        style: 'observant',
        creativity: 0.7,
        formality: 0.6,
        humor: 0.4,
      },
      [AgentType.COMPETITOR_ANALYSIS]: {
        tone: 'strategic',
        style: 'analytical',
        creativity: 0.4,
        formality: 0.8,
        humor: 0.2,
      },
    };

    return personalities[type] || personalities[AgentType.CONTENT_CREATOR];
  }

  /**
   * Execute a task with an agent
   * This is a placeholder - actual execution will be handled by OrchestratorService
   */
  async executeTask(
    tenantId: string,
    agentId: string,
    task: {
      type: string;
      input: Record<string, any>;
    },
  ): Promise<any> {
    const agent = await this.findOne(tenantId, agentId);

    if (!agent.active) {
      throw new Error('Agent is not active');
    }

    // For now, return a placeholder
    // In production, this would call OrchestratorService.executeTask()
    this.logger.warn('executeTask is a placeholder - implement with OrchestratorService');

    return {
      success: true,
      output: {
        message: 'Task execution not yet implemented',
        agentId,
        taskType: task.type,
      },
      metadata: {
        tokensUsed: 0,
        cost: 0,
        duration: 0,
        model: agent.model,
        provider: agent.aiProvider,
      },
    };
  }

  /**
   * Get agent statistics
   */
  async getStatistics(tenantId: string): Promise<{
    totalAgents: number;
    activeAgents: number;
    byType: Record<AgentType, number>;
    totalCost: number;
    totalTasks: number;
  }> {
    const agents = await this.findAll(tenantId);

    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.active).length,
      byType: {} as Record<AgentType, number>,
      totalCost: 0,
      totalTasks: 0,
    };

    // Initialize byType
    Object.values(AgentType).forEach(type => {
      stats.byType[type] = 0;
    });

    // Calculate statistics
    agents.forEach(agent => {
      stats.byType[agent.type]++;
      stats.totalCost += agent.usageStats?.totalCost || 0;
      stats.totalTasks += agent.usageStats?.totalTasks || 0;
    });

    return stats;
  }

  /**
   * Execute a task with a specific agent
   */
  async executeAgentTask(
    tenantId: string,
    agentId: string,
    taskType: string,
    input: Record<string, any>,
  ): Promise<any> {
    const agentConfig = await this.findOne(tenantId, agentId);

    if (!agentConfig.active) {
      throw new BadRequestException('Agent is not active');
    }

    // Create agent instance based on type
    const agent = this.createAgentInstance(agentConfig);

    // Create task
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      type: taskType,
      input,
      priority: 1,
      createdAt: new Date(),
    };

    // Execute task
    const result = await agent.execute(task);

    // Update usage stats
    await this.updateUsageStats(agentId, {
      success: result.success,
      cost: result.metadata.cost,
      duration: result.metadata.duration,
    });

    return result;
  }

  /**
   * Generate content using Content Creator Agent
   * This is a convenience method that doesn't require an existing agent
   */
  async generateContent(
    tenantId: string,
    platform: string,
    topic: string,
    options?: {
      tone?: string;
      keywords?: string[];
      variations?: number;
      includeHashtags?: boolean;
      includeEmojis?: boolean;
    },
  ): Promise<any> {
    this.logger.log(`Generating ${platform} content for topic: ${topic}`);

    // Create a temporary agent config
    const config: AgentConfig = {
      aiProvider: AIProviderType.DEEPSEEK,
      model: 'deepseek-chat',
      personalityConfig: {
        tone: options?.tone || 'engaging',
        style: 'creative',
        creativity: 0.8,
        formality: 0.5,
        humor: 0.6,
      },
      costBudget: 1.0,
      fallbackProvider: AIProviderType.GEMINI,
      usageStats: {},
    };

    // Create Content Creator Agent
    const agent = new ContentCreatorAgent(
      `temp-${Date.now()}`,
      config,
      this.providerFactory,
    );

    // Determine task type based on platform
    const taskType = `generate_${platform.toLowerCase()}_content`;

    // Create task
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      type: taskType,
      input: {
        topic,
        tone: options?.tone || 'engaging',
        keywords: options?.keywords || [],
        variations: options?.variations || 3,
        includeHashtags: options?.includeHashtags !== false,
        includeEmojis: options?.includeEmojis !== false,
      },
      priority: 1,
      createdAt: new Date(),
    };

    // Execute task
    const result = await agent.execute(task);

    if (!result.success) {
      throw new BadRequestException(result.error || 'Content generation failed');
    }

    return {
      success: true,
      platform,
      topic,
      content: result.output.content,
      variations: result.output.variations,
      hashtags: result.output.hashtags,
      characterCount: result.output.characterCount,
      metadata: {
        tokensUsed: result.metadata.tokensUsed,
        cost: result.metadata.cost,
        duration: result.metadata.duration,
        model: result.metadata.model,
        provider: result.metadata.provider,
      },
    };
  }

  /**
   * Create agent instance from config
   */
  private createAgentInstance(agentConfig: AgentConfigEntity): ContentCreatorAgent {
    const config: AgentConfig = {
      aiProvider: agentConfig.aiProvider as AIProviderType,
      model: agentConfig.model,
      personalityConfig: agentConfig.personalityConfig || {
        tone: 'engaging',
        style: 'creative',
        creativity: 0.8,
      },
      costBudget: agentConfig.costBudget,
      fallbackProvider: agentConfig.fallbackProvider as AIProviderType,
      usageStats: agentConfig.usageStats || {},
    };

    // For now, only Content Creator Agent is fully implemented
    if (agentConfig.type === AgentType.CONTENT_CREATOR) {
      return new ContentCreatorAgent(
        agentConfig.id,
        config,
        this.providerFactory,
      );
    }

    // Default to Content Creator for other types (temporary)
    this.logger.warn(`Agent type ${agentConfig.type} not fully implemented, using ContentCreatorAgent`);
    return new ContentCreatorAgent(
      agentConfig.id,
      config,
      this.providerFactory,
    );
  }
}

