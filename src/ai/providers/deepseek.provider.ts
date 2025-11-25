import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  AIProvider,
  AIProviderType,
  GenerationOptions,
  ImageGenerationOptions,
  TextResponse,
  ImageResponse,
  AIRequest,
  CostEstimate,
  ProviderHealth,
} from './ai-provider.interface';

/**
 * DeepSeek AI Provider
 * 
 * Cost-effective AI provider with competitive pricing.
 * Primary provider for most content generation tasks.
 */
@Injectable()
export class DeepSeekProvider implements AIProvider {
  private readonly logger = new Logger(DeepSeekProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  readonly name = AIProviderType.DEEPSEEK;
  readonly displayName = 'DeepSeek';
  readonly supportedModels = [
    'deepseek-chat',
    'deepseek-coder',
  ];

  // Pricing per 1M tokens (approximate)
  private readonly pricing = {
    'deepseek-chat': {
      input: 0.14,  // $0.14 per 1M input tokens
      output: 0.28, // $0.28 per 1M output tokens
    },
    'deepseek-coder': {
      input: 0.14,
      output: 0.28,
    },
  };

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    
    this.client = axios.create({
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });
  }

  /**
   * Generate text using DeepSeek
   */
  async generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<TextResponse> {
    const model = options?.model || this.getDefaultModel('simple');
    
    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1,
        stop: options?.stopSequences,
      });

      const completion = response.data.choices[0];
      const usage = response.data.usage;

      // Calculate cost
      const inputCost = (usage.prompt_tokens / 1000000) * this.pricing[model].input;
      const outputCost = (usage.completion_tokens / 1000000) * this.pricing[model].output;
      const totalCost = inputCost + outputCost;

      return {
        text: completion.message.content,
        tokensUsed: usage.total_tokens,
        cost: totalCost,
        model,
        finishReason: completion.finish_reason,
      };
    } catch (error) {
      this.logger.error(`DeepSeek text generation failed: ${error.message}`, error.stack);
      throw new Error(`DeepSeek generation failed: ${error.message}`);
    }
  }

  /**
   * DeepSeek doesn't support image generation
   * This will throw an error
   */
  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions,
  ): Promise<ImageResponse> {
    throw new Error('DeepSeek does not support image generation. Use OpenAI or another provider.');
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(request: AIRequest): Promise<CostEstimate> {
    const model = this.getDefaultModel(request.complexity === 'low' ? 'simple' : 'complex');
    
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(request.prompt.length / 4);
    const estimatedOutputTokens = request.type === 'text' ? 500 : 0;
    
    const inputCost = (estimatedInputTokens / 1000000) * this.pricing[model].input;
    const outputCost = (estimatedOutputTokens / 1000000) * this.pricing[model].output;
    
    return {
      estimatedCost: inputCost + outputCost,
      estimatedTokens: estimatedInputTokens + estimatedOutputTokens,
      confidence: 0.7, // Moderate confidence in estimation
    };
  }

  /**
   * Check provider health
   */
  async checkHealth(): Promise<ProviderHealth> {
    try {
      const startTime = Date.now();
      
      await this.client.get('/models');
      
      const latency = Date.now() - startTime;

      return {
        available: true,
        latency,
        errorRate: 0,
        lastChecked: new Date(),
      };
    } catch (error) {
      this.logger.warn(`DeepSeek health check failed: ${error.message}`);
      return {
        available: false,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * Get default model based on task type
   */
  getDefaultModel(taskType: 'simple' | 'complex' | 'creative'): string {
    switch (taskType) {
      case 'simple':
        return 'deepseek-chat';
      case 'complex':
        return 'deepseek-chat';
      case 'creative':
        return 'deepseek-chat';
      default:
        return 'deepseek-chat';
    }
  }
}
