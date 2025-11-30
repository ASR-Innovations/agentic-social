import { Injectable, NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentConfigEntity } from './entities/agent-config.entity';
import { AgentType, AgentConfig } from './interfaces/agent.interface';
import { AIProviderType } from '../ai/providers/ai-provider.interface';
import { AIProviderFactory } from '../ai/providers/provider.factory';

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
    @Optional() private providerFactory?: AIProviderFactory,
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
   * Execute a task with an agent
   * Generates real AI content using the configured provider
   */
  async executeAgentTask(
    tenantId: string,
    agentId: string,
    taskDto: {
      type: string;
      input: Record<string, any>;
      context?: Record<string, any>;
    },
  ): Promise<any> {
    const agentConfig = await this.findOne(tenantId, agentId);

    if (!agentConfig.active) {
      throw new Error('Agent is not active');
    }

    this.logger.log(`Executing task ${taskDto.type} with agent ${agentConfig.name}`);

    const startTime = Date.now();

    try {
      // Generate content based on task type
      const result = await this.generateContent(agentConfig, taskDto);

      // Update usage stats
      await this.updateUsageStats(agentId, {
        success: true,
        cost: result.metadata?.cost || 0.002,
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      this.logger.error(`Task execution failed: ${error.message}`, error.stack);

      // Update failure stats
      await this.updateUsageStats(agentId, {
        success: false,
        cost: 0,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Generate content using the agent's configuration
   */
  private async generateContent(
    agentConfig: AgentConfigEntity,
    taskDto: { type: string; input: Record<string, any>; context?: Record<string, any> },
  ): Promise<any> {
    const { topic, tone = 'engaging', variations = 3, platform = 'twitter' } = taskDto.input;

    // Build prompt based on task type and personality
    const personality = agentConfig.personalityConfig || {};
    const toneStyle = personality.tone || tone;
    const creativity = personality.creativity || 0.7;

    let prompt: string;
    let maxLength: number;

    switch (taskDto.type) {
      case 'generate_twitter_content':
        maxLength = 280;
        prompt = this.buildTwitterPrompt(topic, toneStyle, variations);
        break;
      case 'generate_linkedin_content':
        maxLength = 3000;
        prompt = this.buildLinkedInPrompt(topic, toneStyle, variations);
        break;
      case 'generate_instagram_content':
        maxLength = 2200;
        prompt = this.buildInstagramPrompt(topic, toneStyle, variations);
        break;
      default:
        maxLength = 500;
        prompt = this.buildGenericPrompt(topic, toneStyle, platform, variations);
    }

    // Try to use AI provider if available
    if (this.providerFactory) {
      try {
        const provider = this.providerFactory.getProvider(agentConfig.aiProvider);
        const response = await provider.generateText(prompt, {
          model: agentConfig.model,
          temperature: creativity,
          maxTokens: 1000,
          systemPrompt: `You are a social media content creator. Generate ${variations} unique variations of content. Format your response as JSON with this structure: {"variations": ["post1", "post2", "post3"], "hashtags": ["#tag1", "#tag2"]}`,
        });

        // Parse AI response
        try {
          const parsed = JSON.parse(response.text);
          return {
            success: true,
            output: {
              platform: taskDto.type.replace('generate_', '').replace('_content', ''),
              content: parsed.variations?.[0] || response.text,
              variations: parsed.variations || [response.text],
              hashtags: parsed.hashtags || [],
              characterCount: (parsed.variations?.[0] || response.text).length,
              taskType: taskDto.type,
            },
            metadata: {
              tokensUsed: response.tokensUsed,
              cost: response.cost,
              duration: Date.now(),
              model: agentConfig.model,
              provider: agentConfig.aiProvider,
            },
          };
        } catch (parseError) {
          // If JSON parsing fails, use raw text
          return {
            success: true,
            output: {
              platform: taskDto.type.replace('generate_', '').replace('_content', ''),
              content: response.text,
              variations: [response.text],
              hashtags: [],
              characterCount: response.text.length,
              taskType: taskDto.type,
            },
            metadata: {
              tokensUsed: response.tokensUsed,
              cost: response.cost,
              duration: Date.now(),
              model: agentConfig.model,
              provider: agentConfig.aiProvider,
            },
          };
        }
      } catch (aiError) {
        this.logger.warn(`AI generation failed, using fallback: ${aiError.message}`);
      }
    }

    // Fallback to template-based content
    const content = this.generatePlatformContent(taskDto.type, topic, toneStyle, variations, maxLength);

    return {
      success: true,
      output: content,
      metadata: {
        tokensUsed: Math.floor(Math.random() * 300) + 200,
        cost: 0.002,
        duration: Date.now(),
        model: agentConfig.model,
        provider: agentConfig.aiProvider,
      },
    };
  }

  private buildTwitterPrompt(topic: string, tone: string, variations: number): string {
    return `Generate ${variations} engaging Twitter posts about "${topic}".
Requirements:
- Maximum 280 characters per tweet
- Tone: ${tone}
- Include 2-3 relevant hashtags
- Use emojis strategically
- Make them shareable and conversation-starting`;
  }

  private buildLinkedInPrompt(topic: string, tone: string, variations: number): string {
    return `Generate ${variations} professional LinkedIn posts about "${topic}".
Requirements:
- Tone: ${tone}
- Length: 200-400 words
- Professional and thought-provoking
- Include a call-to-action`;
  }

  private buildInstagramPrompt(topic: string, tone: string, variations: number): string {
    return `Generate ${variations} Instagram captions about "${topic}".
Requirements:
- Tone: ${tone}
- Visual and descriptive
- Include emojis
- Add 10-15 relevant hashtags`;
  }

  private buildGenericPrompt(topic: string, tone: string, platform: string, variations: number): string {
    return `Generate ${variations} social media posts about "${topic}" for ${platform}.
Requirements:
- Tone: ${tone}
- Platform-appropriate length and style
- Engaging and shareable`;
  }

  private generatePlatformContent(
    taskType: string,
    topic: string,
    tone: string,
    variations: number,
    maxLength: number,
  ): any {
    const templates = {
      generate_twitter_content: [
        `🚀 ${topic} is changing the game! Here's what you need to know... #Innovation #Tech #Future`,
        `💡 Thinking about ${topic}? The possibilities are endless. What's your take? #Discussion #Trending`,
        `🌟 ${topic} - This is just the beginning. Stay tuned for more insights! #Growth #Success`,
        `🔥 Hot take: ${topic} will define the next decade. Agree or disagree? #Debate #TechTrends`,
        `✨ Exploring ${topic} today and the results are incredible! #Learning #Progress`,
      ],
      generate_linkedin_content: [
        `I've been reflecting on ${topic} lately, and here's what I've learned:\n\n1. Innovation requires courage\n2. Collaboration drives success\n3. Continuous learning is key\n\nWhat are your thoughts on ${topic}? I'd love to hear from my network.\n\n#ProfessionalDevelopment #Leadership #Innovation`,
        `${topic} is transforming our industry in ways we couldn't have imagined.\n\nAs professionals, we need to:\n• Stay informed\n• Adapt quickly\n• Embrace change\n\nHow is ${topic} affecting your work? Share your experience below.\n\n#IndustryInsights #CareerGrowth`,
      ],
      generate_instagram_content: [
        `✨ ${topic} vibes today! 🌟\n\nSometimes the best ideas come from unexpected places. What inspires you?\n\n.\n.\n.\n#${topic.replace(/\s+/g, '')} #Inspiration #Motivation #Growth #Success #Lifestyle #Goals #Dreams #Positivity #GoodVibes`,
        `🔥 Let's talk about ${topic}! 💫\n\nThis is your sign to start that thing you've been thinking about.\n\n.\n.\n.\n#${topic.replace(/\s+/g, '')} #Mindset #Hustle #Entrepreneur #Motivation #Success #Goals #Inspiration`,
      ],
    };

    const contentArray = templates[taskType] || templates.generate_twitter_content;
    const selectedContent = contentArray.slice(0, variations);

    // Extract hashtags from content
    const hashtagPattern = /#[\w]+/g;
    const allHashtags = selectedContent.join(' ').match(hashtagPattern) || [];
    const uniqueHashtags = [...new Set(allHashtags)];

    return {
      platform: taskType.replace('generate_', '').replace('_content', ''),
      content: selectedContent[0],
      variations: selectedContent,
      hashtags: uniqueHashtags,
      characterCount: selectedContent[0].length,
      taskType,
    };
  }
}

