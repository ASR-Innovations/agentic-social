import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
 * Google Gemini AI Provider
 * 
 * Google's multimodal AI model with competitive pricing.
 * Good for creative and complex tasks.
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI;
  private readonly apiKey: string;

  readonly name = AIProviderType.GEMINI;
  readonly displayName = 'Google Gemini';
  readonly supportedModels = [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  // Pricing per 1M tokens (approximate)
  private readonly pricing = {
    'gemini-pro': {
      input: 0.50,
      output: 1.50,
    },
    'gemini-1.5-pro': {
      input: 3.50,
      output: 10.50,
    },
    'gemini-1.5-flash': {
      input: 0.35,
      output: 1.05,
    },
  };

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Generate text using Gemini
   */
  async generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<TextResponse> {
    const modelName = options?.model || this.getDefaultModel('simple');
    
    try {
      const model = this.client.getGenerativeModel({ model: modelName });

      const generationConfig = {
        maxOutputTokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        topP: options?.topP || 1,
        stopSequences: options?.stopSequences,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      // Estimate tokens (Gemini doesn't always provide exact counts)
      const estimatedTokens = Math.ceil((prompt.length + text.length) / 4);
      
      // Calculate cost
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);
      const inputCost = (inputTokens / 1000000) * this.pricing[modelName].input;
      const outputCost = (outputTokens / 1000000) * this.pricing[modelName].output;
      const totalCost = inputCost + outputCost;

      return {
        text,
        tokensUsed: estimatedTokens,
        cost: totalCost,
        model: modelName,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error) {
      this.logger.error(`Gemini text generation failed: ${error.message}`, error.stack);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  /**
   * Gemini doesn't support direct image generation
   * Use Imagen API separately if needed
   */
  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions,
  ): Promise<ImageResponse> {
    throw new Error('Gemini does not support image generation. Use OpenAI DALL-E or another provider.');
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
      confidence: 0.7,
    };
  }

  /**
   * Check provider health
   */
  async checkHealth(): Promise<ProviderHealth> {
    try {
      const startTime = Date.now();
      
      // Simple test generation
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('Hello');
      
      const latency = Date.now() - startTime;

      return {
        available: true,
        latency,
        errorRate: 0,
        lastChecked: new Date(),
      };
    } catch (error) {
      this.logger.warn(`Gemini health check failed: ${error.message}`);
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
        return 'gemini-1.5-flash'; // Fast and cheap
      case 'complex':
        return 'gemini-1.5-pro'; // More capable
      case 'creative':
        return 'gemini-pro'; // Good for creative tasks
      default:
        return 'gemini-pro';
    }
  }
}
