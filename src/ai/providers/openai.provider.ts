import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly client: OpenAI;
  readonly name = AIProviderType.OPENAI;
  readonly displayName = 'OpenAI';
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3', 'dall-e-2'];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }

    this.client = new OpenAI({
      apiKey: apiKey || 'dummy-key',
    });
  }

  async generateText(prompt: string, options?: GenerationOptions): Promise<TextResponse> {
    const startTime = Date.now();

    try {
      const messages: any[] = [];
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        top_p: options?.topP ?? 1,
        stop: options?.stopSequences,
      });

      const choice = response.choices[0];
      const usage = response.usage;

      const tokensUsed = usage?.total_tokens || 0;
      const cost = this.calculateCost(options?.model || 'gpt-4o-mini', tokensUsed);

      return {
        text: choice.message.content || '',
        tokensUsed,
        cost,
        model: response.model,
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error) {
      this.logger.error(`OpenAI text generation failed: ${error.message}`, error.stack);
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageResponse> {
    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: options?.n ?? 1,
        size: (options?.size as any) ?? '1024x1024',
        quality: (options?.quality as any) ?? 'standard',
        style: (options?.style as any) ?? 'vivid',
      });

      const image = response.data[0];
      const cost = this.calculateImageCost('dall-e-3', options?.size || '1024x1024', options?.quality || 'standard');

      return {
        images: [{
          url: image.url || '',
          revisedPrompt: image.revised_prompt,
        }],
        cost,
        model: 'dall-e-3',
      };
    } catch (error) {
      this.logger.error(`OpenAI image generation failed: ${error.message}`, error.stack);
      throw new Error(`OpenAI image generation failed: ${error.message}`);
    }
  }

  async estimateCost(request: AIRequest): Promise<CostEstimate> {
    const estimatedTokens = request.prompt.length * 1.3; // Rough estimate
    const estimatedCost = this.calculateCost('gpt-4o-mini', estimatedTokens);
    
    return {
      estimatedCost,
      estimatedTokens,
      confidence: 0.7,
    };
  }

  async checkHealth(): Promise<ProviderHealth> {
    try {
      await this.client.models.list();
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
        return 'gpt-4o-mini';
      case 'complex':
        return 'gpt-4o';
      case 'creative':
        return 'gpt-4o';
      default:
        return 'gpt-4o-mini';
    }
  }

  private calculateCost(model: string, tokens: number): number {
    const pricing = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.150, output: 0.600 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
    const avgPrice = (modelPricing.input + modelPricing.output) / 2;
    
    return (tokens / 1_000_000) * avgPrice;
  }

  private calculateImageCost(model: string, size: string, quality: string): number {
    if (model === 'dall-e-3') {
      if (quality === 'hd') {
        if (size === '1024x1024') return 0.080;
        if (size === '1024x1792' || size === '1792x1024') return 0.120;
      } else {
        if (size === '1024x1024') return 0.040;
        if (size === '1024x1792' || size === '1792x1024') return 0.080;
      }
    }
    return 0.040;
  }
}
