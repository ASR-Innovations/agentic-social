import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
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

@Injectable()
export class AnthropicProvider implements AIProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic;
  readonly name = AIProviderType.CLAUDE;
  readonly displayName = 'Anthropic Claude';
  readonly supportedModels = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('Anthropic API key not configured');
    }

    this.client = new Anthropic({
      apiKey: apiKey || 'dummy-key',
    });
  }

  async generateText(prompt: string, options?: GenerationOptions): Promise<TextResponse> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 0.7,
        system: options?.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateCost(options?.model || 'claude-3-5-sonnet-20241022', response.usage.input_tokens, response.usage.output_tokens);

      return {
        text,
        tokensUsed,
        cost,
        model: response.model,
        finishReason: response.stop_reason || 'end_turn',
      };
    } catch (error) {
      this.logger.error(`Anthropic text generation failed: ${error.message}`, error.stack);
      throw new Error(`Anthropic generation failed: ${error.message}`);
    }
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageResponse> {
    throw new Error('Anthropic does not support image generation');
  }

  async estimateCost(request: AIRequest): Promise<CostEstimate> {
    const estimatedInputTokens = request.prompt.length * 0.75;
    const estimatedOutputTokens = 500;
    const estimatedCost = this.calculateCost('claude-3-5-sonnet-20241022', estimatedInputTokens, estimatedOutputTokens);
    
    return {
      estimatedCost,
      estimatedTokens: estimatedInputTokens + estimatedOutputTokens,
      confidence: 0.7,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return {
        available: true,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        available: false,
        lastChecked: new Date(),
      };
    }
  }

  getDefaultModel(taskType: 'simple' | 'complex' | 'creative'): string {
    switch (taskType) {
      case 'simple':
        return 'claude-3-haiku-20240307';
      case 'complex':
        return 'claude-3-5-sonnet-20241022';
      case 'creative':
        return 'claude-3-opus-20240229';
      default:
        return 'claude-3-5-sonnet-20241022';
    }
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
    
    return (inputTokens / 1_000_000) * modelPricing.input + (outputTokens / 1_000_000) * modelPricing.output;
  }
}
