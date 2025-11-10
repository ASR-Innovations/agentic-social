import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIRequest, AIRequestType, AIRequestStatus } from './entities/ai-request.entity';
import { OpenAIService } from './services/openai.service';
import { AnthropicService } from './services/anthropic.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @InjectRepository(AIRequest)
    private aiRequestRepository: Repository<AIRequest>,
    private openaiService: OpenAIService,
    private anthropicService: AnthropicService,
    private tenantService: TenantService,
  ) {}

  /**
   * Generate captions for social media posts
   */
  async generateCaption(
    tenantId: string,
    userId: string,
    options: {
      topic: string;
      tone?: string;
      platform?: string;
      variations?: number;
      keywords?: string[];
      maxLength?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<{ captions: string[]; requestId: string }> {
    // Check AI budget
    await this.checkAIBudget(tenantId);

    const startTime = Date.now();

    // Create AI request record
    const request = await this.createAIRequest(tenantId, userId, AIRequestType.CAPTION_GENERATION, {
      topic: options.topic,
      tone: options.tone || 'professional',
      platform: options.platform,
      variations: options.variations || 3,
      keywords: options.keywords,
      maxLength: options.maxLength || 200,
      metadata: options.metadata,
    });

    try {
      // Build prompt
      const prompt = this.buildCaptionPrompt(options);

      // Generate captions using OpenAI
      const response = await this.openaiService.generateText(prompt, {
        model: 'gpt-4-turbo-preview',
        maxTokens: 500,
        temperature: 0.8,
      });

      const captions = this.parseCaptions(response.text, options.variations || 3);
      const processingTime = Date.now() - startTime;

      // Update request with results
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.COMPLETED,
        output: { captions },
        tokensUsed: response.tokensUsed,
        costUsd: response.cost,
        processingTimeMs: processingTime,
      });

      // Update tenant AI usage
      await this.updateAIUsage(tenantId, response.cost);

      return { captions, requestId: request.id };
    } catch (error) {
      this.logger.error(`Caption generation failed: ${error.message}`, error.stack);
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.FAILED,
        errorMessage: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      throw new BadRequestException(`Caption generation failed: ${error.message}`);
    }
  }

  /**
   * Generate content using AI
   */
  async generateContent(
    tenantId: string,
    userId: string,
    options: {
      prompt: string;
      contentType?: string;
      tone?: string;
      targetAudience?: string;
      variations?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<{ content: string[]; requestId: string }> {
    await this.checkAIBudget(tenantId);

    const startTime = Date.now();

    const request = await this.createAIRequest(tenantId, userId, AIRequestType.CONTENT_GENERATION, {
      prompt: options.prompt,
      contentType: options.contentType,
      tone: options.tone,
      targetAudience: options.targetAudience,
      variations: options.variations || 1,
      metadata: options.metadata,
    });

    try {
      const prompt = this.buildContentPrompt(options);

      // Use Claude for long-form content
      const response = await this.anthropicService.generateText(prompt, {
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 2000,
        temperature: 0.7,
      });

      const content = this.parseContent(response.text, options.variations || 1);
      const processingTime = Date.now() - startTime;

      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.COMPLETED,
        output: { content },
        tokensUsed: response.tokensUsed,
        costUsd: response.cost,
        processingTimeMs: processingTime,
      });

      await this.updateAIUsage(tenantId, response.cost);

      return { content, requestId: request.id };
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`, error.stack);
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.FAILED,
        errorMessage: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      throw new BadRequestException(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate images using AI
   */
  async generateImage(
    tenantId: string,
    userId: string,
    options: {
      prompt: string;
      style?: string;
      size?: string;
      n?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<{ images: { url: string; revisedPrompt?: string }[]; requestId: string }> {
    await this.checkAIBudget(tenantId);

    const startTime = Date.now();

    const request = await this.createAIRequest(tenantId, userId, AIRequestType.IMAGE_GENERATION, {
      prompt: options.prompt,
      style: options.style,
      size: options.size || '1024x1024',
      n: options.n || 1,
      metadata: options.metadata,
    });

    try {
      const response = await this.openaiService.generateImage({
        prompt: options.prompt,
        size: options.size as any,
        n: options.n || 1,
        quality: 'standard',
      });

      const processingTime = Date.now() - startTime;

      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.COMPLETED,
        output: { images: response.images },
        costUsd: response.cost,
        processingTimeMs: processingTime,
      });

      await this.updateAIUsage(tenantId, response.cost);

      return { images: response.images, requestId: request.id };
    } catch (error) {
      this.logger.error(`Image generation failed: ${error.message}`, error.stack);
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.FAILED,
        errorMessage: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      throw new BadRequestException(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Generate hashtags for content
   */
  async generateHashtags(
    tenantId: string,
    userId: string,
    options: {
      content: string;
      platform?: string;
      count?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<{ hashtags: string[]; requestId: string }> {
    await this.checkAIBudget(tenantId);

    const startTime = Date.now();

    const request = await this.createAIRequest(tenantId, userId, AIRequestType.HASHTAG_GENERATION, {
      content: options.content,
      platform: options.platform,
      count: options.count || 10,
      metadata: options.metadata,
    });

    try {
      const prompt = this.buildHashtagPrompt(options);

      const response = await this.openaiService.generateText(prompt, {
        model: 'gpt-4-turbo-preview',
        maxTokens: 200,
        temperature: 0.7,
      });

      const hashtags = this.parseHashtags(response.text);
      const processingTime = Date.now() - startTime;

      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.COMPLETED,
        output: { hashtags },
        tokensUsed: response.tokensUsed,
        costUsd: response.cost,
        processingTimeMs: processingTime,
      });

      await this.updateAIUsage(tenantId, response.cost);

      return { hashtags, requestId: request.id };
    } catch (error) {
      this.logger.error(`Hashtag generation failed: ${error.message}`, error.stack);
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.FAILED,
        errorMessage: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      throw new BadRequestException(`Hashtag generation failed: ${error.message}`);
    }
  }

  /**
   * Improve existing content
   */
  async improveContent(
    tenantId: string,
    userId: string,
    options: {
      content: string;
      improvementType?: string;
      tone?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<{ improvedContent: string; suggestions: string[]; requestId: string }> {
    await this.checkAIBudget(tenantId);

    const startTime = Date.now();

    const request = await this.createAIRequest(tenantId, userId, AIRequestType.CONTENT_IMPROVEMENT, {
      content: options.content,
      improvementType: options.improvementType || 'general',
      tone: options.tone,
      metadata: options.metadata,
    });

    try {
      const prompt = this.buildImprovementPrompt(options);

      const response = await this.anthropicService.generateText(prompt, {
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.5,
      });

      const { improvedContent, suggestions } = this.parseImprovement(response.text);
      const processingTime = Date.now() - startTime;

      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.COMPLETED,
        output: { improvedContent, suggestions },
        tokensUsed: response.tokensUsed,
        costUsd: response.cost,
        processingTimeMs: processingTime,
      });

      await this.updateAIUsage(tenantId, response.cost);

      return { improvedContent, suggestions, requestId: request.id };
    } catch (error) {
      this.logger.error(`Content improvement failed: ${error.message}`, error.stack);
      await this.updateAIRequest(request.id, {
        status: AIRequestStatus.FAILED,
        errorMessage: error.message,
        processingTimeMs: Date.now() - startTime,
      });
      throw new BadRequestException(`Content improvement failed: ${error.message}`);
    }
  }

  // Helper methods

  private buildCaptionPrompt(options: any): string {
    return `Generate ${options.variations || 3} engaging social media captions about "${options.topic}".

Requirements:
- Tone: ${options.tone || 'professional'}
${options.platform ? `- Optimized for: ${options.platform}` : ''}
${options.keywords ? `- Include keywords: ${options.keywords.join(', ')}` : ''}
- Maximum length: ${options.maxLength || 200} characters
- Make them engaging and action-oriented
- Include relevant emojis where appropriate

Format: Return each caption on a new line, numbered 1-${options.variations || 3}.`;
  }

  private buildContentPrompt(options: any): string {
    return `${options.prompt}

${options.contentType ? `Content Type: ${options.contentType}` : ''}
${options.tone ? `Tone: ${options.tone}` : ''}
${options.targetAudience ? `Target Audience: ${options.targetAudience}` : ''}

Generate ${options.variations || 1} variation(s) of high-quality content based on the above.`;
  }

  private buildHashtagPrompt(options: any): string {
    return `Analyze this content and generate ${options.count || 10} relevant, trending hashtags:

"${options.content}"

${options.platform ? `Platform: ${options.platform}` : ''}

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content
- Format: Return hashtags in a comma-separated list`;
  }

  private buildImprovementPrompt(options: any): string {
    return `Improve the following content:

"${options.content}"

Improvement focus: ${options.improvementType || 'general'}
${options.tone ? `Desired tone: ${options.tone}` : ''}

Provide:
1. The improved version
2. A list of specific improvements made

Format:
IMPROVED:
[improved content here]

SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]`;
  }

  private parseCaptions(text: string, count: number): string[] {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, count);
  }

  private parseContent(text: string, count: number): string[] {
    // If multiple variations requested, split by markers
    if (count > 1) {
      const variations = text.split(/\n\n---\n\n|\n\nVariation \d+:\n\n/);
      return variations.filter((v) => v.trim()).slice(0, count);
    }
    return [text];
  }

  private parseHashtags(text: string): string[] {
    // Extract hashtags from text
    const hashtagPattern = /#[\w]+/g;
    const matches = text.match(hashtagPattern) || [];

    // Also try comma-separated
    const commaSeparated = text
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.startsWith('#'));

    return [...new Set([...matches, ...commaSeparated])];
  }

  private parseImprovement(text: string): { improvedContent: string; suggestions: string[] } {
    const improvedMatch = text.match(/IMPROVED:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/);
    const suggestionsMatch = text.match(/SUGGESTIONS:\s*([\s\S]*)/);

    const improvedContent = improvedMatch ? improvedMatch[1].trim() : text;
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1]
          .split('\n')
          .map((s) => s.replace(/^-\s*/, '').trim())
          .filter((s) => s.length > 0)
      : [];

    return { improvedContent, suggestions };
  }

  private async checkAIBudget(tenantId: string): Promise<void> {
    const tenant = await this.tenantService.findOne(tenantId);

    if (tenant.aiUsageCurrent >= tenant.aiBudgetLimit) {
      throw new BadRequestException('AI budget limit exceeded. Please upgrade your plan.');
    }
  }

  private async updateAIUsage(tenantId: string, cost: number): Promise<void> {
    const tenant = await this.tenantService.findOne(tenantId);
    tenant.aiUsageCurrent += cost;
    await this.tenantService.update(tenantId, { aiUsageCurrent: tenant.aiUsageCurrent } as any);
  }

  private async createAIRequest(
    tenantId: string,
    userId: string,
    type: AIRequestType,
    input: Record<string, any>,
  ): Promise<AIRequest> {
    const request = this.aiRequestRepository.create({
      tenantId,
      userId,
      type,
      status: AIRequestStatus.PROCESSING,
      model: type === AIRequestType.IMAGE_GENERATION ? 'dall-e-3' : 'gpt-4-turbo',
      input,
    });

    return await this.aiRequestRepository.save(request);
  }

  private async updateAIRequest(requestId: string, updates: Partial<AIRequest>): Promise<void> {
    await this.aiRequestRepository.update(requestId, updates);
  }

  /**
   * Get AI request history for a tenant
   */
  async getRequestHistory(
    tenantId: string,
    options?: {
      type?: AIRequestType;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ requests: AIRequest[]; total: number }> {
    const where: any = { tenantId };

    if (options?.type) {
      where.type = options.type;
    }

    const [requests, total] = await this.aiRequestRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return { requests, total };
  }

  /**
   * Get AI usage statistics for a tenant
   */
  async getUsageStats(tenantId: string): Promise<{
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    byType: Record<string, any>;
  }> {
    const requests = await this.aiRequestRepository.find({
      where: { tenantId, status: AIRequestStatus.COMPLETED },
    });

    const totalRequests = requests.length;
    const totalCost = requests.reduce((sum, req) => sum + Number(req.costUsd), 0);
    const totalTokens = requests.reduce((sum, req) => sum + req.tokensUsed, 0);

    const byType: Record<string, any> = {};
    for (const type of Object.values(AIRequestType)) {
      const typeRequests = requests.filter((r) => r.type === type);
      byType[type] = {
        count: typeRequests.length,
        cost: typeRequests.reduce((sum, req) => sum + Number(req.costUsd), 0),
        tokens: typeRequests.reduce((sum, req) => sum + req.tokensUsed, 0),
      };
    }

    return { totalRequests, totalCost, totalTokens, byType };
  }
}
